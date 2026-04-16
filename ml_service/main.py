from fastapi import FastAPI, File, UploadFile, HTTPException
from io import BytesIO
from PIL import Image
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from ultralytics import YOLO

app = FastAPI(title="YOLOv8 + ResNet50 Advanced ML Tracker")

print("Initializing YOLOv8 for precise background isolation and pet cropping...")
# Let ultralytics download yolov8n.pt natively on first execution
yolo_model = YOLO("yolov8n.pt") 

print("Initializing ResNet50 Deep Feature Extractor...")
# Load pretrained ResNet50
resnet = models.resnet50(pretrained=True)
# Stripping off the final classification FC layer to extract the pure mathematical 2048-dimensional feature backbone!
resnet = torch.nn.Sequential(*list(resnet.children())[:-1])
resnet.eval()

# Native ResNet50 Preprocessing parameters
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.post("/embed")
async def generate_embedding(file: UploadFile = File(...)):
    """
    Advanced Phase 5 ML Endpoint:
    1. Uses YOLOv8 to mathematically identify and crop the pet bounding box out of noisy image backgrounds
    2. Uses ResNet50 to transform that pure pet image into a strict 2048-dimensional embedding
    """
    try:
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        
        # --- PHASE 1: YOLO OBJECT DETECTION & CROPPING ---
        results = yolo_model(image)
        boxes = results[0].boxes
        
        cropped_image = image
        # If YOLO detects entities, isolate the highest confidence subject (usually the dog/cat taking up the frame)
        if len(boxes) > 0:
            best_box = boxes[0] 
            for box in boxes:
                if box.conf > best_box.conf:
                    best_box = box
            
            # Extract standard coordinate bounding structure limits
            x1, y1, x2, y2 = best_box.xyxy[0].tolist()
            cropped_image = image.crop((x1, y1, x2, y2))
            print("YOLO Cropping Operation Succeeded at coordinates:", x1, y1, x2, y2)

        # --- PHASE 2: RESNET50 EMBEDDING VECTOR GENERATION ---
        input_tensor = preprocess(cropped_image)
        input_batch = input_tensor.unsqueeze(0) # mini-batch formatting

        # Perform no-gradient mathematically optimized inference
        with torch.no_grad():
            features = resnet(input_batch)

        # Output shape is [1, 2048, 1, 1], we must mathematically flatten this to 2048 list 
        embedding_list = features.flatten().tolist()
        
        return {
            "status": "success",
            "embedding": embedding_list,
            "dimensions": len(embedding_list)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced Deep Tracking failed: {str(e)}")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "YOLO + ResNet50 Advanced Tracker is online!"}
