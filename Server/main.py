import cv2
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from io import BytesIO

from algo import PathAlgorithm
from path_drawer import PathDrawer

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://safe-strider.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Labels"]
)

class SafeStrider:
    def __init__(self):
        self.modelA = load_model("multi.keras")
        self.modelB = load_model("binary.keras")
        self.value_matrix = []
        self.classes_predicted = {"Safe": [], "Unsafe": []}

        self.drawer = PathDrawer()
        
        self.classes = ['Buildings', 
                        'Drought', 
                        'Earthquake', 
                        'Fire', 
                        'Flood', 
                        'Forest', 
                        'Landslide', 
                        'Potholes', 
                        'Sea', 
                        'Traffic']
        
        self.mapping_super = {
            0: 'Safe',
            1: 'Unsafe',
            2: 'Unsafe',
            3: 'Unsafe',
            4: 'Unsafe',
            5: 'Safe',
            6: 'Unsafe',
            7: 'Unsafe',
            8: 'Safe',
            9: 'Safe'
        }
        self.label_map = {'Safe': 0, 'Unsafe': 1}
        
    # ?Secondary functions
    def preprocess_image(self, image):
        if image.shape[-1] == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(image, (128, 128))
        img_array = img_resized / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        return img_array
    
    def predict_img(self, image):
        img_array = self.preprocess_image(image)
        class_preds = self.modelA.predict(img_array)
        superClass_preds = self.modelB.predict(img_array)

        fine_probs = class_preds[0]
        predicted_class_idx = np.argmax(fine_probs)
        predicted_label = self.classes[predicted_class_idx]

        super_prob = superClass_preds[0][0]

        safeA = sum(fine_probs[j] for j, lbl in self.mapping_super.items() if lbl == 'Safe')
        unsafeA = 1 - safeA
        safeB = 1 - super_prob
        unsafeB = super_prob

        final_safe = (safeA + safeB) / 2
        final_unsafe = (unsafeA + unsafeB) / 2

        pred_super = 0 if final_safe > final_unsafe else 1

        self.classes_predicted.append(predicted_label)
        if pred_super == 0:
            return 1
        return 0
    
    def classify_cell(self, cell_img):
        mean_color = np.mean(cell_img.reshape(-1, 3), axis=0)
        b, g, r = mean_color
        std_dev = np.std(cell_img)
        # print(std_dev)
        if g > 150 and r < 100 :
            # print("green: ", mean_color, "std_dev: ", std_dev)
            return "green"
        elif std_dev < 50:
            return "gray"
        else:
            return "colorful"
    
    def clean_lines(self, lines, threshold=10):
        lines = sorted(lines)
        cleaned = []
        for val in lines:
            if not cleaned or abs(val - cleaned[-1]) > threshold:
                cleaned.append(val)
        return cleaned
    
    # *Main Function
    def process_image(self, bytes):
        nparr = np.frombuffer(bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        img = cv2.resize(img, (500, 500))
        h, w, _ = img.shape
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 100, 150, apertureSize=3)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=50, maxLineGap=10)

        vertical_lines = []
        horizontal_lines = []

        for line in lines:
            x1, y1, x2, y2 = line[0]
            if abs(x2 - x1) < 10:
                vertical_lines.append(x1)
            elif abs(y2 - y1) < 10:
                horizontal_lines.append(y1)

        vertical_lines = self.clean_lines(vertical_lines)
        horizontal_lines = self.clean_lines(horizontal_lines)
        
        annotated_img = img
        
        for i in range(len(horizontal_lines) - 1):
            row = []
            for j in range(len(vertical_lines) - 1):
                y1, y2 = horizontal_lines[i], horizontal_lines[i + 1]
                x1, x2 = vertical_lines[j], vertical_lines[j + 1]

                cell = img[y1:y2, x1:x2]
                label = self.classify_cell(cell)
                if label == "green":
                    row.append(-1)  
                elif label == "gray":
                    row.append(0) 
                else:
                    if self.predict_img(cell):
                        row.append(1)
                    else:
                        row.append(-1)
                    row.append(1)
            self.value_matrix.append(row)

        self.path_algorithm = PathAlgorithm(self.value_matrix)
        directions = self.path_algorithm.main()
        
        start_cell = (len(horizontal_lines) - 2, 0)
        annotated_img = self.drawer.draw_path(directions, start_cell, vertical_lines, horizontal_lines, annotated_img)
        annotated_img_rgb = cv2.cvtColor(annotated_img, cv2.COLOR_BGR2RGB)
    
        bgr_image = cv2.cvtColor(annotated_img_rgb, cv2.COLOR_RGB2BGR)
        _, buffer = cv2.imencode(".png", bgr_image)
        
        return BytesIO(buffer), self.classes_predicted
    
App =SafeStrider()
    
@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):
    App.value_matrix = []
    App.classes_predicted = {"Safe": [], "Unsafe": []}
    content = await file.read()
    output_image_io, labels = App.process_image(content)
    output_image_io.seek(0)
    try:
        return StreamingResponse(output_image_io, media_type="image/png", headers={
            "X-Labels": json.dumps(labels)
        })
    except Exception as e:
        raise HTTPException(
                status_code=500,
                detail="Response preparation failed"
            ) from e
