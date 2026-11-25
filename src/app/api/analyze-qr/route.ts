import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "محتوى غير صالح" }, { status: 400 });
    }

    const trimmed = content.trim();
    const isUrl = /^https?:\/\//i.test(trimmed);

    // هنا يمكنك ربط نموذجك (Gemini / OpenAI) أو سيرفر Python الخاص بك
    // هذا منطق مبدئي سريع يوضح نوع التحليل الذي سيقدمه التطبيق:
    let analysis = `نوع المحتوى: ${isUrl ? "رابط إلكتروني (URL)" : "نص / بيانات"}\n`;

    if (isUrl) {
      try {
        const urlObj = new URL(trimmed);
        const isHttps = urlObj.protocol === "https:";
        analysis += `النطاق (Domain): ${urlObj.hostname}\n`;
        analysis += `حالة الأمان المبدئية: ${
          isHttps ? "يستخدم اتصالاً مشفراً HTTPS (تأكد من موثوقية النطاق قبل إدخال أي بيانات)" : "تحذير: الرابط غير مشفر (HTTP)"
        }`;
      } catch {
        analysis += "تنبيه: صيغة الرابط تبدو غير قياسية، يُنصح بالحذر.";
      }
    } else {
      analysis += `عدد الأحرف: ${trimmed.length}\nملخص: محتوى نصي جاهز للنسخ أو المعالجة عبر نموذجك الذكي.`;
    }

    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json({ error: "فشل التحليل" }, { status: 500 });
  }
}