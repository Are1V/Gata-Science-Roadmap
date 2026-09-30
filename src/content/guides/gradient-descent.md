---
title: 'Gradient descent'
description: 'Gradient descent repeatedly adjusts parameters in the direction opposite the gradient of an objective. It is a local optimization procedure, so success depends on the objective, initialization, and step size.'
phase: 5
topicId: '5-gradient-descent'
prerequisites: ['derivatives', 'vectors']
resources: ['calculus', 'd2l']
project: 'house-prices'
estimatedHours: 3
lab: 'gradient'
---

## What is it?

Gradient descent repeatedly adjusts parameters in the direction opposite the gradient of an objective. It is a local optimization procedure, so success depends on the objective, initialization, and step size.

## Why does it matter?

Linear models, neural networks, and matrix factorization can all be trained by minimizing an explicit loss. The same update rule links calculus to working software.

## Intuition

Loss → derivative → gradient → parameter update → new loss. A gradient gives direction and sensitivity, while the learning rate determines how far to move. A descent direction does not guarantee a lower loss if the step is too large.

## Mathematics

$$\theta_{t+1}=\theta_t-\eta\nabla J(\theta_t)$$

Here $\theta_t$ is the current parameter vector, $\eta>0$ is the learning rate, $J$ is the scalar objective, and $\nabla J$ is its gradient. Full-batch descent uses every observation. Stochastic descent uses one; mini-batch descent uses a subset, trading exactness for efficient, noisy updates.

## Example

For $J(\theta)=\theta^2$, the gradient is $2\theta$. Starting at 3 with $\eta=0.1$, the update is $3-0.1(6)=2.4$ and the loss falls from 9 to 5.76. With $\eta=1.1$, it moves to -3.6 and the loss rises to 12.96.

## Python · from scratch

```python
theta, learning_rate = 3., 0.1
history = []
for _ in range(30):
    history.append(theta**2)
    theta -= learning_rate * 2 * theta
assert history[-1] < history[0]
```

## Using a library

```python
import torch
theta = torch.tensor(3., requires_grad=True)
optimizer = torch.optim.SGD([theta], lr=0.1)
for _ in range(30):
    optimizer.zero_grad()
    loss = theta.square()
    loss.backward()
    optimizer.step()
```

## Common mistakes

- Scaling features poorly makes one learning rate unsuitable for all directions.
- Training loss alone cannot select model capacity.
- Stopping because one mini-batch loss rises confuses sampling noise with divergence.

## Interview questions

1. Why can mini-batch descent be faster than full-batch descent?
2. How does feature scaling change the shape of a least-squares loss surface?
3. For this quadratic, which positive learning rates converge?

## Exercises

1. Derive $\theta_{t+1}=(1-2\eta)\theta_t$ for the example.
2. Find the interval of learning rates for which the absolute parameter shrinks.
3. Add noisy gradient estimates and compare individual losses with a moving average.
