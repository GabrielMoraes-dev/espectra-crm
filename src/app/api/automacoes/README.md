# API de Automações — `/api/automacoes/*`

Camada interna, **somente leitura**, pra ferramentas de automação (OpenClaw, Cowork, futuras integrações) consultarem a operação da Espectra sem acessar o banco direto nem depender da UI do CRM. Nenhuma rota aqui cria, edita ou apaga dado operacional — a única escrita é um log de auditoria best-effort da própria consulta (ver "Auditoria" abaixo).

## Autenticação

```
Authorization: Bearer <AUTOMACAO_SECRET>
```

`AUTOMACAO_SECRET` é uma variável de ambiente própria (configure na Vercel e localmente em `.env.local` — nunca commitada), **separada** de `CRON_SECRET`, justamente pra poder revogar/rotacionar o acesso das automações sem mexer nos crons internos. A comparação é em tempo constante (`crypto.timingSafeEqual`), mesmo padrão já usado pelos webhooks da Cakto/Autentique.

Sem o header, com o header errado, ou mal formado → sempre `401`, sempre a mesma mensagem genérica (não revela se o segredo existe ou por que falhou).

**Token via query string:** não implementado. Foi cogitado pra compatibilidade com o Cowork, mas sem uma limitação real confirmada de que ele não consegue mandar um header `Authorization`. Se essa limitação existir de fato no futuro, dá pra adicionar — mas isso expõe o segredo em logs de acesso/URL history por padrão, então precisa ser uma decisão consciente, não o caminho default.

## Formato de resposta

Sucesso:
```json
{
  "sucesso": true,
  "versao": "1.0",
  "geradoEm": "2026-07-20T12:00:00.000Z",
  "filtros": { "etapa": "NEGOCIACAO" },
  "total": 12,
  "retornado": 12,
  "temMais": false,
  "dados": []
}
```
`total` é a contagem real de linhas que batem com o filtro (não só o que foi devolvido); `retornado` é `dados.length`; `temMais` avisa se `total > retornado` — útil pra automação saber se precisa pedir mais com um `limite` maior, mesmo sem cursor de paginação (ver "Limitações").

`/metricas`, `/health` e a parte de totais de `/financeiro` retornam `dados` como objeto, não array — não têm `total`/`retornado`/`temMais`.

Erro:
```json
{ "sucesso": false, "erro": { "codigo": "PARAMETRO_INVALIDO", "mensagem": "Parâmetro 'limite' deve ser um inteiro positivo." } }
```

Códigos: `NAO_AUTORIZADO` (401), `PARAMETRO_INVALIDO` (400), `ERRO_INTERNO` (500 — nunca inclui stack trace ou mensagem crua do Prisma). Todas as respostas incluem `Cache-Control: private, no-store` (nunca cacheadas por CDN/proxy compartilhado).

Datas de entrada (`desde`, `ate`, `inicio`, `fim`, `prazoAte`) exigem ISO 8601 de verdade (ex: `2026-07-20` ou `2026-07-20T12:00:00Z`) — formatos que o `Date` do JS aceita "por acaso" mas não são ISO 8601 são rejeitados com 400. Um intervalo invertido (`inicio` depois de `fim`, `desde` depois de `ate`) também é 400, não uma lista vazia.

**Filtros contraditórios são rejeitados com 400**, não resolvidos por "o último parâmetro lido vence" — ex: `clientes?status=EM_PRODUCAO&somenteFinalizados=true`, `projetos?status=DESIGN&etapa=REVISAO`, `leads?fechado=true&perdido=true`, `tarefas?status=CONCLUIDA&somenteAtrasadas=true`. A mensagem de erro diz exatamente quais dois parâmetros conflitam.

## Endpoints

