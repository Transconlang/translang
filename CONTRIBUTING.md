# Contribution Guidelines

<style>
	.label {
		padding: 2px 4px;
		border-radius: 12px;
		background-clip: padding-box;
		background-color: #fbca042e;
	}
	.critical {
		color: #FBCA04;
	}
	.question {
		color: #d876e3;
	}
	.duplicate {
		color: #cfd3d7;
	}
	.nyo {
		color: #ffffff;
	}
	.incomplete {
		color: #FEF2C0;
	}
	.donotmerge {
		color: #D93F0B;
	}
</style>

## Content

### Style & Format

All Markdown tables in `Vocabulary/` should be follow this format:

```markdown
| Spelling | Definition |
| -------- | ---------- |
| foo | bar |
```

Column titles are not standardized, but the first column should have the Kumilinwa word, and the second should contain the definition. Optional additional columns can be added to demonstrate an English equivalent or to provide additional context.

## Maintaning

### Issues

- Check for duplicates before creating new issues. If you find a duplicate, close the newer one and reference back to the original.
- Keep titles concise and descriptive. Add sufficient detail in the body and detail all major changes.

#### Labels

- Issues with the <span class='label critical'>`critical`</span> label are high priority and should be addressed as soon as possible.
- Add all relevant [labels](https://github.com/Transconlang/translang/labels) please! Only maintainers may add labels such as <span class='label nyo'>`nyo`</span>, <span class='label question'>`question`</span>, <span class='label duplicate'>`duplicate`</span>, or <span class='label incomplete'>`incomplete`</span>.
- An issue should be closed and marked as not planned if it has the <span class='label nyo'>`nyo`</span> label.

### Pull Requests

- Keep PRs concise and focused. If you have multiple unrelated changes, create multiple PRs.
- PRs should be reviewed by at least one maintainer before merging.
- When possible, reference any issues addressed in a comment (i.e. `fixes #1`) so that they will be automatically closed upon merging.

#### Labels

- Maintainers: PRs with the <span class='label critical'>`critical`</span> label should be reviewed and merged as soon as possible. These take priority over everything else.
- Don't merge if it has the <span class='label donotmerge'>`DONOTMERGE`</span> label. A PR should be closed if it has the <span class='label nyo'>`nyo`</span> label.
- Follow same label rules as issues.