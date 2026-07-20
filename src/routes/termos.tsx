import { createFileRoute, Link } from "@tanstack/react-router";
import { EloopLogo } from "@/components/EloopLogo";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Eloop Token" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="app-shell px-6 py-10 pb-16 max-w-3xl mx-auto">
      <div className="flex flex-col items-center mb-6">
        <EloopLogo size={64} withText />
      </div>
      <h1 className="text-3xl font-bold">Termos de Uso</h1>
      <p className="text-xs text-dim mt-1">Vigência: 20/07/2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Objeto</h2>
          <p>
            A Eloop Token disponibiliza uma plataforma para rastreabilidade
            de Resíduos Eletroeletrônicos (REE) via registros SHA-256
            ancorados em blockchain pública (Polygon) e emissão de tokens
            ELP como comprovação digital de compensação. Esta versão beta
            é destinada a testes controlados.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Elegibilidade</h2>
          <p>
            Cadastros exigem CPF ou CNPJ válido e perfil compatível
            (cooperativa, reciclador, gerador PNRS, doador PF/PJ ou
            comprador). É proibido o uso por menores de 18 anos sem
            representação legal.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Responsabilidades do usuário</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fornecer informações verídicas e mantê-las atualizadas.</li>
            <li>
              Enviar apenas evidências reais de coleta/tratamento de REE. O
              envio de dados falsos pode ser tipificado como fraude
              documental.
            </li>
            <li>Manter suas credenciais em sigilo.</li>
            <li>
              Cumprir a PNRS, SINIR e demais normas ambientais aplicáveis
              ao seu perfil.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Tokens ELP</h2>
          <p>
            ELP é um <strong>token utilitário</strong> de comprovação de
            compensação — <em>não é</em> valor mobiliário, meio de pagamento
            nem promessa de rentabilidade. Sua emissão exige lote validado
            por operador Nível 4 (validador) e hash âncora on-chain. A
            compensação é irreversível.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Beta e limitações</h2>
          <p>
            Durante a fase beta, a plataforma opera em rede pública Polygon
            com carteira de gás mantida pela Eloop. Funcionalidades podem
            mudar, dados de teste podem ser reiniciados mediante aviso, e
            SLAs comerciais ainda não se aplicam.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Propriedade intelectual</h2>
          <p>
            Marca, código-fonte, design e conteúdos da plataforma pertencem
            à Eloop Token. É vedada engenharia reversa, cópia ou redistribuição
            sem autorização escrita.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Limitação de responsabilidade</h2>
          <p>
            A Eloop não se responsabiliza por: (a) indisponibilidades da
            rede Polygon; (b) perda de acesso decorrente de negligência do
            usuário com suas credenciais; (c) decisões regulatórias que
            afetem tokens utilitários; (d) uso indevido por terceiros
            autorizados pelo próprio usuário.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Encerramento</h2>
          <p>
            Podemos suspender contas em caso de violação destes termos,
            fraude ou requisição legal. O usuário pode encerrar sua conta a
            qualquer momento — registros on-chain permanecem imutáveis por
            natureza da tecnologia.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">9. Foro</h2>
          <p>
            Fica eleito o foro da comarca de São Paulo/SP, com renúncia a
            qualquer outro, por mais privilegiado que seja.
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
