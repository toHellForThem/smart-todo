@echo off
echo Starting Python backend server...
cd backend
.\venv\Scripts\python.exe -m uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload
pause
