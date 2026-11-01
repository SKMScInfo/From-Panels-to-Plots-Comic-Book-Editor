Here is a clean, professional GitHub README draft for your comic book project, structured directly from your Master's research report (From Panels to Plots: A Multiview Interface for Coherent Comic Storytelling).   
IFT 6077-Final Report.pdf
From Panels to Plots: A Multiview Interface for Coherent Comic Storytelling
An AI-assisted, multimodal comic authoring system built as part of Master's research at the Université de Montréal. This project bridges local visual editing with temporal story progression, allowing creators to design cohesive multi-panel comic books through an interactive human-AI collaboration loop.   
IFT 6077-Final Report.pdf
+ 2
🌟 Key Features
Text-First Story Exploration: Enter a brief narrative premise and main character details, then use a "fortune sketch" curve to guide emotional pacing and plot evolution over time.   
IFT 6077-Final Report.pdf
Sketch-Guided Generation: Draw rough poses, shapes, or panel compositions directly on a canvas, which the AI interprets as structural and positional constraints while preserving consistent manga styles.   
IFT 6077-Final Report.pdf
Multiview Interface: Coordinates a story authoring panel, a sketch-image workspace, and a storyline navigator to maintain coherence across different levels of abstraction.   
IFT 6077-Final Report.pdf
+ 1
Localized Refinement Tools: Task-specific editing tools that allow fine-grained adjustments without requiring full-page regeneration:
Tone Adjustment Wheel: Instantly shift the emotional tone (e.g., cheerful, tense, dreamy, horror).   
IFT 6077-Final Report.pdf
Color Fill: Al-assisted regional color filling that respects manga shading conventions.   
IFT 6077-Final Report.pdf
Dialogue Text Edit: Natural language command tool to update or generate specific speech bubbles.   
IFT 6077-Final Report.pdf
Smudge Tool: Soft visual distortion for adjusting gestures and action intensity.   
IFT 6077-Final Report.pdf
Version Tracking & Reproducibility: Logs prompts, metadata, and tool configurations in structured JSON databases (story.json, image.json, tools.json) to audit creative decisions and ensure consistency across long-form projects.   
IFT 6077-Final Report.pdf
+ 1
🛠️ System Architecture & Tech Stack
Frontend: React, TypeScript, Tailwind CSS (Multi-canvas interactive workspace)
Backend: Python (Asynchronous orchestration, prompt processing, and API integration)
AI & Generative Models: Integration with LLMs (for text expansion and decomposition) and diffusion-based image generation models.   
IFT 6077-Final Report.pdf
+ 1
Design Theory Foundations: Grounded in Direct Manipulation Theory, Instrumental Interaction Theory, and Multiple View Theory.   
IFT 6077-Final Report.pdf
🚀 Interface Overview
Story Authoring Panel: Input prompts, character names, and fortune curves.   
IFT 6077-Final Report.pdf
Sketch-Image Workspace: Draw freehand sketches and provide optional keyword-based context for localized panel edits.   
IFT 6077-Final Report.pdf
Storyline Navigator: Overview of multi-page layouts, captions, and sequential navigation.   
IFT 6077-Final Report.pdf
Tool Sidebar: Mode-switching workspace for drawing, text edits, and tonal adjustments.   
IFT 6077-Final Report.pdf
📜 Citation & Academic Context
This project was conducted as part of IFT6077 - Conception de l'interaction humain-IA (Designing Human-AI Interaction) at the Université de Montréal (Fall 2025), under the supervision of Prof. Damien Masson.   
IFT 6077-Final Report.pdf
+ 1
If you reference or build upon this work, please cite:
Extrait de code
@inproceedings{sangwan2025panels,
  title={From Panels to Plots: A Multiview Interface for Coherent Comic Storytelling},
  author={Sangwan, Kushal and An, Na},
  booktitle={IFT6077 - Designing Human-AI Interaction, Universit{\'e} de Montr{\'e}al},
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


