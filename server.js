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

// Serve the static frontend
app.use(express.static(__dirname));

// ✅ Replace with your bot info
const BOT_TOKEN = "8306585825:AAFhjYJk8DkDdpjeJQ6u2d6wcEeA0ns8RF4";
const GROUP_CHAT_ID = "-4867068083"; // your verified group ID

// Send form data to Telegram
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

    const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: GROUP_CHAT_ID, text, parse_mode: "Markdown" }),
    });

    const data = await telegramResponse.json();
    if (!data.ok) throw new Error(data.description);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => console.log("Server running on port 3000"));
