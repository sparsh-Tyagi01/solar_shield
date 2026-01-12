#!/bin/bash
# Test SHAP endpoint after starting the server

echo "🧪 Testing SHAP Explainability Endpoint"
echo "========================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo "⚠️  Server not running. Start it with:"
    echo "   uvicorn backend.main:app --reload --port 8000"
    echo ""
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test cases
echo "📊 Test 1: Moderate storm conditions"
echo "Parameters: Bz=-5, Speed=500, Density=10"
curl -s "http://localhost:8000/explain/shap?bz=-5&speed=500&density=10" | python3 -m json.tool
echo ""
echo "---"
echo ""

echo "📊 Test 2: Strong storm conditions"
echo "Parameters: Bz=-15, Speed=700, Density=20"
curl -s "http://localhost:8000/explain/shap?bz=-15&speed=700&density=20" | python3 -m json.tool
echo ""
echo "---"
echo ""

echo "📊 Test 3: Quiet conditions"
echo "Parameters: Bz=2, Speed=350, Density=5"
curl -s "http://localhost:8000/explain/shap?bz=2&speed=350&density=5" | python3 -m json.tool
echo ""

echo "✅ SHAP testing complete!"
