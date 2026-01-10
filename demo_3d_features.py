#!/usr/bin/env python3
"""
SolarShield 3D - Demo Script
Demonstrates the 3D visualization features by simulating different space weather scenarios
"""

import requests
import time
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def print_scenario(name, description):
    print(f"\n🌟 Scenario: {name}")
    print(f"   {description}")
    print("-" * 60)

def test_prediction(data, scenario_name):
    """Test prediction endpoint with scenario data"""
    try:
        response = requests.post(f"{BASE_URL}/predict/storm", json=data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {scenario_name}")
            print(f"   Storm Occurrence: {'YES' if result.get('will_storm_occur') else 'NO'}")
            print(f"   Probability: {result.get('probability', 0):.2%}")
            print(f"   Risk Level: {result.get('risk_level', 'Unknown')}")
            return result
        else:
            print(f"❌ Error: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return None

def main():
    print_header("SolarShield 3D - Feature Demo")
    print("\nThis demo showcases how different space weather conditions")
    print("affect the 3D visualization and satellite health.")
    print("\nMake sure the backend is running at http://localhost:8000")
    print("and the frontend at http://localhost:3000/3d-view")
    
    input("\nPress Enter to start the demo...")

    # Scenario 1: Calm Conditions
    print_scenario(
        "1. CALM SPACE WEATHER",
        "Normal solar activity, positive Bz, low radiation"
    )
    calm_data = {
        "bz": 5.0,
        "speed": 400.0,
        "density": 5.0,
        "pressure": 2.0,
        "xray_flux": 1e-6,
        "proton_flux": 1.0
    }
    print("\n📊 Input Data:")
    print(json.dumps(calm_data, indent=2))
    result = test_prediction(calm_data, "Calm Conditions")
    
    print("\n🎨 3D Visualization Effects:")
    print("   • Sun: Minimal flare activity")
    print("   • Earth: Blue magnetic field lines (normal)")
    print("   • Satellites: All green (healthy)")
    print("   • Particles: Few solar wind particles")
    
    input("\n⏸️  Press Enter to continue to next scenario...")

    # Scenario 2: Minor Storm
    print_scenario(
        "2. MINOR GEOMAGNETIC STORM",
        "Moderate solar wind, slightly negative Bz"
    )
    minor_storm_data = {
        "bz": -3.0,
        "speed": 500.0,
        "density": 10.0,
        "pressure": 4.0,
        "xray_flux": 5e-6,
        "proton_flux": 5.0
    }
    print("\n📊 Input Data:")
    print(json.dumps(minor_storm_data, indent=2))
    result = test_prediction(minor_storm_data, "Minor Storm")
    
    print("\n🎨 3D Visualization Effects:")
    print("   • Sun: Increased flare activity")
    print("   • Earth: Magnetic field starts turning red")
    print("   • Satellites: Some yellow warnings (minor degradation)")
    print("   • Particles: Moderate particle stream")
    
    input("\n⏸️  Press Enter to continue to next scenario...")

    # Scenario 3: Major Storm
    print_scenario(
        "3. MAJOR GEOMAGNETIC STORM",
        "High-speed solar wind, strong negative Bz"
    )
    major_storm_data = {
        "bz": -12.0,
        "speed": 650.0,
        "density": 20.0,
        "pressure": 8.0,
        "xray_flux": 2e-5,
        "proton_flux": 50.0
    }
    print("\n📊 Input Data:")
    print(json.dumps(major_storm_data, indent=2))
    result = test_prediction(major_storm_data, "Major Storm")
    
    print("\n🎨 3D Visualization Effects:")
    print("   • Sun: Intense flares, bright corona pulsing")
    print("   • Earth: Red magnetic field (compressed)")
    print("   • Satellites: Orange/red warnings (high degradation)")
    print("   • Particles: Dense particle storm")
    
    input("\n⏸️  Press Enter to continue to next scenario...")

    # Scenario 4: Extreme Event
    print_scenario(
        "4. EXTREME SPACE WEATHER EVENT",
        "Coronal Mass Ejection (CME) scenario"
    )
    extreme_data = {
        "bz": -25.0,
        "speed": 900.0,
        "density": 35.0,
        "pressure": 15.0,
        "xray_flux": 1e-4,
        "proton_flux": 500.0
    }
    print("\n📊 Input Data:")
    print(json.dumps(extreme_data, indent=2))
    result = test_prediction(extreme_data, "Extreme Event")
    
    print("\n🎨 3D Visualization Effects:")
    print("   • Sun: Maximum flare activity, red-shifted")
    print("   • Earth: Heavily compressed red magnetic field")
    print("   • Satellites: All red (critical degradation)")
    print("   • Particles: Massive particle bombardment")
    print("   • ⚠️  ALERT: Infrastructure at risk!")
    
    input("\n⏸️  Press Enter for summary...")

    # Summary
    print_header("3D VISUALIZATION FEATURES SUMMARY")
    print("""
🌟 IMPLEMENTED FEATURES:

1. REALISTIC CELESTIAL BODIES
   ☀️  Sun with dynamic corona and 8 animated solar flares
   🌍 Earth with rotating clouds and atmospheric glow
   🌙 Moon with realistic orbital mechanics

2. DATA-DRIVEN EFFECTS
   📊 All visuals respond to real ML model predictions
   🔴 Magnetic field color: Blue (normal) → Red (storm)
   💫 Solar particles stream from Sun to Earth
   ⚡ X-ray flux controls flare intensity

3. SIX TRACKED SATELLITES
   🛰️  GPS-A (20,200 km altitude)
   🛰️  COMM-1 (35,786 km - geostationary)
   🛰️  WEATHER-SAT (35,786 km - equatorial)
   🛰️  ISS (408 km - low orbit)
   🛰️  GPS-B (20,200 km - different plane)
   🛰️  RESEARCH-X (500 km - inclined orbit)

4. SATELLITE HEALTH SYSTEM
   🟢 Green: Healthy (80-100%)
   🟡 Yellow: Minor issues (50-80%)
   🟠 Orange: Degraded (20-50%)
   🔴 Red: Critical (0-20%)
   
   Health degrades based on:
   • Distance from Sun (inverse square law)
   • Current radiation levels
   • Solar wind intensity

5. INTERACTIVE CONTROLS
   🖱️  Rotate: Left-click + drag
   🖱️  Pan: Right-click + drag
   🖱️  Zoom: Scroll wheel
   📱 Responsive: Works on all devices

6. DUAL VIEW MODES
   📊 Dashboard: Integrated 600px panel
   🖥️  Full-Screen: Dedicated 3D view page

7. REAL-TIME UPDATES
   ⚡ WebSocket connection for live data
   🔄 60-second refresh cycle
   📡 Automatic satellite health recalculation

""")

    print_header("ACCESSING THE VISUALIZATION")
    print("""
1. Dashboard View:
   http://localhost:3000
   (Scroll down to see the 3D Solar System panel)

2. Full-Screen 3D View:
   http://localhost:3000/3d-view
   (Immersive experience with collapsible info panel)

3. Navigation:
   Click "3D Solar System" in the top navigation bar

""")

    print_header("DEMO COMPLETE")
    print("\n✅ All scenarios demonstrated!")
    print("🚀 Open http://localhost:3000/3d-view to see it in action")
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
