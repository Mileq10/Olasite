# Serwer Node nasłuchuje na 0.0.0.0 (dostęp z telefonu w Wi-Fi).
# Start: npm start
# Albo: node server.js
# Port: 8080 (albo $env:PORT)

$env:PORT = "8080"
node "$PSScriptRoot\server.js"
