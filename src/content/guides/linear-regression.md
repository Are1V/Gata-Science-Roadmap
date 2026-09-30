---
title: 'Linear regression, from geometry to code'
description: 'Linear regression models a numeric response as a weighted sum of features plus an intercept. Ordinary least squares chooses the coefficients that minimize squared prediction errors on the training data.'
phase: 13
topicId: '13-linear-regression'
prerequisites: ['vectors', 'matrices', 'derivatives', 'gradient-descent', 'statistical-inference']
resources: ['sklearn-linear', 'numpy']
project: 'house-prices'
estimatedHours: 5
---

## What is it?

Linear regression models a numeric response as a weighted sum of features plus an intercept. Ordinary least squares chooses the coefficients that minimize squared prediction errors on the training data.

## Why does it matter?

It is a powerful baseline, a foundation for interpretable modeling, and a meeting point of linear algebra, calculus, and probability. The mathematics also prepares you for neural-network training.

## Intuition

Each column of the design matrix is a direction in observation space. Fitted values are the projection of the target vector onto the space spanned by those columns. Residuals are orthogonal to that space at an ordinary least-squares solution.

## Mathematics

$$y=X\beta+\varepsilon,\qquad J(\beta)=\frac1n\|X\beta-y\|_2^2$$

Here $X$ has one row per observation and includes a column of ones for an intercept; $\beta$ contains coefficients; $\varepsilon$ represents unexplained variation.

$$\nabla_\beta J=\frac2nX^T(X\beta-y)$$

Setting the gradient to zero gives $X^TX\hat\beta=X^Ty$. If $X$ has full column rank, the familiar formula is $(X^TX)^{-1}X^Ty$, but a QR- or SVD-based numerical solve is preferable.

A linear conditional mean and zero conditional-mean errors are central for interpreting OLS estimates. Homoscedasticity supports conventional standard errors; independent Gaussian errors additionally connect squared loss to maximum likelihood and exact small-sample inference. Gaussian errors are not required just to compute an OLS fit.

## Example

For points $(1,2),(2,3),(3,4)$, the fitted line is $\hat y=1+x$. Both intercept and slope are 1 and residuals are zero. If a held-out observation is $(4,6)$, its absolute error is 1 and squared error is 1.

## Python · from scratch

```python
import numpy as np
x = np.array([1., 2., 3.])
y = np.array([2., 3., 4.])
X = np.column_stack([np.ones_like(x), x])
beta = np.zeros(2)
for _ in range(5000):
    gradient = 2 * X.T @ (X @ beta - y) / len(y)
    beta -= 0.05 * gradient
print(beta)  # approximately [1., 1.]
```

## Using a library

```python
from sklearn.linear_model import LinearRegression
model = LinearRegression().fit(x.reshape(-1, 1), y)
print(model.intercept_, model.coef_)
# Numerically stable linear algebra alternative:
beta = np.linalg.lstsq(X, y, rcond=None)[0]
```

## Evaluation

MAE averages absolute errors; MSE averages squared errors; RMSE returns squared loss to target units. $R^2=1-SS_{res}/SS_{tot}$ compares to a constant mean and can be negative on held-out data. Adjusted $R^2=1-(1-R^2)(n-1)/(n-p-1)$ penalizes adding predictors when an intercept is included and $n>p+1$; it does not replace validation.

## Common mistakes

- Interpreting a coefficient as causal without identification assumptions.
- Using normality of features as an OLS requirement; the relevant assumptions concern errors and the conditional mean.
- Judging fit only by training $R^2$.

## Interview questions

1. Why are least-squares residuals orthogonal to the columns of $X$?
2. What happens when two columns contain the same information?
3. How can a model have negative test $R^2$?

## Exercises

1. Derive the gradient one coefficient at a time.
2. Add a noisy feature and compare training and validation errors.
3. Plot residuals against predictions and look for curvature or changing spread.
