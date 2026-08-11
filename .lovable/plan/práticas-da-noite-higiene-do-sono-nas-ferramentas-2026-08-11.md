# Práticas da Noite (higiene do sono) nas Ferramentas

Hoje a aba **🌿 Práticas** mostra uma lista única de 8 práticas com horários fixos majoritariamente matinais (06:00–07:30, com Leitura 20:00 e Diário 21:00). A proposta é separar em **Manhã** e **Noite**, criar práticas noturnas voltadas à higiene do sono e calcular os horários a partir da hora de dormir e de acordar do usuário.

## 1. Janela de sono configurável

Um card no topo da aba Práticas com dois campos:
- **Hora de dormir** (padrão 22:30)
- **Hora de acordar** (padrão 06:00)

Mostra as horas totais de sono e um aviso quando ficar abaixo de 7h. Os horários sugeridos de todas as práticas passam a ser derivados dessa janela, com botão "Recalcular horários" (o usuário continua podendo editar cada prática manualmente).

## 2. Novas práticas da noite

| Prática | Horário sugerido (relativo ao dormir) |
|---|---|
| 🌙 Desligar telas | −90 min |
| ☕ Sem cafeína/álcool (checagem) | −6h (lembrete à tarde) |
| 🛁 Ritual de relaxamento (banho morno, alongamento leve) | −60 min |
| 📓 Diário (já existe → passa para Noite) | −50 min |
| 🙏 Gratidão da noite | −40 min |
| 📚 Leitura (já existe → passa para Noite) | −35 min |
| 🧘 Respiração / meditação para dormir | −15 min |
| 🛏️ Ambiente do sono (escuro, silencioso, fresco) | −10 min |

Práticas da manhã continuam as atuais (Oração, Afirmação, Gratidão, Atividade Física, Meditação, Visualização), com horários encadeados a partir da hora de acordar.

## 3. Interface

- Duas seções na aba Práticas: **☀️ Manhã** e **🌙 Noite**, cada uma com sua barra de progresso e contagem própria; o total do dia soma as duas.
- Cada prática noturna abre um painel com orientação curta de higiene do sono e o mesmo botão "Marcar como concluída" já usado nas demais.
- A aba **🔔 Lembretes** passa a listar as práticas agrupadas por período, usando os mesmos horários.
- **📅 Minha Rotina** ganha um template "Rotina Noturna do Sono" gerado a partir da janela de sono.

## Detalhes técnicos

- `src/features/tools/types.ts`: `PracticeId` ganha os novos ids (`telas`, `cafeina`, `relaxamento`, `gratidao_noite`, `respiracao_sono`, `ambiente_sono`); `PracticeMeta` ganha `period: "manha" | "noite"`.
- `src/features/tools/constants.ts`: `PRACTICES` marcado por período, novo `SLEEP_DEFAULTS`, conteúdo de orientação de cada prática noturna e novo template de rotina.
- `src/features/tools/hooks/usePractices.ts`: `defaultConfig()` passa a derivar horários da janela de sono; `sleepWindow` (bedtime/wakeTime) salvo dentro de `profiles.practices_config` — sem migração de banco necessária. Configurações antigas continuam funcionando (merge com o default).
- Novo `SleepWindowCard.tsx` e um componente genérico `SleepPractice.tsx` (checklist + orientação) reutilizado pelas novas práticas noturnas, em vez de 6 arquivos separados.
- `Ferramentas.tsx`: agrupa os cards por período e adiciona os novos drawers.
- `ReminderSettings.tsx`: agrupa por período; as chaves novas gravam normalmente em `practice_configs` (coluna texto livre).
