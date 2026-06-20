from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import joblib
import os

app = FastAPI(title="IrisVision AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IrisClassifier(nn.Module):
    def __init__(self):
        super(IrisClassifier, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(4, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 3)
        )
    def forward(self, x):
        return self.network(x)

# Global variables for models
model = None
scaler = None
label_encoder = None
dataset_stats_cache = None

@app.on_event("startup")
def load_assets():
    global model, scaler, label_encoder, dataset_stats_cache
    try:
        scaler = joblib.load('scaler.pkl')
        label_encoder = joblib.load('label_encoder.pkl')
        
        # Load PyTorch model
        model = IrisClassifier()
        model.load_state_dict(torch.load('model.pt'))
        model.eval()
        print("Model and transformers loaded successfully.")
        
        # Load dataset stats
        data_path = os.path.join(os.path.dirname(__file__), "..", "Iris.csv")
        df = pd.read_csv(data_path)
        df = df.drop('Id', axis=1)
        dataset_stats_cache = {
            "total_samples": len(df),
            "species_count": df['Species'].value_counts().to_dict(),
            "feature_stats": df.describe().to_dict()
        }
    except Exception as e:
        print(f"Error loading assets: {e}")

class PredictionRequest(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float

@app.post("/predict")
def predict(request: PredictionRequest):
    if model is None or scaler is None or label_encoder is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
        
    features = np.array([[
        request.sepal_length, 
        request.sepal_width, 
        request.petal_length, 
        request.petal_width
    ]])
    
    scaled_features = scaler.transform(features)
    features_t = torch.FloatTensor(scaled_features)
    
    with torch.no_grad():
        logits = model(features_t)
        probabilities_t = torch.softmax(logits, dim=1)
        prediction_probs = probabilities_t.numpy()[0]
    
    predicted_class_index = np.argmax(prediction_probs)
    predicted_species = label_encoder.inverse_transform([predicted_class_index])[0]
    confidence = float(prediction_probs[predicted_class_index])
    
    probabilities = {
        label_encoder.inverse_transform([i])[0]: float(prob)
        for i, prob in enumerate(prediction_probs)
    }
    
    # Calculate feature influence for explainability based on first layer weights
    try:
        first_layer_weights = model.network[0].weight.data.numpy() # Shape: (64, 4)
        # Sum absolute weights per input feature
        feature_importance = np.sum(np.abs(first_layer_weights), axis=0) # Shape: (4,)
        # normalize
        feature_importance = feature_importance / np.sum(feature_importance)
        feature_names = ["Sepal Length", "Sepal Width", "Petal Length", "Petal Width"]
        importance_dict = {name: float(val) for name, val in zip(feature_names, feature_importance)}
    except Exception as e:
        print(f"Error calculating influence: {e}")
        importance_dict = {}

    return {
        "predicted_species": predicted_species,
        "confidence": confidence,
        "probabilities": probabilities,
        "feature_influence": importance_dict
    }

@app.get("/model-info")
def get_model_info():
    return {
        "architecture": "Sequential ANN (PyTorch Dense 64 -> Dropout 0.2 -> Dense 32 -> Dropout 0.2 -> Dense 3)",
        "accuracy": 0.98,
        "precision": 0.97,
        "recall": 0.97,
        "f1_score": 0.97
    }

@app.get("/dataset-stats")
def get_dataset_stats():
    if not dataset_stats_cache:
        raise HTTPException(status_code=500, detail="Dataset stats not loaded")
    return dataset_stats_cache

@app.get("/metrics")
def get_metrics():
    return {
        "species_distribution": [
            {"name": "Iris-setosa", "value": 50},
            {"name": "Iris-versicolor", "value": 50},
            {"name": "Iris-virginica", "value": 50}
        ],
        "feature_averages": [
            {"name": "Sepal Length", "setosa": 5.0, "versicolor": 5.9, "virginica": 6.5},
            {"name": "Sepal Width", "setosa": 3.4, "versicolor": 2.7, "virginica": 2.9},
            {"name": "Petal Length", "setosa": 1.4, "versicolor": 4.2, "virginica": 5.5},
            {"name": "Petal Width", "setosa": 0.2, "versicolor": 1.3, "virginica": 2.0}
        ]
    }
