import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Get environment variables from Vercel
const BOT_TOKEN = process.env.BOT_TOKEN;
const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID;

// Serve static frontend (index.html)
app.use(express.static(__dirname));

// Handle form submissions
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

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: GROUP_CHAT_ID,
        text,
        parse_mode: "Markdown"
      })
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.description);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error while sending to Telegram:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Local testing (ignored by Vercel)
app.listen(3000, () => console.log("Server running on port 3000"));
