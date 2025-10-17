@echo off
setlocal

REM Ensure we run from the script directory
cd /d "%~dp0"

if not exist ".venv" (
    python -m venv .venv
)

call ".venv\Scripts\activate.bat"

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

uvicorn app:app --host 127.0.0.1 --port 8000
