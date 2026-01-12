"""
Test integration between frontend and backend
"""
import requests
import json

def test_endpoints():
    """Test all API endpoints that frontend uses"""
    base_url = "http://localhost:8000"
    
    endpoints = [
        "/api/current-conditions",
        "/api/predict/storm",
        "/api/predict/impact",
        "/api/historical/24h",
    ]
    
    print("Testing API endpoints...\n")
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            status = "✓ OK" if response.status_code == 200 else f"✗ FAILED ({response.status_code})"
            print(f"{status} - {endpoint}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"   → Returned {len(data)} items")
                elif isinstance(data, dict):
                    print(f"   → Keys: {', '.join(list(data.keys())[:5])}")
            else:
                print(f"   → Error: {response.text}")
                
        except Exception as e:
            print(f"✗ ERROR - {endpoint}")
            print(f"   → {str(e)}")
        
        print()

def test_health():
    """Test backend health"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        data = response.json()
        print("Backend Health Check:")
        print(f"  Status: {data['status']}")
        print(f"  Models:")
        for model, loaded in data['models'].items():
            status = "✓ Loaded" if loaded else "✗ Not loaded"
            print(f"    {model}: {status}")
        print()
    except Exception as e:
        print(f"✗ Health check failed: {e}\n")

if __name__ == "__main__":
    print("=" * 60)
    print("SolarGuard 3D - Integration Test")
    print("=" * 60)
    print()
    
    test_health()
    test_endpoints()
    
    print("=" * 60)
    print("Test complete!")
    print("Frontend: http://localhost:3000")
    print("Backend:  http://localhost:8000")
    print("=" * 60)
