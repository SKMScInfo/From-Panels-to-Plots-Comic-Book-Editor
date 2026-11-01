# From Panels to Plots: A Multiview Interface for Coherent Comic Storytelling

An AI-assisted, multimodal comic authoring system built as part of Master's research at the Université de Montréal. This project bridges local visual editing with temporal story progression, allowing creators to design cohesive multi-panel comic books through an interactive human-AI collaboration loop.

---

## 🌟 Key Features

* **Text-First Story Exploration:** Enter a brief narrative premise and main character details, then use a **"fortune sketch" curve** to guide emotional pacing and plot evolution over time.
* **Sketch-Guided Generation:** Draw rough poses, shapes, or panel compositions directly on a canvas, which the AI interprets as structural and positional constraints while preserving consistent manga styles.
* **Multiview Interface:** Coordinates a story authoring panel, a sketch-image workspace, and a storyline navigator to maintain coherence across different levels of abstraction.
* **Localized Refinement Tools:** Task-specific editing tools that allow fine-grained adjustments without requiring full-page regeneration:
  * **Tone Adjustment Wheel:** Instantly shift the emotional tone (e.g., cheerful, tense, dreamy, horror).
  * **Color Fill:** AI-assisted regional color filling that respects manga shading conventions.
  * **Dialogue Text Edit:** Natural language command tool to update or generate specific speech bubbles.
  * **Smudge Tool:** Soft visual distortion for adjusting gestures and action intensity.
* **Version Tracking & Reproducibility:** Logs prompts, metadata, and tool configurations in structured JSON databases (`story.json`, `image.json`, `tools.json`) to audit creative decisions and ensure consistency across long-form projects.

---

## 🛠️ System Architecture & Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS (Multi-canvas interactive workspace)
* **Backend:** Python (Asynchronous orchestration, prompt processing, and API integration)
* **AI & Generative Models:** Integration with LLMs (for text expansion and decomposition) and diffusion-based image generation models.
* **Design Theory Foundations:** Grounded in *Direct Manipulation Theory*, *Instrumental Interaction Theory*, and *Multiple View Theory*.

---

## 🚀 Interface Overview

1. **Story Authoring Panel:** Input prompts, character names, and fortune curves.
2. **Sketch-Image Workspace:** Draw freehand sketches and provide optional keyword-based context for localized panel edits.
3. **Storyline Navigator:** Overview of multi-page layouts, captions, and sequential navigation.
4. **Tool Sidebar:** Mode-switching workspace for drawing, text edits, and tonal adjustments.

---

## 📜 Citation & Academic Context

This project was conducted as part of graduate research at the Université de Montréal under academic supervision.

If you reference or build upon this work, please cite:
```bibtex
@inproceedings{sangwan2025panels,
  title={From Panels to Plots: A Multiview Interface for Coherent Comic Storytelling},
  author={Sangwan, Kushal and An, Na},
  booktitle={Graduate Research Report, Universit{\'e} de Montr{\'e}al},
  year={2025}
}


Backend (FastAPI)

cd backend
python3 -m venv venv
source venv/bin/activate      # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload

Backend runs at:
👉 http://127.0.0.1:8000


Frontend (React + Vite)

cd frontend
npm install
npm run dev


Frontend runs at:
👉 http://localhost:5173


