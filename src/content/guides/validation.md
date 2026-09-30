---
title: 'Validation that matches the real world'
description: 'Validation estimates how a complete learning procedure performs on observations it has not used. The split must mimic the separation between historical training data and future deployment inputs.'
phase: 17
topicId: '17-group-cross-validation'
prerequisites: ['model-evaluation']
resources: ['sklearn-validation']
project: 'churn'
estimatedHours: 3
---

## What is it?

Validation estimates how a complete learning procedure performs on observations it has not used. The split must mimic the separation between historical training data and future deployment inputs.

## Why does it matter?

A model can obtain excellent scores by exploiting information that will not be available in practice. Correct validation often matters more than the choice of algorithm.

## Intuition

Imagine the system at its actual prediction time. Hide every field created later and every related observation that would not legitimately be known. Your evaluation boundary should reproduce that information boundary.

## Mathematics

A K-fold estimate is $\hat R=K^{-1}\sum_{k=1}^K R_k$ when equally weighting folds. This is an estimate of a training procedure’s performance, not a guarantee about any one future dataset. Dependence between fold results complicates naive standard-error calculations.

## Example

If ten hospital visits from one patient are split across training and validation, the model may recognize the patient rather than learn transferable clinical structure. Grouping by patient prevents this particular shortcut.

## Python · from scratch

```python
import numpy as np
patient = np.array([1, 1, 2, 2, 3, 3])
train = np.flatnonzero(patient != 3)
valid = np.flatnonzero(patient == 3)
assert not set(patient[train]) & set(patient[valid])
```

## Using a library

```python
from sklearn.model_selection import GroupKFold, TimeSeriesSplit
X = np.arange(12).reshape(6, 2)
y = np.array([0, 0, 1, 1, 0, 1])
folds = GroupKFold(n_splits=3)
for train, valid in folds.split(X, y, groups=patient):
    assert not set(patient[train]) & set(patient[valid])
# For chronologically sorted observations, use a temporal splitter.
# A gap may be needed for overlapping windows or delayed labels.
time_folds = TimeSeriesSplit(n_splits=2, gap=1)
```

Use stratification to preserve class representation when appropriate. Repeated folds measure sensitivity to splitting; leave-one-out can be expensive and highly variable. Nested validation separates hyperparameter selection from evaluation of the selection procedure.

## Common mistakes

- Fitting imputation, feature selection, or scaling before splitting.
- Letting the same entity or a near-duplicate cross the evaluation boundary.
- Constructing features with future records or labels.

## Interview questions

1. When is stratification insufficient for a valid split?
2. Why do preprocessing transforms belong inside a pipeline?
3. What does nested cross-validation estimate?

## Exercises

1. Deliberately leak a target-derived feature and observe the score inflation.
2. Compare grouped and random splits on repeated-entity data.
3. Write a prediction-time availability table for every feature in your project.
