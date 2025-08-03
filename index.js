import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys'
import P from 'pino'
import fs from 'fs'
import qrcode from 'qrcode-terminal' // ✅ استدعاء مكتبة QR

const logFile = './messages.json'
let messages = []

if (fs.existsSync(logFile)) {
  try {
    messages = JSON.parse(fs.readFileSync(logFile))
  } catch (err) {
    messages = []
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: 'silent' }),
  })

  sock.ev.on('messages.upsert', async ({ messages: upsertedMsgs }) => {
    const msg = upsertedMsgs[0]
    if (!msg.message) return

    const sender = msg.pushName || 'مجهول'
    const from = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const time = new Date().toLocaleString()

    const log = { sender, from, text, time }
    messages.unshift(log)
    fs.writeFileSync(logFile, JSON.stringify(messages, null, 2))
    console.log(`[${time}] ${sender}: ${text}`)
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    // ✅ عرض QR في الطرفية بشكل مرئي
    if (qr) {
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('📴 الاتصال انقطع، إعادة الاتصال:', shouldReconnect)
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('✅ تم الاتصال بواتساب')
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

startBot()
