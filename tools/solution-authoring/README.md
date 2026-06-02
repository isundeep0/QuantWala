# Solution authoring

These scripts are the source of truth for the **worked solutions** that get baked
into the lesson content under `content/algorithms/**/*.json`.

Each `sols_*.py` file exports a `SOLS` dict shaped as:

```python
SOLS = {
  "<lesson-slug>": {
    "<problem-id>": dict(
      approach=["paragraph 1", "paragraph 2"],   # required
      time="O(n)", space="O(1)",                 # optional complexity
      cpp="""...C++ source...""",               # optional
      python="""...Python source...""",         # optional
    ),
  },
}
```

`tools_apply.py` reads one of these modules and writes a `solution` object onto
the matching problem in its content JSON. It is idempotent — re-running simply
overwrites the existing solution.

## Usage

From anywhere in the repo:

```bash
python3 tools/solution-authoring/tools_apply.py tools/solution-authoring/sols_sort.py
```

It prints `applied: <n> missing: <none|list>`.

## Coverage

All 11 batches cover the full Module 1 catalog (55 lessons × 5 problems = 275):
sorting-searching, arrays-two-pointers, linked-lists, stacks-queues, trees,
graphs, dynamic-programming, greedy, backtracking, segment-trees-bit, strings,
and math-number-theory.
