/**
 * The type of the entry in each separated file (i.e. verbs.json)
 */
export interface Section {
	title: string;
	type: WordType;
	description?: string;
	entries: Entry[];
}

export interface Entry {
	strascii: string;
	type: WordType;
	eng_trans: string;
	def: string;
	strascii_obscure: string;
}

/**
 * The type of entry in the complete dictionary (0-complete.json)
 * @extends Entry Also contains the properties from the Entry type
 */
export interface FullEntry extends Entry {
	section?: string;
	section_description?: string;
}

export interface ObscureEntry {
	standard: string;
	obscure: string;
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
