# Smart To-Do App 🚀
A mobile task management app with three modes (to-do list, daily tasks, RPG) and a focus on a polished UI/UX.

![Demo](https://github.com/user-attachments/assets/2319141e-f3eb-42cb-a02c-cf3d39ba2eda)

## Tech Stack
- Front-end: JavaScript (ES6+), React Native, Expo
- Back-end: Python, Socket.io
- Database: SQLite

## Key Features
- Triple-Mode Logic: Seamless switching between RPG, Daily, and Classic task management.
- Real-Time Synchronization: Instant updates across multiple devices powered by WebSockets.
- Persistent Storage: Local SQLite database for offline access and data reliability.

## Platform Support

- ✅ Android ([RuStore](https://www.rustore.ru/catalog/app/com.anonymous.toDoSoDo))
- ⏳ iOS (In development)
- ⏳ Desktop (In development)

## Running the Server (Self-Hosting)

If you only want to host your own synchronization server for the mobile app, follow these steps to set up and run the backend on Windows.

### Backend Setup

1. Make sure you have [Python 3.10+](https://www.python.org/) installed.
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
4. Install dependencies:
   ```bash
   .\venv\Scripts\pip install -r requirements.txt
   ```
5. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

### Starting the Server

Use the provided convenience script in the root directory:
- Double-click `start_server_windows.bat` 

---

## Development Setup

If you want to contribute or build the frontend application locally, follow these steps.

### Frontend Setup

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running for Development

To run both the backend server and the frontend client simultaneously for debugging:
- Double-click `start_dev_windows.bat`

Alternatively, you can run the frontend client separately:
```bash
cd frontend
npx expo start
```

## Future Roadmap

⏳ Refactor: Migrate the codebase to TypeScript for enhanced type safety and maintainability.
