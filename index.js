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
                text: "บอทเข้ากลุ่มแล้วจ้า! 🚀",
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

// ✅ ส่งข้อความแบบ Flex Message
app.post("/api/notify-payment", async (req, res) => {
  try {
    const { name, month, status } = req.body;

    const flexMsg = {
      type: "flex",
      altText: "แจ้งเตือนการชำระเงิน",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: status ? "✅ ชำระเงินแล้ว" : "❌ ยังไม่ได้ชำระ",
              weight: "bold",
              size: "lg",
              color: status ? "#00C851" : "#ff4444",
            },
            {
              type: "text",
              text: `ชื่อ: ${name}`,
              margin: "md",
            },
            {
              type: "text",
              text: `เดือน: ${month}`,
              margin: "sm",
            },
          ],
        },
      },
    };

    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: process.env.LINE_GROUP_ID,
        messages: [flexMsg],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LINE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ message: "ส่งข้อความ Flex สำเร็จ!" });
  } catch (error) {
    console.error("❌ Error sending Flex message:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
