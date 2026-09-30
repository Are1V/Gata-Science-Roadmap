---
title: 'SQL windows & analytical queries'
description: 'A SQL window function computes a value using related rows while retaining each individual row. PARTITION BY defines groups and ORDER BY defines their sequence.'
phase: 9
topicId: '9-window-functions'
prerequisites: []
resources: ['sql']
project: 'sql-sales'
estimatedHours: 4
---

## What is it?

A SQL window function computes a value using related rows while retaining each individual row. PARTITION BY defines groups and ORDER BY defines their sequence.

## Why does it matter?

Rankings, running totals, retention calculations, and period-over-period comparisons are common data science tasks. Windows express these operations without fragile manual joins.

## Intuition

GROUP BY makes one row per group. A window keeps the original rows and adds context, such as the previous order’s date or the customer’s cumulative spend.

## Mathematics

For ordered values $x_1,\dots,x_n$, the running sum at row $t$ is $S_t=\sum_{i=1}^{t}x_i$. Growth relative to the previous period is $(x_t-x_{t-1})/x_{t-1}$, undefined when the denominator is zero.

## Example

For monthly sales 100, 150, and 120, running totals are 100, 250, and 370. Growth values are undefined, 50%, and -20%.

## From scratch · SQL

```sql
WITH monthly AS (
  SELECT date_trunc('month', order_time) AS month,
         SUM(amount) AS revenue
  FROM orders
  GROUP BY 1
), compared AS (
  SELECT month, revenue,
         LAG(revenue) OVER (ORDER BY month) AS previous_revenue
  FROM monthly
)
SELECT month, revenue,
       (revenue - previous_revenue) / NULLIF(previous_revenue, 0)
         AS growth
FROM compared
ORDER BY month;
```

The example uses PostgreSQL date syntax. Use decimal amounts or cast integer inputs to avoid integer division. A missing month needs a calendar spine; LAG returns the previous observed row, not automatically the previous calendar month.

## Python · using a library

```python
import pandas as pd
monthly = pd.DataFrame({"revenue": [100., 150., 120.]})
monthly["previous"] = monthly["revenue"].shift(1)
monthly["growth"] = monthly["revenue"].div(monthly["previous"]).sub(1)
monthly["running_total"] = monthly["revenue"].cumsum()
```

`ROW_NUMBER` assigns unique positions, `RANK` leaves gaps after ties, and `DENSE_RANK` does not. For a running sum, specify `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` when row-based behavior is intended, especially with tied ordering values.

## Common mistakes

- Ordering by a non-unique timestamp without a tie-breaker.
- Filtering rows before the window when the calculation needs earlier history.
- Confusing a missing month with a month of zero sales.

## Interview questions

1. Find each customer’s second order with deterministic ties.
2. How do RANK and DENSE_RANK differ on values 10, 10, and 8?
3. Why might a default RANGE frame include multiple rows at once?

## Exercises

1. Return the top three products by revenue within each category.
2. Calculate a seven-row moving average and explain why it is not always seven days.
3. Build a month spine and handle zero-revenue periods explicitly.
