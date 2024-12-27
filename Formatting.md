# Formatting

## Resources

- For a short markdown guide see [this](https://commonmark.org/help/).
- For a more extensive markdown guide, see [this](https://handbook.gitlab.com/docs/markdown-guide/).

## Hard rules

- Formatting — both of the raw markdown code and the result of its visual rendering — should be as consistent as possible.
- Every page should have a descriptive but concise title.
- The title should be a level 1 heading, that is, the line should be preceded a `#`.
- Sections, subsections, or n\*(sub)sections should be level 2, 3, or n headings respectively. If you need more than the 6 default headings included in standard markdown, you're probably doing something wrong.

**For parser compatibility, each table should follow the following column format:**

```markdown
| Spelling | Definition / Meaning | English Equivalent / Implication |
| -------- | -------------------- | -------------------------------- |
| foo      | bar                  | baz                              |
```

(Padding data cells with spaces is not necessary.)

If an entry does not have a direct translation (definition or meaning), then it **must** have an implication. No exceptions, other we have completely undefined words.

## Soft rules/guidelines

### Regarding the raw markdown code

- Between every significant mass of characters (a paragraph of text, a table, an itemised list, an enumerated list, etc.) there should be one empty line.
- HTML tags should be avoided unless imperative for the situation.
