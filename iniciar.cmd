@echo off
rem Dois cliques aqui: sobe a API e abre o painel no navegador.
rem Usa npm.cmd (e nao npm) para funcionar mesmo com scripts do PowerShell bloqueados.
cd /d "%~dp0"
if not exist node_modules call npm.cmd install
rem Abre o navegador daqui a 3 segundos, quando o servidor ja subiu.
start "" /min cmd /c "timeout /t 3 >nul & start http://localhost:3000"
npm.cmd run dev