### `GET /leads`
Filtros: `etapa`, `origem`, `desde` (createdAt≥), `limite`, `diasNaEtapaMin`, `diasSemInteracaoMin`, `semInteracao`, `fechado`, `perdido`.
Campos: id, nome, etapa, origem, valorEstimado, createdAt, etapaAlteradaEm, diasNaEtapa, ultimaInteracaoEm/Tipo, diasSemInteracao, convertidoEmCliente, links.
**Sem filtro/campo `responsavel`** — `Lead` não tem `responsavelId` no schema (só `Cliente`/`Projeto`/`Tarefa` têm). Ordenado por `etapaAlteradaEm` ascendente (mais parado primeiro), não por mais recente. `fechado`+`perdido` juntos, ou `etapa` incompatível com qualquer um dos dois, voltam 400.
Omitido de propósito: whatsapp, instagram, email, observações.

### `GET /clientes`
Filtros: `status`, `responsavel`, `desde` (dataEntrada≥), `prazoAte`, `somenteFinalizados`, `somenteAtivos`, `pagamentoPendente`, `pesquisaPendente`, `limite`.
Campos: id, nome, status, nicho, cidade/estado, dataEntrada, prazo, responsavel {id,nome}, valorContratado, pagamento {situacao, totalPago, totalPendente}, contratoAssinado (bool), briefingRecebido (bool), situacaoProjeto, notaSatisfacao, ultimaAtividadeEm (via TimelineEvent mais recente), links.
Sempre filtra `deletedAt: null` (lixeira nunca aparece — não configurável). `somenteFinalizados`+`somenteAtivos` juntos, ou `status` incompatível com qualquer um dos dois (ou com `pesquisaPendente`, que já implica `FINALIZADO`), voltam 400.
Omitido: email, telefone, CPF/CNPJ, contrato/briefing completos, arquivos.

### `GET /projetos`
Filtros: `status`/`etapa` (sinônimos — valores diferentes entre os dois voltam 400), `responsavel`, `desde`, `somenteAtrasados`, `prazoAte`, `clienteId`, `limite`.
Campos: id, cliente {id,nome}, status, prazo, diasAtePrazo, responsavel, checklist {concluidos,total}, tarefasPendentes/Atrasadas, updatedAt, links.
**`tarefasPendentes`/`tarefasAtrasadas` refletem as tarefas do CLIENTE do projeto, não do projeto especificamente** — `Tarefa` só se relaciona com `Cliente` no schema, não existe vínculo direto Tarefa↔Projeto. Campo `tarefasEscopo: "cliente"` deixa isso explícito na resposta. Projetos de clientes na lixeira nunca aparecem (Projeto sempre pertence a um Cliente).

### `GET /tarefas`
Filtros: `status`, `prioridade`, `responsavel`, `clienteId`, `desde`, `somenteAtrasadas`, `prazoAte`, `limite`.
Campos: id, titulo, status, prioridade, prazo, diasAtePrazo, responsavel, cliente (se vinculado), createdAt, updatedAt, links. Sem `descricao` (propositalmente). Tarefas de um cliente na lixeira são excluídas; tarefas sem cliente vinculado continuam aparecendo normalmente (o vínculo é opcional). `status=CONCLUIDA` junto com `somenteAtrasadas=true` volta 400 (contraditório).

### `GET /financeiro`
Filtros: `inicio`/`fim` (Pagamento.data / PagamentoSemMatch.createdAt), `pago`, `clienteId`, `formaPagamento`, `somenteSemMatch`, `limite`.
`dados` = `{ pagamentos: [...], semMatch: [...] }`. Cada pagamento: id, cliente, valorBruto (**calculado** a partir do desconto%, não é um valor gravado — pode ter arredondamento), desconto, valorFinal (esse sim é o valor real gravado), pago, formaPagamento, data, links. `semMatch`: id, nome, valor, createdAt, resolvido (sem email/telefone). Pagamentos de clientes na lixeira nunca aparecem.

