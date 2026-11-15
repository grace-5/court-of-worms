import fs from 'node:fs/promises';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'src/routes/data');
const wordBankDir = path.join(dataDir, 'wordbanks');

const wordBankFiles = {
	name: 'names.txt',
	place: 'places.txt',
	noun: 'nouns.txt',
	plural_noun: 'plural_nouns.txt',
	adjective: 'adjectives.txt',
	adverb: 'adverbs.txt',
	verb_base: 'verb_base.txt',
	verb_past: 'verb_past.txt',
	verb_ing: 'verb_ing.txt',
	verb_past_participle: 'verb_past_participle.txt',
	body_part: 'body_parts.txt',
	number: 'numbers.txt'
};

export async function loadWordBanks() {
	const banks = {};

	for (const [type, filename] of Object.entries(wordBankFiles)) {
		const contents = await fs.readFile(path.join(wordBankDir, filename), 'utf-8');
		banks[type] = contents
			.split(/\r?\n/)
			.map((word) => word.trim())
			.filter((word) => word.length > 0);
	}

	return banks;
}

export function getRandomWord(type, banks) {
	const words = banks[type];

	if (!words || words.length === 0) {
		throw new Error(`No word bank found for type: ${type}`);
	}

	return words[Math.floor(Math.random() * words.length)];
}

export async function createPretrialData() {
	const madlibs = JSON.parse(await fs.readFile(path.join(dataDir, 'madlibs_ref.json'), 'utf-8'));
	const banks = await loadWordBanks();
	const keys = Object.keys(madlibs);

	for (let i = keys.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[keys[i], keys[j]] = [keys[j], keys[i]];
	}

	const promptKeys = keys.slice(0, 27);
	if (promptKeys.length !== 27) {
		throw new Error('The Mad Libs template must contain at least 27 prompts.');
	}

	const promptSet = new Set(promptKeys);
	const values = Object.fromEntries(
		Object.entries(madlibs).map(([key, field]) => [
			key,
			promptSet.has(key) ? '' : getRandomWord(field.type, banks)
		])
	);
	const fields = Object.entries(madlibs).map(([key, field]) => ({
		key,
		type: field.type,
		description: field.description,
		examples: field.examples
	}));

	return { fields, promptKeys, values };
}
