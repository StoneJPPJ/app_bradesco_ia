@echo off
echo ================================
echo 🚀 INICIANDO SISTEMA BRADESCO CHATBOT
echo ================================

echo 📊 Compilando projeto...
javac -cp "lib/*" src/main/java/com/bradesco/chatbot/*.java -d target/classes

echo 🖥️  Iniciando Backend (Java)...
start "Backend ChatBot" java -cp "target/classes;lib/*" com.bradesco.chatbot.ChatBotBradesco

timeout /t 3 /nobreak >nul

echo 🌐 Abrindo Frontend...
start "" frontend/index.html

echo ================================
echo ✅ SISTEMA INICIADO COM SUCESSO!
echo ================================
echo 🖥️  Backend: http://localhost:8081
echo 🌐 Frontend: Abrindo automaticamente
echo ================================
echo ℹ️  Para parar o sistema, feche as janelas abertas
echo ================================

pause 