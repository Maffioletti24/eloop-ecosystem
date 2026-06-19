import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submitSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  message: z.string().min(1, "Mensagem é obrigatória"),
});

export const submitInvestorLead = createServerFn({ method: "POST" })
  .inputValidator((data) => submitSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("investor_leads").insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });

    if (error) {
      console.error("Failed to save investor lead:", error);
      throw new Error("Não foi possível enviar sua mensagem. Tente novamente.");
    }

    return { success: true };
  });
