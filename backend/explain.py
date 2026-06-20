import os
import joblib
import numpy as np
import pandas as pd
import torch
import shap
from models import IrisClassifier, BASE_DIR, get_train_test_data

# Global explainer assets cache
explainer_cache = {}

def get_model_and_predict_fn(model_name):
    """
    Loads the specified model and returns a unified predict_proba function.
    """
    scaler = joblib.load(os.path.join(BASE_DIR, 'scaler.pkl'))
    
    if model_name == "Logistic Regression":
        model = joblib.load(os.path.join(BASE_DIR, 'lr_model.pkl'))
        return model, lambda x: model.predict_proba(x)
        
    elif model_name == "SVM":
        model = joblib.load(os.path.join(BASE_DIR, 'svm_model.pkl'))
        return model, lambda x: model.predict_proba(x)
        
    elif model_name == "Random Forest":
        model = joblib.load(os.path.join(BASE_DIR, 'rf_model.pkl'))
        return model, lambda x: model.predict_proba(x)
        
    elif model_name == "Neural Network":
        model = IrisClassifier()
        model.load_state_dict(torch.load(os.path.join(BASE_DIR, 'model.pt')))
        model.eval()
        
        def predict_ann(x):
            x_t = torch.FloatTensor(x)
            with torch.no_grad():
                logits = model(x_t)
                probs = torch.softmax(logits, dim=1).numpy()
            return probs
            
        return model, predict_ann
        
    else:
        raise ValueError(f"Unknown model: {model_name}")

def get_shap_explainer(model_name):
    """
    Creates or retrieves a SHAP KernelExplainer for the specified model.
    Uses a small representative background dataset to keep execution time under 50ms.
    """
    cache_key = model_name
    if cache_key in explainer_cache:
        return explainer_cache[cache_key]

    # Load scaled train data to build background summary
    X_train, _, _, _, _, _ = get_train_test_data()
    
    # Use 15 representative samples (5 from each region of the dataset) as background
    # This keeps KernelExplainer extremely fast and numerically stable
    background = shap.kmeans(X_train, 15)
    
    _, predict_fn = get_model_and_predict_fn(model_name)
    
    explainer = shap.KernelExplainer(predict_fn, background)
    explainer_cache[cache_key] = explainer
    return explainer

def explain_prediction(model_name, input_vector):
    """
    Calculates SHAP values for a single input vector.
    Returns:
        predicted_class_index: The index of the predicted class.
        shap_values: A dict of species names to their feature SHAP values list.
        base_values: The base probability values for each class.
    """
    scaler = joblib.load(os.path.join(BASE_DIR, 'scaler.pkl'))
    label_encoder = joblib.load(os.path.join(BASE_DIR, 'label_encoder.pkl'))
    
    # Scale input
    scaled_input = scaler.transform(np.array([input_vector]))
    
    # Get explainer and prediction probabilities
    explainer = get_shap_explainer(model_name)
    _, predict_fn = get_model_and_predict_fn(model_name)
    
    probs = predict_fn(scaled_input)[0]
    predicted_idx = int(np.argmax(probs))
    predicted_class = label_encoder.inverse_transform([predicted_idx])[0]
    
    # Compute SHAP values (list of arrays, one array per class)
    # shape of each array: (1, 4)
    raw_shap = explainer.shap_values(scaled_input)
    
    # KernelExplainer in some versions returns a list of length 3 (for 3 classes)
    # of shape (1, 4) or returns a single 3D array (1, 4, 3)
    if isinstance(raw_shap, list):
        shap_list = raw_shap
    else:
        # If it's a single array of shape (1, 4, 3), convert it to list of shape (1, 4)
        shap_list = [raw_shap[:, :, c] for c in range(raw_shap.shape[2])]
        
    feature_names = ["Sepal Length", "Sepal Width", "Petal Length", "Petal Width"]
    species_names = label_encoder.classes_
    
    # Format outputs
    formatted_shap = {}
    base_values = {}
    
    # base_value is the expected value of the model output (length 3 list)
    expected_value = explainer.expected_value
    if not isinstance(expected_value, (list, np.ndarray)):
        expected_value = [expected_value] * 3
        
    for idx, species in enumerate(species_names):
        formatted_shap[species] = {
            name: float(val) for name, val in zip(feature_names, shap_list[idx][0])
        }
        base_values[species] = float(expected_value[idx])
        
    return {
        "predicted_species": predicted_class,
        "predicted_idx": predicted_idx,
        "shap_values": formatted_shap,
        "base_values": base_values,
        "probabilities": {species: float(probs[i]) for i, species in enumerate(species_names)}
    }

def get_global_shap_data(model_name, n_samples=30):
    """
    Computes SHAP values for a sample of rows from the test/train dataset
    so the frontend can draw a beautiful global beeswarm summary plot.
    """
    X_train, X_test, y_train, y_test, _, label_encoder = get_train_test_data()
    scaler = joblib.load(os.path.join(BASE_DIR, 'scaler.pkl'))
    
    # Take a balanced sample of size n_samples
    indices = np.linspace(0, len(X_test) - 1, n_samples, dtype=int)
    X_sample = X_test[indices]
    y_sample = y_test[indices]
    
    explainer = get_shap_explainer(model_name)
    raw_shap = explainer.shap_values(X_sample)
    
    if not isinstance(raw_shap, list):
        shap_list = [raw_shap[:, :, c] for c in range(raw_shap.shape[2])]
    else:
        shap_list = raw_shap
        
    # Reconstruct original feature values for dot colors
    X_original = scaler.inverse_transform(X_sample)
    feature_names = ["Sepal Length", "Sepal Width", "Petal Length", "Petal Width"]
    species_names = label_encoder.classes_
    
    global_points = []
    
    # We return data points containing: feature_name, shap_value, feature_value, class_name
    for c_idx, species in enumerate(species_names):
        class_shap = shap_list[c_idx] # shape (n_samples, 4)
        for s_idx in range(len(X_sample)):
            for f_idx, feat_name in enumerate(feature_names):
                global_points.append({
                    "species": species,
                    "feature": feat_name,
                    "shap_value": float(class_shap[s_idx, f_idx]),
                    "feature_value": float(X_original[s_idx, f_idx]),
                    "actual_class": label_encoder.inverse_transform([y_sample[s_idx]])[0]
                })
                
    return global_points
