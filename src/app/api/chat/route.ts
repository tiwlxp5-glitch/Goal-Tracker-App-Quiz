import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  if (!genAI) {
    return NextResponse.json(
      { reply: "ไม่พบ Gemini API Key กรุณาตั้งค่าก่อนใช้งาน (ตั้งในไฟล์ .env.local)" },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing API Key");

    const latestMsg = messages[messages.length - 1].content;
    let history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));
    if (history.length > 0 && history[0].role === "model") {
      history.unshift({ role: "user", parts: [{ text: "สวัสดี (เริ่มต้นการสนทนา)" }] });
    }

    const payload = {
      systemInstruction: {
        parts: [{
          text: `คุณคือ "โค้ชวางแผนเป้าหมาย" ที่คอยถามคำถามเชิงลึกทีละข้อ เพื่อทำความเข้าใจเป้าหมายของผู้ใช้
ให้คุยแบบถาม-ตอบทีละคำถาม (อย่าถามรวดเดียวหมด)
ถามประมาณ 3-5 คำถามเพื่อดึงข้อมูล (เช่น motivation, deadline, ทรัพยากรที่มี, อุปสรรค)
เมื่อได้ข้อมูลครบถ้วนแล้ว ให้ตอบด้วย JSON format โดยไม่ต้องมีข้อความอธิบายใดๆ ทั้งสิ้น เริ่มต้นด้วย { และจบด้วย }
โครงสร้าง JSON:
{
  "isReadyToGenerate": true,
  "goalPlan": {
    "title": "ชื่อเป้าหมายสั้นๆ",
    "description": "คำอธิบายเป้าหมาย",
    "icon": "🎯",
    "tasks": [
      {"title": "งานย่อย 1", "suggested_date": "กรอบเวลาคร่าวๆ เช่น สัปดาห์ที่ 1"},
      {"title": "งานย่อย 2", "suggested_date": "สัปดาห์ที่ 2"}
    ]
  }
}
หากยังข้อมูลไม่ครบ ให้ตอบกลับเป็นข้อความสนทนาปกติ (isReadyToGenerate: false ในใจ ไม่ต้องพ่น JSON ออกมา พ่นแค่ข้อความ)`
        }]
      },
      contents: history.concat({ role: "user", parts: [{ text: latestMsg }] })
    };

    const responseText = await new Promise<string>((resolve, reject) => {
      const https = require("https");
      const data = JSON.stringify(payload);
      const req = https.request(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data)
          },
          timeout: 15000 // 15 seconds timeout
        },
        (res: any) => {
          let chunks = "";
          res.on("data", (d: any) => chunks += d);
          res.on("end", () => {
            if (res.statusCode !== 200) {
              reject(new Error(`API Error ${res.statusCode}: ${chunks}`));
              return;
            }
            try {
              const json = JSON.parse(chunks);
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
              resolve(text);
            } catch (e) {
              reject(e);
            }
          });
        }
      );
      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timed out after 15 seconds. Google's server is too slow."));
      });
      req.write(data);
      req.end();
    });

    // Check if response is JSON
    if (responseText.trim().startsWith("{") && responseText.trim().endsWith("}")) {
      try {
        const jsonData = JSON.parse(responseText);
        if (jsonData.isReadyToGenerate) {
          return NextResponse.json(jsonData);
        }
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
      }
    }

    return NextResponse.json({ isReadyToGenerate: false, reply: responseText });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ reply: `ขออภัย โค้ชเกิดอาการงงชั่วคราว (Error: ${error.message})` }, { status: 500 });
  }
}
