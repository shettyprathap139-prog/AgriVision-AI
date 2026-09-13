from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch

MODEL_NAME = "wellCh4n/tomato-leaf-disease-classification-resnet50"

print("Loading tomato-specific model...")

processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)

image_path = r"C:\Users\Prathik\OneDrive\Desktop\tomato_leaf.jpg"

image = Image.open(image_path).convert("RGB")

print("Image loaded:", image.size)

inputs = processor(images=image, return_tensors="pt")

with torch.no_grad():
    outputs = model(**inputs)

probabilities = torch.softmax(outputs.logits, dim=-1)
top_probabilities, top_classes = torch.topk(probabilities[0], 5)

print("\n🌱 AgriVision AI — Tomato Disease Detection")
print("--------------------------------------------")

for probability, class_id in zip(top_probabilities, top_classes):
    label = model.config.id2label[class_id.item()]
    print(f"{label}: {probability.item() * 100:.2f}%")