`pagamentos` e `semMatch` têm paginação **separada** no envelope (`{total, retornado, temMais}` cada) — são duas listas com filtros parcialmente diferentes (`pago`/`clienteId`/`formaPagamento` só existem em `Pagamento`, `PagamentoSemMatch` não tem esses campos por definição). Quando `somenteSemMatch=true`, o bloco `pagamentos` vem `null` (não foi consultado nessa chamada, não é "zero resultados"). `totais` (totalPago/totalPendente/ticketMedio) continua sempre calculado, sempre em BRL, valor decimal (reais, não centavos — mesma convenção do resto do CRM).

### `GET /metricas`
Filtros: `inicio`/`fim` (sem os dois, padrão = últimos 30 dias — `filtros.periodoPadraoAplicado` avisa quando isso aconteceu), `responsavel`, `nicho`.
Retorna **agregados prontos**, não reaproveita o dashboard da UI. Duas famílias de número: `...NoPeriodo` (o que aconteceu na janela `inicio`/`fim`) e `...Atual` (estado agora — não faz sentido escopar por período, ex: clientes ativos). `responsavel`/`nicho` não filtram os números de `leads` (schema não tem esses campos em `Lead`) — filtram tudo o mais, inclusive `satisfacao`. `tempoMedioNaEtapaAtualDias` é o tempo médio que os leads **hoje** em cada etapa estão parados nela — não é histórico real de trânsito por etapa (não existe uma tabela de transições). Clientes na lixeira (e os Pagamentos/Projetos/Tarefas/Pesquisas ligados a eles) são excluídos de todos os números — tarefas sem cliente vinculado continuam contando normalmente.

### `GET /eventos-recentes`
Filtros: `desde`, `ate`, `tipo`, `entidade` (→ entidadeTipo), `limite`.
Fonte: só `ActivityLog` (não junta com `TimelineEvent` — ver "Limitações"). Cada evento vem normalizado: `{ tipo, categoria, resumo, entidadeTipo, entidadeId, ocorridoEm }` — **nunca** o texto livre de `descricao` (pode conter nome/observações não sanitizadas, tratado como não-confiável mesmo sendo texto gerado pelo sistema). **Sem filtro `responsavel`** — `ActivityLog` não guarda quem executou a ação. Nunca inclui os próprios registros de auditoria dessa API (`tipo: automacao_consulta`) — `?tipo=automacao_consulta` explicitamente devolve 400 em vez de vazar esses registros.

### `GET /health`
Requer autenticação, igual aos demais. Retorna `{ status: "ok"|"degradado", bancoConectado, ambiente }`. Nunca retorna: string de conexão, host do banco, nomes de secrets, versões de dependência, contagem de dados.

## Limitações conhecidas (documentadas de propósito, não escondidas)

- **Sem paginação por cursor.** Só `limite` (máximo 200) + `total`/`temMais`. Isso significa que **não há como recuperar registros além dos primeiros 200 de uma mesma consulta** — `temMais=true` acima do limite máximo não tem uma segunda página pra pedir. Pra um CRM de 2 pessoas com dezenas/centenas de registros isso é suficiente hoje; se o volume crescer além de ~200 por entidade, um cursor (`createdAt+id`) precisa ser adicionado.
- **Sem rate limit de verdade.** Serverless na Vercel não tem memória persistente entre invocações, e uma tabela Postgres pra contar requisições adicionaria escrita (e latência) a toda leitura só pra simular um limite que hoje não é necessário (2 consumidores internos conhecidos). A única barreira real de acesso hoje é o `AUTOMACAO_SECRET`. Se ele vazar, o consumidor consegue ler repetidamente até o limite máximo de cada endpoint — trate a rotação do secret como a defesa principal.
- **`ActivityLog.tipo` é texto livre**, sem enum no banco. O mapa de normalização em `src/lib/automacoes/eventos.ts` cobre todo tipo já usado no código hoje (checado via grep, não suposição); tipos futuros não mapeados caem num resumo genérico `"Evento: <tipo>"`. Dois tipos (`projeto`, `tarefa`) cobrem mais de uma ação cada (criação E mudança de status/conclusão) — a API não tenta distinguir os dois automaticamente.
- **`eventos-recentes` não junta `TimelineEvent`.** Os marcos comerciais que ele registra (pagamento, contrato assinado, cliente virou X) já aparecem via `ActivityLog` com um `tipo` estruturado; juntar as duas fontes duplicaria informação sem ganho real hoje.
- **`Lead` não tem responsável nem nicho no schema.** Esses filtros/campos simplesmente não existem pra Lead nos endpoints acima — se precisar rastrear isso no futuro, precisaria de uma migration adicionando `responsavelId`/`nicho` ao model `Lead`.
- **Nenhum endpoint tem link de "abrir o registro" pra Lead/Projeto/Tarefa.** Só `Cliente` tem página própria (`/clientes/[id]`) hoje — os outros usam um painel client-side sem rota por id. `links.registro` só existe pra Cliente; os demais recebem `links.lista` (ou `links.clienteRelacionado`, quando o registro pertence a um cliente).

