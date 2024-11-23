import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Entry, WordType, ObscureEntry } from './types';

const SourceDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'Vocabulary');
const TargetDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'rawspec');


function parseTableRow(row: string): string[] {
	return row.slice(1, -1).split('|').map(v => v.trim());
}

async function parseObscurisms(): Promise<Map<string, string>> {
	const obscureMap = new Map<string, string>();
	const content = await readFile(join(dirname(fileURLToPath(import.meta.url)), '..', 'Obscurisms.md'), 'utf-8');
	
	const rows = content.split('\n')
		.map(v => v.trim())
		.filter(v => v.startsWith('|') && v.endsWith('|'));

	for (const row of rows) {
		const [obscure, standard, type] = parseTableRow(row);
		if (standard && obscure) {
			obscureMap.set(standard.trim(), obscure.trim());
		}
	}

	return obscureMap;
}

async function main() {
	const obscureMap = await parseObscurisms();
	const files = await readdir(SourceDirectory);
	const completeDict: Entry[] = [];

	for (const file of files) {
		if (!file.endsWith('.md')) continue;

		const content = await readFile(join(SourceDirectory, file), 'utf-8');
		const entries: Entry[] = [];
		
		const type = file.toLowerCase().replace(/s\.md$/, '') as WordType;
		
		const rows = content.split('\n')
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
			join(TargetDirectory, file.replace(/\.md$/, '.json')),
			JSON.stringify(entries, null, '\t'),
			'utf-8'
		);
	}

	await writeFile(
		join(TargetDirectory, '0-complete.json'),
		JSON.stringify(completeDict, null, '\t'),
		'utf-8'
	);
}

main().catch(console.error);