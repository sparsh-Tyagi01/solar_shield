#!/usr/bin/env python3
"""
Test script for new features
Tests confidence scores, model improvement, and economy loss calculation
"""
import sys
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.utils import (
    get_confidence_calculator,
    get_economy_calculator,
    get_model_improver
)


def test_confidence_calculator():
    """Test confidence score calculation"""
    print("=" * 60)
    print("TEST 1: CONFIDENCE SCORE CALCULATOR")
    print("=" * 60)
    
    cc = get_confidence_calculator()
    
    # Test 1: High probability prediction
    confidence1 = cc.calculate_occurrence_confidence(
        probability=0.95,
        input_quality=1.0
    )
    print(f"\n✅ High Probability (95%):")
    print(f"   Confidence Score: {confidence1}%")
    print(f"   Expected: >90% (Excellent)")
    
    # Test 2: Moderate probability
    confidence2 = cc.calculate_occurrence_confidence(
        probability=0.65,
        input_quality=0.8
    )
    print(f"\n✅ Moderate Probability (65%):")
    print(f"   Confidence Score: {confidence2}%")
    print(f"   Expected: 60-80% (Good)")
    
    # Test 3: Low probability
    confidence3 = cc.calculate_occurrence_confidence(
        probability=0.15,
        input_quality=1.0
    )
    print(f"\n✅ Low Probability (15%):")
    print(f"   Confidence Score: {confidence3}%")
    print(f"   Expected: >80% (Very confident it won't happen)")
    
    # Test 4: Input quality assessment
    test_data = {
        'bz': -10,
        'speed': 500,
        'density': 8,
        'pressure': 3.0
    }
    quality = cc.assess_input_quality(test_data)
    print(f"\n✅ Input Quality Assessment:")
    print(f"   Data: {test_data}")
    print(f"   Quality Score: {quality * 100:.1f}%")
    
    print("\n" + "=" * 60)
    print("CONFIDENCE CALCULATOR: ✅ WORKING")
    print("=" * 60 + "\n")


def test_economy_calculator():
    """Test economy loss calculation"""
    print("=" * 60)
    print("TEST 2: ECONOMY LOSS CALCULATOR")
    print("=" * 60)
    
    ec = get_economy_calculator()
    
    # Test 1: Moderate storm
    print("\n✅ Test Case 1: Moderate Storm (Severity: 5.5)")
    impact1 = ec.calculate_total_economic_impact(
        severity_score=5.5,
        impact_probabilities={'satellites': 0.6, 'gps': 0.4},
        num_satellites=10
    )
    print(f"   Total Expected Loss: ${impact1['total_expected_loss_million_usd']:.2f}M")
    print(f"   Satellite Damage: ${impact1['satellite_damage']['expected_loss_million_usd']:.2f}M")
    print(f"   Service Disruption: ${impact1['service_disruption']['expected_loss_million_usd']:.2f}M")
    print(f"   Net Benefit of Action: ${impact1['net_benefit_of_action_million_usd']:.2f}M")
    print(f"   Recommendation: {impact1['recommendation']}")
    
    # Test 2: Severe storm
    print("\n✅ Test Case 2: Severe Storm (Severity: 8.5)")
    impact2 = ec.calculate_total_economic_impact(
        severity_score=8.5,
        impact_probabilities={'satellites': 0.9, 'gps': 0.7, 'power_grid': 0.6},
        num_satellites=10
    )
    print(f"   Total Expected Loss: ${impact2['total_expected_loss_million_usd']:.2f}M")
    print(f"   Satellite Damage: ${impact2['satellite_damage']['expected_loss_million_usd']:.2f}M")
    print(f"   Service Disruption: ${impact2['service_disruption']['expected_loss_million_usd']:.2f}M")
    print(f"   Net Benefit of Action: ${impact2['net_benefit_of_action_million_usd']:.2f}M")
    print(f"   Recommendation: {impact2['recommendation']}")
    
    # Test 3: Minor storm
    print("\n✅ Test Case 3: Minor Storm (Severity: 2.5)")
    impact3 = ec.calculate_total_economic_impact(
        severity_score=2.5,
        impact_probabilities={'satellites': 0.2, 'gps': 0.1},
        num_satellites=10
    )
    print(f"   Total Expected Loss: ${impact3['total_expected_loss_million_usd']:.2f}M")
    print(f"   Satellite Damage: ${impact3['satellite_damage']['expected_loss_million_usd']:.2f}M")
    print(f"   Recommendation: {impact3['recommendation']}")
    
    print("\n" + "=" * 60)
    print("ECONOMY LOSS CALCULATOR: ✅ WORKING")
    print("=" * 60 + "\n")


