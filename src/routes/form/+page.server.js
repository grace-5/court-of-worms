import fs from 'node:fs/promises';
import path from 'node:path';
import { redirect } from '@sveltejs/kit';
import { getRandomWord, loadWordBanks } from '../../lib/server/madlibs.js';

const dataDir = path.join(process.cwd(), 'src/routes/data');

export async function load() {
	let mad = await assignMadlibs();
	return {
		madlibs: mad
	};
}

// MadLibsForm stuff!
async function assignMadlibs() {
	const filePath = path.join(dataDir, 'madlibs_ref.json');
	const rawData = await fs.readFile(filePath, 'utf-8');

	const jsonData = JSON.parse(rawData);
	const banks = await loadWordBanks();

	const users = ['user1', 'user2', 'user3'];
	const keys = Object.keys(jsonData);

	// Shuffle keys
	for (let i = keys.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[keys[i], keys[j]] = [keys[j], keys[i]];
	}

	let assignedCount = 0;
	const maxAssigned = users.length * 9;

	for (const key of keys) {
		const field = jsonData[key];

		if (assignedCount < maxAssigned) {
			// Give 9 per player
			field.assigned_user = users[assignedCount % users.length];
			field.value = '';
			assignedCount++;
		} else {
			// Auto random rest of prompts
			field.assigned_user = '';
			field.value = getRandomWord(field.type, banks);
		}
	}

	await fs.writeFile(path.join(dataDir, 'madlibs.json'), JSON.stringify(jsonData), 'utf-8');

	return jsonData;
}

// End MadLibsForm stuff

export const actions = {
	submit: async ({ request }) => {
		const data = await request.formData();
		const filePath = path.join(dataDir, 'madlibs.json');

		const rawData = await fs.readFile(filePath, 'utf-8');
		const existingData = JSON.parse(rawData);

		for (const [key, value] of data.entries()) {
			if (existingData[key]) {
				existingData[key].value = value;
			}
		}

		await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf-8');

		throw redirect(303, '/completed');
	}
};
