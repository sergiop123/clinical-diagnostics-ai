from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from PIL import Image
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
        "message": "Image received successfully"
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

    return {
        "filename": file.filename,
        "modality": modality.upper(),
        "finding": top_result["label"],
        "confidence": round(top_result["score"] * 100, 2),
        "message": "Analysis complete"
    }