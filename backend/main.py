import os
import json
import joblib
import numpy as np
import pandas as pd
import torch
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from models import IrisClassifier, BASE_DIR, train_all_models, get_train_test_data, load_data
from explain import explain_prediction, get_global_shap_data
from report import generate_pdf_report
from sklearn.metrics import confusion_matrix, roc_curve, auc, precision_recall_curve
from sklearn.preprocessing import label_binarize

app = FastAPI(title="IrisVision AI Production API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory history file path
HISTORY_FILE = os.path.join(BASE_DIR, "train_runs_history.json")

def load_train_history() -> List[Dict[str, Any]]:
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_train_history(history: List[Dict[str, Any]]):
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

@app.on_event("startup")
def verify_initial_models():
    """
    On startup, verify models exist. If not, trigger initial training run.
    """
    cache_path = os.path.join(BASE_DIR, 'metrics_cache.pkl')
    if not os.path.exists(cache_path):
        print("Initial models not found. Running training suite...")
        train_all_models()
        # Initialize default history run
        save_train_history([{
            "epochs": 100,
            "lr": 0.005,
            "timestamp": datetime_now_str(),
            "leaderboard": joblib.load(cache_path)["leaderboard"]
        }])

def datetime_now_str():
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Pydantic Schemas
class PredictionRequest(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float
    model_name: str = "Neural Network"

class TrainRequest(BaseModel):
    epochs: int = 100
    lr: float = 0.005

class ReportRequest(BaseModel):
    inputs: Dict[str, float]
    predicted_species: str
    confidence: float
    model_name: str
    shap_values: Dict[str, Dict[str, float]]

# REST Endpoints
@app.post("/predict")
def predict(request: PredictionRequest):
    try:
        input_vector = [
            request.sepal_length,
            request.sepal_width,
            request.petal_length,
            request.petal_width
        ]
        
        # Calculate prediction + SHAP explainability
        explanation = explain_prediction(request.model_name, input_vector)
        
        return {
            "predicted_species": explanation["predicted_species"],
            "predicted_idx": explanation["predicted_idx"],
            "confidence": explanation["probabilities"][explanation["predicted_species"]],
            "probabilities": explanation["probabilities"],
            "shap_values": explanation["shap_values"],
            "base_values": explanation["base_values"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/model-leaderboard")
def get_model_leaderboard():
    cache_path = os.path.join(BASE_DIR, 'metrics_cache.pkl')
    if not os.path.exists(cache_path):
        train_all_models()
    
    metrics = joblib.load(cache_path)
    return metrics["leaderboard"]

@app.post("/train")
def train_model(request: TrainRequest):
    try:
        # Validate hyperparameters
        if request.epochs <= 0 or request.epochs > 1000:
            raise HTTPException(status_code=400, detail="Epochs must be between 1 and 1000")
        if request.lr <= 0 or request.lr > 1.0:
            raise HTTPException(status_code=400, detail="Learning rate must be between 0 and 1.0")
            
        metrics = train_all_models(epochs=request.epochs, lr=request.lr)
        
        # Log to training history
        history = load_train_history()
        new_run = {
            "epochs": request.epochs,
            "lr": request.lr,
            "timestamp": datetime_now_str(),
            "leaderboard": metrics["leaderboard"]
        }
        history.append(new_run)
        save_train_history(history)
        
        return {
            "status": "success",
            "message": "Models retrained successfully.",
            "metrics": metrics["leaderboard"],
            "loss_curve": metrics["loss_curve"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

@app.get("/train-history")
def get_train_history():
    return load_train_history()

@app.get("/advanced-analytics")
def get_advanced_analytics():
    try:
        # Load dataset
        df = load_data()
        
        # 1. Feature Correlation Matrix
        feature_df = df.drop('Species', axis=1, errors='ignore')
        corr_matrix = feature_df.corr().to_dict()
        corr_data = []
        features = list(corr_matrix.keys())
        for f1 in features:
            for f2 in features:
                corr_data.append({
                    "x": f1,
                    "y": f2,
                    "val": float(corr_matrix[f1][f2])
                })
        
        # Get train/test splits for evaluation curves
        X_train, X_test, y_train, y_test, _, label_encoder = get_train_test_data()
        species_names = [s.replace("Iris-", "") for s in label_encoder.classes_]
        
        # Load models
        models = {
            "Logistic Regression": joblib.load(os.path.join(BASE_DIR, 'lr_model.pkl')),
            "SVM": joblib.load(os.path.join(BASE_DIR, 'svm_model.pkl')),
            "Random Forest": joblib.load(os.path.join(BASE_DIR, 'rf_model.pkl'))
        }
        
        # PyTorch ANN Load
        ann_model = IrisClassifier()
        ann_model.load_state_dict(torch.load(os.path.join(BASE_DIR, 'model.pt')))
        ann_model.eval()
        
        # Evaluate for Confusion Matrix, ROC, PR Curves
        analytics = {
            "correlation_matrix": corr_data,
            "confusion_matrices": {},
            "roc_curves": {},
            "pr_curves": {},
            "loss_curve": []
        }
        
        # Load Loss Curve cache
        cache_path = os.path.join(BASE_DIR, 'metrics_cache.pkl')
        if os.path.exists(cache_path):
            analytics["loss_curve"] = joblib.load(cache_path).get("loss_curve", [])
            
        # Binarize test targets for multi-class ROC/PR evaluation
        y_test_bin = label_binarize(y_test, classes=[0, 1, 2])
        
        # Evaluate sklearn models
        for name, m in models.items():
            preds = m.predict(X_test)
            probs = m.predict_proba(X_test)
            
            # Confusion Matrix
            cm = confusion_matrix(y_test, preds)
            analytics["confusion_matrices"][name] = cm.tolist()
            
            # ROC & PR Curves per class
            analytics["roc_curves"][name] = {}
            analytics["pr_curves"][name] = {}
            for c_idx, class_name in enumerate(species_names):
                # ROC Curve
                fpr, tpr, _ = roc_curve(y_test_bin[:, c_idx], probs[:, c_idx])
                # Downsample curve details to 10 points to keep response size small
                indices = np.linspace(0, len(fpr) - 1, 10, dtype=int)
                roc_points = [{"fpr": float(fpr[i]), "tpr": float(tpr[i])} for i in indices]
                # End point to ensure curves hit (1.0, 1.0)
                if len(roc_points) > 0:
                    roc_points[-1] = {"fpr": 1.0, "tpr": 1.0}
                analytics["roc_curves"][name][class_name] = roc_points
                
                # PR Curve
                precision, recall, _ = precision_recall_curve(y_test_bin[:, c_idx], probs[:, c_idx])
                pr_indices = np.linspace(0, len(recall) - 1, 10, dtype=int)
                pr_points = [{"recall": float(recall[i]), "precision": float(precision[i])} for i in pr_indices]
                analytics["pr_curves"][name][class_name] = pr_points
                
        # Evaluate PyTorch ANN model
        X_test_t = torch.FloatTensor(X_test)
        with torch.no_grad():
            ann_logits = ann_model(X_test_t)
            ann_probs = torch.softmax(ann_logits, dim=1).numpy()
            ann_preds = np.argmax(ann_probs, axis=1)
            
        cm_ann = confusion_matrix(y_test, ann_preds)
        analytics["confusion_matrices"]["Neural Network"] = cm_ann.tolist()
        
        analytics["roc_curves"]["Neural Network"] = {}
        analytics["pr_curves"]["Neural Network"] = {}
        for c_idx, class_name in enumerate(species_names):
            # ROC
            fpr, tpr, _ = roc_curve(y_test_bin[:, c_idx], ann_probs[:, c_idx])
            indices = np.linspace(0, len(fpr) - 1, 10, dtype=int)
            roc_points = [{"fpr": float(fpr[i]), "tpr": float(tpr[i])} for i in indices]
            if len(roc_points) > 0:
                roc_points[-1] = {"fpr": 1.0, "tpr": 1.0}
            analytics["roc_curves"]["Neural Network"][class_name] = roc_points
            
            # PR
            precision, recall, _ = precision_recall_curve(y_test_bin[:, c_idx], ann_probs[:, c_idx])
            pr_indices = np.linspace(0, len(recall) - 1, 10, dtype=int)
            pr_points = [{"recall": float(recall[i]), "precision": float(precision[i])} for i in pr_indices]
            analytics["pr_curves"]["Neural Network"][class_name] = pr_points
            
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed loading analytics: {str(e)}")

@app.get("/dataset")
def get_dataset(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc",
    species_filter: Optional[str] = None
):
    try:
        # Load full original dataset
        df = pd.read_csv(os.path.join(BASE_DIR, "..", "Iris.csv"))
        
        # Search & Filtering
        if species_filter and species_filter != "all":
            # Support filters like "setosa", "Iris-setosa"
            filter_val = species_filter if species_filter.startswith("Iris-") else f"Iris-{species_filter}"
            df = df[df['Species'].str.lower() == filter_val.lower()]
            
        if search:
            # Search by species name or check if the search term matches numeric values
            search_lower = search.lower()
            mask = df['Species'].str.lower().str.contains(search_lower)
            for col in ['SepalLengthCm', 'SepalWidthCm', 'PetalLengthCm', 'PetalWidthCm']:
                mask = mask | df[col].astype(str).str.contains(search_lower)
            df = df[mask]
            
        # Sorting
        if sort_by:
            # Map frontend column names to actual columns
            col_map = {
                "id": "Id",
                "sepal_length": "SepalLengthCm",
                "sepal_width": "SepalWidthCm",
                "petal_length": "PetalLengthCm",
                "petal_width": "PetalWidthCm",
                "species": "Species"
            }
            mapped_col = col_map.get(sort_by)
            if mapped_col in df.columns:
                df = df.sort_values(by=mapped_col, ascending=(sort_order == "asc"))
                
        total_records = len(df)
        
        # Paginate
        start = (page - 1) * page_size
        end = start + page_size
        paginated_df = df.iloc[start:end]
        
        # Convert paginated records to frontend friendly format
        records = []
        for _, row in paginated_df.iterrows():
            records.append({
                "id": int(row.get("Id", 0)),
                "sepal_length": float(row["SepalLengthCm"]),
                "sepal_width": float(row["SepalWidthCm"]),
                "petal_length": float(row["PetalLengthCm"]),
                "petal_width": float(row["PetalWidthCm"]),
                "species": row["Species"].replace("Iris-", "")
            })
            
        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "records": records
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed loading dataset: {str(e)}")

@app.get("/global-shap")
def get_global_shap(model_name: str = "Neural Network", n_samples: int = 30):
    try:
        data = get_global_shap_data(model_name, n_samples)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed loading global SHAP: {str(e)}")

@app.post("/generate-report")
def generate_report(request: ReportRequest):
    try:
        pdf_bytes = generate_pdf_report(
            inputs=request.inputs,
            predicted_species=request.predicted_species,
            confidence=request.confidence,
            model_name=request.model_name,
            shap_values=request.shap_values
        )
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=iris_report_{int(datetime_now_str().replace('-','').replace(':','').replace(' ',''))}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=550, detail=f"PDF generation error: {str(e)}")
