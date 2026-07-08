# Clinical Diagnostics AI

**Jade Global Internship 2026**

An AI-powered medical imaging application that analyzes X-ray, CT, and MRI scans, provides radiologist-style findings and differential diagnosis suggestions, and supports both single-image and batch processing.

## Tech Stack

- **Frontend:** React (Jade Global branding)
- **Backend:** FastAPI (Python)
- **AI Model:** Google MedGemma 4B (open-source, Hugging Face) — handles X-ray, CT, and MRI in one model

## Project Structure

clinical-diagnostics-ai/
├── backend/
│   ├── main.py              # CPU version (local dev, session dashboard)
│   ├── main_medgemma.py     # GPU version (MedGemma — for VM deployment)
│   ├── diagnosis.py         # Differential diagnosis mapping (legacy)
│   ├── requirements.txt     # Backend dependencies
├── frontend/                # React application
├── install.sh               # Consolidated install script
└── README.md

## Two Backend Versions

This project has two backend files for two environments:

- **`main.py`** — Runs on any machine (CPU). Used for local development. Provides the app structure, dashboard, and lightweight analysis.
- **`main_medgemma.py`** — Requires a CUDA GPU (e.g. the Jade VM). Runs Google MedGemma for full radiologist-style analysis across X-ray, CT, and MRI. **This is the production backend.**

## Setup

Run the consolidated install script from the project root:

```bash
bash install.sh
```

## Running the Application

### On a GPU machine (Jade VM) — recommended

```bash
export HF_TOKEN=your_token_here

cd backend
uvicorn main_medgemma:app --host 0.0.0.0 --port 8000

cd frontend
npm start
```

### On a CPU machine (local dev)

```bash
cd backend
source venv/Scripts/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

cd frontend
npm start
```

## Notes

- MedGemma requires GPU access and a Hugging Face account with access granted to `google/medgemma-4b-it`.
- The frontend expects the backend at `http://localhost:8000` (update the API URL in `App.js` if hosting the backend elsewhere).

## Medical Disclaimer

For educational purposes only. Not a medical diagnosis. All results must be reviewed by a licensed medical professional.

## Next Enhancement Steps

- Database integration (Snowflake / Databricks) with platform selection
- Consolidated database admin SQL scripts
- Persistent dashboard analytics
- DICOM file support