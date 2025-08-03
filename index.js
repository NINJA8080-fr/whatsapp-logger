import { connectDB, Message } from './db.js'
import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys'
import P from 'pino'
import fs from 'fs'
import qrcode from 'qrcode-terminal'

// ✅ الاتصال بقاعدة البيانات
await connectDB()

const logFile = './messages.json'
let messages = []

// ✅ تحميل سجل الرسائل من الملف (اختياري فقط للتوافق)
if (fs.existsSync(logFile)) {
  try {
    messages = JSON.parse(fs.readFileSync(logFile))
  } catch {
    messages = []
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: 'silent' })
  })

  // ✅ تسجيل الرسائل المستلمة
  sock.ev.on('messages.upsert', async ({ messages: upsertedMsgs }) => {
    const msg = upsertedMsgs[0]
    if (!msg.message) return

    const sender = msg.pushName || 'مجهول'
    const from = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const time = new Date().toLocaleString()

    const log = { sender, from, text, time }

    // 🔴 حفظ في ملف (اختياري)
    messages.unshift(log)
    fs.writeFileSync(logFile, JSON.stringify(messages, null, 2))

    // ✅ حفظ في MongoDB
    await Message.create(log)

    console.log(`[${time}] ${sender}: ${text}`)
  })

  // ✅ التعامل مع الاتصال و QR
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('✅ امسح الكود لتسجيل الدخول إلى واتساب:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const reason = (lastDisconnect?.error)?.output?.statusCode
      const shouldReconnect = reason !== DisconnectReason.loggedOut
      console.log('📴 تم قطع الاتصال، جارٍ إعادة الاتصال:', shouldReconnect)
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('✅ تم الاتصال بواتساب بنجاح!')
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

startBot().catch(err => {
  console.error('❌ حدث خطأ أثناء تشغيل البوت:', err)
})
