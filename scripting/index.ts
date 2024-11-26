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
/**
	const files = await readdir(SourceDirectory);
	const completeDict: Entry[] = [];
*/

/**
	for (const file of files) {
		if (!file.endsWith('.md')) continue;

		const content = await readFile(join(SourceDirectory, file), 'utf-8');
		const entries: Entry[] = [];

		const type = file.toLowerCase().replace(/s\.md$/, '') as WordType;

		const rows = content
			.split('\n')
			.map(v => v.trim())
			.filter(v => v.startsWith('|') && v.endsWith('|') && !v.includes('---'));

		let isHeader = true;
		for (const row of rows) {
			if (isHeader) {
				isHeader = false;
				continue;
			}

			const [strascii, eng_trans, def] = parseTableRow(row);

			const entry: Entry = {
				strascii: strascii.trim(),
				type,
				eng_trans: eng_trans.trim(),
				def: def?.trim() || '',
				strascii_obscure: obscureMap.get(strascii.trim()) || ''
			};

			entries.push(entry);
			completeDict.push(entry);
		}

		await writeFile(
			join(TargetDirectory, file.toLowerCase().replace(/\.md$/, '.json')),
			JSON.stringify(entries, null, '\t'),
			'utf-8'
		);
	}
*/

const Files = await readdir(SourceDirectory);
const CompleteDictionaryStack: FullEntry[] = [];

const h2Matcher = /^## [A-z\s!-,()]+$/i;
const tableRowMatcher = /^\| [^|]* \|( [^|]* \|)+$/i;

for (const file of Files) {
	const content = await readFile(join(SourceDirectory, file), 'utf-8');
	const rows = content
		.split('\n')
		.map(v => v.trim())
		.filter(
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
	for (const row of rows) {
		if (h2Matcher.test(row)) {
			title = row.slice(3);
			if (subSectionStack.length > 0)
				sectionStack.push({ type, title, entries: subSectionStack });
			subSectionStack = [];
			justStartedNewSection = true;
			continue;
		}

		const [word, meaning, english] = row
			.slice(1, -1)
			.split('|')
			.map(v => v.slice(1, -1));

		if (justStartedNewSection) {
			justStartedNewSection = false;
			continue;
		}

		subSectionStack.push({
			word,
			meaning,
			english: english ?? null,
			obscurism: obscureMap.get(word) ?? null
		} satisfies Entry);

		CompleteDictionaryStack.push({
			word,
			meaning,
			english: english ?? null,
			type,
			obscurism: obscureMap.get(word) ?? null
		} satisfies FullEntry);
	}
	subSectionStack.length > 0 &&
		sectionStack.push({
			type,
			title,
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
