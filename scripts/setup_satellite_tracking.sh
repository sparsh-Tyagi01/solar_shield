#!/bin/bash

# Quick Setup Script for Real Satellite Tracking
# This script helps you set up the N2YO API key for live satellite data

echo "🛰️  SolarShield - Real Satellite Tracking Setup"
echo "================================================"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✓ .env file found"
else
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
fi

echo ""
echo "📋 To enable LIVE satellite tracking:"
echo ""
echo "1. Get a FREE API key from N2YO:"
echo "   → Visit: https://www.n2yo.com/api/"
echo "   → Click 'Request API Key'"
echo "   → Fill out the form (instant approval)"
echo ""
echo "2. Add your API key to .env file:"
echo "   → Open: .env"
echo "   → Find line: N2YO_API_KEY=YOUR_API_KEY_HERE"
echo "   → Replace YOUR_API_KEY_HERE with your actual key"
echo ""
echo "3. Restart the backend:"
echo "   → Press Ctrl+C in the terminal running uvicorn"
echo "   → Run: uvicorn backend.main:app --reload"
echo ""
echo "📊 Without API key:"
echo "   • System works with simulated data"
echo "   • Satellites still correlate with real space weather"
echo "   • Health calculations are accurate"
echo ""
echo "📊 With API key:"
echo "   • Real-time satellite positions from N2YO"
echo "   • Actual ISS, Hubble, GPS, GOES satellites"
echo "   • LIVE badge appears on satellite cards"
echo "   • Dashboard shows 'X/6 satellites with LIVE tracking'"
echo ""
echo "💡 Free tier includes 1000 requests/hour"
echo "   (System uses ~72 requests/hour with 6 satellites)"
echo ""
read -p "Press Enter to continue..."
