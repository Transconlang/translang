/**
 * These are some basic validation checks for the rawspec data.
 * This script is not meant to be run in production, but rather as a development tool.
 *
 * It is NOT meant to be a failsafe.
 * Any updates to the main script should be checked.
 *
 * This is NOT a complete check.
 * Do not rely on this script to catch all errors.
 */

import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const TargetDirectory = join(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'rawspec'
);

const FullData = await readFile(
	join(TargetDirectory, '0-complete.json'),
	'utf-8'
);

let parsed;
try {
	parsed = JSON.parse(FullData);
} catch (error) {
	console.error(error);
	process.exit(1);
}

if (!Array.isArray(parsed)) {
	console.error('The parsed data is not an array');
	process.exit(1);
}

for (const entry of parsed) {
	if (Object.keys(entry).length !== 5) {
		console.error(
			`An entry has an unexpected number of keys:\n${JSON.stringify(entry, null, '\t')}`
		);
		process.exit(1);
	}
	if (typeof entry.word !== 'string' || !entry.word) {
		console.error(
			`An entry has an invalid word:\n${JSON.stringify(entry, null, '\t')}`
		);
		process.exit(1);
	}
	if (typeof entry.type !== 'string' || !entry.type) {
		console.error(
			`An entry has an invalid type:\n${JSON.stringify(entry, null, '\t')}`
		);
		process.exit(1);
	}
	if (!entry.meaning && !entry.impl) {
		console.error(
			`An entry has neither a meaning nor an implication:\n${JSON.stringify(entry, null, '\t')}`
		);
		process.exit(1);
	}
}

console.log('Validation complete, no errors found.');
