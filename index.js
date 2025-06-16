import "dotenv/config";
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json()); // สำคัญมาก ไม่งั้น req.body จะกลายเป็น undefined

app.post("/webhook", async (req, res) => {
  try {
    const events = req.body.events || [];
    console.log("📩 Events:", events);

    for (const event of events) {
      if (event.type === "join") {
        await axios.post(
          "https://api.line.me/v2/bot/message/reply",
          {
            replyToken: event.replyToken,
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
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error in webhook:", error.message);
    res.sendStatus(500);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
