# Differential diagnosis mapping
# Maps AI findings to possible diagnoses for medical assistants

DIFFERENTIAL_DIAGNOSES = {
    # Chest / X-Ray findings
    "pneumonia": [
        "Viral Pneumonia",
        "Bacterial Pneumonia",
        "Atypical Pneumonia (Walking Pneumonia)",
        "Pulmonary Edema",
        "Lung Abscess",
    ],
    "normal": [
        "No significant findings detected",
        "Routine follow-up recommended",
    ],
    "tuberculosis": [
        "Primary Tuberculosis",
        "Secondary Tuberculosis",
        "Atypical Mycobacterial Infection",
        "Sarcoidosis",
        "Lung Cancer",
    ],
    "cardiomegaly": [
        "Congestive Heart Failure",
        "Hypertensive Heart Disease",
        "Dilated Cardiomyopathy",
        "Pericardial Effusion",
    ],
    "pleural effusion": [
        "Congestive Heart Failure",
        "Pneumonia with Parapneumonic Effusion",
        "Malignant Pleural Effusion",
        "Tuberculosis",
    ],
    # MRI findings
    "tumor": [
        "Benign Meningioma",
        "Glioblastoma Multiforme",
        "Metastatic Brain Tumor",
        "Pituitary Adenoma",
    ],
    "brain tumor": [
        "Benign Meningioma",
        "Glioblastoma Multiforme",
        "Metastatic Brain Tumor",
        "Pituitary Adenoma",
    ],
    "glioma": [
        "Low-grade Glioma",
        "High-grade Glioma (GBM)",
        "Oligodendroglioma",
        "Astrocytoma",
    ],
    # CT findings
    "nodule": [
        "Benign Pulmonary Nodule",
        "Primary Lung Cancer",
        "Metastatic Nodule",
        "Granuloma",
    ],
    "mass": [
        "Primary Lung Cancer",
        "Lymphoma",
        "Metastatic Disease",
        "Benign Tumor",
    ],
}

DISCLAIMER = (
    "⚠️ For educational purposes only. "
    "These suggestions are not a medical diagnosis. "
    "All findings must be reviewed by a licensed medical professional "
    "before discussion with doctors or patients."
)


def get_differential_diagnosis(finding: str):
    """
    Takes an AI finding and returns possible differential diagnoses.
    Searches for keywords in the finding string.
    """
    finding_lower = finding.lower()

    # Check if any key matches the finding
    for key in DIFFERENTIAL_DIAGNOSES:
        if key in finding_lower:
            return {
                "finding": finding,
                "differentials": DIFFERENTIAL_DIAGNOSES[key],
                "disclaimer": DISCLAIMER,
            }

    # Default if no match found
    return {
        "finding": finding,
        "differentials": [
            "Finding does not match known patterns",
            "Please consult a radiologist for manual review",
        ],
        "disclaimer": DISCLAIMER,
    }