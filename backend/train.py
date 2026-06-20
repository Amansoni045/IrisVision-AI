import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os

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

def train_and_save_model():
    print("Loading data...")
    data_path = os.path.join(os.path.dirname(__file__), "..", "Iris.csv")
    df = pd.read_csv(data_path)
    
    # Drop Id column
    df = df.drop('Id', axis=1)
    
    print("Preprocessing data...")
    X = df.drop('Species', axis=1).values
    y = df['Species'].values
    
    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Save label encoder
    joblib.dump(label_encoder, 'label_encoder.pkl')
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Save scaler
    joblib.dump(scaler, 'scaler.pkl')
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)
    
    # Convert to PyTorch tensors
    X_train_t = torch.FloatTensor(X_train)
    y_train_t = torch.LongTensor(y_train)
    X_test_t = torch.FloatTensor(X_test)
    y_test_t = torch.LongTensor(y_test)
    
    # Instantiate model
    model = IrisClassifier()
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.005)
    
    print("Training PyTorch model...")
    epochs = 100
    model.train()
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = model(X_train_t)
        loss = criterion(outputs, y_train_t)
        loss.backward()
        optimizer.step()
        
        if (epoch+1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}")
            
    # Evaluation
    model.eval()
    with torch.no_grad():
        test_outputs = model(X_test_t)
        _, predicted = torch.max(test_outputs, 1)
        correct = (predicted == y_test_t).sum().item()
        accuracy = correct / len(y_test_t)
        print(f"Test Accuracy: {accuracy:.4f}")
        
    print("Saving model weights...")
    torch.save(model.state_dict(), 'model.pt')
    print("Done!")

if __name__ == "__main__":
    train_and_save_model()
