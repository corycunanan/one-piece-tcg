#!/bin/bash

echo "🚀 Starting One Piece TCG Servers..."

# Start JSON Server in the background
echo "📊 Starting JSON Server on port 3001..."
cd "$(dirname "$0")"
json-server --watch db.json --port 3001 &
JSON_SERVER_PID=$!

# Wait a moment for JSON server to start
sleep 2

# Start Backend Server in the background
echo "🔧 Starting Backend Server on port 5001..."
cd backend
npm start &
BACKEND_SERVER_PID=$!

# Wait a moment for backend server to start
sleep 3

echo ""
echo "✅ Servers started successfully!"
echo "📊 JSON Server: http://localhost:3001"
echo "🔧 Backend Server: http://localhost:5001"
echo "🎴 Admin Panel: http://localhost:3000/admin-panel/index.html"
echo "🃏 Deck Manager: http://localhost:3000/admin-panel/decks.html"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $JSON_SERVER_PID 2>/dev/null
    kill $BACKEND_SERVER_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait 