export interface Entry {
	word: string;
	meaning: string;
}

export type WordType =
	| 'adjective'
	| 'adverb'
	| 'conjunction'
	| 'interjection'
	| 'noun'
	| 'number'
	| 'prefix'
	| 'preposition'
	| 'pronoun'
	| 'suffix'
	| 'verb';

export interface FullEntry extends Entry {
	type: WordType;
}
