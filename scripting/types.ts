/**
 * The type of the entry in each separated file (i.e. verbs.json)
 */
export interface Section {
	title: string | null;
	headers: string[];
	type: WordType;
	entries: Entry[];
}

export interface Entry {
	word: string;
	meaning: string | null;
	impl: string | null;
	obscurism: string | null;
}

/**
 * The type of entry in the complete dictionary (0-complete.json)
 * @extends Entry Also contains the properties from the Entry type
 */
export interface FullEntry extends Entry {
	type: WordType;
}

/**
 * The types of words there can be
 */
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
	| 'verb'
	| 'article';
