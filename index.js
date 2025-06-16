import express from "express";
import { middleware } from "@line/bot-sdk";
import axios from "axios";

const app = express();

const config = {
  channelSecret: process.env.LINE_SECRET,
  channelAccessToken: process.env.LINE_TOKEN,
};

// ❗ ห้ามมี express.json()

app.post("/webhook", middleware(config), async (req, res) => {
  const events = req.body.events || [];

  for (const ev of events) {
    if (ev.type === "join") {
      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: ev.replyToken,
          messages: [
            {
              type: "text",
              text: "บอทพร้อมให้บริการในกลุ่มนี้แล้วครับ 🚀",
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
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
