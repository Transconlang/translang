import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Entry, FullEntry, Section, WordType } from './types';

const SourceDirectory = join(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'Vocabulary'
);
const TargetDirectory = join(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'rawspec'
);

const Files = await readdir(SourceDirectory);

const CompleteDictionaryStack: FullEntry[] = [];

for (const file of Files) {
	const content = await readFile(join(SourceDirectory, file), 'utf-8');
	const rows = content
		.split('\n')
		.map(v => v.trim())
		.filter(
			v =>
				!v.includes('Spelling | Definition') &&
				!v.includes('Word | Meaning') &&
				v.replaceAll(/[\|\s\-]/g, '').length > 0 &&
				(/^\| [^|]+ \|( [^|]+ \|)+$/.test(v) || /^## [a-zA-Z\s]+$/.test(v))
		);

	const type = (() => {
		const asdf = file.toLowerCase().replace(/s\.md$/, '');
		if (asdf === 'prefixe') return 'prefix';
		if (asdf === 'suffixe') return 'suffix';
		else return asdf;
	})() as WordType;

	const sectionStack: Section[] = [];
	let subSectionStack: Entry[] = [];
	let title = undefined;
	for (const row of rows) {
		if (/^## [a-zA-Z\s]+$/.test(row)) {
			title = row.slice(3);
			subSectionStack.length > 0 &&
				sectionStack.push({ type, title, entries: subSectionStack });
			subSectionStack = [];
		} else {
			const [word, meaning, ...extra] = row
				.slice(1, -1)
				.split('|')
				.map(v => v.slice(1, -1));
			subSectionStack.push({ word, meaning, extra });
			CompleteDictionaryStack.push({
				word,
				meaning,
				extra,
				type
			} satisfies FullEntry);
		}
	}
	subSectionStack.length > 0 &&
		sectionStack.push({ type, title, entries: subSectionStack });

	const map = rows.map(row =>
		row
			.slice(1, -1)
			.split('|')
			.map(v => v.slice(1, -1))
	);

	const targetFile = join(
		TargetDirectory,
		file.toLowerCase().replace(/\.md$/, '.json')
	);

	await writeFile(targetFile, JSON.stringify(sectionStack, null, '	'), 'utf-8');

	CompleteDictionaryStack.push(
		...map.map(
			([word, meaning, ...extra]) =>
				({ word, meaning, extra, type }) satisfies FullEntry
		)
	);
}

await writeFile(
	join(TargetDirectory, '0-complete.json'),
	JSON.stringify(CompleteDictionaryStack, null, '	'),
	'utf-8'
);
