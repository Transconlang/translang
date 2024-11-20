# JSON Specification

This is the raw data for every word in the language.

## Rules

- Do not manually edit these files. Use the `../scripting/index.ts` script to modify them.
- Do not add extra commits to update these files; GitHub Actions will automatically update the rawspec after merging into `main`.

Any faulty changes will be overwritten after merge.

## Schemas

See `../scripting/types.ts` for file schemas.

The complete langspec is simply an array of `Entry` objects; that is to say, when imported or parsed, it resolves to a value of type `Entry[]`.

All the other files (e.g. `nouns.json`, `verbs.json`, etc.) consist of arrays of `Section` objects. If the file has subheaders (Level 2 Markdown headings) then this is used for each `Section.title`. Otherwise, the `Section.title` is `null`, and all entries are kept in the one untitled section.

## Using

Permalink to complete spec: [`https://raw.githubusercontent.com/Transconlang/translang/refs/heads/main/rawspec/0-complete.json`](https://raw.githubusercontent.com/Transconlang/translang/refs/heads/main/rawspec/0-complete.json)

Permalink to individual files: `https://raw.githubusercontent.com/Transconlang/translang/refs/heads/main/rawspec/{{NAME}}.json` where `{{NAME}}` is the name of the file (e.g. `nouns`, `verbs`, etc.).
