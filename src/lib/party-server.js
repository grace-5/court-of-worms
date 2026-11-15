export const partyServerHost =
	import.meta.env.VITE_PARTY_SERVER_HOST || (import.meta.env.DEV ? 'localhost:8787' : null);
