# 🤖 SolarGPT - Real AI Chatbot Integration Guide

## Current Status: Mock Chatbot → Real AI Integration Needed

### Current Implementation
The chatbot currently sends questions to your backend endpoint at `/api/chatbot`, but the backend needs to be connected to a real AI service.

---

## 🔑 API Keys Required

### Option 1: OpenAI (Recommended - GPT-4/GPT-3.5)

**What you need:**
1. OpenAI API Key
2. Organization ID (optional)

**Where to get it:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

**Cost:** ~$0.002 per request for GPT-3.5-Turbo, ~$0.03 per request for GPT-4

**Location to add key:**
```bash
# Create .env file in backend directory
/Users/apple/Projects/SolarSheild/backend/.env
```

**Add to .env:**
```env
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4
```

---

### Option 2: Anthropic Claude (Great Alternative)

**What you need:**
1. Anthropic API Key

**Where to get it:**
1. Go to https://console.anthropic.com/
2. Sign up for access
3. Navigate to API Keys
4. Generate a new key

**Cost:** ~$0.002-$0.015 per request depending on model

**Location to add key:**
```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

---

### Option 3: Google Gemini (Free Tier Available)

**What you need:**
1. Google AI Studio API Key

**Where to get it:**
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Copy the key

**Cost:** Free tier available, then ~$0.0005 per request

**Location to add key:**
```bash
# backend/.env
GOOGLE_API_KEY=your-gemini-key-here
GOOGLE_MODEL=gemini-pro
```

---

## 📝 Backend Implementation

### Step 1: Install Required Package

```bash
cd /Users/apple/Projects/SolarSheild/backend
source ../.venv/bin/activate
pip install openai  # For OpenAI
# OR
pip install anthropic  # For Anthropic
# OR
pip install google-generativeai  # For Google Gemini
```

### Step 2: Update backend/chatbot.py

**Current file location:** `/Users/apple/Projects/SolarSheild/backend/chatbot.py`

**Replace the mock implementation with:**

```python
# backend/chatbot.py
import os
from typing import List, Dict
from openai import OpenAI  # Option 1
# from anthropic import Anthropic  # Option 2
# import google.generativeai as genai  # Option 3

class SolarGPTChatbot:
    def __init__(self):
        # Option 1: OpenAI
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.model = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
        
        # Option 2: Anthropic (uncomment if using)
        # self.client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        # self.model = os.getenv('ANTHROPIC_MODEL', 'claude-3-sonnet-20240229')
        
        # Option 3: Google Gemini (uncomment if using)
        # genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        # self.model = genai.GenerativeModel('gemini-pro')
        
        self.system_prompt = \"\"\"You are SOLAR-GPT, an expert AI assistant specializing in space weather, 
        solar storms, geomagnetic disturbances, and satellite operations. You help users understand:
        - Kp index and its implications
        - Solar wind speed and IMF (Interplanetary Magnetic Field)
        - Geomagnetic storm predictions and impacts
        - Satellite health and space radiation risks
        - ISS (International Space Station) safety
        - GPS and communication disruptions
        
        Provide accurate, scientific answers while being accessible to non-experts. 
        Use data from the dashboard when available. Be concise but comprehensive.
        \"\"\"
    
    def get_response(self, message: str, conversation_history: List[Dict], 
                     current_data: Dict = None) -> str:
        \"\"\"Get AI response with context from space weather data\"\"\"
        
        # Build context from current data
        context = ""
        if current_data:
            context = f\"\"\"
            Current Space Weather Conditions:
            - Kp Index: {current_data.get('kp_index', 'N/A')}
            - Solar Wind Speed: {current_data.get('speed', 'N/A')} km/s
            - IMF Bz: {current_data.get('bz', 'N/A')} nT
            - Proton Density: {current_data.get('density', 'N/A')} p/cm³
            - Storm Probability: {current_data.get('storm_probability', 'N/A')}%
            \"\"\"
        
        # OpenAI Implementation
        try:
            messages = [
                {"role": "system", "content": self.system_prompt + context}
            ]
            
            # Add conversation history
            messages.extend(conversation_history)
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"❌ Error: {str(e)}. Please check your API key and internet connection."
    
    # Anthropic Claude Implementation (Alternative)
    def get_response_claude(self, message: str, conversation_history: List[Dict],
                           current_data: Dict = None) -> str:
        \"\"\"Use this if you prefer Anthropic Claude\"\"\"
        try:
            # Build context
            context = ""
            if current_data:
                context = f\"\"\"
                Current Space Weather: Kp={current_data.get('kp_index')}, 
                Wind={current_data.get('speed')}km/s, 
                Bz={current_data.get('bz')}nT
                \"\"\"
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                system=self.system_prompt + context,
                messages=conversation_history + [{"role": "user", "content": message}]
            )
            
            return response.content[0].text
            
        except Exception as e:
            return f"❌ Error: {str(e)}"
    
    # Google Gemini Implementation (Alternative)
    def get_response_gemini(self, message: str, current_data: Dict = None) -> str:
        \"\"\"Use this if you prefer Google Gemini\"\"\"
        try:
            context = ""
            if current_data:
                context = f"Space Weather: Kp={current_data.get('kp_index')}, Wind={current_data.get('speed')}km/s"
            
            prompt = f\"{self.system_prompt}\\n{context}\\n\\nUser: {message}\"
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            return f"❌ Error: {str(e)}"
```

### Step 3: Update backend/main.py Endpoint

**File:** `/Users/apple/Projects/SolarSheild/backend/main.py`

**Find the `/api/chatbot` endpoint (around line 400-450) and update it:**

```python
@app.post("/api/chatbot")
async def chatbot_endpoint(request: dict):
    \"\"\"SOLAR-GPT Chatbot with real AI\"\"\"
    try:
        from backend.chatbot import SolarGPTChatbot
        
        message = request.get('message', '')
        history = request.get('conversation_history', [])
        
        # Get current space weather data for context
        current_data = await get_current_data()
        
        # Initialize chatbot
        chatbot = SolarGPTChatbot()
        
        # Get AI response
        response_text = chatbot.get_response(
            message=message,
            conversation_history=history,
            current_data=current_data
        )
        
        return {
            "response": response_text,
            "timestamp": datetime.now().isoformat(),
            "model": chatbot.model
        }
        
    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        return {
            "response": f"❌ Sorry, I encountered an error: {str(e)}. Make sure your API key is set up correctly.",
            "timestamp": datetime.now().isoformat()
        }
