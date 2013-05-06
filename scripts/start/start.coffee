express = require "express"

port = process.env.PORT || 3000

app = express()
app.use "/", express.static("#{__dirname}/../../")
app.listen port

console.log "HTTP server listening on port #{port}"
console.log "Press Ctrl-C to stop"
