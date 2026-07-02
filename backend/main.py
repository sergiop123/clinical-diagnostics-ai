from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from transformers import pipeline
from PIL import Image
from diagnosis import get_differential_diagnosis, map_to_medical_finding
from typing import List
import io

app = FastAPI(title="Clinical Diagnostics AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading AI models... please wait")

model = pipeline("image-classification", model="google/vit-base-patch16-224")

models = {
    "xray": model,
    "mri": model,
    "ct": model,
}

print("All models loaded successfully")


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
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    selected_model = models.get(modality, models["xray"])
    results = selected_model(image)
    top_result = results[0]

    confidence = round(top_result["score"] * 100, 2)
    medical_finding = map_to_medical_finding(confidence, modality)
    diagnosis = get_differential_diagnosis(medical_finding)

    return {
        "filename": file.filename,
        "modality": modality.upper(),
        "finding": medical_finding,
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
            image = Image.open(io.BytesIO(contents)).convert("RGB")

            selected_model = models.get(modality, models["xray"])
            ai_results = selected_model(image)
            top_result = ai_results[0]

            confidence = round(top_result["score"] * 100, 2)
            finding = map_to_medical_finding(confidence, modality)
            diagnosis = get_differential_diagnosis(finding)

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