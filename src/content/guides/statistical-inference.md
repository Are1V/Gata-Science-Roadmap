---
title: 'Sampling, uncertainty & statistical inference'
description: 'Statistical inference uses observed samples to reason about a population. It requires an explicit sampling model; uncertainty estimates are only as credible as those assumptions.'
phase: 7
topicId: '7-confidence-intervals'
prerequisites: ['bayes-theorem']
resources: ['statistics', 'probability']
project: 'titanic'
estimatedHours: 4
---

## What is it?

Statistical inference uses observed samples to reason about a population. It requires an explicit sampling model; uncertainty estimates are only as credible as those assumptions.

## Why does it matter?

A difference observed in a sample may reflect noise, selection, or a real population difference. Inference helps distinguish these possibilities without pretending uncertainty disappears.

## Intuition

Repeated random samples produce different means. The spread of these means is the standard error, distinct from the spread of individual observations. Under suitable conditions, the central limit theorem makes standardized means approximately normal as sample size grows.

## Mathematics

$$\bar x=\frac1n\sum_i x_i,\quad s^2=\frac{\sum_i(x_i-\bar x)^2}{n-1},\quad SE(\bar x)=\frac{s}{\sqrt n}$$

For independent normally distributed observations with unknown variance, a mean interval is $\bar x\pm t_{n-1,1-\alpha/2}s/\sqrt n$. A p-value is the probability, under the null model, of a test statistic at least as incompatible with that model as the observed statistic.

## Example

If $n=100$, $\bar x=20$, and $s=5$, the standard error is 0.5. A normal approximation gives a 95% interval of $20\pm1.96(0.5)$, or approximately [19.02, 20.98]. Clustering or selection bias would require a different analysis.

## Python · from scratch

```python
import numpy as np
x = np.array([16., 18., 19., 21., 23., 25.])
rng = np.random.default_rng(42)
means = np.array([
    rng.choice(x, size=len(x), replace=True).mean()
    for _ in range(10_000)
])
print(np.quantile(means, [0.025, 0.975]))
```

## Using a library

```python
from scipy import stats
interval = stats.t.interval(
    confidence=0.95, df=len(x)-1,
    loc=x.mean(), scale=stats.sem(x)
)
```

## Common mistakes

- A confidence interval procedure has coverage; a fixed parameter is not random in this frequentist interpretation.
- A nonsignificant result is not proof of no effect.
- Repeated testing and selective reporting require multiplicity control.

## Interview questions

1. How does quadrupling sample size affect standard error under independence?
2. What is the difference between Type I error and statistical power?
3. Why can bootstrap intervals fail with dependent observations?

## Exercises

1. Simulate confidence-interval coverage for a known normal mean.
2. Repeat with correlated observations and explain the difference.
3. Report an effect in practical units alongside its interval and p-value.
