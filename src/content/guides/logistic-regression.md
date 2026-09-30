---
title: 'Logistic regression & cross-entropy'
description: 'Logistic regression models the probability of a binary outcome by applying a sigmoid to a linear combination of features. Its log odds are linear even though its probabilities are not.'
phase: 14
topicId: '14-logistic-regression'
prerequisites: ['vectors', 'logarithms', 'bayes-theorem', 'gradient-descent']
resources: ['sklearn-linear', 'd2l']
project: 'churn'
estimatedHours: 5
lab: 'sigmoid'
---

## What is it?

Logistic regression models the probability of a binary outcome by applying a sigmoid to a linear combination of features. Its log odds are linear even though its probabilities are not.

## Why does it matter?

It is an efficient, interpretable classifier and a foundation for probabilistic neural networks. Deriving its loss connects probability, logarithms, calculus, and optimization.

## Intuition

A raw score can be any real number, but a probability must lie between zero and one. The sigmoid smoothly compresses the score. The intercept sets baseline log odds and each coefficient changes them conditionally on other features.

## Mathematics

$$z=x^Tw+b,\qquad p=\sigma(z)=\frac1{1+e^{-z}},\qquad \log\frac p{1-p}=z$$

For independent Bernoulli outcomes, maximizing likelihood is equivalent to minimizing binary cross-entropy:

$$J=-\frac1n\sum_i[y_i\log p_i+(1-y_i)\log(1-p_i)]$$

Its gradient with respect to weights is $X^T(p-y)/n$. A stable per-example expression directly from the score is $\log(1+e^z)-yz$, implemented with `logaddexp`.

## Example

A score of zero gives probability 0.5. A score of $\log 3\approx1.099$ gives probability 0.75 and odds 3. For a positive label, that prediction has loss $-\log(0.75)\approx0.288$.

## Python · from scratch

```python
import numpy as np
X = np.array([[-2.], [-1.], [1.], [2.]])
y = np.array([0., 0., 1., 1.])
w, b = np.zeros(1), 0.
for _ in range(1000):
    z = X @ w + b
    p = np.exp(-np.logaddexp(0., -z))
    error = p - y
    w -= 0.1 * (X.T @ error / len(y))
    b -= 0.1 * error.mean()
loss = np.mean(np.logaddexp(0., X @ w + b) - y*(X @ w + b))
```

This tiny separable dataset illustrates optimization; it is not a validation benchmark. Without regularization, coefficients can keep growing on perfectly separable data.

## Using a library

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
model = make_pipeline(StandardScaler(), LogisticRegression())
model.fit(X, y)
probabilities = model.predict_proba(X)[:, 1]
```

Scikit-learn applies regularization by default. This differs from the unpenalized educational loop above.

## Common mistakes

- Calling it linear regression because its name includes regression.
- Assuming a 0.5 threshold is always appropriate.
- Treating a coefficient’s exponentiated odds ratio as a causal risk ratio.

## Interview questions

1. Why is cross-entropy the negative Bernoulli log-likelihood?
2. How does changing the threshold alter precision and recall?
3. What happens to unregularized coefficients on perfectly separable data?

## Exercises

1. Differentiate binary cross-entropy through the sigmoid.
2. Fit an imbalanced dataset and compare accuracy with PR-AUC.
3. Choose a threshold based on explicit false-positive and false-negative costs.
