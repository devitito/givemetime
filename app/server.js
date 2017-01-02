const express = require('express')

const app = express()

// static file serve
app.use(express.static(__dirname + '/src'))
// not found in static files, so default to index.html
app.use((req, res) => res.sendFile(`${__dirname}/src/index.html`))

// eslint-disable-next-line no-console
console.log('Listening to port 4000')
app.listen(4000)
