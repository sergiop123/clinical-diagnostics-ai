from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from diagnosis import get_differential_diagnosis, map_to_medical_finding
from typing import List
import io
import torch
import timm
from huggingface_hub import hf_hub_download
from torchvision import transforms
from transformers import pipeline

app = FastAPI(title="Clinical Diagnostics AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ChestX-ray14 labels
XRAY_LABELS = [
    "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration",
    "Mass", "Nodule", "Pneumonia", "Pneumothorax",
    "Consolidation", "Edema", "Emphysema", "Fibrosis",
    "Pleural_Thickening", "Hernia"
]

print("Loading medical AI models... please wait")

# Load chest X-ray model
model_path = hf_hub_download(
    repo_id="taheera/vit-in1k-chestxray14",
    filename="pytorch_model.bin"
)

xray_model = timm.create_model("vit_base_patch16_224", pretrained=False, num_classes=14)
state_dict = torch.load(model_path, map_location="cpu")
xray_model.load_state_dict(state_dict)
xray_model.eval()

xray_preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])

# Load brain MRI model
print("Loading Brain MRI model...")
mri_model = pipeline(
    "image-classification",
    model="NeuronZero/MRI-Reader"
)

print("All medical AI models loaded successfully")


def analyze_xray(image: Image.Image):
    tensor = xray_preprocess(image).unsqueeze(0)
    with torch.no_grad():
        outputs = xray_model(tensor)
        probabilities = torch.sigmoid(outputs)[0]

    results = []
    for i, prob in enumerate(probabilities):
        results.append({
            "label": XRAY_LABELS[i],
            "score": float(prob)
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results


def analyze_mri(image: Image.Image):
    results = mri_model(image)
    return results


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

    if modality == "xray":
        results = analyze_xray(image)
        top_result = results[0]
        finding = top_result["label"].replace("_", " ")
        confidence = round(top_result["score"] * 100, 2)

    elif modality == "mri":
        results = analyze_mri(image)
        top_result = results[0]
        finding = top_result["label"].replace("_", " ")
        confidence = round(top_result["score"] * 100, 2)

    else:
        # CT — medical finding mapping
        general = pipeline("image-classification", model="google/vit-base-patch16-224")
        results = general(image)
        top_result = results[0]
        confidence = round(top_result["score"] * 100, 2)
        finding = map_to_medical_finding(confidence, modality)

    diagnosis = get_differential_diagnosis(finding)

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
            image = Image.open(io.BytesIO(contents)).convert("RGB")

            if modality == "xray":
                ai_results = analyze_xray(image)
                top_result = ai_results[0]
                finding = top_result["label"].replace("_", " ")
                confidence = round(top_result["score"] * 100, 2)

            elif modality == "mri":
                ai_results = analyze_mri(image)
                top_result = ai_results[0]
                finding = top_result["label"].replace("_", " ")
                confidence = round(top_result["score"] * 100, 2)

            else:
                general = pipeline("image-classification", model="google/vit-base-patch16-224")
                ai_results = general(image)
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