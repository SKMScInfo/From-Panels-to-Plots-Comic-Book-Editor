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


