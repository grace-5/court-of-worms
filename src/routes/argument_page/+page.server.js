import { createPretrialData } from '../../lib/server/madlibs.js';
import { loadScriptTemplate } from '../../lib/server/completed-script.js';

export async function load() {
	const [script, pretrial] = await Promise.all([loadScriptTemplate(), createPretrialData()]);

	return {
		script,
		pretrial
	};
}
