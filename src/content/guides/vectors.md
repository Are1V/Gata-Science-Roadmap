---
title: 'Vectors, distances & projections'
description: 'A vector is an ordered collection of numbers. It can represent a point, a direction, or the features of one observation. Its coordinates are meaningful only relative to a chosen basis and units.'
phase: 4
topicId: '4-vectors'
prerequisites: []
resources: ['linear-algebra', 'numpy']
project: 'recommendation-system'
estimatedHours: 3
lab: 'vectors'
---

## What is it?

A vector is an ordered collection of numbers. It can represent a point, a direction, or the features of one observation. Its coordinates are meaningful only relative to a chosen basis and units.

## Why does it matter?

Models compare feature vectors, multiply them by weights, and embed text or items into vector spaces. Geometry gives a concrete explanation of similarity and prediction.

## Intuition

Treat a vector as an arrow. Its length measures magnitude; its direction captures relative coordinates. Normalizing changes the length to one without changing direction. The zero vector has no direction and cannot be normalized this way.

## Mathematics

For $x,y\in\mathbb R^d$, the dot product is a scalar:

$$x^T y = \sum_{j=1}^{d} x_jy_j,\qquad \|x\|_2=\sqrt{x^Tx}$$

Cosine similarity removes magnitude. The projection of $x$ onto a nonzero $y$ keeps only the part aligned with $y$:

$$\cos(x,y)=\frac{x^Ty}{\|x\|_2\|y\|_2},\qquad \operatorname{proj}_y(x)=\frac{x^Ty}{y^Ty}y$$

Euclidean distance is $\|x-y\|_2$; Manhattan distance is $\sum_j|x_j-y_j|$. Orthogonal vectors have a zero dot product.

## Example

With $x=(3,4)$ and $y=(1,0)$, the norm of $x$ is 5, the normalized vector is $(0.6,0.8)$, the dot product is 3, and the projection is $(3,0)$. Their cosine similarity is 0.6.

## Python · from scratch

```python
import math
x, y = [3., 4.], [1., 0.]
dot = sum(a * b for a, b in zip(x, y, strict=True))
norm = math.sqrt(sum(a * a for a in x))
unit = [a / norm for a in x]  # [0.6, 0.8]
```

## Using a library

```python
import numpy as np
x, y = np.array([3., 4.]), np.array([1., 0.])
projection = (x @ y) / (y @ y) * y
cosine = (x @ y) / (np.linalg.norm(x) * np.linalg.norm(y))
```

## Connection to machine learning

Linear regression predicts with a dot product between features and coefficients. Recommendation systems compare learned item vectors; cosine similarity emphasizes orientation. PCA projects observations onto a smaller orthogonal basis.

## Common mistakes

- Mixing meters and kilograms in unscaled distance can make units dominate similarity.
- Cosine similarity is undefined for a zero vector.
- A small distance does not imply semantic similarity unless the representation supports it.

## Interview questions

1. When do Euclidean distance and cosine similarity produce the same ranking?
2. Why does dividing a vector by its norm preserve its direction?
3. How is a dot product related to a linear model’s prediction?

## Exercises

1. Calculate the Manhattan and Euclidean distances between $(1,2)$ and $(4,6)$.
2. Verify that $x-\operatorname{proj}_y(x)$ is orthogonal to $y$.
3. Compare nearest neighbors before and after changing one feature’s unit by a factor of 1,000.
