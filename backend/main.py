from fastapi import FastAPI
import socketio
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
socket_app = socketio.ASGIApp(sio, app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            text TEXT,
            completed BOOLEAN DEFAULT FALSE,
            deleted BOOLEAN DEFAULT FALSE,
            updated_at INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

init_db()

def db_query(query, params=(), is_select=False):
    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()
    cursor.execute(query, params)
    res = None
    if is_select:
        res = cursor.fetchall()
    conn.commit()
    conn.close()
    return res

class Todo(BaseModel):
    id: str
    text: str
    completed: bool = False
    deleted: bool = False
    updated_at: int

@sio.event
async def connect(sid, environ):
    print(f"Клиент подключился: {sid}")
    rows = db_query("SELECT * FROM todos WHERE deleted = 0 ORDER BY id DESC", is_select=True)
    todos = [{"id": r[0], "text": r[1], "completed": bool(r[2]), "deleted": bool(r[3])} for r in rows]
    await sio.emit('server:all_todos', todos, to=sid)

@sio.on('client:sync_todo')
async def handle_sync(sid, data):
    todo_id = data['id']
    client_updated_at = data.get('updatedAt', 0)
    row = db_query("SELECT updated_at FROM todos WHERE id = ?", (todo_id,), is_select=True)
    if not row or client_updated_at > row[0][0]:
        db_query("""
            INSERT OR REPLACE INTO todos (id, text, completed, deleted, updated_at)
            VALUES (?, ?, ?, ?, ?)
        """, (data['id'], data['text'], data['completed'], data['deleted'], client_updated_at))
        await sio.emit('server:todo_updated', data, skip_sid=sid)
        print(f"Обновлено: {data['text']} (Client version was newer)")
    else:
        print(f"На сервере данные новее для: {data['text']}")