# SalãoPro — Sistema de Gestão para Salões de Beleza

Sistema web completo (multi-tenant / SaaS) para gestão de salões de beleza e
estética: agenda, clientes, equipe, serviços, financeiro com comissões e
controle de estoque.

Cada salão que se cadastra tem seus próprios dados isolados (multi-tenant):
vários salões podem usar o mesmo sistema sem ver os dados uns dos outros.

## Funcionalidades

- **Autenticação e cadastro de salões**: qualquer pessoa pode criar a conta
  do seu salão (`/cadastro`) e convidar sua equipe futuramente.
- **Agenda**: agendamento de horários por cliente, profissional e serviço,
  com visão diária, marcação de status (agendado, concluído, cancelado, não
  compareceu). Ao concluir um atendimento, a receita é lançada
  automaticamente no financeiro.
- **Clientes**: cadastro com telefone, e-mail, aniversário, observações e
  histórico completo de atendimentos.
- **Equipe**: cadastro de profissionais (cabeleireiros, manicures etc.) com
  especialidade e percentual de comissão.
- **Serviços**: catálogo de serviços com duração e preço.
- **Financeiro**: entradas e saídas manuais, receita automática dos
  atendimentos concluídos, resumo mensal e cálculo de comissão por
  profissional.
- **Estoque**: produtos com preço de custo/venda, estoque mínimo, alerta de
  reposição e histórico de movimentações (entrada/saída).
- **Configurações**: dados do salão (nome, endereço, horário de
  funcionamento).

## Stack técnica

- [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Turbopack)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/) + [`node:sqlite`](https://nodejs.org/api/sqlite.html)
  (banco de dados em arquivo, sem necessidade de infraestrutura externa)
- Autenticação própria com sessão em cookie assinado (JWT via
  [`jose`](https://github.com/panva/jose)) e senhas com `bcryptjs`

> Este projeto usa SQLite propositalmente: funciona imediatamente em
> qualquer máquina/servidor sem precisar configurar um banco de dados
> externo. Ele usa o módulo `node:sqlite`, **nativo do Node.js**, em vez de
> pacotes como `better-sqlite3` — de propósito, para que `npm install`
> nunca precise compilar nada (isso evita os erros clássicos de Windows por
> falta de Visual Studio Build Tools/Python). Para produção com múltiplos
> servidores/alta concorrência, considere migrar para Postgres — a camada
> de acesso a dados está isolada em `src/db/`, então a migração é
> localizada.

## Como rodar localmente

Pré-requisitos: **Node.js 22.5 ou mais recente** (o projeto usa o módulo
`node:sqlite`, disponível a partir dessa versão). Confira com `node -v`.

```bash
npm install
npm run db:migrate  # cria o banco de dados SQLite (data/salao.db) a partir do schema
npm run db:seed     # popula com um salão de demonstração
npm run dev          # inicia o servidor de desenvolvimento
```

Acesse http://localhost:3000 e entre com a conta de demonstração:

- **E-mail**: `demo@salaopro.com`
- **Senha**: `demo123`

Ou crie sua própria conta de salão em `/cadastro`.

## Build de produção

```bash
npm run build
npm run start
```

### Variáveis de ambiente (`.env.local`)

| Variável         | Descrição                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| `SESSION_SECRET`  | Chave usada para assinar o cookie de sessão. Já vem gerada; troque em produção. |
| `COOKIE_SECURE`   | Defina como `true` somente quando o site estiver servido via HTTPS (o cookie de sessão exige HTTPS para ser aceito pelo navegador com essa flag). |

## Estrutura do projeto

```
src/
  app/
    login/            página e server action de login
    cadastro/         cadastro de novo salão (multi-tenant)
    (app)/            área autenticada (layout com menu lateral)
      page.tsx         dashboard
      agenda/          agendamentos
      clientes/        clientes e histórico
      equipe/          profissionais
      servicos/        catálogo de serviços
      financeiro/      lançamentos e comissões
      estoque/         produtos e movimentações
      configuracoes/   dados do salão
  components/          componentes de UI compartilhados
  db/                  schema Drizzle + conexão com o SQLite (node:sqlite)
  lib/                 sessão/autenticação, formatação, DAL
drizzle/
  *.sql                migrações SQL geradas a partir do schema
scripts/
  migrate.ts           aplica as migrações em drizzle/*.sql ao banco local
  seed.ts               script de dados de demonstração
```

> Ao rodar comandos que tocam no banco (`db:migrate`, `db:seed`, `dev`,
> `build`, `start`) você verá um aviso do Node como `ExperimentalWarning:
> SQLite is an experimental feature...`. Isso é apenas informativo — o
> módulo funciona normalmente — e pode ser ignorado.

### Alterando o schema do banco no futuro

Se um dia for preciso adicionar/alterar tabelas em `src/db/schema.ts`, gere
a nova migração SQL com `npx drizzle-kit generate` (isso só analisa os
arquivos TypeScript, não precisa de um driver de banco instalado) e depois
rode `npm run db:migrate` normalmente para aplicá-la.

## Multi-tenant (SaaS)

Todas as tabelas principais possuem `salonId`, e toda consulta ao banco é
filtrada por esse campo a partir da sessão do usuário logado — isso garante
isolamento entre salões diferentes que usam o mesmo sistema. Cada usuário
pertence a exatamente um salão e tem um papel (`owner` ou `staff`).

## Limitações conhecidas / próximos passos sugeridos

- Autenticação é local (e-mail/senha); não há convite de equipe por e-mail
  nem recuperação de senha — pode ser adicionado depois.
- Os horários de agendamento usam o fuso horário do servidor onde a
  aplicação roda (não é feita conversão de fuso horário explícita).
- Pagamentos online, notificações por SMS/WhatsApp e um app para o cliente
  final agendar sozinho ainda não estão implementados, mas a estrutura do
  banco de dados já foi pensada para comportar essas expansões.
- Para uso com muitos salões simultâneos em produção, recomenda-se migrar
  de SQLite para Postgres (a camada `src/db/` foi isolada para facilitar
  essa troca).
# salao-saas
