from fastapi import FastAPI, UploadFile, File, Form
from db import init_db, save_result, get_history
from fastapi.middleware.cors import CORSMiddleware
from diagnosis import get_differential_diagnosis, map_to_medical_finding
from typing import List
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import os
import io

load_dotenv()

HF_TOKEN = os.getenv("HF_API_TOKEN")
client = InferenceClient(provider="hf-inference", api_key=HF_TOKEN)

XRAY_LABELS = [
    "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration",
    "Mass", "Nodule", "Pneumonia", "Pneumothorax",
    "Consolidation", "Edema", "Emphysema", "Fibrosis",
    "Pleural_Thickening", "Hernia"
]

app = FastAPI(title="Clinical Diagnostics AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

print("Clinical Diagnostics AI backend starting...")
print("Using Hugging Face Inference API")


def analyze_xray(image_bytes: bytes):
    results = client.image_classification(
        image_bytes,
        model="taheera/vit-in1k-chestxray14"
    )
    results_sorted = sorted(results, key=lambda x: x.score, reverse=True)
    top = results_sorted[0]
    return top.label.replace("_", " "), round(top.score * 100, 2)


def analyze_mri(image_bytes: bytes):
    results = client.image_classification(
        image_bytes,
        model="NeuronZero/MRI-Reader"
    )
    results_sorted = sorted(results, key=lambda x: x.score, reverse=True)
    top = results_sorted[0]
    return top.label.replace("_", " "), round(top.score * 100, 2)


@app.get("/")
def home():
    return {"status": "Clinical Diagnostics AI is running"}


@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    return {
        "filename": file.filename,
        "size_bytes": len(contents),
        "content_type": file.content_type,
        "message": "Image received successfully",
    }


@app.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    modality: str = Form("xray")
):
    contents = await file.read()

    try:
        if modality == "xray":
            finding, confidence = analyze_xray(contents)
        elif modality == "mri":
            finding, confidence = analyze_mri(contents)
        else:
            confidence = 25.0
            finding = map_to_medical_finding(confidence, modality)
    except Exception as e:
        finding = "Unable to process image"
        confidence = 0.0
        print(f"API Error: {e}")

    diagnosis = get_differential_diagnosis(finding)

    # Save result to database
    save_result(file.filename, modality.upper(), finding)

    return {
        "filename": file.filename,
        "modality": modality.upper(),
        "finding": finding,
        "confidence": confidence,
        "differentials": diagnosis["differentials"],
        "disclaimer": diagnosis["disclaimer"],
        "message": "Analysis complete",
    }


@app.post("/batch-analyze")
async def batch_analyze(
    files: List[UploadFile] = File(...),
    modality: str = Form("xray")
):
    results = []

    for file in files:
        try:
            contents = await file.read()

            if modality == "xray":
                finding, confidence = analyze_xray(contents)
            elif modality == "mri":
                finding, confidence = analyze_mri(contents)
            else:
                confidence = 25.0
                finding = map_to_medical_finding(confidence, modality)

            diagnosis = get_differential_diagnosis(finding)

            # Save result to database (previously missing from batch endpoint)
            save_result(file.filename, modality.upper(), finding)

            results.append({
                "filename": file.filename,
                "modality": modality.upper(),
                "finding": finding,
                "confidence": confidence,
                "differentials": diagnosis["differentials"],
                "status": "Success",
            })

        except Exception as e:
            results.append({
                "filename": file.filename,
                "modality": modality.upper(),
                "finding": "Error",
                "confidence": 0,
                "differentials": [],
                "status": f"Failed: {str(e)}",
            })

    return {
        "total": len(results),
        "results": results,
        "disclaimer": "For educational purposes only. Not a medical diagnosis.",
    }

@app.get("/history")
def history():
    return {"history": get_history()}