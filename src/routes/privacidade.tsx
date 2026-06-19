import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SITE_URL = "https://eloop-investidores.lovable.app";
const EMAIL = "elooptoken.project@elooptoken.com";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Eloop Token" },
      {
        name: "description",
        content:
          "Política de Privacidade da Eloop Token: dados coletados, base legal LGPD, retenção, direitos do titular e canal de contato do encarregado.",
      },
      { property: "og:title", content: "Política de Privacidade — Eloop Token" },
      {
        property: "og:description",
        content: "Como tratamos seus dados pessoais em conformidade com a LGPD.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/privacidade` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/privacidade` }],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Política de Privacidade
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Última atualização: junho de 2026
        </p>

        <div className="prose prose-invert mt-10 max-w-none text-muted-foreground">
          <p>
            Esta Política de Privacidade descreve como a Eloop Token coleta,
            usa, armazena e compartilha dados pessoais em conformidade com a
            Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD).
          </p>

          <h2 className="text-foreground">1. Dados que coletamos</h2>
          <ul>
            <li>
              <strong>Dados de contato</strong>: nome, e-mail e mensagem que
              você envia voluntariamente pelos formulários do site (páginas
              de contato e investidores).
            </li>
            <li>
              <strong>Dados de navegação</strong>: registros técnicos de
              acesso (IP, user-agent, páginas visitadas), necessários para
              segurança e funcionamento do serviço.
            </li>
          </ul>

          <h2 className="text-foreground">2. Finalidade do tratamento</h2>
          <ul>
            <li>Responder a contatos, propostas e solicitações de demo.</li>
            <li>Conduzir conversas com investidores e parceiros.</li>
            <li>Manter a segurança e estabilidade do site.</li>
            <li>Cumprir obrigações legais e regulatórias.</li>
          </ul>

          <h2 className="text-foreground">3. Base legal</h2>
          <p>
            Tratamos seus dados com base no consentimento (art. 7º, I, LGPD)
            ao submeter os formulários, no legítimo interesse para
            comunicação comercial pertinente (art. 7º, IX) e no cumprimento
            de obrigação legal quando aplicável (art. 7º, II).
          </p>

          <h2 className="text-foreground">4. Compartilhamento</h2>
          <p>
            Não vendemos dados pessoais. Podemos compartilhar com prestadores
            de serviço estritamente necessários (provedor de e-mail, hosting,
            analytics), todos sob obrigação de confidencialidade. Quando
            exigido por lei ou ordem judicial, atendemos as autoridades
            competentes.
          </p>

          <h2 className="text-foreground">5. Retenção</h2>
          <p>
            Mantemos os dados de contato pelo tempo necessário para concluir a
            interação solicitada e por até 5 anos após o último contato, salvo
            obrigação legal de prazo superior. Você pode solicitar a exclusão
            antes desse prazo.
          </p>

          <h2 className="text-foreground">6. Direitos do titular</h2>
          <p>Você tem direito a:</p>
          <ul>
            <li>Confirmação da existência de tratamento;</li>
            <li>Acesso aos seus dados;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>Portabilidade;</li>
            <li>Eliminação dos dados tratados com consentimento;</li>
            <li>Informação sobre compartilhamento;</li>
            <li>Revogação do consentimento.</li>
          </ul>

          <h2 className="text-foreground">7. Segurança</h2>
          <p>
            Adotamos medidas técnicas e administrativas para proteger os
            dados pessoais contra acessos não autorizados, perda ou
            destruição, incluindo controle de acesso, criptografia em
            trânsito e registros de auditoria.
          </p>

          <h2 className="text-foreground">8. Encarregado de dados (DPO)</h2>
          <p>
            Para exercer seus direitos, esclarecer dúvidas ou reportar
            incidentes, fale com nosso encarregado em{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>

          <h2 className="text-foreground">9. Atualizações</h2>
          <p>
            Esta política pode ser atualizada periodicamente. A versão vigente
            está sempre disponível nesta página, com a data da última revisão
            no topo.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
