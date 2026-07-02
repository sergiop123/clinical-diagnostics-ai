DIFFERENTIAL_DIAGNOSES = {
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
    "hemorrhage": [
        "Intracerebral Hemorrhage",
        "Subarachnoid Hemorrhage",
        "Subdural Hematoma",
        "Epidural Hematoma",
    ],
    "pulmonary nodule": [
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
    "fracture": [
        "Stress Fracture",
        "Traumatic Fracture",
        "Pathological Fracture",
        "Compression Fracture",
    
    ],
    "infiltration": [
    "Bronchitis",
    "Pneumonia",
    "Pulmonary Edema",
    "Aspiration Pneumonitis",
    "Interstitial Lung Disease",
    ],
    "atelectasis": [
    "Mucus Plugging",
    "Endobronchial Obstruction",
    "Post-surgical Atelectasis",
    "Pleural Effusion",
    "Pneumothorax",
    ],
    "effusion": [
    "Congestive Heart Failure",
    "Parapneumonic Effusion",
    "Malignant Pleural Effusion",
    "Tuberculosis",
    "Pulmonary Embolism",
    ],
    "emphysema": [
    "Chronic Obstructive Pulmonary Disease (COPD)",
    "Alpha-1 Antitrypsin Deficiency",
    "Chronic Bronchitis",
    "Asthma",
    ],
    "fibrosis": [
    "Idiopathic Pulmonary Fibrosis",
    "Hypersensitivity Pneumonitis",
    "Sarcoidosis",
    "Connective Tissue Disease",
    ],
    "consolidation": [
    "Bacterial Pneumonia",
    "Lung Abscess",
    "Pulmonary Infarction",
    "Bronchioloalveolar Carcinoma",
    ],
    "edema": [
    "Congestive Heart Failure",
    "Acute Respiratory Distress Syndrome (ARDS)",
    "Neurogenic Pulmonary Edema",
    "Fluid Overload",
    ],
    "pneumothorax": [
    "Spontaneous Pneumothorax",
    "Traumatic Pneumothorax",
    "Tension Pneumothorax",
    "Secondary Pneumothorax from COPD",
    ],
    "pleural thickening": [
    "Asbestos-related Pleural Disease",
    "Previous Empyema",
    "Tuberculosis",
    "Malignant Mesothelioma",
    ],
    "hernia": [
    "Hiatal Hernia",
    "Diaphragmatic Hernia",
    "Bochdalek Hernia",
    "Morgagni Hernia",
    ],
    "nodule": [
    "Benign Pulmonary Nodule",
    "Primary Lung Cancer",
    "Metastatic Nodule",
    "Granuloma",
    "Hamartoma",
],
}

XRAY_FINDINGS = [
    "Normal",
    "Pneumonia",
    "Tuberculosis",
    "Cardiomegaly",
    "Pleural Effusion",
    "Pulmonary Edema",
    "Atelectasis",
    "Pneumothorax",
]

MRI_FINDINGS = [
    "Normal",
    "Brain Tumor",
    "Glioma",
    "Hemorrhage",
    "White Matter Lesion",
    "Cerebral Infarction",
    "Hydrocephalus",
]

CT_FINDINGS = [
    "Normal",
    "Pulmonary Nodule",
    "Mass",
    "Pleural Effusion",
    "Pneumonia",
    "Emphysema",
    "Fracture",
]

DISCLAIMER = (
    "For educational purposes only. "
    "These suggestions are not a medical diagnosis. "
    "All findings must be reviewed by a licensed medical professional "
    "before discussion with doctors or patients."
)


def map_to_medical_finding(confidence: float, modality: str) -> str:
    """
    Maps AI confidence score to a realistic medical finding
    based on the selected modality.
    """
    import random
    random.seed(int(confidence * 1000))

    if modality == "xray":
        findings = XRAY_FINDINGS
    elif modality == "mri":
        findings = MRI_FINDINGS
    elif modality == "ct":
        findings = CT_FINDINGS
    else:
        findings = XRAY_FINDINGS

    if confidence > 80:
        weights = [30, 20, 10, 10, 10, 5, 5, 5]
    elif confidence > 50:
        weights = [20, 25, 15, 10, 10, 10, 5, 5]
    else:
        weights = [15, 25, 20, 15, 10, 10, 5, 5]

    weights = weights[:len(findings)]
    total = sum(weights)
    weights = [w / total for w in weights]

    return random.choices(findings, weights=weights, k=1)[0]


def get_differential_diagnosis(finding: str):
    """
    Takes a medical finding and returns possible differential diagnoses.
    """
    finding_lower = finding.lower()

    for key in DIFFERENTIAL_DIAGNOSES:
        if key in finding_lower:
            return {
                "finding": finding,
                "differentials": DIFFERENTIAL_DIAGNOSES[key],
                "disclaimer": DISCLAIMER,
            }

    return {
        "finding": finding,
        "differentials": [
            "Finding requires manual review by a radiologist",
            "Please consult a specialist for further evaluation",
        ],
        "disclaimer": DISCLAIMER,
    }