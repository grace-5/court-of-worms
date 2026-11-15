import { describe, expect, it, vi } from 'vitest';
import { Lobby } from '../src';

function createLobby() {
	const lobby = Object.create(Lobby.prototype);
	Object.assign(lobby, {
		players: new Map(),
		connectionPlayerIds: new Map(),
		playerConnections: new Map(),
		hostId: null,
		gameState: null,
		broadcast: vi.fn(),
	});

	return lobby;
}

function createConnection(id) {
	return {
		id,
		messages: [],
		send(message) {
			this.messages.push(JSON.parse(message));
		},
	};
}

function send(lobby, connection, message) {
	lobby.onMessage(connection, JSON.stringify(message));
}

function createPretrialData(connections) {
	const fields = connections.flatMap((connection) =>
		Array.from({ length: 9 }, (_, index) => ({
			key: `${connection.id}_${index}`,
			type: 'noun',
			description: 'Enter a noun.',
			examples: ['chair'],
			assignedPlayerId: connection.id,
		})),
	);

	return {
		fields,
		values: Object.fromEntries(fields.map((field) => [field.key, ''])),
		sequence: [{ type: 'dialogue' }, { type: 'turn', role: 'prosecution' }, { type: 'verdict' }, { type: 'dialogue' }],
	};
}

function submitPrompts(lobby, connection, fields) {
	send(lobby, connection, {
		type: 'submit-pretrial',
		values: Object.fromEntries(
			fields.filter((field) => field.assignedPlayerId === connection.id).map((field) => [field.key, `word${field.key.slice(-1)}`]),
		),
	});
}

describe('Court of Worms game rooms', () => {
	it('waits for all pre-trial submissions before assigning roles and beginning the trial', () => {
		const lobby = createLobby();
		const connections = ['p1', 'p2', 'p3'].map(createConnection);
		const pretrial = createPretrialData(connections);

		for (const connection of connections) {
			send(lobby, connection, {
				type: 'join',
				name: connection.id,
				playerId: connection.id,
			});
		}

		send(lobby, connections[0], { type: 'start-pretrial', ...pretrial });
		expect(lobby.gameState.status).toBe('pretrial');
		expect(lobby.gameState.roles).toBeNull();
		const roomView = createConnection('observer');
		lobby.sendState(roomView);
		expect(roomView.messages[0].gameState.pretrial.values).toBeUndefined();

		submitPrompts(lobby, connections[0], pretrial.fields);
		expect(lobby.gameState.status).toBe('pretrial');
		expect(lobby.gameState.pretrial.submittedPlayerIds).toEqual(['p1']);
		expect(lobby.gameState.roles).toBeNull();

		submitPrompts(lobby, connections[1], pretrial.fields);
		submitPrompts(lobby, connections[2], pretrial.fields);

		expect(lobby.gameState.status).toBe('playing');
		expect(Object.values(lobby.gameState.roles).sort()).toEqual(['defense', 'judge', 'prosecution']);
		expect(lobby.gameState.pretrial.values).toMatchObject({
			judge_name: connections.find((connection) => lobby.gameState.roles[connection.id] === 'judge').id,
			prosec_name: connections.find((connection) => lobby.gameState.roles[connection.id] === 'prosecution').id,
			defend_name: connections.find((connection) => lobby.gameState.roles[connection.id] === 'defense').id,
		});

		send(lobby, connections[0], { type: 'ready-for-step', stepIndex: 1 });
		expect(lobby.gameState.stepIndex).toBe(0);
		expect(lobby.gameState.readyPlayerIds).toEqual(['p1']);
		const prosecutorId = Object.keys(lobby.gameState.roles).find((id) => lobby.gameState.roles[id] === 'prosecution');
		const prosecutor = connections.find((connection) => connection.id === prosecutorId);
		const otherPlayer = connections.find((connection) => connection.id !== prosecutorId);

		send(lobby, otherPlayer, {
			type: 'submit-turn',
			stepIndex: 1,
			text: 'The defendant is not guilty.',
		});
		expect(otherPlayer.messages.at(-1)).toMatchObject({ type: 'error' });
		expect(lobby.gameState.stepIndex).toBe(0);

		for (const connection of connections.slice(1)) {
			send(lobby, connection, { type: 'ready-for-step', stepIndex: 1 });
		}
		expect(lobby.gameState.stepIndex).toBe(1);
		expect(lobby.gameState.activeStepReady).toBe(true);

		send(lobby, prosecutor, {
			type: 'submit-turn',
			stepIndex: 1,
			text: 'The defendant took the crystal.',
		});
		expect(lobby.gameState.transcript).toEqual([
			{
				role: 'prosecution',
				player: prosecutorId,
				text: 'The defendant took the crystal.',
				stepIndex: 1,
			},
		]);
		expect(lobby.gameState.activeStepReady).toBe(false);

		const judgeId = Object.keys(lobby.gameState.roles).find((id) => lobby.gameState.roles[id] === 'judge');
		const judge = connections.find((connection) => connection.id === judgeId);
		send(lobby, judge, {
			type: 'choose-verdict',
			stepIndex: 2,
			verdict: 'guilty',
			explanation: 'x'.repeat(151),
		});
		expect(judge.messages.at(-1)).toMatchObject({ type: 'error' });
		expect(lobby.gameState.stepIndex).toBe(2);

		for (const connection of connections) {
			send(lobby, connection, { type: 'ready-for-step', stepIndex: 2 });
		}
		expect(lobby.gameState.activeStepReady).toBe(true);
		send(lobby, judge, {
			type: 'choose-verdict',
			stepIndex: 2,
			verdict: 'guilty',
			explanation: 'x'.repeat(151),
		});
		expect(judge.messages.at(-1)).toMatchObject({ type: 'error' });
		expect(lobby.gameState.stepIndex).toBe(2);

		send(lobby, judge, {
			type: 'choose-verdict',
			stepIndex: 2,
			verdict: 'guilty',
			explanation: 'x'.repeat(150),
		});

		expect(lobby.gameState).toMatchObject({
			status: 'playing',
			verdict: 'guilty',
			explanation: 'x'.repeat(150),
			stepIndex: 3,
		});

		send(lobby, connections[0], { type: 'finish-script', stepIndex: 3 });
		send(lobby, connections[1], { type: 'finish-script', stepIndex: 3 });
		expect(lobby.gameState.status).toBe('playing');
		send(lobby, connections[2], { type: 'finish-script', stepIndex: 3 });
		expect(lobby.gameState.status).toBe('completed');
	});

	it('rejects starting with fewer than three players', () => {
		const lobby = createLobby();
		const host = createConnection('host');

		send(lobby, host, { type: 'join', name: 'Host', playerId: 'host' });
		send(lobby, host, {
			type: 'start-pretrial',
		});

		expect(host.messages.at(-1)).toMatchObject({
			type: 'error',
			message: 'At least three players are required to start.',
		});
		expect(lobby.gameState).toBeNull();
	});
});
