import { createFileRoute, Link } from "@tanstack/react-router";
import { EloopLogo } from "@/components/EloopLogo";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Eloop Token" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="app-shell px-6 py-10 pb-16 max-w-3xl mx-auto">
      <div className="flex flex-col items-center mb-6">
        <EloopLogo size={64} withText />
      </div>
      <h1 className="text-3xl font-bold">Política de Privacidade</h1>
      <p className="text-xs text-dim mt-1">
        Vigência: 20/07/2026 · Em conformidade com a Lei nº 13.709/2018 (LGPD).
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Controlador</h2>
          <p>
            A Eloop Token ("Eloop", "nós") é a controladora dos dados pessoais
            tratados nesta plataforma. Contato do encarregado (DPO):{" "}
            <a href="mailto:dpo@elooptoken.com" className="text-primary">
              dpo@elooptoken.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">
            2. Dados que coletamos
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Identificação:</strong> nome, e-mail, CPF ou CNPJ,
              perfil operacional (cooperativa, reciclador, gerador, doador,
              comprador).
            </li>
            <li>
              <strong>Autenticação:</strong> senha (hash), sessões, IP de acesso.
            </li>
            <li>
              <strong>Operacionais:</strong> lotes de REE registrados, hashes
              SHA-256 de evidências, transações on-chain (Polygon), tokens ELP
              emitidos/compensados.
            </li>
            <li>
              <strong>Carteira custodial:</strong> endereço público derivado
              para vínculo com sua conta. A chave privada é gerenciada em
              custódia segura.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Bases legais (art. 7º LGPD)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Execução de contrato: operacionalização da plataforma.</li>
            <li>Cumprimento de obrigação legal: PNRS (Lei 12.305/2010) e SINIR.</li>
            <li>Legítimo interesse: prevenção a fraudes e segurança.</li>
            <li>Consentimento: comunicações opcionais de marketing.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Compartilhamento</h2>
          <p>
            Não vendemos dados. Compartilhamos apenas com: (a) autoridades
            competentes quando exigido por lei; (b) processadores essenciais
            (infraestrutura em nuvem, e-mail transacional); (c) contrapartes
            explicitamente autorizadas por você em operações de compensação
            de crédito. Registros on-chain são públicos por natureza — apenas
            hashes e IDs anonimizados são publicados.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Retenção</h2>
          <p>
            Dados de conta: enquanto a conta estiver ativa e por até 5 anos
            após inativação, para fins fiscais e regulatórios. Registros de
            rastreabilidade PNRS: prazo mínimo legal aplicável (10 anos).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Seus direitos (art. 18 LGPD)</h2>
          <p>
            Você pode solicitar a qualquer momento: confirmação, acesso,
            correção, anonimização, portabilidade, informação sobre
            compartilhamentos, revogação de consentimento e eliminação de
            dados tratados com base em consentimento. Envie sua solicitação
            para <a href="mailto:dpo@elooptoken.com" className="text-primary">dpo@elooptoken.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Segurança</h2>
          <p>
            Aplicamos RLS em todas as tabelas, criptografia em trânsito (TLS)
            e em repouso, autenticação com verificação contra vazamentos
            conhecidos (HIBP) e monitoramento contínuo de acesso.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Alterações</h2>
          <p>
            Podemos atualizar esta política. A versão vigente e a data de
            última revisão estarão sempre nesta página.
          </p>
        </section>
      </div>

      <div className="mt-10 text-center">
        <Link to="/cadastro" className="text-primary text-sm font-medium">
          ← Voltar ao cadastro
        </Link>
      </div>
    </div>
  );
}
