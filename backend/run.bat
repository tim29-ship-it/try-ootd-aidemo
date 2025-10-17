@echo off
setlocal

REM Ensure we run from the script directory
cd /d "%~dp0"

if not exist "myenv" (
    python -m venv myenv
)

call "myenv\Scripts\activate.bat"

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

uvicorn app:app --host 127.0.0.1 --port 8000
