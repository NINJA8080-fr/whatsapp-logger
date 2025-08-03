import express from 'express'
import fs from 'fs'

const app = express()
const PORT = 3000
const logFile = './messages.json'
let messages = []

if (fs.existsSync(logFile)) {
    try {
        messages = JSON.parse(fs.readFileSync(logFile))
    } catch (err) {
        messages = []
    }
}

app.use(express.static('public'))

app.get('/messages', (req, res) => {
    res.json(messages)
})

app.listen(PORT, () => {
    console.log(`🟢 لوحة التحكم: http://localhost:${PORT}`)
})
