"""
AI Chatbot SOLAR-GPT powered by Google Gemini
Provides intelligent space weather assistance with real-time data context
"""
import google.generativeai as genai
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.utils.logger import get_logger

logger = get_logger(__name__)


class SolarGPT:
    """AI Assistant for Space Weather Intelligence"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found. Chatbot will use fallback mode.")
            self.client = None
        else:
            try:
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel('gemini-2.5-flash')
                logger.info("✓ Google Gemini initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
                self.client = None
        
        self.model = "gemini-pro"
        self.max_tokens = 1024
        
    def build_system_prompt(self, realtime_data: Dict[str, Any]) -> str:
        """Build system prompt with real-time space weather data"""
        
        # Extract current conditions
        current = realtime_data.get('current_conditions', {})
        predictions = realtime_data.get('predictions', {})
        satellites = realtime_data.get('satellites', [])
        
        # Format satellite status
        satellite_status = []
        for sat in satellites[:5]:  # Top 5 satellites
            risk = "🟢 LOW" if sat.get('health', 100) > 80 else "🟡 MODERATE" if sat.get('health', 100) > 50 else "🔴 HIGH"
            satellite_status.append(f"  • {sat.get('name', 'Unknown')}: {sat.get('health', 0):.1f}% health - {risk}")
        
        satellite_text = "\n".join(satellite_status) if satellite_status else "  No satellite data available"
        
        # Build comprehensive prompt
        prompt = f"""You are SOLAR-GPT, an expert AI assistant for SolarGuard 3D - the world's most advanced space weather intelligence platform. You provide real-time space weather analysis, storm predictions, and satellite risk assessments.

📡 CURRENT SPACE WEATHER CONDITIONS (Live Data):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Timestamp: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC

🌍 GEOMAGNETIC INDICES:
  • Kp Index: {current.get('kp_index', 'N/A')}
  • Dst Index: {current.get('dst_index', 'N/A')} nT
  
☄️ SOLAR WIND PARAMETERS:
  • Speed: {current.get('speed', 'N/A')} km/s (normal: 300-500 km/s)
  • IMF Bz: {current.get('bz', 'N/A')} nT (negative = storm risk)
  • Proton Density: {current.get('density', 'N/A')} p/cm³
  • Dynamic Pressure: {current.get('pressure', 'N/A')} nPa

🤖 AI STORM PREDICTION:
  • Storm Probability: {predictions.get('storm_occurrence', {}).get('probability', 'N/A')}%
  • Confidence: {predictions.get('storm_occurrence', {}).get('confidence', 'N/A')}%
  • Risk Level: {predictions.get('storm_occurrence', {}).get('risk_level', 'N/A')}
  • Severity Score: {predictions.get('storm_severity', {}).get('severity_score', 'N/A')}/10

🛰️ SATELLITE STATUS (Top Priority Assets):
{satellite_text}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESPONSE GUIDELINES:
✅ Use emojis to make responses engaging (🌟⚡🛰️🌍⚠️📊)
✅ Be concise but informative (2-4 sentences typical)
✅ Reference ACTUAL current values from above data
✅ Provide actionable insights and recommendations
✅ Explain technical terms in simple language when first mentioned
✅ Compare to historical events when relevant (Carrington Event 1859, Halloween Storm 2003, etc.)
✅ Highlight risks to satellites, GPS, communications, power grids
✅ Use markdown formatting for clarity (bold, lists, etc.)

QUICK REFERENCE - SEVERITY SCALES:
• Kp Index: 0-4 (quiet), 5-6 (minor storm), 7-8 (major storm), 9 (severe storm)
• IMF Bz: Positive (good), Negative (risk increases), <-10 nT (high risk)
• Solar Wind Speed: <400 (slow), 400-600 (normal), >600 (fast/dangerous)

