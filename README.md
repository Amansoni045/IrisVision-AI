# IrisVision AI

Intelligent Flower Species Classification Powered by Machine Learning. IrisVision AI is a production-grade AI web application that classifies Iris flower species using a custom PyTorch Artificial Neural Network (ANN) and displays the results in a premium, modern dashboard.

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend:** FastAPI, Python, PyTorch (Artificial Neural Network)

---

## Getting Started

Follow these instructions to run the project locally.

### Prerequisites

- Python 3.8+
- Node.js 18+ and npm

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn main:app --port 8000 --reload
   ```
   The backend will be running at [http://localhost:8000](http://localhost:8000).

### Running the Frontend

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will be running at [http://localhost:3000](http://localhost:3000).
