import "dotenv/config";
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const events = req.body?.events || [];
  // console.log("📩 Events:", JSON.stringify(events, null, 2));

  for (const event of events) {
    if (event.type === "join") {
      try {
        const replyToken = event.replyToken;
        if (!replyToken) {
          console.warn("⚠️ No replyToken in event");
          continue;
        }

        await axios.post(
          "https://api.line.me/v2/bot/message/reply",
          {
            replyToken,
            messages: [
              {
                type: "text",
                text: "บอทเข้ากลุ่มแล้วครับ! 🚀",
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.LINE_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("✅ ส่งข้อความสำเร็จ");
      } catch (error) {
        console.error(
          "❌ LINE reply error:",
          error.response?.data || error.message
        );
      }
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
