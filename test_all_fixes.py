#!/usr/bin/env python3
"""
Comprehensive test of all fixes
Tests:
1. Keras model loading (with mse metric fix)
2. SHAP endpoint (with numpy type conversion fix)
"""
import sys
import os
sys.path.insert(0, '.')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

print("=" * 60)
print("🧪 COMPREHENSIVE FIX VERIFICATION TEST")
print("=" * 60)

# Test 1: Keras Model Loading
print("\n1️⃣ Testing Keras Model Loading (Storm Severity)...")
try:
    from backend.ml import StormSeverityPredictor
    severity_model = StormSeverityPredictor()
    severity_model.load()
    print("   ✅ Storm severity model loaded successfully!")
    print(f"   📊 Model has {severity_model.model.count_params()} parameters")
except Exception as e:
    print(f"   ❌ FAILED: {e}")
    sys.exit(1)

# Test 2: XGBoost Model Loading
print("\n2️⃣ Testing XGBoost Model Loading (Storm Occurrence)...")
try:
    from backend.ml import StormOccurrencePredictor
    occurrence_model = StormOccurrencePredictor()
    occurrence_model.load()
    print("   ✅ Storm occurrence model loaded successfully!")
    print(f"   📊 Model features: {', '.join(occurrence_model.features)}")
except Exception as e:
    print(f"   ❌ FAILED: {e}")
    sys.exit(1)

# Test 3: SHAP Explainability
print("\n3️⃣ Testing SHAP Explainability...")
try:
    import asyncio
    import backend.main as main_module
    
    # Set the model in the main module
    main_module.occurrence_model = occurrence_model
    
    # Test the endpoint
    result = asyncio.run(main_module.explain_prediction(
        bz=-5.0, 
        speed=500.0, 
        density=10.0
    ))
    
    # Verify all fields are present and properly typed
    assert 'feature_importance' in result
    assert 'reasoning' in result
    assert 'base_value' in result
    assert 'prediction' in result
    
    # Verify types are JSON-serializable (not numpy types)
    import json
    json_str = json.dumps(result)  # This will fail if numpy types aren't converted
    
    print("   ✅ SHAP endpoint working correctly!")
    print(f"   📊 Prediction: {result['prediction']:.4f}")
    print(f"   📈 Base value: {result['base_value']:.4f}")
    print(f"   🔍 Features analyzed: {len(result['feature_importance'])}")
    
except Exception as e:
    print(f"   ❌ FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 4: JSON Serialization
print("\n4️⃣ Testing JSON Serialization (No Numpy Types)...")
try:
    import json
    
    # Try to serialize the SHAP result
    json_output = json.dumps(result, indent=2)
    
    # Verify all values are native Python types
    for key, value in result['feature_importance'].items():
        assert isinstance(value, (int, float)), f"Value {key} is {type(value)}, not native type"
    
    assert isinstance(result['prediction'], (int, float))
    assert isinstance(result['base_value'], (int, float))
    
    print("   ✅ All values are JSON-serializable!")
    print(f"   📦 JSON output size: {len(json_output)} bytes")
    
except Exception as e:
    print(f"   ❌ FAILED: {e}")
    sys.exit(1)

# Test 5: Full Backend Import
print("\n5️⃣ Testing Full Backend Import...")
try:
    from backend.main import app
    print("   ✅ Backend imports successfully!")
    print(f"   🌐 API: {app.title} v{app.version}")
except Exception as e:
    print(f"   ❌ FAILED: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ ALL TESTS PASSED!")
print("=" * 60)
print("\n📝 Summary:")
print("  ✓ Keras model loading fix: WORKING")
print("  ✓ SHAP numpy type conversion: WORKING")
print("  ✓ JSON serialization: WORKING")
print("  ✓ All models loadable: WORKING")
print("\n🚀 Your SolarGuard 3D system is fully operational!")
print("\nNext steps:")
print("  1. Start server: uvicorn backend.main:app --reload --port 8000")
print("  2. Test SHAP: curl 'http://localhost:8000/explain/shap?bz=-5&speed=500&density=10'")
print("  3. View docs: http://localhost:8000/docs")
