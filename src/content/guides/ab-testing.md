---
title: 'A/B testing: from design to decision'
description: "An A/B test randomly assigns eligible units to control or treatment and compares outcomes. It estimates an intervention\u2019s effect under the experiment\u2019s assignment and measurement assumptions."
phase: 28
topicId: '28-experiment-design'
prerequisites: ['statistical-inference', 'bayes-theorem']
resources: ['statistics', 'causal']
project: 'sql-sales'
estimatedHours: 4
---

## What is it?

An A/B test randomly assigns eligible units to control or treatment and compares outcomes. It estimates an intervention’s effect under the experiment’s assignment and measurement assumptions.

## Why does it matter?

Predictive models identify associations; randomized experiments can support causal decisions. Good design requires more than testing whether a p-value is below a threshold.

## Intuition

Randomization balances observed and unobserved factors in expectation. A difference in average outcomes can then be attributed to assignment, provided interference, attrition, and measurement do not invalidate the design.

## Mathematics

For independent binary outcomes in each arm:

$$\hat\Delta=\hat p_T-\hat p_C,\qquad SE(\hat\Delta)\approx\sqrt{\frac{\hat p_T(1-\hat p_T)}{n_T}+\frac{\hat p_C(1-\hat p_C)}{n_C}}$$

A large-sample interval uses $\hat\Delta\pm1.96SE$. Clustered assignment or rare events need methods reflecting that structure. The estimand may be an intention-to-treat effect, which follows assignment regardless of actual exposure.

## Example

If both arms have 1,000 users and conversion rates are 10% and 12%, the absolute effect is two percentage points and the relative lift is 20%. The approximate standard error is 1.4 percentage points, so a normal 95% interval includes zero.

## Python · from scratch

```python
import math
p_c, p_t, n_c, n_t = 0.10, 0.12, 1000, 1000
effect = p_t - p_c
se = math.sqrt(p_t*(1-p_t)/n_t + p_c*(1-p_c)/n_c)
interval = (effect - 1.96*se, effect + 1.96*se)
print(effect, interval)
```

## Using a library

```python
import numpy as np
rng = np.random.default_rng(42)
control = rng.binomial(1, 0.10, 1000)
treatment = rng.binomial(1, 0.12, 1000)
# A simulation lets you repeat the design to estimate power
# at the assumed effect, before collecting experimental data.
print(treatment.mean() - control.mean())
```

Predefine the primary metric, assignment unit, minimum detectable effect, power, sample size, duration, and exclusions. Check sample-ratio mismatch and logging integrity before interpreting outcomes. Multiple metrics or subgroup tests need a multiplicity strategy.

## Common mistakes

- Stopping the first time an ordinary p-value becomes significant.
- Reporting relative lift without its baseline or absolute change.
- Removing post-treatment groups in a way that breaks randomization.

## Interview questions

1. Why should the analysis respect the randomization unit?
2. How would you distinguish statistical from practical significance?
3. What can cause a sample-ratio mismatch?

## Exercises

1. Simulate repeated experiments and estimate power for a two-point absolute effect.
2. Add repeated observations per user and compare row-level with user-level analysis.
3. Write a decision memo including uncertainty, guardrails, and rollout costs.
