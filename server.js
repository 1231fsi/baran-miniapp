import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables from Vercel
const BOT_TOKEN = process.env.BOT_TOKEN;
const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// --- Telegram commands (/start, /help) ---
app.post("/webhook", async (req, res) => {
  try {
    const update = req.body;
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      if (text === "/start") {
        await sendMessage(chatId, `
سلام! 👋  
برای شروع، روی دکمه *Baran App* در گوشه چپ چت کلیک کنید.  
اگر نیاز به راهنمایی دارید، دستور /help را ارسال کنید.
        `);
      }

      else if (text === "/help") {
        await sendMessage(chatId, `
📘 *راهنمای استفاده از دستیار باران*  
برای باز کردن مینی‌اپ:
1️⃣ روی دکمه آبی *Baran App* در گوشه چپ چت کلیک کنید.  
2️⃣ سپس فرم خدمات یا پیشنهاد را پر کرده و ارسال کنید.
        `);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(500);
  }
});

// --- Mini-app submission route ---
app.post("/submit", async (req, res) => {
  try {
    const { type, name, apartment, floor, issue, details, feedback, user } = req.body;
    let text = "";

    if (type === "service") {
      text = `
📩 *درخواست جدید خدمات باران*
👤 نام: ${name}
🏢 واحد: ${apartment}
🏗 طبقه: ${floor}
📂 نوع: ${issue}
📝 توضیحات: ${details || "—"}
${user ? `💬 ارسال‌شده توسط: @${user}` : ""}
      `;
    } else if (type === "feedback") {
      text = `
💡 *بازخورد جدید*
👤 نام: ${name}
🗒 پیام: ${feedback}
${user ? `💬 ارسال‌شده توسط: @${user}` : ""}
      `;
    }

    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text, parse_mode: "Markdown" })
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.description);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error while sending to Telegram:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Serve your mini-app frontend ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --- Helper function ---
async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" })
  });
}

app.listen(3000, () => console.log("Server running on port 3000"));
