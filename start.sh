#!/bin/bash

echo "================================"
echo "    CVInspector Launcher"
echo "================================"
echo ""
echo "Starting Backend Server..."
cd backend && npm start &
sleep 3
echo ""
echo "Starting Frontend App..."
cd ../frontend && npm start &
echo ""
echo "================================"
echo "Both servers are starting!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "================================"
wait