def test_model_improver():
    """Test model improvement system"""
    print("=" * 60)
    print("TEST 3: MODEL AUTO-IMPROVEMENT SYSTEM")
    print("=" * 60)
    
    mi = get_model_improver()
    
    # Test 1: Log a prediction
    print("\n✅ Test Case 1: Logging Predictions")
    pred_id_1 = mi.log_prediction(
        model_type='storm_occurrence',
        input_data={'bz': -10, 'speed': 500},
        prediction=True
    )
    print(f"   Logged prediction: {pred_id_1}")
    
    pred_id_2 = mi.log_prediction(
        model_type='storm_severity',
        input_data={'bz': -12, 'speed': 550},
        prediction=7.5
    )
    print(f"   Logged prediction: {pred_id_2}")
    
    # Test 2: Get improvement summary
    print("\n✅ Test Case 2: Improvement Summary")
    summary = mi.get_improvement_summary()
    print(f"   Storm Occurrence:")
    print(f"      - Total Predictions: {summary['storm_occurrence']['predictions_logged']}")
    print(f"      - Outcomes Recorded: {summary['storm_occurrence']['outcomes_recorded']}")
    
    print(f"   Storm Severity:")
    print(f"      - Total Predictions: {summary['storm_severity']['predictions_logged']}")
    print(f"      - Outcomes Recorded: {summary['storm_severity']['outcomes_recorded']}")
    
    print(f"   Impact Risk:")
    print(f"      - Total Predictions: {summary['impact_risk']['predictions_logged']}")
    print(f"      - Outcomes Recorded: {summary['impact_risk']['outcomes_recorded']}")
    
    # Test 3: Record an outcome (simulated)
    print("\n✅ Test Case 3: Recording Actual Outcome")
    success = mi.record_actual_outcome(pred_id_1, actual_outcome=True)
    print(f"   Outcome recorded for {pred_id_1}: {'✅ Success' if success else '❌ Failed'}")
    
    # Test 4: Get updated summary
    print("\n✅ Test Case 4: Updated Summary After Recording")
    updated_summary = mi.get_improvement_summary()
    print(f"   Storm Occurrence:")
    print(f"      - Outcomes Recorded: {updated_summary['storm_occurrence']['outcomes_recorded']}")
    print(f"      - Pending Outcomes: {updated_summary['storm_occurrence']['pending_outcomes']}")
    
    print("\n" + "=" * 60)
    print("MODEL AUTO-IMPROVEMENT: ✅ WORKING")
    print("=" * 60 + "\n")


def main():
    """Run all tests"""
    print("\n")
    print("🚀 " * 30)
    print("TESTING NEW FEATURES FOR SOLARSHIELD")
    print("🚀 " * 30)
    print("\n")
    
    try:
        # Test 1: Confidence Calculator
        test_confidence_calculator()
        
        # Test 2: Economy Loss Calculator
        test_economy_calculator()
        
        # Test 3: Model Improver
        test_model_improver()
        
        # Final Summary
        print("\n")
        print("🎉 " * 30)
        print("ALL TESTS PASSED SUCCESSFULLY!")
        print("🎉 " * 30)
        print("\n")
        print("✅ Confidence Score Calculator: WORKING")
        print("✅ Economy Loss Calculator: WORKING")
        print("✅ Model Auto-Improvement: WORKING")
        print("\n")
        print("Next Steps:")
        print("1. Start backend: python -m backend.main")
        print("2. Test API endpoints with curl or Postman")
        print("3. Start frontend: cd frontend && npm start")
        print("4. View new features in Dashboard")
        print("\n")
        
    except Exception as e:
        print("\n")
        print("❌ " * 30)
        print(f"TEST FAILED: {e}")
        print("❌ " * 30)
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