## Auditoria

Cada chamada **autenticada com sucesso** gera **uma** entrada em `ActivityLog` (`tipo: "automacao_consulta"`, `entidadeTipo: "automacao"`, `entidadeId: <nome do endpoint>`), com `descricao` contendo só: endpoint, consumidor/rotina (se informados via `?consumidor=`/`?rotina=`), sucesso/falha, quantidade de registros retornados, duração aproximada em ms. **Nunca** grava o token, o header `Authorization`, a URL completa ou qualquer dado pessoal. É best-effort — se a gravação falhar, a leitura em si não é afetada (só loga no console do servidor).

**Requisições sem autenticação válida (401) nunca geram entrada de auditoria** — de propósito: como essa rota é pública no proxy (autenticação própria via Bearer, não cookie de sessão) e não tem rate limit, registrar tentativas não autenticadas permitiria qualquer pessoa, mesmo sem o segredo, inflar o `ActivityLog` indefinidamente.

`consumidor`/`rotina`: string opcional, só letras/números/`-`/`_`, até 40 caracteres. Fora desse formato, o valor é silenciosamente ignorado na auditoria (não derruba a consulta).

## Configuração

1. Gere um segredo forte (ex: `openssl rand -base64 32`) e configure `AUTOMACAO_SECRET` no `.env.local` (dev) e nas variáveis de ambiente da Vercel (produção) — nunca no código, nunca no `.env.example`.
2. Pra revogar o acesso, troque o valor da variável e faça redeploy — todos os consumidores atuais param de autenticar imediatamente.

## Testando localmente

```bash
curl -s http://localhost:3000/api/automacoes/health \
  -H "Authorization: Bearer $AUTOMACAO_SECRET"

curl -s "http://localhost:3000/api/automacoes/leads?limite=5&diasNaEtapaMin=3" \
  -H "Authorization: Bearer $AUTOMACAO_SECRET"
```

## Consumindo (OpenClaw / Cowork)

Requisição HTTP simples, GET, header `Authorization: Bearer <token>`, resposta JSON no envelope acima. `/metricas` é o ponto de partida mais barato pra qualquer resumo/relatório (poucos números, sem precisar ler registro por registro); `/eventos-recentes` responde "o que mudou desde X"; os demais servem pra follow-up/detalhe operacional. Nenhuma rota aceita `POST`/`PUT`/`DELETE` — qualquer ação que mude dado continua exclusivamente pela UI/Server Actions do CRM.

## Próximos passos possíveis (não implementados agora)

- Cursor de paginação, se o volume de dados crescer muito.
- Segredos por consumidor (`AUTOMACAO_OPENCLAW_SECRET`, `AUTOMACAO_COWORK_SECRET`) em vez de um único `AUTOMACAO_SECRET` global, se um dia for necessário revogar o acesso de um consumidor sem afetar o outro.
- Um índice em `ActivityLog(createdAt)` — hoje essa tabela não tem índice nesse campo apesar de ser ordenada por ele em toda consulta (inclusive na página /atividades já existente); exigiria uma migration, fora do escopo desta tarefa.
