import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔒 Replace with your real bot token
const BOT_TOKEN = "8306585825:AAFhjYJk8DkDdpjeJQ6u2d6wcEeA0ns8RF4";
const GROUP_CHAT_ID = "-4867068083"; // Verified group ID

app.post("/submit", async (req, res) => {
  try {
    const data = req.body;
    let text = "";

    if (data.type === "feedback") {
      // Feedback message
      text = `
💡 *پیشنهاد / بازخورد جدید از ساکن باران*
👤 نام: ${data.name}
🗒️ بازخورد:
${data.feedback}
${data.user ? `💬 ارسال‌شده توسط: @${data.user}` : ""}
      `;
    } else {
      // Service request message
      text = `
📩 *درخواست جدید خدمات باران*
👤 نام: ${data.name}
🏢 واحد: ${data.apartment}
🏗 طبقه: ${data.floor}
📂 نوع: ${data.issue}
📝 توضیحات: ${data.details || "—"}
${data.user ? `💬 ارسال‌شده توسط: @${data.user}` : ""}
      `;
    }

    console.log("Sending to Telegram...");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: GROUP_CHAT_ID,
          text,
          parse_mode: "Markdown"
        })
      }
    );

    const result = await telegramResponse.json();
    console.log("Telegram API response:", result);

    if (!result.ok) throw new Error(result.description);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error while sending to Telegram:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
