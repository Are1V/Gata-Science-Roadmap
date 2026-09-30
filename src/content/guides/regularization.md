---
title: 'Ridge, Lasso & Elastic Net'
description: 'Regularization adds a preference for simpler parameter values to the training objective. Ridge uses a squared L2 penalty, Lasso uses L1, and Elastic Net combines both.'
phase: 13
topicId: '13-ridge-regression'
prerequisites: ['linear-regression', 'gradient-descent']
resources: ['sklearn-linear']
project: 'house-prices'
estimatedHours: 3
---

## What is it?

Regularization adds a preference for simpler parameter values to the training objective. Ridge uses a squared L2 penalty, Lasso uses L1, and Elastic Net combines both.

## Why does it matter?

Correlated features and many predictors can make unregularized coefficients unstable. Regularization trades some bias for lower variance and can improve prediction on new data.

## Intuition

A penalty makes large coefficients costly. Ridge shrinks smoothly. Lasso’s nonsmooth corner at zero allows some coefficients to become exactly zero, so it can perform feature selection.

## Mathematics

$$J_{ridge}=\frac{\|y-X\beta\|^2}{2n}+\frac\lambda2\|\beta\|_2^2$$

$$J_{lasso}=\frac{\|y-X\beta\|^2}{2n}+\lambda\|\beta\|_1$$

At nonzero coefficients the L1 derivative has constant magnitude, while L2’s derivative grows with coefficient magnitude. Library definitions can scale these terms differently; compare documented conventions, not raw alpha values.

## Example

In a standardized one-dimensional problem, a coefficient estimate of 0.2 under a soft-threshold of 0.3 becomes zero with Lasso. Ridge scales it down continuously but does not hit zero for a finite positive penalty in that simple setting.

## Python · from scratch

```python
import numpy as np
# One-dimensional proximal step for an L1-penalized objective.
def soft_threshold(value, threshold):
    return np.sign(value) * np.maximum(np.abs(value)-threshold, 0.)
print(soft_threshold(0.2, 0.3))  # 0.0
```

## Using a library

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge, Lasso, ElasticNet
models = [make_pipeline(StandardScaler(), estimator)
          for estimator in (Ridge(alpha=1.), Lasso(alpha=0.1),
                            ElasticNet(alpha=0.1, l1_ratio=0.5))]
# Fit and compare each model inside the same cross-validation splits.
```

## Common mistakes

- Penalizing features on incomparable scales.
- Treating Lasso-selected variables as stable scientific discoveries without checking correlated alternatives.
- Tuning alpha on the final test set.

## Interview questions

1. Why is scaling important before penalized regression?
2. Why does L1 create sparse solutions?
3. What problem can Elastic Net address when features are correlated?

## Exercises

1. Plot coefficients as the penalty increases.
2. Duplicate a feature and compare Ridge and Lasso behavior.
3. Tune regularization strength using a logarithmic search space within cross-validation.
