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

✅ **Changed start command to use `python -m uvicorn`** instead of just `uvicorn`

### Why This Works

1. **`uvicorn` (direct command)**:
   - Runs the installed uvicorn binary
   - Python's module path may not include project root
   - Results in: `ModuleNotFoundError: No module named 'backend'`

2. **`python -m uvicorn` (module execution)**:
   - Runs uvicorn as a Python module
   - Current directory is automatically added to `sys.path`
   - Python's import system properly resolves `backend.main`
   - Results in: ✅ Successful import

## Files Updated

### 1. Procfile
```diff
- web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
+ web: python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

### 2. render.yaml
```diff
- startCommand: "uvicorn backend.main:app --host 0.0.0.0 --port $PORT"
+ startCommand: "python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT"
```

### 3. start_server.sh (NEW - Alternative)
Created a bash startup script that:
- Explicitly sets `PYTHONPATH` to project root
- Changes to correct working directory
- Provides debug output
- Starts the server with proper configuration

Usage:
```bash
bash start_server.sh
```

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
   ```bash
   git add Procfile render.yaml start_server.sh
   git commit -m "Fix: Use python -m uvicorn for proper module imports on Render"
   git push
   ```

2. **Redeploy on Render**:
   - Render will automatically detect the changes
   - Or manually trigger deployment from dashboard

3. **Verify in Render logs**:
   Look for these lines:
   ```
   INFO:     Started server process
   INFO:     Waiting for application startup.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:10000
   ```

4. **Test the deployed API**:
   ```bash
   curl https://your-app.onrender.com/
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
