express = require "express"

app = express()
app.use "/", express.static("#{__dirname}/../../")
app.listen 3000

console.log "HTTP server listening on port 3000"
console.log "Press Ctrl-C to stop"
