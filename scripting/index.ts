import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Entry, WordType, FullEntry, Section, BigSection } from './types';

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
const CattedBigSectionStack: BigSection[] = [];

const h1Matcher = /^# .+$/i;
const h2Matcher = /^## .+$/i;
const tableSeparatorMatcher = /^\|[-\|]+\|$/i;
const tableRowMatcher = /^\| [^|]* \|( [^|]* \|| \|)+$/i;

for (const file of Files) {
	const content = await readFile(join(SourceDirectory, file), 'utf-8');
	const unfilteredRows = content.split('\n').map(v => v.trim());

	const nonDataRows = new Map<string, string>();
	const rows: string[] = [];

	let previousRow = unfilteredRows[0];
	for (const row of unfilteredRows) {
		if (
			row.length === 0 ||
			h1Matcher.test(row) ||
			tableSeparatorMatcher.test(row)
		)
			continue;

		if (tableRowMatcher.test(row)) rows.push(row);
		else if (h2Matcher.test(row)) {
			rows.push(row);
			previousRow = row;
		} else nonDataRows.set(previousRow, row);
	}

	// const rows = unfilteredRows.filter(
	// 	v => tableRowMatcher.test(v) || h2Matcher.test(v)
	// );

	const type = (() => {
		const asdf = file.toLowerCase().replace(/s\.md$/, '');
		if (asdf === 'prefixe') return 'prefix';
		if (asdf === 'suffixe') return 'suffix';
		return asdf as WordType;
	})();

	console.log(`Processing ${file} as type ${type}...`);

	const sectionStack: Section[] = [];
	let subSectionStack: Entry[] = [];
	let title = null;
	let justStartedNewSection = true;
	let headers: string[] = [];
	for (const row of rows) {
		if (h2Matcher.test(row)) {
			if (subSectionStack.length > 0)
				sectionStack.push({
					type,
					title,
					headers,
					entries: subSectionStack.sort((a, b) =>
						a.word
							.replaceAll(/[^a-zA-Z]/g, '')
							.localeCompare(b.word.replaceAll(/[^a-zA-Z]/g, ''))
					)
				} satisfies Section);
			title = row.slice(3);
			subSectionStack = [];
			justStartedNewSection = true;
			continue;
		}

		const parsedRow = row
			.slice(1, -1)
			.split('|')
			.map(v => v.trim());

		// What the hell is this for?
		/**
			// no using !v because it will throw an error if v is an empty string
			if (parsedRow.some(v => v === null || v === undefined))
				throw new Error(
					`Invalid row (at row ${unfilteredRows.indexOf(row)} of ${file}): ${row}`
				);
		*/

		if (justStartedNewSection) {
			headers = parsedRow;
			justStartedNewSection = false;
			continue;
		}

		let [word, meaningBinding, implBinding] = parsedRow;

		word = word.replaceAll('**', '');
		let meaning = meaningBinding || null;
		let impl = implBinding || null;

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

	if (subSectionStack.length > 0)
		sectionStack.push({
			type,
			title,
			headers,
			entries: subSectionStack.sort((a, b) =>
				a.word
					.replaceAll(/[^a-zA-Z]/g, '')
					.localeCompare(b.word.replaceAll(/[^a-zA-Z]/g, ''))
			)
		} satisfies Section);

	await writeFile(
		join(SourceDirectory, file),
		unfilteredRows[0] +
			'\n\n' +
			(nonDataRows.has(unfilteredRows[0])
				? nonDataRows.get(unfilteredRows[0]) + '\n\n'
				: '') +
			sectionStack
				.map(section => {
					let sectionString = '';
					if (section.title) {
						const subtitleRow = `## ${section.title}`;
						sectionString += subtitleRow + '\n\n';
						if (nonDataRows.has(subtitleRow))
							sectionString += nonDataRows.get(subtitleRow) + '\n\n';
					}
					sectionString += `| ${section.headers.join(' | ')} |\n`;
					sectionString += `|${section.headers.map(header => '--' + '-'.repeat(header.length)).join('|')}|\n`;
					sectionString += section.entries
						.map(
							entry =>
								`| ${entry.word} | ${entry.meaning ?? ''} | ${entry.impl ?? ''} |`
						)
						.join('\n');
					return sectionString;
				})
				.join('\n\n') +
			'\n'
	);

	const targetFile = join(
		TargetDirectory,
		file.toLowerCase().replace(/\.md$/, '.json')
	);

	await writeFile(
		targetFile,
		JSON.stringify(sectionStack, null, '\t'),
		'utf-8'
	);

	CattedBigSectionStack.push({
		title: file.replace(/\.md$/, ''),
		sections: sectionStack
	} satisfies BigSection);
}

const AlphabetizedCompleteDictionaryStack = CompleteDictionaryStack.sort(
	(a, b) =>
		a.word
			.replaceAll(/[^a-zA-Z]/g, '')
			.localeCompare(b.word.replaceAll(/[^a-zA-Z]/g, ''))
);

await writeFile(
	join(TargetDirectory, '0-complete.json'),
	JSON.stringify(AlphabetizedCompleteDictionaryStack, null, '\t'),
	'utf-8'
);

await writeFile(
	join(TargetDirectory, '0-catted.json'),
	JSON.stringify(CattedBigSectionStack, null, '\t'),
	'utf-8'
);
