sudo kill $(ps aux | grep 'node server.js' | awk '{print $2}')
