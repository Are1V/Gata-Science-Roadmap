---
title: 'Logarithms, exponentials & stable probabilities'
description: "The natural logarithm is the inverse of the exponential function: $\\log(e^x)=x$. It turns multiplication into addition and is defined for positive real inputs."
phase: 4
topicId: '4-logarithms'
prerequisites: []
resources: ['numpy', 'd2l']
project: 'sentiment'
estimatedHours: 2
---

## What is it?

The natural logarithm is the inverse of the exponential function: $\log(e^x)=x$. It turns multiplication into addition and is defined for positive real inputs.

## Why does it matter?

Likelihoods multiply probabilities. Log-likelihoods add their logarithms, making optimization and numerical computation easier. Exponentials convert unconstrained scores into positive weights.

## Intuition

An exponential describes repeated multiplicative growth. A logarithm asks how much growth was required to reach a value. Log loss strongly penalizes confident predictions that are wrong.

## Mathematics

$$\log(ab)=\log a+\log b,\qquad \frac{d}{dx}\log x=\frac1x$$

Softmax converts scores into a probability distribution:

$$p_i=\frac{e^{z_i-m}}{\sum_j e^{z_j-m}},\qquad m=\max_jz_j$$

Subtracting a common constant cancels between numerator and denominator, preserving probabilities while avoiding overflow.

## Example

Scores $(0,\log 2)$ exponentiate to $(1,2)$, giving probabilities $(1/3,2/3)$. Predicting probability 0.1 for the correct class incurs $-\log(0.1)\approx2.303$ nats of loss; probability 0.9 incurs about 0.105.

## Python · from scratch

```python
import math
scores = [1000., 1001.]
m = max(scores)
weights = [math.exp(z - m) for z in scores]
probabilities = [w / sum(weights) for w in weights]
```

## Using a library

```python
import numpy as np
z = np.array([1000., 1001.])
p = np.exp(z - z.max())
p /= p.sum()
# Stable log(1 + exp(z)) for binary log loss:
softplus = np.logaddexp(0, z)
```

## Common mistakes

- Exponentiating a large raw score can overflow.
- Taking a logarithm of a zero or negative observed value needs a justified modeling decision.
- The mean of logged values is not the logarithm of the mean.

## Interview questions

1. Why does maximizing likelihood also maximize log-likelihood?
2. Why does adding a constant to every softmax score leave probabilities unchanged?
3. What changes when log base 2 replaces the natural logarithm in a loss?

## Exercises

1. Compute softmax for $(1,2,3)$ by hand to two decimal places.
2. Compare naive and stable softmax on scores near 1,000.
3. Explain why a log transformation can help with multiplicative measurement noise.
