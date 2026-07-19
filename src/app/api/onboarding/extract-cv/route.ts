import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDocumentProxy, extractText as extractPdfText } from "unpdf";
import mammoth from "mammoth";
import { createClient, createAdminClient } from "@/lib/supabase-server";
import { CV_EXTRACTION_SYSTEM_PROMPT, buildCvExtractionUserPrompt } from "@/lib/cv-extraction-prompt";
import { CvExtractionResponseSchema, type CvExtractionResponse } from "@/lib/cv-extraction-schema";

const anthropic = new Anthropic();

const BUCKET = "cv-uploads-temp";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const DAILY_LIMIT = 3;
const MODEL = "claude-haiku-4-5";

export async function POST(request: Request) {
  // (a) Sesión de faculty autenticada — nunca anónimo
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "faculty") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const storagePath = body?.storagePath;
  const pastedText = body?.text;

  const hasStoragePath = typeof storagePath === "string" && storagePath.length > 0;
  const hasPastedText = typeof pastedText === "string" && pastedText.trim().length > 0;

  if (!hasStoragePath && !hasPastedText) {
    return NextResponse.json({ error: "missing_input" }, { status: 400 });
  }

  // Defensa en profundidad: aunque la policy de Storage ya impide subir
  // fuera de la propia carpeta, nunca confiar en un path que llega en el
  // body de la petición sin volver a comprobar que es del usuario.
  if (hasStoragePath && !storagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (hasPastedText && pastedText.length > 50000) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }

  // (b) Rate limit atado al user_id autenticado, no a IP
  const today = new Date().toISOString().slice(0, 10);
  const { data: allowed } = await admin.rpc("increment_cv_extraction_usage", {
    p_user_id: user.id,
    p_day: today,
    p_daily_limit: DAILY_LIMIT,
  });

  if (!allowed) {
    if (hasStoragePath) await admin.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    let text: string;

    if (hasPastedText) {
      text = pastedText;
    } else {
      const { data: file, error: downloadError } = await admin.storage
        .from(BUCKET)
        .download(storagePath);

      if (downloadError || !file) {
        return NextResponse.json({ error: "file_not_found" }, { status: 404 });
      }

      const arrayBuffer = await file.arrayBuffer();

      if (arrayBuffer.byteLength > MAX_FILE_BYTES) {
        await admin.storage.from(BUCKET).remove([storagePath]);
        return NextResponse.json({ error: "file_too_large" }, { status: 413 });
      }

      text = await extractText(storagePath, arrayBuffer);
      // Privacidad: el CV se borra en cuanto se ha extraído el texto,
      // no hace falta esperar a que termine la llamada al modelo
      await admin.storage.from(BUCKET).remove([storagePath]);
    }

    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: "empty_document" }, { status: 422 });
    }

    const result = await extractWithRetry(text);

    if (!result) {
      return NextResponse.json({ error: "extraction_failed" }, { status: 422 });
    }

    if ("error" in result) {
      return NextResponse.json({ error: "not_a_cv", detalle: result.detalle }, { status: 422 });
    }

    return NextResponse.json({ success: true, profile: result });
  } catch (e) {
    if (hasStoragePath) await admin.storage.from(BUCKET).remove([storagePath]).catch(() => {});
    console.error("[extract-cv] error:", e);
    // Nunca mostrar detalles de parsing/errores del modelo al usuario
    return NextResponse.json({ error: "extraction_failed" }, { status: 500 });
  }
}

async function extractText(storagePath: string, arrayBuffer: ArrayBuffer): Promise<string> {
  if (storagePath.toLowerCase().endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
    return value;
  }
  const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
  const { text } = await extractPdfText(pdf, { mergePages: true });
  return text;
}

// Claude a veces envuelve el JSON en un fence de markdown (```json ... ```)
// pese a la regla 9 del prompt ("Sin markdown"). Se quita aquí en vez de
// tocar el prompt — es una robustez de parsing nuestra, no una regla de la IA.
function extractJsonFromModelText(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

async function extractWithRetry(cvText: string): Promise<CvExtractionResponse | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4096,
        temperature: 0,
        system: CV_EXTRACTION_SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildCvExtractionUserPrompt(cvText) }],
      });

      const textBlock = message.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        console.error(`[extract-cv] attempt ${attempt + 1}: no text block in response`);
        continue;
      }

      const parsed = JSON.parse(extractJsonFromModelText(textBlock.text));
      const validated = CvExtractionResponseSchema.safeParse(parsed);
      if (validated.success) return validated.data;

      console.error(`[extract-cv] attempt ${attempt + 1}: schema validation failed`, validated.error.format());
    } catch (e) {
      console.error(`[extract-cv] attempt ${attempt + 1}: threw`, e);
    }
  }
  return null;
}
