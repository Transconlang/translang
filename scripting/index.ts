import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Entry, FullEntry, WordType } from './types';

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
		.filter(
			v =>
				!v.includes('Spelling') &&
				v.replaceAll(/[\|\s\-]/g, '').length > 0 &&
				/^\| [^|]+ \|( [^|]+ \|)+$/.test(v)
		);
	// console.log(file, rows);
	const map = rows.map(row =>
		row
			.slice(1, -1)
			.split('|')
			.map(v => v.slice(1, -1))
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
