# 🏃‍♂️ Health Tracker 💪

Health Tracker is your fun and friendly companion on your wellness journey! Track your daily activities, stay motivated, and crush your health goals! 🎯

## 📋 Table of Contents
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Database Setup](#-database-setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Scripts](#-scripts)
- [Acknowledgements](#-acknowledgements)

## ✨ Features
- 🏋️‍♀️ Track daily exercise routines
- 🥗 Log meals and calorie intake
- 😴 Monitor sleep patterns
- 📊 Generate health reports
- 💊 Medication reminders
- 🎵 Workout playlist management
- 🔍 Search functionality across all data

## 📁 Project Structure
```
health-tracker/
├── health-tracker-backend/     # Backend API
│   ├── src/
│   │   ├── server.ts          # Main server file with API endpoints
│   │   └── ...
│   ├── .env                   # Environment variables
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json        # TypeScript configuration
│
├── health-tracker-frontend/    # Frontend application
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── ...
│   └── package.json         # Frontend dependencies
```

## 🔧 Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn
- TypeScript

## 🚀 Installation & Setup

### Backend Setup
```bash
# Clone repository
git clone https://github.com/yourusername/health-tracker.git
cd health-tracker

# Install backend dependencies
cd health-tracker-backend
npm install
```

### Frontend Setup
```bash
# Install frontend dependencies
cd health-tracker-frontend
npm install
```

## 💾 Database Setup

Run these SQL commands to set up your database:

```sql
-- Create database
CREATE DATABASE health_tracker;
USE health_tracker;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercise tracking table
CREATE TABLE exercises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(255) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    calories_burned INT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Nutrition tracking table
CREATE TABLE nutrition (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    food_item VARCHAR(255) NOT NULL,
    calories_gained INT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sleep tracking table
CREATE TABLE sleep (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    duration VARCHAR(50) NOT NULL,
    quality VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Capsule reminders table
CREATE TABLE capsule_reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    time TIME NOT NULL,
    taken BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Music playlists table
CREATE TABLE playlists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Music tracks table
CREATE TABLE tracks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    playlist_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    file_path VARCHAR(255),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id)
);

-- Add indexes for better performance
CREATE INDEX idx_user_exercises ON exercises(user_id, date);
CREATE INDEX idx_user_nutrition ON nutrition(user_id, date);
CREATE INDEX idx_user_sleep ON sleep(user_id, date);
CREATE INDEX idx_user_reminders ON capsule_reminders(user_id);
CREATE INDEX idx_user_playlists ON playlists(user_id);
```

## ⚙️ Environment Configuration

### Backend (.env)
```env
PORT=3001
JWT_SECRET=your_jwt_secret_key_here
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=health_tracker
```

## 🎯 Running the Application

1. Start MySQL server
2. Start backend:
```bash
cd health-tracker-backend
npm run dev
```
3. Start frontend:
```bash
cd health-tracker-frontend
npm run dev
```

## 🔌 API Documentation

### Authentication
```bash
# Register User
POST /register
Content-Type: application/json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
}

# Login
POST /login
Content-Type: application/json
{
    "email": "john@example.com",
    "password": "securepassword"
}
Response: { "token": "jwt_token_here" }
```

### Protected Routes
All protected routes require JWT token:
```bash
Authorization: Bearer <jwt_token>
```

### Available Endpoints
```bash
# Exercise Routes
GET /exercise          # Get all exercises
POST /exercise         # Create exercise

# Nutrition Routes
GET /nutrition         # Get nutrition entries
POST /nutrition        # Add nutrition entry

# Sleep Routes
GET /sleep            # Get sleep records
POST /sleep           # Add sleep record

# Medication Routes
GET /capsule-reminders    # Get reminders
POST /capsule-reminders   # Create reminder

# Playlist Routes
GET /playlists           # Get playlists
POST /playlists          # Create playlist
GET /tracks/:playlistId  # Get tracks
POST /tracks             # Add track

# Search
GET /search?query=<searchterm>  # Search across all data
```

## 📜 Scripts

### Backend Scripts
```bash
npm run dev           # Start development server (ts-node-dev)
npm run build        # Build TypeScript to JavaScript
npm start           # Run production server
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build       # Build for production
npm start          # Start production server
```

## 👏 Acknowledgements
- Express.js - Backend framework
- TypeScript - Type safety
- MySQL - Database
- JWT - Authentication
- Next.js - Frontend framework
- Tailwind CSS - Styling
- shadcn/ui - UI components
