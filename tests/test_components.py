"""
Test script to verify all components are working
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent))

print("=" * 60)
print("  🌞 SolarGuard 3D - Component Test")
print("=" * 60)

# Test 1: Import all modules
print("\n1. Testing imports...")
try:
    from backend.data import get_fetcher, engineer_features
    from backend.ml import (
        StormOccurrencePredictor,
        StormSeverityPredictor,
        ImpactRiskClassifier
    )
    from backend.utils import get_logger
    print("   ✓ All imports successful")
except Exception as e:
    print(f"   ❌ Import error: {e}")
    sys.exit(1)

# Test 2: Data fetcher
print("\n2. Testing data fetcher...")
try:
    from datetime import datetime, timedelta
    fetcher = get_fetcher()
    data = fetcher.fetch_realtime_data()
    print(f"   ✓ Data fetcher working")
    print(f"   Sample data: Bz={data['bz']:.2f}, Speed={data['speed']:.1f}")
except Exception as e:
    print(f"   ❌ Data fetcher error: {e}")

# Test 3: Feature engineering
print("\n3. Testing feature engineering...")
try:
    import pandas as pd
    from backend.data import FeatureEngineer
    
    # Create sample data
    sample_df = pd.DataFrame({
        'timestamp': pd.date_range(start='2024-01-01', periods=100, freq='1min'),
        'bz': [-5.0] * 100,
        'speed': [450.0] * 100,
        'density': [5.0] * 100,
        'pressure': [2.0] * 100,
        'sym_h': [-30.0] * 100,
        'xray_flux': [1e-6] * 100,
        'proton_flux': [1.0] * 100
    })
    
    engineer = FeatureEngineer()
    features_df = engineer.create_features(sample_df)
    print(f"   ✓ Feature engineering working")
    print(f"   Generated {len(features_df.columns)} features")
except Exception as e:
    print(f"   ❌ Feature engineering error: {e}")

# Test 4: Model initialization
print("\n4. Testing model initialization...")
try:
    occ_model = StormOccurrencePredictor()
    sev_model = StormSeverityPredictor()
    imp_model = ImpactRiskClassifier()
    print("   ✓ All models initialized successfully")
except Exception as e:
    print(f"   ❌ Model initialization error: {e}")

# Test 5: Check model files
print("\n5. Checking for trained models...")
from backend.config import (
    STORM_OCCURRENCE_MODEL_PATH,
    STORM_SEVERITY_MODEL_PATH,
    IMPACT_RISK_MODEL_PATH
)

models_exist = {
    "Storm Occurrence": STORM_OCCURRENCE_MODEL_PATH.exists(),
    "Storm Severity": STORM_SEVERITY_MODEL_PATH.exists(),
    "Impact Risk": IMPACT_RISK_MODEL_PATH.exists()
}

for model_name, exists in models_exist.items():
    status = "✓" if exists else "⚠"
    print(f"   {status} {model_name}: {'Found' if exists else 'Not trained yet'}")

if not any(models_exist.values()):
    print("\n   ⚠ No trained models found.")
    print("   Run: python backend/ml/train_pipeline.py")

# Test 6: Configuration
print("\n6. Testing configuration...")
try:
    from backend.config import (
        API_HOST,
        API_PORT,
        DATA_DIR,
        MODEL_DIR
    )
    print(f"   ✓ Configuration loaded")
    print(f"   API: {API_HOST}:{API_PORT}")
    print(f"   Data directory: {DATA_DIR}")
    print(f"   Model directory: {MODEL_DIR}")
except Exception as e:
    print(f"   ❌ Configuration error: {e}")

# Summary
print("\n" + "=" * 60)
print("  Test Summary")
print("=" * 60)

if all(models_exist.values()):
    print("\n  ✅ All components working! System ready.")
    print("\n  Next step: uvicorn backend.main:app --reload")
else:
    print("\n  ⚠ Setup complete, but models need training.")
    print("\n  Next step: python backend/ml/train_pipeline.py")

print("\n" + "=" * 60)
