import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

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
	const data = map.map(([word, meaning]) => ({ word, meaning }));

	const targetFile = join(
		TargetDirectory,
		file.toLowerCase().replace(/\.md$/, '.json')
	);

	await writeFile(targetFile, JSON.stringify(data, null, '	'), 'utf-8');
}
