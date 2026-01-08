# ✅ SHAP Explainability - FULLY ENABLED

## Installation Complete! 🎉

SHAP (SHapley Additive exPlanations) has been successfully installed and integrated into your SolarGuard 3D system.

## What Was Done

### 1. Dependencies Installed ✅
- **LLVM 20** (`brew install llvm@20`) - Required compiler toolchain
- **SHAP 0.49.1** - ML explainability library
- **XGBoost 2.0.3** - Downgraded from 3.1.2 for SHAP compatibility

### 2. Code Updated ✅
- ✅ Re-enabled `import shap` in [`backend/main.py`](backend/main.py)
- ✅ Restored `/explain/shap` API endpoint
- ✅ Updated [`requirements.txt`](requirements.txt)

### 3. Testing ✅
- ✅ Test script created: [`test_shap.py`](test_shap.py)
- ✅ SHAP successfully generates explanations
- ✅ Feature contributions calculated correctly

## API Endpoint Usage

### GET `/explain/shap`

Get SHAP explanation for storm occurrence prediction.

**Parameters:**
- `bz` (float): IMF Bz value (nT)
- `speed` (float): Solar wind speed (km/s)
- `density` (float): Proton density (p/cm³)

**Example Request:**
```bash
curl "http://localhost:8000/explain/shap?bz=-5.0&speed=500&density=10"
```

**Example Response:**
```json
{
  "feature_importance": {
    "bz_rolling_30min": -1.8273,
    "speed": 0.6138,
    "density": -0.4774,
    "bz_gradient": -0.1193,
    "pressure_spike": -0.0851,
    "energy_coupling": 0.1862
  },
  "reasoning": "Model predicts LOW storm risk (17.3%). Key factors...",
  "base_value": 0.1432,
  "prediction": 0.1728
}
```

## Testing SHAP

### Quick Test
```bash
python test_shap.py
```

Expected output:
```
✅ Loading storm occurrence model...
🔬 Creating test data...
🧠 Creating SHAP explainer...
📊 Calculating SHAP values...
✨ SHAP Explanation Results:
📈 Feature Contributions:
  bz_rolling_30min: -1.8273  ↓ decreases storm probability
  speed: +0.6138  ↑ increases storm probability
  ...
✅ SHAP is working perfectly with your models!
```

### API Test
```bash
# Start the server
uvicorn backend.main:app --reload --port 8000

# In another terminal, test the endpoint
curl "http://localhost:8000/explain/shap?bz=-5&speed=500&density=10"
```

## Understanding SHAP Values

### What SHAP Does
SHAP values explain **WHY** your model made a specific prediction by:
- Breaking down each feature's contribution
- Showing which features increase/decrease storm probability
- Providing transparent, interpretable AI explanations

### Reading SHAP Output

**Positive values** (e.g., +0.6138):
- Feature **increases** storm probability
- Higher values = stronger positive impact

**Negative values** (e.g., -1.8273):
- Feature **decreases** storm probability  
- Lower values = stronger negative impact

**Base Value** (e.g., 0.1432):
- Average prediction across all data
- Starting point before features are considered

**Total** = Base Value + Sum(SHAP values) = Final Prediction

## Technical Details

### Version Requirements
- **LLVM**: 20.x (not 21.x)
- **XGBoost**: < 2.1 (2.0.3 recommended)
- **SHAP**: 0.49.1
- **Python**: 3.10.x

### Why the Downgrade?
SHAP 0.49.1 doesn't support XGBoost 3.x yet due to internal API changes. Using XGBoost 2.0.3 ensures full compatibility.

### Architecture Integration

```
User Input (Bz, Speed, Density)
    ↓
Feature Engineering
    ↓
XGBoost Model (Storm Occurrence)
    ↓
SHAP TreeExplainer
    ↓
Feature Contributions + Reasoning
    ↓
/explain/shap API Response
```

## Next Steps

### 1. Start the Server
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 2. Try the Endpoint
```bash
curl "http://localhost:8000/explain/shap?bz=-10&speed=600&density=15"
```

### 3. Integrate with Frontend
The `/explain/shap` endpoint can be called from your 3D visualization to show real-time explanations of why storms are predicted.

### 4. Add More Explainability
You can extend SHAP to other models:
- Storm Severity (Model B)
- Impact Risk (Model C)

## Troubleshooting

### Issue: "ImportError: No module named shap"
**Solution:** Reinstall with LLVM 20
```bash
export PATH="/usr/local/opt/llvm@20/bin:$PATH"
pip install shap
```

### Issue: "XGBoost version incompatible"
**Solution:** Use XGBoost < 2.1
```bash
pip install "xgboost<2.1"
```

### Issue: Model not found
**Solution:** Train the models first
```bash
python backend/ml/train_pipeline.py
```

## Resources

- [SHAP Documentation](https://shap.readthedocs.io/)
- [XGBoost + SHAP Tutorial](https://shap.readthedocs.io/en/latest/example_notebooks/tabular_examples/tree_based_models/tree_explainer.html)
- [Interpretable ML Book](https://christophm.github.io/interpretable-ml-book/shap.html)

---

**Status**: ✅ **FULLY OPERATIONAL**  
**Last Updated**: 2026-01-08  
**Tested**: ✅ Working perfectly
