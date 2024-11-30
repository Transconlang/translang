# Translang
The trans constructed language :3
Help us out at r/transconlang

## Contributing

Please read the [CONTRIBUTING](CONTRIBUTING.md) file for guidelines!

## Table of contents

- [CONTRIBUTING](CONTRIBUTING.md)
- [Grammar](Grammar.md)
- [Phonetics](Phonetics.md)
- [Examples](Examples.md)
- [Formatting](Formatting.md)
- Vocabulary
	- [Nouns](Vocabulary/Nouns.md)
	- [Adjectives](Vocabulary/Adjectives.md)
	- [Verbs](Vocabulary/Verbs.md)
	- [Pronouns](Vocabulary/Pronouns.md)
	- [Numbers](Vocabulary/Numbers.md)
	- [Suffixes](Vocabulary/Suffixes.md)
	- [Prefixes](Vocabulary/Prefixes.md)
	- [Conjunctions](Vocabulary/Conjunctions.md)
	- [Interjections](Vocabulary/Interjections.md)
	- [Adverbs](Vocabulary/Adverbs.md)
	- [Prepositions](Vocabulary/Prepositions.md)

## Common Misunderstandings

### ni- vs mo- vs -fe

The difference between the affixes ni- , mo- , and -fe may seem confusing for some people.

#### A general definition is:
- ni- ***is used for negation***, having exactly the same meaning as non- in english, and thus ***establishes that the word is specifically not what the rest of it means***. It can thus definitively refer to one concrete word (see first example), or be more abstract and refer to a wider array of possible options (see examples two and three). Examples:
	1. nikumi , literal meaning being non-trans, and since the only possibilities in this case are trans and cis, cis
	2. ni[positive] (we don't have words for positive, neutral, and negative), which would literally mean non-positive, and could thus mean negative or neutral
	3. nikase , literal meaning being non-cat, which could mean anything without specific context. Thus, **certain combinations with ni- are impractical and should not be used**.
- mo- ***is used for inversion***, meaning "the contrary/inverse of", and hence ***establishes that the word is the contrary of what the rest of it means***. It thus always definitively refers to one concrete word, unless there is ambiguity in the interpretation. Examples:
	1. mo[positive] (we don't have words for positive, neutral, and negative), which would literally mean the contrary of positive (negative)
- -fe ***is used to convey opposition*** towards something, meaning "opposed to", and thus simply ***defines opposition towards what the rest of the word means***. Examples:
	1. kumife , literal meaning being "opposed to transness", that being "transphobe"

## Serialized Language Specification

The language specification lives in the `rawspec/` directory. Each JSON file contains an array consisting of entries from single section of the language specification. The sections are as listed in `Vocabulary/`, and the JSON files are named accordingly. All of them are concatenated into `rawspec/0-complete.json`, which has every single word. For the entry format, see `scripting/types.ts`, which explains the type of entry in each file.