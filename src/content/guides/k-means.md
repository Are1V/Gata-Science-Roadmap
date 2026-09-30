---
title: 'K-Means clustering'
description: 'K-Means partitions observations into K groups by alternating nearest-centroid assignment and mean-centroid updates. It minimizes within-cluster squared Euclidean distances.'
phase: 21
topicId: '21-k-means'
prerequisites: ['vectors', 'matrices']
resources: ['sklearn']
project: 'segmentation'
estimatedHours: 3
---

## What is it?

K-Means partitions observations into K groups by alternating nearest-centroid assignment and mean-centroid updates. It minimizes within-cluster squared Euclidean distances.

## Why does it matter?

It offers a simple, fast baseline for segmentation and vector quantization. Its objective makes its strengths and failure modes easy to reason about.

## Intuition

Place K representatives among the points. Assign each point to its closest representative, then move each representative to the average of its assigned points. Repeat until assignments stabilize or a stopping criterion is reached.

## Mathematics

$$\min_{c,\mu}\sum_i\|x_i-\mu_{c_i}\|_2^2$$

With assignments fixed, differentiating a cluster’s sum of squared distances makes the arithmetic mean its optimum centroid. Alternating the two steps does not increase the objective, but can settle in a local optimum.

## Example

For points 0, 1, 9, and 10 with K=2, clusters {0,1} and {9,10} have centroids 0.5 and 9.5. Total within-cluster squared distance is 1.

## Python · from scratch

```python
import numpy as np
X = np.array([[0.], [1.], [9.], [10.]])
centers = X[[0, 3]].copy()
for _ in range(20):
    distances = ((X[:, None, :] - centers[None, :, :])**2).sum(axis=2)
    labels = distances.argmin(axis=1)
    updated = centers.copy()
    for k in range(len(centers)):
        if np.any(labels == k):
            updated[k] = X[labels == k].mean(axis=0)
    if np.allclose(updated, centers):
        break
    centers = updated
```

## Using a library

```python
from sklearn.cluster import KMeans
model = KMeans(n_clusters=2, n_init=10, random_state=42).fit(X)
print(model.cluster_centers_.ravel())
```

## Common mistakes

- Using arbitrary category codes as Euclidean coordinates.
- Believing a lower inertia alone identifies the correct K; inertia always decreases as K grows.
- Expecting spherical-distance clusters to capture curved or uneven-density structures.

## Interview questions

1. Why is the mean the best center for squared Euclidean distance?
2. Why run more than one initialization?
3. When would DBSCAN be a better choice?

## Exercises

1. Add one extreme outlier and inspect the centroid shift.
2. Compare scaled and unscaled features.
3. Evaluate stability across seeds and samples, then assess whether groups support useful actions.
