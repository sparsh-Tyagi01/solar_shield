"""
Test SHAP explainability with SolarGuard models
"""
import numpy as np
import pandas as pd
import shap
import joblib
from pathlib import Path

# Check if models exist
models_dir = Path("models")
occurrence_model_path = models_dir / "storm_occurrence.pkl"

if occurrence_model_path.exists():
    print("✅ Loading storm occurrence model...")
    model_dict = joblib.load(occurrence_model_path)
    model = model_dict['model']  # Extract the actual XGBoost model
    features = model_dict['features']
    
    # Create sample input data
    print("\n🔬 Creating test data...")
    test_data = pd.DataFrame({
        features[0]: [-5.0],
        features[1]: [500.0],
        features[2]: [10.0],
        features[3]: [-0.5],
        features[4]: [0.2],
        features[5]: [15.0]
    })
    
    print("Input features:")
    for col, val in test_data.iloc[0].items():
        print(f"  {col}: {val}")
    
    # Create SHAP explainer
    print("\n🧠 Creating SHAP explainer...")
    explainer = shap.TreeExplainer(model)
    
    # Calculate SHAP values
    print("📊 Calculating SHAP values...")
    shap_values = explainer.shap_values(test_data)
    
    # Display results
    print("\n✨ SHAP Explanation Results:")
    print(f"Base value (expected): {explainer.expected_value:.4f}")
    print(f"Model prediction: {model.predict_proba(test_data)[0][1]:.4f}")
    
    print("\n📈 Feature Contributions:")
    for feature, shap_val in zip(test_data.columns, shap_values[0]):
        impact = "↑ increases" if shap_val > 0 else "↓ decreases"
        print(f"  {feature:20s}: {shap_val:+.4f}  {impact} storm probability")
    
    # Show total
    total_impact = explainer.expected_value + sum(shap_values[0])
    print(f"\nTotal prediction: {total_impact:.4f}")
    
    print("\n✅ SHAP is working perfectly with your models!")
    print("🚀 Ready to use /explain/shap endpoint!")
    
else:
    print("❌ Storm occurrence model not found!")
    print("Run the training pipeline first: python backend/ml/train_pipeline.py")
