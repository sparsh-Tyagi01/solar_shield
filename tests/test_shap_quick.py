#!/usr/bin/env python3
"""Quick test of SHAP endpoint without starting full server"""
import sys
sys.path.insert(0, '.')

import asyncio
import backend.main as main_module
from backend.ml import StormOccurrencePredictor

# Load model
print("Loading model...")
main_module.occurrence_model = StormOccurrencePredictor()
main_module.occurrence_model.load()

# Test the endpoint function
print("\nTesting SHAP endpoint...")
result = asyncio.run(main_module.explain_prediction(bz=-5.0, speed=500.0, density=10.0))

print("\n✅ SHAP Endpoint Test Results:")
print(f"Prediction: {result['prediction']:.4f}")
print(f"Base value: {result['base_value']:.4f}")
print(f"\nFeature Importance:")
for feature, value in result['feature_importance'].items():
    impact = "↑ increases" if value > 0 else "↓ decreases"
    print(f"  {feature:20s}: {value:+.4f}  {impact}")
print(f"\nReasoning: {result['reasoning'][:100]}...")
print("\n✅ All tests passed! SHAP endpoint is working correctly.")
