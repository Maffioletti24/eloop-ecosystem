import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submitSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  message: z.string().trim().min(1, "Mensagem é obrigatória").max(2000),
  source: z.string().trim().max(40).optional(),
});

export const submitContactLead = createServerFn({ method: "POST" })
  .inputValidator((data) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("contact_leads").insert({
      name: data.name,
      email: data.email,
      message: data.message,
      source: data.source ?? "contato",
    });

    if (error) {
      console.error("Failed to save contact lead:", error);
      throw new Error("Não foi possível enviar sua mensagem. Tente novamente.");
    }

    return { success: true };
  });
