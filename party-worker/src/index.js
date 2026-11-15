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
		}
	}

	onClose(conn) {
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
		
	},
};
