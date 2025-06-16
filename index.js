import "dotenv/config";
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const events = req.body?.events || [];
  console.log("📩 Events:", JSON.stringify(events, null, 2));

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

// ✅ ENDPOINT ที่หน้าเว็บจะยิงมา
app.post("/api/notify-payment", async (req, res) => {
  const { name, month, status } = req.body;

  if (!name || !month || typeof status !== "boolean") {
    return res.status(400).json({ message: "ข้อมูลไม่ครบ" });
  }

  const text = `💬 แจ้งเตือน\n${name} ${
    status ? "✅ ชำระเงินแล้ว" : "❌ ยังไม่ชำระเงิน"
  } ประจำเดือน ${month}`;

  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: process.env.LINE_GROUP_ID, // ✅ Group ID ที่ได้จาก event.source.groupId
        messages: [{ type: "text", text }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LINE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ message: "ส่งข้อความสำเร็จ" });
  } catch (err) {
    console.error("❌ ส่งข้อความล้มเหลว:", err.response?.data || err.message);
    res.status(500).json({ message: "ส่งข้อความล้มเหลว" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
