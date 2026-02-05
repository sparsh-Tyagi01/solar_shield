"""
Economy Loss Calculator
Calculate potential economic losses from space weather events
Based on satellite damage, service disruption, and system failures
"""
import numpy as np
from typing import Dict, Any, List
from backend.utils.logger import get_logger

logger = get_logger(__name__)


class EconomyLossCalculator:
    """
    Calculate potential economic losses from ignoring space weather alerts
    
    Loss categories:
    1. Satellite damage/replacement costs
    2. Communication service disruption
    3. GPS service disruption
    4. Power grid damage
    5. Operational costs
    """
    
    # Base costs (in million USD)
    SATELLITE_COSTS = {
        'low_orbit': 150,      # LEO satellite replacement
        'medium_orbit': 300,   # MEO satellite replacement
        'geo_orbit': 500,      # GEO satellite replacement
        'scientific': 800      # Scientific satellite replacement
    }
    
    REPAIR_COSTS = {
        'minor': 5,            # Minor repairs (solar panel, sensors)
        'moderate': 25,        # Moderate damage (electronics)
        'severe': 100,         # Severe damage (major systems)
        'critical': 300        # Critical, near total loss
    }
    
    SERVICE_DISRUPTION_COSTS = {
        'satellites': 2.5,      # per hour (communication downtime)
        'gps': 1.5,            # per hour (navigation disruption)
        'communication': 5.0,   # per hour (telecom disruption)
        'power_grid': 10.0     # per hour (power system issues)
    }
    
    def __init__(self):
        self.logger = logger
    
    def calculate_satellite_loss(
        self,
        severity_score: float,
        num_satellites: int = 10,
        satellite_types: List[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate potential satellite damage costs
        
        Args:
            severity_score: Storm severity (0-10)
            num_satellites: Number of satellites at risk
            satellite_types: List of satellite types affected
        
        Returns:
            Dict with damage breakdown and total cost
        """
        if satellite_types is None:
            # Default distribution
            satellite_types = ['low_orbit'] * 6 + ['medium_orbit'] * 3 + ['geo_orbit'] * 1
        
        # Calculate damage probability based on severity
        if severity_score < 3:
            damage_prob = 0.05
            damage_level = 'minor'
        elif severity_score < 5:
            damage_prob = 0.15
            damage_level = 'minor'
        elif severity_score < 7:
            damage_prob = 0.35
            damage_level = 'moderate'
        elif severity_score < 9:
            damage_prob = 0.60
            damage_level = 'severe'
        else:
            damage_prob = 0.85
            damage_level = 'critical'
        
        # Calculate costs
        total_replacement_cost = 0
        total_repair_cost = 0
        satellites_affected = []
        
        for i, sat_type in enumerate(satellite_types[:num_satellites]):
            # Probability this specific satellite is affected
            if np.random.random() < damage_prob or severity_score > 8:
                satellites_affected.append({
                    'id': i + 1,
                    'type': sat_type,
                    'damage_level': damage_level
                })
                
                # Severe/critical damage may require replacement
                if damage_level in ['critical']:
                    total_replacement_cost += self.SATELLITE_COSTS.get(sat_type, 300)
                elif damage_level in ['severe'] and np.random.random() < 0.3:
                    total_replacement_cost += self.SATELLITE_COSTS.get(sat_type, 300) * 0.5
                else:
                    total_repair_cost += self.REPAIR_COSTS.get(damage_level, 25)
        
        # Expected value calculation
        expected_replacement = total_replacement_cost * (damage_prob * 0.7)
        expected_repair = total_repair_cost * damage_prob
        
        return {
            'satellites_at_risk': num_satellites,
            'satellites_likely_affected': len(satellites_affected),
            'damage_probability': round(damage_prob * 100, 1),
            'damage_level': damage_level,
            'expected_replacement_cost': round(expected_replacement, 2),
            'expected_repair_cost': round(expected_repair, 2),
            'worst_case_replacement_cost': round(total_replacement_cost, 2),
            'worst_case_repair_cost': round(total_repair_cost, 2),
            'total_expected_loss': round(expected_replacement + expected_repair, 2),
            'total_worst_case': round(total_replacement_cost + total_repair_cost, 2)
        }
    
    def calculate_service_disruption_loss(
        self,
        severity_score: float,
        impacted_systems: List[str],
        duration_hours: float = 24
    ) -> Dict[str, Any]:
        """
        Calculate service disruption costs
        
        Args:
            severity_score: Storm severity (0-10)
            impacted_systems: List of affected systems
            duration_hours: Expected outage duration
        
        Returns:
            Dict with disruption cost breakdown
        """
        # Adjust duration based on severity
        if severity_score < 3:
            duration_multiplier = 0.5
        elif severity_score < 5:
            duration_multiplier = 1.0
        elif severity_score < 7:
            duration_multiplier = 2.0
        elif severity_score < 9:
            duration_multiplier = 3.0
        else:
            duration_multiplier = 5.0
        
        adjusted_duration = duration_hours * duration_multiplier
        
        # Calculate costs per system
        system_costs = {}
        total_cost = 0
        
        for system in impacted_systems:
            hourly_cost = self.SERVICE_DISRUPTION_COSTS.get(system, 2.0)
            system_cost = hourly_cost * adjusted_duration
            system_costs[system] = round(system_cost, 2)
            total_cost += system_cost
        
        return {
            'expected_duration_hours': round(adjusted_duration, 1),
            'system_costs': system_costs,
            'total_disruption_cost': round(total_cost, 2)
        }
    
    def calculate_total_economic_impact(
        self,
        severity_score: float,
        impact_probabilities: Dict[str, float],
        num_satellites: int = 10,
        include_indirect: bool = True
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive economic impact
        
        Args:
            severity_score: Storm severity (0-10)
            impact_probabilities: System impact probabilities
            num_satellites: Number of satellites at risk
            include_indirect: Include indirect economic costs
        
        Returns:
            Comprehensive economic impact breakdown
        """
        # Determine affected systems
        affected_systems = [
            system for system, prob in impact_probabilities.items()
            if prob > 0.5
        ]
        
        # Calculate satellite losses
        satellite_loss = self.calculate_satellite_loss(
            severity_score=severity_score,
            num_satellites=num_satellites
        )
        
        # Calculate service disruption
        if affected_systems:
            service_loss = self.calculate_service_disruption_loss(
                severity_score=severity_score,
                impacted_systems=affected_systems,
                duration_hours=24
            )
        else:
            service_loss = {
                'expected_duration_hours': 0,
                'system_costs': {},
                'total_disruption_cost': 0
            }
        
        # Calculate indirect costs (if enabled)
        indirect_costs = 0
        if include_indirect:
            # Business losses, supply chain, emergency response, etc.
            direct_total = (
                satellite_loss['total_expected_loss'] + 
                service_loss['total_disruption_cost']
            )
            # Indirect costs typically 30-50% of direct costs
            indirect_costs = direct_total * 0.4
        
        # Protection/mitigation costs (cost of taking preventive action)
        mitigation_cost = num_satellites * 0.5  # $500K per satellite for protective measures
        
        # Total loss if alert ignored
        total_loss_if_ignored = (
            satellite_loss['total_expected_loss'] +
            service_loss['total_disruption_cost'] +
            indirect_costs
        )
        
        # Net benefit of taking action
        net_benefit = total_loss_if_ignored - mitigation_cost
        
        return {
            'severity_score': severity_score,
            'risk_level': self._get_risk_level(severity_score),
            'satellite_damage': {
                'expected_loss_million_usd': satellite_loss['total_expected_loss'],
                'worst_case_million_usd': satellite_loss['total_worst_case'],
                'satellites_at_risk': satellite_loss['satellites_at_risk'],
                'damage_probability': satellite_loss['damage_probability']
            },
            'service_disruption': {
                'expected_loss_million_usd': service_loss['total_disruption_cost'],
                'duration_hours': service_loss['expected_duration_hours'],
                'affected_systems': affected_systems,
                'breakdown': service_loss['system_costs']
            },
            'indirect_costs_million_usd': round(indirect_costs, 2),
            'total_expected_loss_million_usd': round(total_loss_if_ignored, 2),
            'mitigation_cost_million_usd': round(mitigation_cost, 2),
            'net_benefit_of_action_million_usd': round(net_benefit, 2),
            'recommendation': (
                'TAKE PROTECTIVE ACTION IMMEDIATELY' if net_benefit > 10 
                else 'Monitor closely and prepare for action' if net_benefit > 1
                else 'Standard monitoring sufficient'
            ),
            'cost_breakdown': {
                'satellite_damage': round(satellite_loss['total_expected_loss'], 2),
                'service_disruption': round(service_loss['total_disruption_cost'], 2),
                'indirect_costs': round(indirect_costs, 2),
                'prevention_cost': round(mitigation_cost, 2)
            }
        }
    
    def _get_risk_level(self, severity_score: float) -> str:
        """Determine risk level from severity score"""
        if severity_score < 3:
            return 'LOW'
        elif severity_score < 5:
            return 'MODERATE'
        elif severity_score < 7:
            return 'HIGH'
        elif severity_score < 9:
            return 'SEVERE'
        else:
            return 'EXTREME'
    
    def get_cost_comparison_chart(
        self,
        severity_scores: List[float]
    ) -> Dict[str, List[float]]:
        """
        Generate cost comparison data for different severity levels
        
        Args:
            severity_scores: List of severity scores to compare
        
        Returns:
            Dict with cost data for visualization
        """
        costs_by_severity = {
            'severity': [],
            'satellite_damage': [],
            'service_disruption': [],
            'indirect_costs': [],
            'total_loss': []
        }
        
        for severity in severity_scores:
            # Quick calculation
            impact = self.calculate_total_economic_impact(
                severity_score=severity,
                impact_probabilities={'satellites': 0.8, 'gps': 0.6},
                num_satellites=10
            )
            
            costs_by_severity['severity'].append(severity)
            costs_by_severity['satellite_damage'].append(
                impact['satellite_damage']['expected_loss_million_usd']
            )
            costs_by_severity['service_disruption'].append(
                impact['service_disruption']['expected_loss_million_usd']
            )
            costs_by_severity['indirect_costs'].append(
                impact['indirect_costs_million_usd']
            )
            costs_by_severity['total_loss'].append(
                impact['total_expected_loss_million_usd']
            )
        
        return costs_by_severity


# Global instance
_economy_calculator = None


def get_economy_calculator() -> EconomyLossCalculator:
    """Get global economy loss calculator instance"""
    global _economy_calculator
    if _economy_calculator is None:
        _economy_calculator = EconomyLossCalculator()
    return _economy_calculator
