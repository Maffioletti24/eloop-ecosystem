import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Servidor: chama Google Vision API para extrair o peso de uma foto da balança.
 * Retorna o número decimal detectado (kg) ou null.
 */
export const ocrPesoFromImage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        imageBase64: z.string().min(50).max(8_000_000), // ~6MB max
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "Google Vision API não configurada" };
    }

    // strip data URL prefix se vier
    const content = data.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    try {
      const resp = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content },
                features: [{ type: "TEXT_DETECTION", maxResults: 1 }],
              },
            ],
          }),
        },
      );
      if (!resp.ok) {
        const t = await resp.text();
        return { ok: false as const, error: `Vision API ${resp.status}: ${t.slice(0, 200)}` };
      }
      const json = (await resp.json()) as {
        responses?: Array<{ fullTextAnnotation?: { text?: string } }>;
      };
      const text = json.responses?.[0]?.fullTextAnnotation?.text ?? "";

      // procura o primeiro número decimal seguido (opcionalmente) por kg
      const match = text.match(/(\d{1,4}[.,]?\d{0,3})\s*(kg|KG|Kg)?/);
      if (!match) {
        return { ok: true as const, peso: null, rawText: text };
      }
      const peso = parseFloat(match[1].replace(",", "."));
      return { ok: true as const, peso: Number.isFinite(peso) ? peso : null, rawText: text };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
    }
  });
