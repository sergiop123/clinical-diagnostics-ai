#!/bin/bash

# ============================================================
# Clinical Diagnostics AI - Consolidated Installation Script
# Jade Global Internship 2026
# ============================================================
# This script sets up the entire application:
#   - Python virtual environment + backend dependencies
#   - React frontend dependencies
# ============================================================

echo "=============================================="
echo "Clinical Diagnostics AI - Setup"
echo "=============================================="

# ---------- BACKEND SETUP ----------
echo ""
echo "[1/4] Setting up Python backend..."
cd backend || exit

echo "Creating virtual environment..."
python -m venv venv

echo "Activating virtual environment..."
# Windows (Git Bash)
source venv/Scripts/activate 2>/dev/null || source venv/bin/activate

echo "Installing backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Backend setup complete."

# ---------- FRONTEND SETUP ----------
echo ""
echo "[2/4] Setting up React frontend..."
cd ../frontend || exit

echo "Installing frontend dependencies..."
npm install

echo "Frontend setup complete."

# ---------- DONE ----------
cd ..
echo ""
echo "=============================================="
echo "[3/4] Installation complete!"
echo "=============================================="
echo ""
echo "[4/4] To run the application:"
echo ""
echo "  BACKEND (Terminal 1):"
echo "    cd backend"
echo "    source venv/Scripts/activate"
echo "    uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "  FRONTEND (Terminal 2):"
echo "    cd frontend"
echo "    npm start"
echo ""
echo "=============================================="