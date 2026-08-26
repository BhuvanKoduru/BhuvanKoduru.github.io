---
layout: page
title: "Persona-Induced Response Modulation"
description: Activation-steering pipeline inducing confident personas without fine-tuning
img: assets/img/activation_steering.jpg
importance: 3
category: work
tags:
  - LLMs
  - Mechanistic Interpretability
  - Activation Steering
---

# Persona-Induced Response Modulation

**Period:** October - December 2025
**Models Tested:** Llama 3.1 8B, Gemma 2 2B

## Overview

This project explores activation steering as a lightweight alternative to fine-tuning for inducing personality traits in large language models. By manipulating internal activations, we successfully induced confident personas that reduced uncertainty expressions by 95% without requiring parameter updates.

## Key Achievements

- **95% uncertainty reduction** in model outputs when steering toward confident personas
- Zero fine-tuning required - purely activation-based intervention
- Comprehensive ablation studies across Llama 3.1 8B and Gemma 2 2B
- Mechanistic analysis of which layers contribute most to personality expression

## Methodology

### Activation Steering Pipeline

1. **Persona Dataset Construction:** Created paired examples of uncertain vs. confident responses
2. **Activation Extraction:** Captured intermediate activations from target layers during forward passes
3. **Steering Vector Computation:** Computed directional vectors representing the "confidence" axis in activation space
4. **Runtime Intervention:** Added scaled steering vectors to activations during inference

### Evaluation Metrics

- Uncertainty expression frequency (phrases like "I think," "maybe," "possibly")
- Response confidence scores (human evaluation)
- Factual accuracy preservation
- Layer-wise ablation analysis

## Results

The activation steering approach successfully modulated model behavior without fine-tuning:

- **Llama 3.1 8B:** 95% reduction in uncertainty markers while maintaining factual accuracy
- **Gemma 2 2B:** 92% reduction with similar accuracy preservation
- **Optimal Layers:** Middle-to-late transformer layers (18-24 for Llama 3.1) showed strongest steering effects

## Implications

This work demonstrates that personality traits in LLMs can be controlled through lightweight activation interventions rather than expensive fine-tuning. This has applications in:

- Personalized AI assistants without per-user model copies
- Safety research (steering away from harmful behaviors)
- Interpretability (understanding how personality emerges in neural representations)

## Technical Stack

- PyTorch for activation extraction and manipulation
- Hugging Face Transformers for model loading
- Custom steering vector implementation
- Evaluation harness for automated testing

---

This project was completed as part of coursework at Carnegie Mellon University, exploring the intersection of mechanistic interpretability and controllable generation in large language models.
