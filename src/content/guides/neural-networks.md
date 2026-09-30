---
title: 'Neural networks & backpropagation'
description: 'A feed-forward neural network composes parameterized linear transformations with nonlinear activations. Backpropagation computes how a scalar loss changes with every parameter through the chain rule.'
phase: 23
topicId: '23-neural-networks'
prerequisites: ['matrices', 'derivatives', 'gradient-descent', 'logistic-regression']
resources: ['pytorch', 'd2l']
project: 'deep-learning-app'
estimatedHours: 6
---

## What is it?

A feed-forward neural network composes parameterized linear transformations with nonlinear activations. Backpropagation computes how a scalar loss changes with every parameter through the chain rule.

## Why does it matter?

Composition allows learned representations to capture relationships that a single linear map cannot. The same training ideas underpin modern language and vision models.

## Intuition

The forward pass produces a prediction. The loss compares it with the target. The backward pass passes sensitivity information through each operation in reverse order. An optimizer then updates parameters; backpropagation itself is not the update rule.

## Mathematics

For a two-layer network:

$$H=\operatorname{ReLU}(XW_1+b_1),\qquad \hat Y=HW_2+b_2$$

For $J=\frac1n\|\hat Y-Y\|_F^2$ with a single output, $\partial J/\partial\hat Y=2(\hat Y-Y)/n$. Matrix multiplication and the ReLU mask propagate this sensitivity backward to $W_1$. ReLU’s derivative is 1 for positive inputs and 0 for negative inputs; a convention is chosen at zero.

## Example

For a one-unit model $\hat y=v\operatorname{ReLU}(wx)$ with $x=2$, $w=1$, $v=3$, the prediction is 6. If $y=4$, squared loss is 4, $\partial J/\partial v=8$, and $\partial J/\partial w=24$.

## Python · from scratch

```python
import numpy as np
X = np.array([[1., 0.], [0., 1.]])
y = np.array([[1.], [0.]])
rng = np.random.default_rng(42)
W1 = rng.normal(0, 0.2, (2, 3))
W2 = rng.normal(0, 0.2, (3, 1))
# One training step, biases omitted only to make the chain rule visible.
z = X @ W1
h = np.maximum(z, 0)
pred = h @ W2
dpred = 2 * (pred-y) / len(X)
dW2 = h.T @ dpred
dW1 = X.T @ ((dpred @ W2.T) * (z > 0))
W1 -= 0.1 * dW1
W2 -= 0.1 * dW2
```

## Using a library

```python
import torch
model = torch.nn.Sequential(
    torch.nn.Linear(2, 3), torch.nn.ReLU(), torch.nn.Linear(3, 1)
)
optimizer = torch.optim.AdamW(model.parameters(), lr=0.01)
x_t = torch.tensor(X, dtype=torch.float32)
y_t = torch.tensor(y, dtype=torch.float32)
optimizer.zero_grad()
loss = torch.nn.functional.mse_loss(model(x_t), y_t)
loss.backward()
optimizer.step()
```

For classification, use a loss matching the output: `BCEWithLogitsLoss` for binary logits or `CrossEntropyLoss` for multiclass logits. Dropout and batch normalization behave differently during training and evaluation. Initialization, learning rate, batch size, and regularization all affect training.

## Common mistakes

- Applying softmax before `CrossEntropyLoss`, which already handles logits.
- Forgetting that PyTorch accumulates gradients until cleared.
- Tuning architecture against the test set.

## Interview questions

1. Why do linear layers without nonlinearities collapse to one linear map?
2. How do training and evaluation modes affect dropout?
3. What is the difference between an epoch and a gradient update?

## Exercises

1. Verify one weight gradient with finite differences.
2. Add biases to the NumPy implementation.
3. Plot training and validation losses under two different learning rates.
