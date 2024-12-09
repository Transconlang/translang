import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Entry, WordType, FullEntry, Section } from './types';

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

function parseTableRow(row: string): string[] {
	return row
		.slice(1, -1)
		.split('|')
		.map(v => v.trim());
}

async function parseObscurisms(): Promise<Map<string, string>> {
	const obscureMap = new Map<string, string>();
	const content = await readFile(
		join(dirname(fileURLToPath(import.meta.url)), '..', 'Obscurisms.md'),
		'utf-8'
	);

	const rows = content
		.split('\n')
		.map(v => v.trim())
		.filter(v => v.startsWith('|') && v.endsWith('|'));

	for (const row of rows) {
		const [obscure, standard] = parseTableRow(row);
		if (standard && obscure) obscureMap.set(standard.trim(), obscure.trim());
	}

	return obscureMap;
}

const obscureMap = await parseObscurisms();

const Files = await readdir(SourceDirectory);
const CompleteDictionaryStack: FullEntry[] = [];

const h2Matcher = /^## [A-z\s!-,()]+$/i;
const tableRowMatcher = /^\| [^|]* \|( [^|]* \|)+$/i;

for (const file of Files) {
	const content = await readFile(join(SourceDirectory, file), 'utf-8');
	const unfilteredRows = content.split('\n').map(v => v.trim());
	const rows = unfilteredRows.filter(
		v =>
			v.replaceAll(/[\|\s\-]/gi, '').length > 0 &&
			(tableRowMatcher.test(v) || h2Matcher.test(v))
	);

	const type = (() => {
		const asdf = file.toLowerCase().replace(/s\.md$/, '');
		if (asdf === 'prefixe') return 'prefix';
		if (asdf === 'suffixe') return 'suffix';
		return asdf;
	})() as WordType;

	const sectionStack: Section[] = [];
	let subSectionStack: Entry[] = [];
	let title = null;
	let justStartedNewSection = true;
	let headers: string[] = [];
	for (const row of rows) {
		if (h2Matcher.test(row)) {
			title = row.slice(3);
			if (subSectionStack.length > 0)
				sectionStack.push({ type, title, headers, entries: subSectionStack });
			subSectionStack = [];
			justStartedNewSection = true;
			continue;
		}

		const parsedRow = row
			.slice(1, -1)
			.split('|')
			.map(v => v.slice(1, -1));

		// no using !v because it will throw an error if v is an empty string
		if (parsedRow.some(v => v === null || v === undefined))
			throw new Error(
				`Invalid row (at row ${unfilteredRows.indexOf(row)} of ${file}): ${row}`
			);

		if (justStartedNewSection) {
			headers = parsedRow;
			justStartedNewSection = false;
			continue;
		}

		const [word, meaning, impl] = parsedRow;

		subSectionStack.push({
			word,
			meaning,
			impl,
			obscurism: obscureMap.get(word) ?? null
		} satisfies Entry);

		CompleteDictionaryStack.push({
			word,
			meaning,
			impl,
			type,
			obscurism: obscureMap.get(word) ?? null
		} satisfies FullEntry);
	}

	subSectionStack.length > 0 &&
		sectionStack.push({
			type,
			title,
			headers,
			entries: subSectionStack
		} satisfies Section);

	const targetFile = join(
		TargetDirectory,
		file.toLowerCase().replace(/\.md$/, '.json')
	);

	await writeFile(
		targetFile,
		JSON.stringify(sectionStack, null, '\t'),
		'utf-8'
	);
}

await writeFile(
	join(TargetDirectory, '0-complete.json'),
	JSON.stringify(CompleteDictionaryStack, null, '\t'),
	'utf-8'
);
