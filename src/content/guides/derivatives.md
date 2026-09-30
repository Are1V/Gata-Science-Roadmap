---
title: 'Derivatives & the chain rule'
description: 'A derivative is the limit of a difference quotient. It describes the local rate of change of a function. For functions of several variables, partial derivatives hold other coordinates fixed.'
phase: 5
topicId: '5-derivatives'
prerequisites: ['vectors', 'logarithms']
resources: ['calculus', 'd2l']
project: 'deep-learning-app'
estimatedHours: 4
---

## What is it?

A derivative is the limit of a difference quotient. It describes the local rate of change of a function. For functions of several variables, partial derivatives hold other coordinates fixed.

## Why does it matter?

Gradients connect a model’s error to the parameters that caused it. Backpropagation is an organized application of the chain rule, not a separate mathematical mystery.

## Intuition

Near a differentiable point, a function behaves approximately like a line. In several dimensions, its gradient supplies a linear local approximation. Continuity alone does not guarantee differentiability; an absolute-value function has a corner at zero.

## Mathematics

$$f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h},\qquad \frac{d}{dx}f(g(x))=f'(g(x))g'(x)$$

For scalar $J(\theta)$, the gradient is the vector of partial derivatives. A directional derivative in unit direction $u$ is $\nabla J^Tu$. The Jacobian generalizes derivatives to vector outputs; the Hessian collects second derivatives of a scalar output.

## Example

For $J(w)=(2w-3)^2$, the outer derivative is $2(2w-3)$ and the inner derivative is 2, so $J'(w)=4(2w-3)$. At $w=0$, the gradient is $-12$: increasing $w$ a little decreases loss.

## Python · from scratch

```python
def loss(w):
    return (2*w - 3)**2
w, h = 0., 1e-5
numeric = (loss(w+h) - loss(w-h)) / (2*h)
analytic = 4 * (2*w - 3)
assert abs(numeric - analytic) < 1e-6
```

## Using a library

```python
import torch
w = torch.tensor(0., requires_grad=True)
loss = (2*w - 3)**2
loss.backward()
print(w.grad.item())  # -12.0
```

## Common mistakes

- Forgetting the inner derivative breaks the chain rule.
- A zero derivative may identify a maximum or saddle, not a minimum.
- A finite-difference step that is too small can suffer cancellation error.

## Interview questions

1. What are the dimensions of a Jacobian for a function from three inputs to two outputs?
2. How can the Hessian distinguish a local minimum from a saddle?
3. Why can ReLU networks train even though ReLU is not differentiable at zero?

## Exercises

1. Differentiate $(3w+1)^2$ and check numerically at $w=2$.
2. Find the gradient and Hessian of $J(x,y)=x^2+3y^2$.
3. Compute a directional derivative along $(1,1)/\sqrt2$.
