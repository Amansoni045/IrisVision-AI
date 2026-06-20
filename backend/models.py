import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import joblib

# Absolute path helper
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "Iris.csv")

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

def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    if 'Id' in df.columns:
        df = df.drop('Id', axis=1)
    return df

def get_train_test_data():
    df = load_data()
    X = df.drop('Species', axis=1).values
    y = df['Species'].values

    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    joblib.dump(label_encoder, os.path.join(BASE_DIR, 'label_encoder.pkl'))

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, os.path.join(BASE_DIR, 'scaler.pkl'))

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_encoded, test_size=0.2, random_state=42
    )
    return X_train, X_test, y_train, y_test, scaler, label_encoder

def train_all_models(epochs=100, lr=0.005):
    """
    Trains all four classifiers and saves their assets.
    Returns details about the training metrics, training times, and training loss curve for the ANN.
    """
    X_train, X_test, y_train, y_test, scaler, label_encoder = get_train_test_data()
    
    leaderboard = {}
    ann_loss_curve = []

    # 1. Logistic Regression
    t0 = time.time()
    lr_model = LogisticRegression(max_iter=1000, random_state=42)
    lr_model.fit(X_train, y_train)
    lr_time = time.time() - t0
    y_pred_lr = lr_model.predict(X_test)
    acc_lr = accuracy_score(y_test, y_pred_lr)
    prec_lr, rec_lr, f1_lr, _ = precision_recall_fscore_support(y_test, y_pred_lr, average='weighted')
    joblib.dump(lr_model, os.path.join(BASE_DIR, 'lr_model.pkl'))
    leaderboard["Logistic Regression"] = {
        "accuracy": float(acc_lr),
        "precision": float(prec_lr),
        "recall": float(rec_lr),
        "f1_score": float(f1_lr),
        "training_time": float(lr_time)
    }

    # 2. Support Vector Machine (SVM)
    t0 = time.time()
    svm_model = SVC(probability=True, random_state=42)
    svm_model.fit(X_train, y_train)
    svm_time = time.time() - t0
    y_pred_svm = svm_model.predict(X_test)
    acc_svm = accuracy_score(y_test, y_pred_svm)
    prec_svm, rec_svm, f1_svm, _ = precision_recall_fscore_support(y_test, y_pred_svm, average='weighted')
    joblib.dump(svm_model, os.path.join(BASE_DIR, 'svm_model.pkl'))
    leaderboard["SVM"] = {
        "accuracy": float(acc_svm),
        "precision": float(prec_svm),
        "recall": float(rec_svm),
        "f1_score": float(f1_svm),
        "training_time": float(svm_time)
    }

    # 3. Random Forest
    t0 = time.time()
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    rf_time = time.time() - t0
    y_pred_rf = rf_model.predict(X_test)
    acc_rf = accuracy_score(y_test, y_pred_rf)
    prec_rf, rec_rf, f1_rf, _ = precision_recall_fscore_support(y_test, y_pred_rf, average='weighted')
    joblib.dump(rf_model, os.path.join(BASE_DIR, 'rf_model.pkl'))
    leaderboard["Random Forest"] = {
        "accuracy": float(acc_rf),
        "precision": float(prec_rf),
        "recall": float(rec_rf),
        "f1_score": float(f1_rf),
        "training_time": float(rf_time)
    }

    # 4. Neural Network (PyTorch ANN)
    t0 = time.time()
    X_train_t = torch.FloatTensor(X_train)
    y_train_t = torch.LongTensor(y_train)
    X_test_t = torch.FloatTensor(X_test)
    y_test_t = torch.LongTensor(y_test)

    ann_model = IrisClassifier()
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(ann_model.parameters(), lr=lr)

    ann_model.train()
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = ann_model(X_train_t)
        loss = criterion(outputs, y_train_t)
        loss.backward()
        optimizer.step()
        ann_loss_curve.append({"epoch": epoch + 1, "loss": float(loss.item())})

    ann_time = time.time() - t0
    ann_model.eval()
    with torch.no_grad():
        test_outputs = ann_model(X_test_t)
        _, predicted = torch.max(test_outputs, 1)
        y_pred_ann = predicted.numpy()

    acc_ann = accuracy_score(y_test, y_pred_ann)
    prec_ann, rec_ann, f1_ann, _ = precision_recall_fscore_support(y_test, y_pred_ann, average='weighted')
    torch.save(ann_model.state_dict(), os.path.join(BASE_DIR, 'model.pt'))
    
    leaderboard["Neural Network"] = {
        "accuracy": float(acc_ann),
        "precision": float(prec_ann),
        "recall": float(rec_ann),
        "f1_score": float(f1_ann),
        "training_time": float(ann_time)
    }

    # Cache metrics inside a local file
    metrics_cache = {
        "leaderboard": leaderboard,
        "loss_curve": ann_loss_curve,
        "hyperparams": {"epochs": epochs, "lr": lr},
        "timestamp": time.time()
    }
    joblib.dump(metrics_cache, os.path.join(BASE_DIR, 'metrics_cache.pkl'))

    return metrics_cache
