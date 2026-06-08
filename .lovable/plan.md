## Rotina diária às 08:00 — daily_checks

Vamos implementar um cron job interno no backend (Lovable Cloud) que roda todos os dias às 08:00 e garante que a tabela `daily_checks` contenha exatamente 1 registro com o dia atual em formato ISO (`AAAA-MM-DD`).

Como a aplicação é client-side (React/Vite), o agendamento não pode viver no frontend (não roda 24/7). Usaremos os recursos nativos do backend já disponíveis: **pg_cron + pg_net + Edge Function**. Isso continua funcionando mesmo após reinicializações e sem depender de serviços externos.

### 1. Migração — criação da tabela

Criar `public.daily_checks`:

- `id` uuid PK default `gen_random_uuid()`
- `current_day` date not null unique
- `created_at` timestamptz default `now()`

Configuração de acesso:
- GRANT para `authenticated` (leitura) e `service_role` (tudo)
- RLS habilitado
- Política: qualquer usuário autenticado pode ler; escrita apenas via `service_role` (edge function)

### 2. Edge Function — `daily-check`

`supabase/functions/daily-check/index.ts` usando o client com `SUPABASE_SERVICE_ROLE_KEY`:

1. Calcular o dia atual em ISO (`AAAA-MM-DD`) no fuso `America/Sao_Paulo`.
2. `DELETE FROM daily_checks` (apaga tudo — sempre mantém apenas 1 registro).
3. `INSERT` do novo registro com `current_day = hoje`.
4. Usar `ON CONFLICT (current_day) DO NOTHING` como salvaguarda contra execuções duplicadas.
5. Retornar JSON `{ ok: true, current_day }` com CORS.
6. Logs claros em cada etapa.

### 3. Agendamento — pg_cron + pg_net

Habilitar extensões `pg_cron` e `pg_net` e registrar o job (via insert SQL — contém URL/anon key específicos do projeto e não deve virar migração compartilhada):

```text
cron.schedule(
  'daily-check-0800',
  '0 11 * * *',  -- 08:00 BRT = 11:00 UTC
  net.http_post(url, headers, body)
)
```

A função será chamada via HTTP POST diariamente. Se já houver job com o mesmo nome, fazemos `cron.unschedule` antes para evitar duplicidade.

### 4. Comentários no código

Cada etapa (cálculo da data, delete, insert, tratamento de erro) terá comentários em português explicando o funcionamento, conforme solicitado.

### Detalhes técnicos

- Fuso horário do "08:00": confirmar abaixo (assumindo Brasil/São Paulo por padrão).
- A função roda com `verify_jwt = false` (padrão Lovable) e valida internamente que a chamada veio do cron via header `apikey`.
- Não é necessário código no frontend — é uma rotina puramente de backend.

### Pergunta antes de implementar

Confirmar: o "08:00" é horário de **Brasília (America/Sao_Paulo)**, certo? Se for UTC ou outro fuso, ajusto o cron expression.