Your goal: Help users understand space weather, assess risks, and make informed decisions. Be friendly but professional - like Mission Control meets friendly AI assistant."""

        return prompt
    
    async def chat(
        self, 
        user_message: str, 
        conversation_history: List[Dict[str, str]], 
        realtime_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process chat message with Google Gemini AI
        
        Args:
            user_message: User's input message
            conversation_history: Last 10 messages (format: [{"role": "user/assistant", "content": "..."}])
            realtime_data: Current space weather data for context
            
        Returns:
            Dict with 'response', 'timestamp', 'confidence'
        """
        try:
            # Fallback mode if no API key
            if not self.client:
                return self._fallback_response(user_message, realtime_data)
            
            # Build system prompt with real-time data
            system_prompt = self.build_system_prompt(realtime_data)
            
            # Format conversation for Gemini
            # Gemini uses a simpler format - just combine history into context
            context = system_prompt + "\n\n"
            
            # Add conversation history
            for msg in conversation_history[-10:]:  # Last 5 exchanges
                role = "User" if msg["role"] == "user" else "Assistant"
                context += f"{role}: {msg['content']}\n\n"
            
            # Add current user message
            full_prompt = context + f"User: {user_message}\n\nAssistant:"
            
            logger.info(f"Sending message to Gemini: {user_message[:100]}...")
            
            # Call Gemini API
            response = self.client.generate_content(
                full_prompt,
                generation_config={
                    'temperature': 0.7,
                    'max_output_tokens': self.max_tokens,
                }
            )
            
            assistant_message = response.text
            
            logger.info(f"Received response from Gemini: {assistant_message[:100]}...")
            
            return {
                "response": assistant_message,
                "timestamp": datetime.utcnow().isoformat(),
                "confidence": 0.90,  # Gemini is generally very good
                "model": self.model
            }
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            # Try fallback on error
            if "API key" in str(e) or "GEMINI_API_KEY" in str(e):
                return {
                    "response": f"⚠️ I'm having trouble connecting to my AI brain. Please check your GEMINI_API_KEY environment variable.\n\nError: {str(e)}",
                    "timestamp": datetime.utcnow().isoformat(),
                    "confidence": 0.0,
                    "error": str(e)
                }
            else:
                return {
                    "response": f"❌ Oops! Something went wrong: {str(e)}\n\nPlease try again or rephrase your question.",
                    "timestamp": datetime.utcnow().isoformat(),
                    "confidence": 0.0,
                    "error": str(e)
                }
    
    def _fallback_response(self, user_message: str, realtime_data: Dict[str, Any]) -> Dict[str, Any]:
        """Provide intelligent fallback responses when Gemini API is unavailable"""
        
        message_lower = user_message.lower()
        current = realtime_data.get('current_conditions', {})
        predictions = realtime_data.get('predictions', {})
        
        # Pattern matching for common questions
        if any(word in message_lower for word in ['kp', 'index', 'geomagnetic']):
            kp = current.get('kp_index', 'N/A')
            response = f"🌍 Current Kp index is **{kp}**. "
            if isinstance(kp, (int, float)):
                if kp < 5:
                    response += "Conditions are quiet - no storm activity. 🟢"
                elif kp < 7:
                    response += "Minor geomagnetic storm conditions. Monitor satellite systems. 🟡"
                else:
                    response += "Major geomagnetic storm! Take protective measures! 🔴"
        
        elif any(word in message_lower for word in ['storm', 'predict', 'forecast']):
            prob = predictions.get('storm_occurrence', {}).get('probability', 'N/A')
            response = f"⚡ AI storm prediction: **{prob}%** probability. "
            if isinstance(prob, (int, float)):
                if prob > 70:
                    response += "High risk - prepare for potential impacts! ⚠️"
                elif prob > 40:
                    response += "Moderate risk - stay alert. 📊"
                else:
                    response += "Low risk currently. 🟢"
        
        elif any(word in message_lower for word in ['iss', 'station', 'satellite']):
            satellites = realtime_data.get('satellites', [])
            if satellites:
                iss = next((s for s in satellites if 'ISS' in s.get('name', '')), None)
                if iss:
                    health = iss.get('health', 100)
                    response = f"🛰️ ISS health: **{health:.1f}%**. "
                    response += "Safe conditions. ✅" if health > 80 else "Elevated risk - monitor closely! ⚠️"
                else:
                    response = f"🛰️ Tracking {len(satellites)} satellites. Currently analyzing conditions..."
            else:
                response = "🛰️ Satellite data loading... Please check the dashboard for live status."
        
        elif any(word in message_lower for word in ['bz', 'imf', 'magnetic']):
            bz = current.get('bz', 'N/A')
            response = f"🧲 IMF Bz component: **{bz} nT**. "
            if isinstance(bz, (int, float)):
                if bz < -10:
                    response += "Strongly southward - HIGH storm risk! 🔴"
                elif bz < 0:
                    response += "Southward orientation - elevated storm potential. 🟡"
                else:
                    response += "Northward - favorable conditions. 🟢"
        
        else:
            # Generic helpful response
            response = f"""👋 Hi! I'm SOLAR-GPT, your space weather assistant. 

**Current Status:**
• Kp Index: {current.get('kp_index', 'N/A')}
• Storm Risk: {predictions.get('storm_occurrence', {}).get('probability', 'N/A')}%
• Satellites Tracked: {len(realtime_data.get('satellites', []))}

**I can help you with:**
• Current space weather conditions
• Storm predictions and timing
• Satellite risk assessments  
• Explain technical terms
• Provide recommendations

*Note: AI mode currently limited. For full capabilities, add GEMINI_API_KEY to environment.*"""
        
        return {
            "response": response,
            "timestamp": datetime.utcnow().isoformat(),
            "confidence": 0.7,
            "mode": "fallback"
        }


# Global chatbot instance
_chatbot_instance = None

def get_chatbot() -> SolarGPT:
    """Get or create global chatbot instance"""
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = SolarGPT()
    return _chatbot_instance
