import { NextRequest, NextResponse } from "next/server";
import { requireInterviewUser } from "@/lib/supabase/guard";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const denied = await requireInterviewUser(request);
  if (denied) return denied;
  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file." }, { status: 400 });
    if (file.size > 5_000_000) return NextResponse.json({ error: "Maximum file size is 5 MB." }, { status: 400 });
    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    if (name.endsWith(".txt")) text = buffer.toString("utf8");
    else if (name.endsWith(".docx")) { const mammoth = await import("mammoth"); text = (await mammoth.extractRawText({ buffer })).value; }
    else if (name.endsWith(".pdf")) { const pdf = (await import("pdf-parse")).default; text = (await pdf(buffer)).text; }
    else return NextResponse.json({ error: "Upload a PDF, DOCX, or TXT file." }, { status: 400 });
    if (!text.trim()) return NextResponse.json({ error: "No readable text found. Paste your resume instead." }, { status: 422 });
    return NextResponse.json({ text: text.slice(0, 12000) });
  } catch { return NextResponse.json({ error: "Could not read this file. Paste your resume instead." }, { status: 422 }); }
}
