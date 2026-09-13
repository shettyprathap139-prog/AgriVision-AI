from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
import io

app = FastAPI(title="AgriVision AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://agrivision-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "wellCh4n/tomato-leaf-disease-classification-resnet50"

processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
model.eval()


@app.get("/")
def home():
    return {"message": "AgriVision AI API is running 🌱"}


@app.post("/analyze")
async def analyze_crop(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)

    probabilities = torch.softmax(outputs.logits, dim=-1)
    confidence, class_id = torch.max(probabilities[0], dim=0)

    label = model.config.id2label[class_id.item()]
    confidence_value = round(confidence.item() * 100, 2)

    if label == "A healthy tomato leaf":
        disease_name = "Healthy"
    else:
        disease_name = label.replace("A tomato leaf with ", "")

    if confidence_value >= 85:
        severity = "Moderate"
    elif confidence_value >= 60:
        severity = "Low"
    else:
        severity = "Needs Review"

    temperature = 26.1
    humidity = 93
    rainfall = 0.2

    environment_risk = "High" if humidity >= 85 else "Low"

    if disease_name == "Healthy":
        risk = "Low"
        recommendation = "Crop appears healthy. Continue regular monitoring."
    elif environment_risk == "High":
        risk = "High"
        recommendation = (
            "Inspect nearby leaves and consider preventive or targeted treatment."
        )
    else:
        risk = "Moderate"
        recommendation = "Monitor the crop closely and inspect nearby leaves."

    return {
        "disease": disease_name,
        "confidence": confidence_value,
        "severity": severity,
        "temperature": temperature,
        "humidity": humidity,
        "rainfall": rainfall,
        "environment_risk": environment_risk,
        "risk": risk,
        "recommendation": recommendation,
    }