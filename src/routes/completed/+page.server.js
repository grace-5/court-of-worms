import { loadCompletedScript } from '../../lib/server/completed-script.js';

export async function load() {
	return {
		script: await loadCompletedScript()
	};
}
