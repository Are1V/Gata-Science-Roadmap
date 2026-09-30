---
title: 'PCA, eigenvectors & singular values'
description: 'Principal component analysis finds orthogonal directions capturing the greatest variance in centered data. Projecting onto a few of these directions gives a lower-dimensional representation.'
phase: 21
topicId: '21-pca'
prerequisites: ['vectors', 'matrices', 'statistical-inference']
resources: ['linear-algebra', 'sklearn-decomposition']
project: 'segmentation'
estimatedHours: 5
---

## What is it?

Principal component analysis finds orthogonal directions capturing the greatest variance in centered data. Projecting onto a few of these directions gives a lower-dimensional representation.

## Why does it matter?

PCA compresses correlated measurements, reveals dominant variation, and connects covariance, eigenvectors, SVD, and projections. It does not use target labels, so maximum variance need not mean maximum predictive usefulness.

## Intuition

Imagine a long, narrow cloud of points. The first component follows its longest direction. After removing that direction’s variation, the next component follows the largest remaining orthogonal direction.

## Mathematics

For centered $X_c\in\mathbb R^{n\times d}$, the sample covariance is

$$C=\frac{X_c^TX_c}{n-1},\qquad Cv_j=\lambda_jv_j$$

Eigenvectors $v_j$ are directions and eigenvalues $\lambda_j$ measure variance along them. Sort eigenvalues in decreasing order and project with $Z=X_cV_k$. Equivalently, if $X_c=U\Sigma V^T$, the right singular vectors are principal axes and $\lambda_j=\sigma_j^2/(n-1)$.

## Example

Centered points $(-1,-1),(0,0),(1,1)$ have covariance $\begin{bmatrix}1&1\\1&1\end{bmatrix}$. The leading direction is $(1,1)/\sqrt2$, with eigenvalue 2. The orthogonal direction has eigenvalue zero; all variation lies on a line.

## Python · from scratch

```python
import numpy as np
X = np.array([[1., 1.], [2., 2.], [3., 3.]])
mean = X.mean(axis=0)
Xc = X - mean
U, singular_values, Vt = np.linalg.svd(Xc, full_matrices=False)
components = Vt[:1]
Z = Xc @ components.T
reconstructed = Z @ components + mean
assert np.allclose(X, reconstructed)
```

## Using a library

```python
from sklearn.decomposition import PCA
pca = PCA(n_components=1)
Z = pca.fit_transform(X)
print(pca.explained_variance_ratio_)  # [1.]
```

## Common mistakes

- Forgetting to center data, which changes the problem.
- Scaling blindly: standardization is a modeling choice about which units should matter.
- Treating an eigenvector’s sign as meaningful; reversing it describes the same axis.
- Fitting PCA before splitting data leaks validation information.

## Interview questions

1. How do SVD and the covariance eigendecomposition relate?
2. Why might a low-variance direction be predictive?
3. Why can you have at most $n-1$ nonzero principal variances after centering $n$ observations?

## Exercises

1. Compute the two eigenvectors of the example covariance matrix.
2. Compare PCA with and without scaling on features with different units.
3. Plot reconstruction error against the number of retained components.
