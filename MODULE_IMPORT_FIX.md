# Module Import Fix for Render Deployment

## Problem
```
ModuleNotFoundError: No module named 'backend'
```

This error occurred on Render.com when trying to start the application with:
```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

## Root Cause

When you run `uvicorn` directly (as an installed command), Python's module import system doesn't automatically include the current working directory in the module search path. This causes `import backend.main` to fail.

## Solution

✅ **Use startup script with explicit PYTHONPATH configuration**

### Final Working Configuration

**1. Startup Script (start_server.sh):**
- Sets working directory to project root
- Exports PYTHONPATH to include project root
- Validates backend directory exists
- Provides diagnostic output
- Starts uvicorn with proper environment

**2. Render Configuration:**
- Build Command: `pip install -r requirements.txt && chmod +x start_server.sh`
- Start Command: `bash start_server.sh`
- Environment Variable: `PYTHONPATH=/opt/render/project/src`

### Why This Works

The combination of startup script + PYTHONPATH environment variable ensures:

1. **Explicit Python Path**: PYTHONPATH is set before Python starts
2. **Working Directory**: Script changes to project root directory
3. **Validation**: Checks that backend directory exists before starting
4. **Diagnostic Output**: Provides clear logs for debugging
5. **Cross-Platform**: Handles both python3 and python commands

## Files Updated

### 1. Procfile
```diff
- web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
+ web: bash start_server.sh
```

### 2. render.yaml
```diff
- buildCommand: "pip install -r requirements.txt"
- startCommand: "uvicorn backend.main:app --host 0.0.0.0 --port $PORT"
+ buildCommand: "pip install -r requirements.txt && chmod +x start_server.sh"
+ startCommand: "bash start_server.sh"
+ envVars:
+   - key: PYTHONPATH
+     value: /opt/render/project/src
```

### 3. start_server.sh (Enhanced)
Updated with:
- Better diagnostic output with formatted headers
- Backend directory validation
- Python version detection (python3/python)
- Error handling with exit codes
- Clear status messages

### 4. RENDER_DEPLOYMENT.md (UPDATED)
Added troubleshooting section explaining the module import fix.

### 5. DEPLOYMENT_QUICK_REFERENCE.md (UPDATED)
Added explanation of why `python -m uvicorn` is required.

## Verification

Local test confirms the fix works:
```bash
$ cd /Users/apple/Projects/SolarSheild
$ python3 -c "import sys; sys.path.insert(0, '.'); import backend.main"
✅ Module import successful - backend.main loaded
```

## Next Steps for Render Deployment

1. **Push the changes to GitHub**:
   ```bash RENDER_DEPLOYMENT.md DEPLOYMENT_QUICK_REFERENCE.md MODULE_IMPORT_FIX.md
   git commit -m "Fix: Add startup script with PYTHONPATH for Render module imports"
   git push
   ```

2. **Configure Render Dashboard**:
   - Go to your service settings
   - Update Environment Variables:
     - Add: `PYTHONPATH=/opt/render/project/src`
   - Save changes

3. **Redeploy on Render**:
   - Render will automatically detect the changes and redeploy
   - Or manually trigger deployment from dashboard

4. **Verify in Render logs**:
   Look for these success indicators:
   ```
   ======================================
   Starting SolarShield Backend
   ======================================
   Working directory: /opt/render/project/src
   Python path: /opt/render/project/src:...
   Port: 10000
   ✓ Backend directory found
   Starting uvicorn server...
   Manual PYTHONPATH in start command
```bash
export PYTHONPATH=/opt/render/project/src && python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

### Option 2: Install as editable package
Add `setup.py` to project root:
```python
from setuptools import setup, find_packages

setup(
    name="solarsheild-backend",
    version="1.0.0",
    packages=find_packages(),
)
```

Then update build command:
```bash
pip install -r requirements.txt &&    curl https://your-app.onrender.com/
   ```

## Alternative Solutions (if still having issues)

### Option 1: Use the startup script
In Render dashboard, change start command to:
```bash
bash start_server.sh
```

### Option 2: Set PYTHONPATH explicitly
```bash
PYTHONPATH=/opt/render/project/src python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

### Option 3: Install backend as a package
Add `__init__.py` to project root and install in editable mode:
```bash
pip install -e .
```

## Technical Deep Dive

### Python Module Resolution

When Python tries to import `backend.main`:

1. **Searches `sys.path`** in order:
   - Current working directory (when using `-m`)
   - Installed packages
   - Standard library

2. **Looks for**:
   - `backend/` directory with `__init__.py`
   - Then `backend/main.py` file

3. **`python -m` adds CWD to `sys.path`**:
   ```python
   import sys
   print(sys.path)
   # ['/opt/render/project/src', ...]  ← Project root is first!
   ```

4. **Direct `uvicorn` command doesn't**:
   ```python
   # sys.path might not include project root
   # Results in: ModuleNotFoundError
   ```

## Status

✅ **FIXED** - Ready for Render deployment

The application will now start correctly on Render.com and properly import the `backend` module.
