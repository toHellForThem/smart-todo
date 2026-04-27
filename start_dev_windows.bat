@echo off
start cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload"
start cmd /k "cd frontend && npx expo start"