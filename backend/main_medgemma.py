# ============================================================
# Clinical Diagnostics AI - MedGemma Backend
# Jade Global Internship 2026
# ============================================================
# This is the GPU-powered backend using Google MedGemma.
# Requires a machine with a CUDA GPU (e.g. the Jade VM).
# MedGemma handles X-ray, CT, and MRI analysis in one model.
#
# To run on a GPU machine:
#   uvicorn main_medgemma:app --host 0.0.0.0 --port 8000
# ============================================================

from fastapi import FastAPI, UploadFile, File, Form
from db import init_db, save_result, get_history
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoProcessor, AutoModelForImageTextToText
from typing import List
from PIL import Image
import torch
import io
import os

app = FastAPI(title="Clinical Diagnostics AI - MedGemma")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
# ---------- LOAD MEDGEMMA MODEL ----------
# Requires Hugging Face access to google/medgemma-4b-it
# Set your token as an environment variable: HF_TOKEN
print("Loading Google MedGemma 4B... (requires GPU)")

HF_TOKEN = os.getenv("HF_TOKEN")  # set this on the VM

processor = AutoProcessor.from_pretrained("google/medgemma-4b-it", token=HF_TOKEN)
medgemma = AutoModelForImageTextToText.from_pretrained(
    "google/medgemma-4b-it",
    torch_dtype=torch.bfloat16,
    device_map="cuda",
    token=HF_TOKEN
)
print("MedGemma loaded successfully!")


# ---------- ANALYSIS FUNCTION ----------
def analyze_with_medgemma(image, modality, brief=False):
    if brief:
        prompt = f"Look at this {modality} image. State only the single most likely finding or diagnosis in under 10 words. Be concise."
        max_tokens = 50
    else:
        modality_prompts = {
            "xray": "Analyze this X-ray. Give one short line of key findings, then list the top 3 possible diagnoses as a numbered list. Keep it brief.",
            "mri": "Analyze this MRI. Give one short line of key findings, then list the top 3 possible diagnoses as a numbered list. Keep it brief.",
            "ct": "Analyze this CT scan. Give one short line of key findings, then list the top 3 possible diagnoses as a numbered list. Keep it brief."
        }
        prompt = modality_prompts.get(modality, modality_prompts["xray"])
        max_tokens = 200
    

    messages = [
        {"role": "system", "content": [{"type": "text", "text": "You are an expert radiologist."}]},
        {"role": "user", "content": [
            {"type": "text", "text": prompt},
            {"type": "image", "image": image}
        ]}
    ]

    inputs = processor.apply_chat_template(
        messages, add_generation_prompt=True, tokenize=True,
        return_dict=True, return_tensors="pt"
    ).to("cuda", dtype=torch.bfloat16)

    input_len = inputs["input_ids"].shape[-1]

    with torch.inference_mode():
        generation = medgemma.generate(**inputs, max_new_tokens=max_tokens, do_sample=False)
        generation = generation[0][input_len:]

    return processor.decode(generation, skip_special_tokens=True)


def extract_summary(analysis_text):
    lines = analysis_text.split("\n")
    for line in lines:
        clean = line.strip().lstrip("*").lstrip("1234567890.").strip()
        if clean and len(clean) > 3:
            return clean.replace("**", "")[:80]
    return analysis_text[:80]


# ---------- ENDPOINTS ----------
@app.get("/")
def home():
    return {"status": "Clinical Diagnostics AI with MedGemma is running"}


@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...), modality: str = Form("xray")):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    analysis = analyze_with_medgemma(image, modality)
    # Save a short summary of the finding to the database
    summary = extract_summary(analysis)
    save_result(file.filename, modality.upper(), summary)
    return {
        "filename": file.filename,
        "modality": modality.upper(),
        "analysis": analysis,
        "message": "Analysis complete"
    }


@app.post("/batch-analyze")
async def batch_analyze(files: List[UploadFile] = File(...), modality: str = Form("xray")):
    results = []
    for file in files:
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents)).convert("RGB")
            analysis = analyze_with_medgemma(image, modality, brief=True)
            summary = extract_summary(analysis)
            save_result(file.filename, modality.upper(), summary)
            results.append({
                "filename": file.filename,
                "modality": modality.upper(),
                "finding": summary,
                "analysis": analysis,
                "status": "Success"
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "modality": modality.upper(),
                "finding": "Error",
                "analysis": str(e),
                "status": "Failed"
            })
    return {
        "total": len(results),
        "results": results,
        "disclaimer": "For educational purposes only. Not a medical diagnosis."
    }

@app.get("/history")
def history():
    return {"history": get_history()}