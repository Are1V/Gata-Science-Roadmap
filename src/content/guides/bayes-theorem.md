---
title: "Conditional probability & Bayes\u2019 theorem"
description: "Bayes\u2019 theorem expresses the probability of a hypothesis after seeing evidence in terms of a prior and the likelihood of that evidence under the hypothesis."
phase: 6
topicId: '6-bayes-theorem'
prerequisites: []
resources: ['probability', 'statistics']
project: 'medical-classification'
estimatedHours: 3
---

## What is it?

Bayes’ theorem expresses the probability of a hypothesis after seeing evidence in terms of a prior and the likelihood of that evidence under the hypothesis.

## Why does it matter?

It supports diagnostic reasoning, probabilistic classification, and parameter estimation. It also explains why base rates matter even when a test seems highly accurate.

## Intuition

Imagine 10,000 people. If 1% have a condition, only 100 can produce true positives. False positives are drawn from the much larger group of 9,900 people without it.

## Mathematics

$$P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}$$

For a binary hypothesis, the denominator is $P(B\mid A)P(A)+P(B\mid\neg A)P(\neg A)$. Independence would imply $P(A\mid B)=P(A)$, provided the conditional is defined.

Maximum likelihood chooses the parameter maximizing $P(D\mid\theta)$. Maximum a posteriori estimation maximizes $P(D\mid\theta)P(\theta)$, adding a prior preference.

## Example

With prevalence 1%, sensitivity 90%, and specificity 95%, there are 90 expected true positives and 495 false positives per 10,000 people. The positive predictive value is $90/(90+495)\approx15.4\%$.

## Python · from scratch

```python
prior, sensitivity, specificity = 0.01, 0.90, 0.95
true_positive = prior * sensitivity
false_positive = (1-prior) * (1-specificity)
posterior = true_positive / (true_positive + false_positive)
print(round(posterior, 3))  # 0.154
```

## Using a library

```python
import numpy as np
rng = np.random.default_rng(42)
condition = rng.random(100_000) < 0.01
positive = rng.random(100_000) < np.where(condition, 0.90, 0.05)
print(condition[positive].mean())
```

## Common mistakes

- Reversing the conditional without accounting for the prior.
- Treating conditional independence as unconditional independence.
- Using a prevalence estimate from a different population without justification.

## Interview questions

1. What changes if prevalence rises from 1% to 10%?
2. In what sense is likelihood a function of the parameters?
3. Why can Naive Bayes classify well despite unrealistic independence assumptions?

## Exercises

1. Recompute the posterior with specificity 99%.
2. Simulate 1,000 samples repeatedly and examine posterior-estimate variability.
3. Derive the posterior odds form of Bayes’ theorem.
