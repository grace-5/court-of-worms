<<<<<<< HEAD
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Server, routePartykitRequest } from "partyserver";

export class Lobby extends Server {
	players = new Map();

	onConnect(conn) {
		conn.send(JSON.stringify({
			type: "sync",
			players: Array.from(this.players.values())
		}));
	}

	onMessage(conn, message) {
		const data = JSON.parse(message);

		if(data.type === "join") {
			this.players.set(conn.id, {id: conn.id, name: data.name});
			this.broadcastState();
=======
import { Server, routePartykitRequest } from 'partyserver';

const ROLES = ['prosecution', 'defense', 'judge'];
const MAX_TURN_LENGTH = 500;
const PRETRIAL_PROMPTS_PER_PLAYER = 9;
const MAX_PROMPT_LENGTH = 20;
const MAX_VERDICT_EXPLANATION_LENGTH = 150;

export class Lobby extends Server {
	players = new Map();
	connectionPlayerIds = new Map();
	playerConnections = new Map();
	hostId = null;
	gameState = null;

	onConnect(conn) {
		this.sendState(conn);
	}

	onMessage(conn, message) {
		let data;
		try {
			data = JSON.parse(message);
		} catch {
			this.sendError(conn, 'Invalid message.');
			return;
		}

		if (!data || typeof data !== 'object' || Array.isArray(data)) {
			this.sendError(conn, 'Invalid message.');
			return;
		}

		switch (data.type) {
			case 'join':
				this.join(conn, data);
				break;
			case 'start-pretrial':
				this.startPretrial(conn, data);
				break;
			case 'submit-pretrial':
				this.submitPretrial(conn, data.values);
				break;
			case 'ready-for-step':
				this.readyForStep(conn, data.stepIndex);
				break;
			case 'finish-script':
				this.finishScript(conn, data.stepIndex);
				break;
			case 'submit-turn':
				this.submitTurn(conn, data);
				break;
			case 'choose-verdict':
				this.chooseVerdict(conn, data);
				break;
			default:
				this.sendError(conn, 'Unknown message type.');
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
		}
	}

	onClose(conn) {
<<<<<<< HEAD
		this.players.delete(conn.id);
		this.broadcastState();
	}

	broadcastState() {
		this.broadcast(JSON.stringify({
			type: "sync",
			players: Array.from(this.players.values())
		}))
	}
 }
export default {
	async fetch(request, env) {
		return (
			(await routePartykitRequest(request, env)) 
			|| new Response("Not found", { status: 404 })
		)
		
=======
		const playerId = this.connectionPlayerIds.get(conn.id);
		this.connectionPlayerIds.delete(conn.id);

		if (!playerId || this.playerConnections.get(playerId) !== conn) return;

		this.playerConnections.delete(playerId);
		const player = this.players.get(playerId);
		if (!player) return;

		if (['pretrial', 'playing'].includes(this.gameState?.status)) {
			this.players.set(playerId, { ...player, online: false });
		} else {
			this.players.delete(playerId);
			if (this.hostId === playerId) {
				this.hostId = this.players.keys().next().value ?? null;
			}
		}

		this.broadcastState();
	}

	join(conn, data) {
		if (typeof data.name !== 'string' || !data.name.trim()) {
			this.sendError(conn, 'Enter a player name to join.');
			return;
		}

		if (typeof data.playerId !== 'string' || !data.playerId) {
			this.sendError(conn, 'Player identity is missing.');
			return;
		}

		const playerId = data.playerId;
		this.players.set(playerId, {
			id: playerId,
			name: data.name.trim().slice(0, 40),
			online: true,
		});
		this.connectionPlayerIds.set(conn.id, playerId);
		this.playerConnections.set(playerId, conn);

		if (!this.hostId) this.hostId = playerId;

		this.broadcastState();
	}

	startPretrial(conn, pretrialData) {
		const playerId = this.connectionPlayerIds.get(conn.id);
		if (!playerId || playerId !== this.hostId) {
			this.sendError(conn, 'Only the room host can start the pre-trial.');
			return;
		}

		if (this.gameState) {
			this.sendError(conn, 'The pre-trial has already started.');
			return;
		}

		if (this.players.size < ROLES.length) {
			this.sendError(conn, 'At least three players are required to start.');
			return;
		}

		const { fields, values, sequence } = pretrialData;
		if (!Array.isArray(sequence) || sequence.length === 0 || sequence.length > 256) {
			this.sendError(conn, 'The game sequence is invalid.');
			return;
		}

		if (
			sequence.some(
				(step) =>
					!step ||
					!['dialogue', 'turn', 'verdict'].includes(step.type) ||
					(step.type === 'turn' && !['prosecution', 'defense'].includes(step.role)),
			)
		) {
			this.sendError(conn, 'The game sequence contains an invalid step.');
			return;
		}

		if (
			!Array.isArray(fields) ||
			fields.length !== ROLES.length * PRETRIAL_PROMPTS_PER_PLAYER ||
			!values ||
			typeof values !== 'object' ||
			Array.isArray(values)
		) {
			this.sendError(conn, 'The pre-trial prompts are invalid.');
			return;
		}

		const assignedCounts = new Map();
		const promptKeys = new Set();
		for (const field of fields) {
			if (
				!field ||
				typeof field.key !== 'string' ||
				typeof field.type !== 'string' ||
				typeof field.description !== 'string' ||
				!Array.isArray(field.examples) ||
				typeof field.assignedPlayerId !== 'string' ||
				!this.players.get(field.assignedPlayerId)?.online ||
				promptKeys.has(field.key)
			) {
				this.sendError(conn, 'The pre-trial prompt assignments are invalid.');
				return;
			}

			promptKeys.add(field.key);
			assignedCounts.set(field.assignedPlayerId, (assignedCounts.get(field.assignedPlayerId) ?? 0) + 1);
		}

		if (
			assignedCounts.size !== ROLES.length ||
			[...assignedCounts.values()].some((count) => count !== PRETRIAL_PROMPTS_PER_PLAYER) ||
			[...promptKeys].some((key) => typeof values[key] !== 'string')
		) {
			this.sendError(conn, 'Each of three players must receive nine prompts.');
			return;
		}

		this.gameState = {
			status: 'pretrial',
			pretrial: {
				fields,
				values,
				playerIds: [...assignedCounts.keys()],
				submittedPlayerIds: [],
			},
			sequence,
			stepIndex: 0,
			readyStepIndex: null,
			readyPlayerIds: [],
			activeStepReady: false,
			finishedPlayerIds: [],
			roles: null,
			transcript: [],
			verdict: null,
			explanation: null,
		};
		this.broadcastState();
	}

	submitPretrial(conn, values) {
		if (!this.gameState || this.gameState.status !== 'pretrial') {
			this.sendError(conn, 'The pre-trial is not accepting submissions.');
			return;
		}

		const playerId = this.connectionPlayerIds.get(conn.id);
		const fields = this.gameState.pretrial.fields.filter((field) => field.assignedPlayerId === playerId);
		if (fields.length === 0) {
			this.sendError(conn, 'You do not have pre-trial prompts assigned.');
			return;
		}

		if (this.gameState.pretrial.submittedPlayerIds.includes(playerId)) {
			this.sendError(conn, 'You have already submitted your pre-trial words.');
			return;
		}

		if (!values || typeof values !== 'object' || Array.isArray(values)) {
			this.sendError(conn, 'Submit all nine pre-trial words.');
			return;
		}

		const submittedKeys = Object.keys(values);
		const assignedKeys = new Set(fields.map((field) => field.key));
		if (submittedKeys.length !== fields.length || submittedKeys.some((key) => !assignedKeys.has(key))) {
			this.sendError(conn, 'Submit only your nine assigned pre-trial words.');
			return;
		}

		const cleanValues = {};
		for (const field of fields) {
			const value = values[field.key];
			if (
				typeof value !== 'string' ||
				value.trim().length === 0 ||
				value.trim().length > MAX_PROMPT_LENGTH ||
				!/^[A-Za-z0-9 ,.'-]+$/.test(value.trim())
			) {
				this.sendError(conn, 'Each word must use letters, numbers, spaces, or basic punctuation.');
				return;
			}
			cleanValues[field.key] = value.trim();
		}

		this.gameState.pretrial.values = {
			...this.gameState.pretrial.values,
			...cleanValues,
		};
		this.gameState.pretrial.submittedPlayerIds.push(playerId);

		if (this.gameState.pretrial.submittedPlayerIds.length === this.gameState.pretrial.playerIds.length) {
			const shuffledPlayers = [...this.gameState.pretrial.playerIds];
			for (let i = shuffledPlayers.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
			}

			const roles = {};
			for (let i = 0; i < ROLES.length; i++) {
				roles[shuffledPlayers[i]] = ROLES[i];
			}

			const getPlayerName = (role) => this.players.get(Object.keys(roles).find((id) => roles[id] === role)).name;

			this.gameState.pretrial.values = {
				...this.gameState.pretrial.values,
				judge_name: getPlayerName('judge'),
				prosec_name: getPlayerName('prosecution'),
				defend_name: getPlayerName('defense'),
				verdict: '',
			};
			this.gameState.roles = roles;
			this.gameState.status = 'playing';
		}

		this.broadcastState();
	}

	readyForStep(conn, stepIndex) {
		if (!this.gameState || this.gameState.status !== 'playing') {
			this.sendError(conn, 'The game is not in progress.');
			return;
		}

		const playerId = this.connectionPlayerIds.get(conn.id);
		const playerIds = this.gameState.pretrial.playerIds;
		if (!playerIds.includes(playerId)) {
			this.sendError(conn, 'Only trial players can join the live session.');
			return;
		}

		if (this.gameState.activeStepReady) {
			this.sendError(conn, 'The live court session has already started.');
			return;
		}

		const currentStep = this.gameState.sequence[this.gameState.stepIndex];
		const currentStepNeedsReady = currentStep && ['turn', 'verdict'].includes(currentStep.type);
		const nextStepIndex = currentStepNeedsReady
			? this.gameState.stepIndex
			: this.gameState.sequence.findIndex((step, index) => index > this.gameState.stepIndex && ['turn', 'verdict'].includes(step.type));
		if (nextStepIndex < 0 || stepIndex !== nextStepIndex) {
			this.sendError(conn, 'The game has moved on. Please use the current prompt.');
			return;
		}

		if (this.gameState.readyStepIndex !== null && this.gameState.readyStepIndex !== stepIndex) {
			this.sendError(conn, 'Players are preparing for a different court session.');
			return;
		}

		this.gameState.readyStepIndex = stepIndex;
		if (!this.gameState.readyPlayerIds.includes(playerId)) {
			this.gameState.readyPlayerIds.push(playerId);
		}

		if (this.gameState.readyPlayerIds.length === playerIds.length) {
			this.gameState.stepIndex = stepIndex;
			this.gameState.readyStepIndex = null;
			this.gameState.readyPlayerIds = [];
			this.gameState.activeStepReady = true;
		}

		this.broadcastState();
	}

	finishScript(conn, stepIndex) {
		if (!this.gameState || this.gameState.status !== 'playing') {
			this.sendError(conn, 'The game is not in progress.');
			return;
		}

		const playerId = this.connectionPlayerIds.get(conn.id);
		const playerIds = this.gameState.pretrial.playerIds;
		const finalStepIndex = this.gameState.sequence.length - 1;
		if (!playerIds.includes(playerId)) {
			this.sendError(conn, 'Only trial players can finish the script.');
			return;
		}

		if (
			stepIndex !== finalStepIndex ||
			this.gameState.stepIndex !== finalStepIndex ||
			this.gameState.sequence[finalStepIndex]?.type !== 'dialogue'
		) {
			this.sendError(conn, 'The script is not ready to be finished.');
			return;
		}

		if (!this.gameState.finishedPlayerIds.includes(playerId)) {
			this.gameState.finishedPlayerIds.push(playerId);
		}
		if (this.gameState.finishedPlayerIds.length === playerIds.length) {
			this.gameState.status = 'completed';
		}

		this.broadcastState();
	}

	submitTurn(conn, data) {
		if (!this.isCurrentStep(data.stepIndex, 'turn', conn)) return;

		const playerId = this.connectionPlayerIds.get(conn.id);
		const step = this.gameState.sequence[this.gameState.stepIndex];
		const text = typeof data.text === 'string' ? data.text.trim() : '';

		if (this.gameState.roles[playerId] !== step.role) {
			this.sendError(conn, "It is not your role's turn.");
			return;
		}

		if (!text || text.length > MAX_TURN_LENGTH) {
			this.sendError(conn, `Your argument must be between 1 and ${MAX_TURN_LENGTH} characters.`);
			return;
		}

		this.gameState.transcript.push({
			role: step.role,
			player: this.players.get(playerId)?.name ?? 'Player',
			text,
			stepIndex: this.gameState.stepIndex,
		});
		this.advanceStep();
	}

	chooseVerdict(conn, data) {
		if (!this.isCurrentStep(data.stepIndex, 'verdict', conn)) return;

		const playerId = this.connectionPlayerIds.get(conn.id);
		if (this.gameState.roles[playerId] !== 'judge') {
			this.sendError(conn, 'Only the Judge can choose the verdict.');
			return;
		}

		if (!['guilty', 'not guilty'].includes(data.verdict)) {
			this.sendError(conn, 'Choose guilty or not guilty.');
			return;
		}

		if (typeof data.explanation !== 'string') {
			this.sendError(conn, `Enter an explanation of up to ${MAX_VERDICT_EXPLANATION_LENGTH} characters.`);
			return;
		}

		const explanation = data.explanation.trim();
		if (!explanation || data.explanation.length > MAX_VERDICT_EXPLANATION_LENGTH) {
			this.sendError(conn, `Enter an explanation of 1 to ${MAX_VERDICT_EXPLANATION_LENGTH} characters.`);
			return;
		}

		this.gameState.verdict = data.verdict;
		this.gameState.explanation = explanation;
		this.advanceStep();
	}

	isCurrentStep(stepIndex, expectedType, conn) {
		if (!this.gameState || this.gameState.status !== 'playing') {
			this.sendError(conn, 'The game is not in progress.');
			return false;
		}

		if (stepIndex !== this.gameState.stepIndex) {
			this.sendError(conn, 'The game has moved on. Please use the current prompt.');
			return false;
		}

		if (this.gameState.sequence[stepIndex]?.type !== expectedType) {
			this.sendError(conn, 'That action is not available at this step.');
			return false;
		}

		if (!this.gameState.activeStepReady) {
			this.sendError(conn, 'Wait for all players to be ready before starting.');
			return false;
		}

		return true;
	}

	advanceStep() {
		this.gameState.stepIndex++;
		this.gameState.readyStepIndex = null;
		this.gameState.readyPlayerIds = [];
		this.gameState.activeStepReady = false;
		if (this.gameState.stepIndex >= this.gameState.sequence.length) {
			this.gameState.status = 'completed';
		}
		this.broadcastState();
	}

	sendError(conn, message) {
		conn.send(JSON.stringify({ type: 'error', message }));
	}

	sendState(conn) {
		let gameState = this.gameState;
		if (gameState?.status === 'pretrial') {
			gameState = {
				...gameState,
				pretrial: { ...gameState.pretrial },
			};
			delete gameState.pretrial.values;
		}

		const state = {
			type: 'sync',
			players: Array.from(this.players.values()).map((player) => ({
				...player,
				role: this.gameState?.roles?.[player.id] ?? null,
			})),
			hostId: this.hostId,
			gameState,
		};

		if (conn) {
			conn.send(JSON.stringify(state));
		} else {
			this.broadcast(JSON.stringify(state));
		}
	}

	broadcastState() {
		this.sendState();
	}
}

export default {
	async fetch(request, env) {
		return (await routePartykitRequest(request, env)) || new Response('Not found', { status: 404 });
>>>>>>> 7e32757746dfb4e02be04be84f63737ed2f387dc
	},
};
