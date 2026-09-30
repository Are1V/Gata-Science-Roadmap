---
title: 'Matrices & linear transformations'
description: 'A matrix is a rectangular array that can represent a dataset or a linear transformation. Its dimensions tell you which operations are possible.'
phase: 4
topicId: '4-matrices'
prerequisites: ['vectors']
resources: ['linear-algebra', 'numpy']
project: 'house-prices'
estimatedHours: 4
---

## What is it?

A matrix is a rectangular array that can represent a dataset or a linear transformation. Its dimensions tell you which operations are possible.

## Why does it matter?

A dense layer, a regression prediction, and a change of coordinates can all be expressed as matrix multiplication. Understanding shapes prevents many modeling bugs.

## Intuition

A transformation maps basis vectors to new vectors. The columns of a matrix record those destinations. Linearity means sums and scalar multiples are preserved.

## Mathematics

If $A\in\mathbb R^{n\times d}$ and $B\in\mathbb R^{d\times k}$, then $AB\in\mathbb R^{n\times k}$:

$$(AB)_{ij}=\sum_{r=1}^{d}A_{ir}B_{rj}$$

Transpose swaps rows and columns. Rank is the number of independent columns or rows. A square matrix is invertible precisely when it has full rank; equivalently, its determinant is nonzero. The identity transformation leaves every vector unchanged. A symmetric matrix is positive definite when $x^TAx>0$ for every nonzero $x$.

## Example

Let $X=\begin{bmatrix}1&2\\3&4\end{bmatrix}$ and $w=(2,1)^T$. Then $Xw=(4,10)^T$. Its determinant is $1\cdot4-2\cdot3=-2$, so this particular matrix is invertible.

## Python · from scratch

```python
X, w = [[1., 2.], [3., 4.]], [2., 1.]
prediction = [sum(a*b for a, b in zip(row, w)) for row in X]
assert prediction == [4., 10.]
```

## Using a library

```python
import numpy as np
X = np.array([[1., 2.], [3., 4.]])
w = np.array([2., 1.])
y = X @ w
recovered = np.linalg.solve(X, y)
assert np.allclose(recovered, w)
```

For non-square or rank-deficient least squares, use `np.linalg.lstsq`; do not force an inverse.

## Common mistakes

- `X * w` is elementwise multiplication; `X @ w` is a matrix-vector product.
- In general, $AB\ne BA$.
- Computing an inverse explicitly can amplify numerical error and waste work.

## Interview questions

1. What shape does a batch of 32 examples with 10 features have?
2. What happens to uniqueness of a linear solve when columns are dependent?
3. Why are covariance matrices positive semidefinite?

## Exercises

1. Work out the shapes of a two-layer network with widths 10, 8, and 3.
2. Construct a rank-one 2 by 2 matrix and explain its geometric action.
3. Compare solving a system with an inverse and with `solve` on a nearly singular matrix.
