import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "";

    // هنا لاحقاً سنربط نموذج Gemini / OpenAI أو سيرفر Python (FastAPI) الخاص بك
    const encoder = new TextEncoder();
    const simulatedReply = `أهلاً بك! استلمت رسالتك: "${lastMessage}". البنية جاهزة الآن لربطها بنموذج الذكاء الاصطناعي أو سيرفر Python الخاص بك مع بث مباشر للردود.`;

    const stream = new ReadableStream({
      async start(controller) {
        const words = simulatedReply.split(" ");
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise((r) => setTimeout(r, 60));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "حدث خطأ في الخادم" }), {
      status: 500,
    });
  }
}