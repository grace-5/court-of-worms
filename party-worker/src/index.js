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

export class ChatServer extends Server {
	onMessage(sender, message) {
		this.broadcast(message);
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
