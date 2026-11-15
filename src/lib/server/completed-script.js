import fs from 'node:fs/promises';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'src/routes/data');

export async function loadScriptTemplate() {
	return JSON.parse(await fs.readFile(path.join(dataDir, 'script.json'), 'utf-8'));
}

export async function loadCompletedScript() {
	const [madlibsRaw, script, gameDataRaw] = await Promise.all([
		fs.readFile(path.join(dataDir, 'madlibs.json'), 'utf-8'),
		loadScriptTemplate(),
		fs.readFile(path.join(dataDir, 'game_data.json'), 'utf-8')
	]);

	const madlibs = JSON.parse(madlibsRaw);
	const gameData = JSON.parse(gameDataRaw);

	const allMadlibs = {
		...madlibs,
		...gameData
	};

	return {
		...script,
		sections: script.sections.map((section) => {
			if (section.type === 'turn' || section.type === 'verdict') {
				return section;
			}

			return {
				...section,
				paragraphs: section.paragraphs.map((paragraph) =>
					paragraph.replace(/\{(\w+)\}/g, (match, key) => {
						const value = allMadlibs[key]?.value;

						if (value == null || value.trim() === '') {
							console.warn(`Missing Mad Lib value: ${key}`);
							return `[${key}]`;
						}

						return value;
					})
				)
			};
		})
	};
}
