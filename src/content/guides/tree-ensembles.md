---
title: 'Decision trees, forests & boosting'
description: 'Decision trees split feature space into regions with simple predictions. Random forests average randomized trees. Gradient boosting builds an additive model by repeatedly fitting a new learner to a loss-dependent residual signal.'
phase: 15
topicId: '15-decision-trees'
prerequisites: ['statistical-inference', 'gradient-descent']
resources: ['sklearn-ensemble']
project: 'churn'
estimatedHours: 5
---

## What is it?

Decision trees split feature space into regions with simple predictions. Random forests average randomized trees. Gradient boosting builds an additive model by repeatedly fitting a new learner to a loss-dependent residual signal.

## Why does it matter?

Trees model interactions and nonlinear thresholds with little feature transformation. Ensembles improve their accuracy and stability and form strong baselines for tabular data.

## Intuition

A tree asks a sequence of questions. A forest asks many varied trees and averages their opinions. Boosting asks what the current ensemble gets wrong and adds a small correction.

## Mathematics

For class proportions $p_k$ in a node, Gini impurity is $1-\sum_kp_k^2$ and entropy is $-\sum_kp_k\log p_k$. A split is scored by the parent impurity minus the sample-weighted child impurities.

Gradient boosting forms $F_m(x)=F_{m-1}(x)+\eta h_m(x)$. The new learner fits negative derivatives of the loss with respect to current predictions. For squared loss, this signal is proportional to $y-F_{m-1}(x)$.

## Example

A binary node containing three positives and one negative has Gini $1-(3/4)^2-(1/4)^2=0.375$. A perfect split into pure children reduces the weighted child impurity to zero.

## Python · from scratch

```python
def gini(labels):
    if not labels:
        return 0.0
    proportions = [labels.count(k)/len(labels) for k in set(labels)]
    return 1 - sum(p*p for p in proportions)
assert gini([1, 1, 1, 0]) == 0.375
# A numeric stump searches candidate thresholds and minimizes
# the row-count-weighted impurity of its left and right groups.
```

## Using a library

```python
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score
X, y = load_breast_cancer(return_X_y=True)
forest = RandomForestClassifier(n_estimators=100, min_samples_leaf=3,
                                 random_state=42)
boosted = HistGradientBoostingClassifier(max_iter=100, learning_rate=0.1,
                                         random_state=42)
for model in [forest, boosted]:
    print(cross_val_score(model, X, y, cv=5, scoring="roc_auc").mean())
```

Bagging combines bootstrap-trained learners; random forests additionally sample candidate features at splits. AdaBoost reweights examples in its classic formulation. XGBoost, LightGBM, and CatBoost implement different efficient boosting strategies, constraints, and categorical-data handling.

## Common mistakes

- Treating impurity importance as unbiased evidence of causal relevance.
- Growing trees until every leaf contains one observation.
- Using the final test set for early stopping.

## Interview questions

1. How does averaging reduce the variance of imperfectly correlated trees?
2. What is the difference between bagging and boosting?
3. Why can shallow trees still capture nonlinear relationships?

## Exercises

1. Implement a one-feature split search using the Gini function above.
2. Plot validation score against tree depth.
3. Compare permutation and impurity feature importance on correlated predictors.
