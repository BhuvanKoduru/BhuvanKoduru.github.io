---
layout: page
title: "Minesweeper AI"
description: An AI agent for playing Minesweeper by making safe logical moves to avoid mines—a fun demo.
img: assets/img/ms.jpeg
importance: 3
repo: "Minesweeper"
category: fun
tags:
  - AI
  - Game
  - Reinforcement Learning
---

This project is an **AI-powered Minesweeper solver** that uses **propositional logic** to play the classic game. The AI reasons about the game board using logical sentences and makes safe moves whenever possible, falling back to random moves only when necessary.

 [Here's a demo video](https://drive.google.com/file/d/1083Tj_0Zo2GY8GKhMl5gww7ZXk_zdcCs/view?usp=share_link)


---

##  Project Overview
The project consists of three main components:

### 1. **Minesweeper Game Engine**
- Implements the game board with a customizable **height**, **width**, and **number of mines**.
- Randomly places mines and tracks revealed cells.
- Provides utility methods:
  - `nearby_mines(cell)` → counts how many mines are adjacent to a given cell.
  - `is_mine(cell)` → checks if a cell contains a mine.
  - `won()` → determines if all mines have been flagged.
- Includes a text-based board visualization for debugging.

### 2. **Sentence (Logical Representation)**
- Encodes **logical knowledge** about the game.
- Each `Sentence` represents:
  - A **set of cells** on the board.
  - A **count** of how many of those cells contain mines.
- Provides inference capabilities:
  - `known_mines()` → identifies cells that must be mines.
  - `known_safes()` → identifies cells that must be safe.
  - `mark_mine(cell)` → updates sentences when a cell is confirmed as a mine.
  - `mark_safe(cell)` → updates sentences when a cell is confirmed safe.

### 3. **Minesweeper AI**
- The reasoning engine that plays the game.
- Maintains sets of:
  - **Moves made** (to avoid repeats).
  - **Known safes** and **known mines**.
  - A **knowledge base** of sentences about the board.
- **Key Methods:**
  - `add_knowledge(cell, count)`  
    - Marks a cell as safe.  
    - Adds a new logical sentence based on nearby unrevealed cells and mine counts.  
    - Updates the knowledge base by inferring additional safe/mine cells.  
    - Uses **subset reasoning** to derive new knowledge (e.g., if `{A, B, C} = 2` and `{A, B} = 1`, then `{C} = 1`).
  - `make_safe_move()`  
    - Selects a cell that is logically guaranteed to be safe.
  - `make_random_move()`  
    - Selects a random move when no safe moves are known, avoiding flagged mines.

---

##  How the AI Thinks
1. **Player clicks a cell** → game reveals number of nearby mines.  
2. **AI adds knowledge** → creates logical constraints from that number.  
3. **Logical inference** → deduces safe cells or mines.  
4. **Decision-making**:  
   - Prefer safe moves (guaranteed by logic).  
   - If no safe move is available, make a random move.  

This allows the AI to play Minesweeper in a human-like reasoning process.

---

##  Skills Demonstrated
- **Artificial Intelligence & Logic** → Representing knowledge with logical sentences.  
- **Game Development** → Implemented a custom Minesweeper engine.  
- **Algorithm Design** → Inference rules for subset relationships.  
- **Python Programming** → OOP design with classes, sets, and randomization.

---

## Takeaways
This project showcases how **knowledge-based AI** can be applied to reasoning under uncertainty. Instead of brute-force simulation, the AI uses logical deduction to safely progress through the game — just like a human player.

