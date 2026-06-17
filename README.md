<div align="center">
  <h1>🚀 ToDoSoDo</h1>
  <p><i>Кроссплатформенное приложение для управления задачами с упором на удобство, универсальность и offline-first архитектуру.</i></p>

  <!-- Бэйджи с технологиями -->
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</div>

---

![Demo](https://github.com/user-attachments/assets/2319141e-f3eb-42cb-a02c-cf3d39ba2eda)

## 📱 О проекте

**ToDoSoDo** — это универсальный инструмент для организации вашей жизни. Приложение создано для максимального удобства и позволяет не только вести обычные списки дел, но и отслеживать привычки, контролировать накопления на цели и сохранять прогресс в хобби.

### 🌟 Ключевые фичи
- 🎯 **Triple-Mode Logic:** Бесшовное переключение между Классическим to-do листом, Ежедневными задачами (с трекером привычек) и RPG-режимом, который нужен для глубокого отслеживания жизни (серии сериалов, фильмы, контроль накоплений на цели).
- 🔌 **Offline-First:** Полноценная работа без подключения к интернету. Данные надежно лежат в быстром локальном хранилище на устройстве (через `react-native-mmkv`) и синхронизируются в фоне при появлении сети.
- ⚡ **Real-Time Синхронизация:** Мгновенное обновление задач на всех устройствах (телефон, ПК) через WebSockets с встроенным алгоритмом разрешения конфликтов версий.
- 🔐 **Безопасность:** Регистрация и авторизация на базе JWT-токенов, хэширование паролей.

---

## 📥 Установка и загрузка

Приложение готово к использованию на Android и Windows:

* 🤖 **Android:** Скачать из [RuStore](https://www.rustore.ru/catalog/app/com.anonymous.toDoSoDo) или [GitHub APK](https://github.com/toHellForThem/smart-todo/releases/latest)
* 💻 **Windows:** Скачать [.exe приложение](https://github.com/toHellForThem/smart-todo/releases/latest)
* 🍎 **iOS:** В разработке ⏳

---

## 🛠 Архитектура

Приложение разделено на три основные части:
1. **Frontend (Mobile & Web):** Написан на React Native (Expo) с использованием TypeScript. Отвечает за плавный интерфейс (`react-native-reanimated`, `react-native-paper`) и локальное хранилище ключей-значений.
2. **Backend (Server):** Асинхронный Python-сервер на базе FastAPI.
3. **Database:** SQLite в режиме WAL (Write-Ahead Logging) через библиотеку `aiosqlite` для неблокирующих запросов. Соединение с клиентами поддерживается через `python-socketio`.

---

## 🚀 Self-Hosting (Свой сервер синхронизации)

Если вы хотите поднять собственный бэкенд для хранения и синхронизации ваших данных из приложения:

Убедитесь, что установлен [Python 3.10+](https://www.python.org/).
```bash
cd backend
python -m venv venv

# Для Windows:
.\venv\Scripts\pip install -r requirements.txt

# Настройте переменные окружения (.env)
copy .env.example .env  
```
*Запуск сервера на Windows:* Двойной клик по скрипту `start_server_windows.bat`.
