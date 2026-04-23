@echo off
cd /d "%~dp0"
echo Starting PCPro Builder at http://127.0.0.1:8765/index.html
echo Leave this window open while using the app.
start "" "http://127.0.0.1:8765/index.html"
python -m http.server 8765 --bind 127.0.0.1
