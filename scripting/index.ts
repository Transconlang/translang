import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Entry, FullEntry, WordType } from './types';
import { JSDOM } from 'jsdom';

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

function parsetablehtml(content: string): Entry[] {
	const dom = new JSDOM(content);
	const table = dom.window.document.querySelector('table');
	if (!table) return [];

	const rows = Array.from(table.querySelectorAll('tbody tr'));
	const entries: Entry[] = [];
	for (const row of rows) {
		const cells = Array.from(row.querySelectorAll('td')).map((cell) =>
			cell.textContent?.trim() || ''
		);
		if (cells.length < 2) continue;
		const [useCase, termination, ...others] = cells;
		const meanings = others.join(' | ');
		entries.push({ word: `${useCase} (${termination})`, meaning: meanings });
	}

	return entries;
}

for (const file of Files) {
	const content = await readFile(join(SourceDirectory, file), 'utf-8');
	let data: Entry[] = [];
	if (content.includes('<table')) {
		data = parseHTMLTable(content);
	}
	else {
		const rows = content
			.split('\n')
			.map(v => v.trim())
			.filter(
				v =>
					!v.includes('Spelling | Definition') && !v.includes('Word | Meaning') &&
					v.replaceAll(/[\|\s\-]/g, '').length > 0 &&
					/^\| [^|]+ \|( [^|]+ \|)+$/.test(v)
			);
		
	// console.log(file, rows);
		const map = rows.map(row =>
			row
				.slice(1, -1)
				.split('|')
				.map(v => v.trim())
		);
	// console.log(file, map);
	const data: Entry[] = map.map(([word, meaning]) => ({ word, meaning }));

	const wordType = (() => {
		const asdf = file.toLowerCase().replace(/s\.md$/, '');
		if (asdf === 'prefixe') return 'prefix';
		if (asdf === 'suffixe') return 'suffix';
		else return asdf;
	})() as WordType;

	const targetFile = join(
		TargetDirectory,
		file.toLowerCase().replace(/\.md$/, '.json')
	);

	await writeFile(targetFile, JSON.stringify(data, null, '	'), 'utf-8');

	CompleteDictionaryStack.push(
		...data.map(entry => ({ ...entry, type: wordType }) satisfies FullEntry)
	);
}

await writeFile(
	join(TargetDirectory, '0-complete.json'),
	JSON.stringify(CompleteDictionaryStack, null, '	'),
	'utf-8'
);
