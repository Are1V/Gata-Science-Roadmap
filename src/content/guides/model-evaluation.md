---
title: 'Metrics, thresholds & calibration'
description: 'Evaluation measures how predictions support a decision on data that represent intended use. A classification score, a calibrated probability, and a thresholded action require different checks.'
phase: 16
topicId: '16-confusion-matrix'
prerequisites: ['bayes-theorem', 'logistic-regression']
resources: ['sklearn-metrics']
project: 'fraud-detection'
estimatedHours: 4
---

## What is it?

Evaluation measures how predictions support a decision on data that represent intended use. A classification score, a calibrated probability, and a thresholded action require different checks.

## Why does it matter?

An impressive aggregate score can hide a useless rare-event detector or an unreliable probability. Metrics should reflect the relative costs of errors and the available operational capacity.

## Intuition

The confusion matrix is a count of correct and incorrect decisions. A threshold moves examples between its cells. Calibration asks whether events predicted at probability 0.7 occur about 70% of the time among comparable cases.

## Mathematics

$$\text{precision}=\frac{TP}{TP+FP},\quad\text{recall}=\frac{TP}{TP+FN},\quad F_1=\frac{2TP}{2TP+FP+FN}$$

Specificity is $TN/(TN+FP)$. ROC curves compare true-positive and false-positive rates; precision-recall curves expose tradeoffs among retrieved positives. Average precision summarizes precision across recall increments and is not identical to trapezoidal PR-AUC.

## Example

Among 1,000 examples with ten positives, predicting all negatives gives 99% accuracy and zero recall. If a model flags 20 cases, finds eight positives, and misses two, precision is 0.4 and recall is 0.8.

## Python · from scratch

```python
y, predicted = [1, 1, 0, 0], [1, 0, 1, 0]
tp = sum(a == 1 and b == 1 for a, b in zip(y, predicted))
fp = sum(a == 0 and b == 1 for a, b in zip(y, predicted))
fn = sum(a == 1 and b == 0 for a, b in zip(y, predicted))
precision = tp / (tp+fp) if tp+fp else 0.
recall = tp / (tp+fn) if tp+fn else 0.
```

## Using a library

```python
from sklearn.metrics import (precision_recall_curve,
    average_precision_score, brier_score_loss)
y = [1, 1, 0, 0]
scores = [0.9, 0.4, 0.6, 0.1]
precision, recall, thresholds = precision_recall_curve(y, scores)
ap = average_precision_score(y, scores)
brier = brier_score_loss(y, scores)
```

For regression, MAE is robust to extreme errors relative to MSE; RMSE emphasizes large misses. MAPE has zero-target problems. RMSLE emphasizes relative differences for nonnegative targets and predictions. Choose units and edge-case behavior deliberately.

## Common mistakes

- Passing predicted classes instead of scores to ranking metrics.
- Comparing metrics across datasets with different prevalence without context.
- Choosing the operating threshold on the final test set.

## Interview questions

1. Why can ROC-AUC look good while precision is poor?
2. Is a well-calibrated constant predictor necessarily useful for ranking?
3. How do you choose a threshold under a fixed daily review budget?

## Exercises

1. Compute metrics for the rare-event example by hand.
2. Plot precision and recall as the threshold varies.
3. Report confidence intervals and subgroup results for an operating point.