```

---

## 🚀 Quick Setup (5 Minutes)

### For OpenAI (Easiest):

```bash
# 1. Get API key from https://platform.openai.com/api-keys

# 2. Create .env file
cd /Users/apple/Projects/SolarSheild/backend
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "OPENAI_MODEL=gpt-3.5-turbo" >> .env

# 3. Install package
source ../.venv/bin/activate
pip install openai

# 4. Restart backend
# The chatbot will now use real AI!
```

---

## 💰 Cost Estimates

### OpenAI GPT-3.5-Turbo (Recommended for production)
- Input: $0.0015 per 1K tokens
- Output: $0.002 per 1K tokens
- **Average cost per chat: $0.001-$0.005**
- **1000 chats ≈ $1-5**

### OpenAI GPT-4 (Most powerful)
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- **Average cost per chat: $0.02-$0.10**
- **1000 chats ≈ $20-100**

### Anthropic Claude
- Similar to GPT-3.5 pricing
- **1000 chats ≈ $1-5**

### Google Gemini
- Free tier: 60 requests/minute
- **1000 chats ≈ FREE to $2**

---

## 🧪 Testing Without API Key

If you want to test without spending money, use this temporary mock:

```python
# backend/chatbot.py - Quick mock for testing
class SolarGPTChatbot:
    def get_response(self, message: str, conversation_history, current_data=None):
        # Smart mock that uses actual data
        msg_lower = message.lower()
        
        if 'kp' in msg_lower and current_data:
            kp = current_data.get('kp_index', 3)
            if kp < 4:
                return f"The current Kp index is {kp}, indicating quiet geomagnetic conditions. No major concerns."
            elif kp < 6:
                return f"The Kp index is currently {kp}, showing moderate geomagnetic activity. Monitor satellite systems."
            else:
                return f"⚠️ High Kp index of {kp} detected! Significant geomagnetic storm in progress."
        
        elif 'iss' in msg_lower or 'space station' in msg_lower:
            if current_data and current_data.get('kp_index', 0) > 6:
                return "🚨 ISS is at elevated radiation risk due to high geomagnetic activity. Crew should monitor closely."
            return "✅ ISS conditions are nominal. Radiation levels within safe limits for crew operations."
        
        elif 'storm' in msg_lower:
            prob = current_data.get('storm_probability', 0) if current_data else 0
            return f"Current storm probability is {prob}%. Based on solar wind and IMF conditions."
        
        return "I'm a space weather expert. Ask me about Kp index, solar storms, ISS safety, or satellite health!"
```

---

## ✅ Verification

After setup, test with:

1. Open the app → Click chatbot
2. Ask: "What's the current Kp index?"
3. Should get a real AI response with context from your dashboard data!

---

## 📍 Summary - Where Everything Goes

**API Keys:** `/Users/apple/Projects/SolarSheild/backend/.env`
**Chatbot Code:** `/Users/apple/Projects/SolarSheild/backend/chatbot.py`
**Backend Endpoint:** `/Users/apple/Projects/SolarSheild/backend/main.py` (line ~400)
**Frontend Component:** `/Users/apple/Projects/SolarSheild/frontend/src/components/SolarGPTChatbot.tsx` (already done ✅)

---

**Need help?** Just let me know which AI provider you want to use and I'll give you the exact code to paste!
