---
title: 'From arrays to analysis-ready tables'
description: 'NumPy provides typed multidimensional arrays. Pandas adds labeled Series and DataFrames, letting you align, filter, join, and aggregate tabular records without manually managing each position.'
phase: 8
topicId: '8-pandas'
prerequisites: []
resources: ['numpy', 'pandas']
project: 'exploratory-analysis'
estimatedHours: 4
---

## What is it?

NumPy provides typed multidimensional arrays. Pandas adds labeled Series and DataFrames, letting you align, filter, join, and aggregate tabular records without manually managing each position.

## Why does it matter?

Most modeling work begins with table construction. Incorrect joins or hidden missing values can create more damage than choosing a slightly weaker algorithm.

## Intuition

A table has a grain: what one row represents. Every operation should preserve that grain or deliberately change it. Grouping changes grain; a window-style transform returns a value aligned with every original row.

## Mathematics

For groups $G_k$, a group mean is $\bar x_k=|G_k|^{-1}\sum_{i\in G_k}x_i$. Standardization transforms a feature as $z=(x-\mu)/s$; fit $\mu$ and $s$ on training data only.

## Example

Sales of 10 and 20 in region A sum to 30. Joining each sales row to two matching region records would silently double that total to 60. Cardinality validation catches this error.

## Python · from scratch

```python
rows = [("A", 10), ("A", 20), ("B", 5)]
totals = {}
for region, amount in rows:
    totals[region] = totals.get(region, 0) + amount
assert totals == {"A": 30, "B": 5}
```

## Using a library

```python
import pandas as pd
sales = pd.DataFrame({"region": ["A", "A", "B"],
                      "amount": [10, 20, 5]})
regions = pd.DataFrame({"region": ["A", "B"],
                        "manager": ["Jo", "Sam"]})
joined = sales.merge(regions, on="region", validate="many_to_one")
totals = joined.groupby("region", dropna=False)["amount"].sum()
joined["region_mean"] = joined.groupby("region")["amount"].transform("mean")
```

Prefer vectorized column operations to `apply` when a built-in operation expresses the task. Use explicit datetime parsing and categorical types when their semantics match your data.

## Common mistakes

- Chained assignment can behave unexpectedly; use explicit `.loc` indexing.
- Missing group keys can disappear from summaries unless handled deliberately.
- A concatenation stacks data; it does not match records by business keys.

## Interview questions

1. When would you use `transform` instead of `agg`?
2. What does a many-to-many merge do to row counts?
3. How does NumPy broadcasting align dimensions?

## Exercises

1. Add an unknown region and preserve it in the report.
2. Duplicate a region key and confirm that merge validation fails.
3. Benchmark a row-wise operation against a vectorized equivalent.
