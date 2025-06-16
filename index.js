import express from "express";
import { middleware } from "@line/bot-sdk";
import axios from "axios";

const app = express();

// กำหนดค่าจาก LINE Developer Console
const config = {
  channelSecret: process.env.LINE_SECRET,
};

// ใช้ LINE middleware
app.post("/webhook", middleware(config), async (req, res) => {
  const events = req.body.events || [];

  for (const ev of events) {
    if (ev.type === "join") {
      // ตอบกลับตอนเข้ากลุ่ม
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

// เปิดเซิร์ฟเวอร์
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
