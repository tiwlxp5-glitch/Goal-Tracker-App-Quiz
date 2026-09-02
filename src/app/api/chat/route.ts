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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `คุณคือ "โค้ชวางแผนเป้าหมาย" ที่คอยถามคำถามเชิงลึกทีละข้อ เพื่อทำความเข้าใจเป้าหมายของผู้ใช้
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
    });

    // Convert messages format for Gemini
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));
    
    const latestMsg = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(latestMsg);
    const responseText = result.response.text();

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

  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: "ขออภัย โค้ชเกิดอาการงงชั่วคราว กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
