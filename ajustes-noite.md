# Ajustes das práticas noturnas

## Resultado
- Gratidões independentes de manhã e noite, com múltiplos itens, edição, exclusão, sugestões e histórico paginado por janelas de 14 dias.
- Conclusão da gratidão sincronizada por gatilho: um ou mais itens no dia concluem a prática; apagar o último desmarca.
- Identificador antigo `respiracao_sono` convertido para `meditacao_sono` nos registros e configurações; compatibilidade ao carregar configurações antigas.
- Meditação noturna com durações de 5, 10, 15 e 20 minutos, tipos, orientações, timer e observação diária.
- Checklists e anotações de higiene do sono separados das configurações permanentes e consultados por data local; histórico separado.
- Formulários de diário, gratidão, leitura e meditação reiniciados na mudança do dia local, detectada por visibilidade e verificação de 60 segundos; livros e páginas já lidas são preservados.
- Alterar dormir/acordar recalcula os horários sugeridos.

## Arquivos alterados ou criados
- `src/features/tools/constants.ts`
- `src/features/tools/types.ts`
- `src/features/tools/hooks/usePractices.ts`
- `src/features/tools/hooks/useLocalDay.ts`
- `src/features/tools/hooks/useNightEntry.ts`
- `src/features/tools/hooks/useGratitudeEntries.ts`
- `src/features/tools/practices/GratitudePractice.tsx`
- `src/features/tools/practices/SleepMeditationPractice.tsx`
- `src/features/tools/practices/SleepStepPractice.tsx`
- `src/features/tools/practices/DiaryPractice.tsx`
- `src/features/tools/components/PracticeCard.tsx`
- `src/features/tools/components/PracticeDrawer.tsx`
- `src/features/tools/components/ScheduleConfig.tsx`
- `src/features/tools/components/RoutineBuilder.tsx`
- `src/features/tools/components/SleepWindowCard.tsx`
- `src/pages/Ferramentas.tsx`
- `src/lib/notifications.ts`
- `supabase/functions/send-push/index.ts` (publicada)
- `src/features/tools/nightRules.test.ts`
- `src/features/tools/dayRollover.test.tsx`
- `src/integrations/supabase/types.ts` (regenerado automaticamente)
- `drizzle/migrations/0000_gratitude_entries_by_period.sql` e metadados gerenciados pela ferramenta
- `AGENTS.md`, `roadmap.md` e este relatório

## SQL executado
1. Migração `0000_gratitude_entries_by_period.sql`: tabela de gratidões por período, permissões, proteção dos dados por usuário, índice, atualização de timestamp e sincronização de conclusão. Backfill de `diary_entries.gratitude_text` para manhã, pois esse campo era usado apenas pela tela matinal.
2. Atualizações de dados (não são migrações de estrutura): identificador antigo nos logs diários, lembretes, sonecas, atividades da rotina e configurações/rotinas do perfil; substituição do nome em textos administrativos existentes.
3. Preservação das anotações antigas da gratidão noturna do perfil como um item noturno. Como o campo antigo não guardava uma data própria, foi usada a data local de atualização do perfil disponível no momento da recuperação.

## Validação
- 19 testes aprovados, incluindo conclusão pendente no novo dia para cada uma das oito práticas noturnas, limpeza de checklists/anotações, padrão de duração, limpeza de diário e separação manhã/noite.
- Fluxo autenticado em 360px: inclusão/edição/exclusão de gratidão, campo limpo após salvar, início/pausa de meditação e ausência de rolagem lateral.
- Sem erros de execução no teste final; compilação automática aprovada.
- A virada de dia foi validada nos testes automatizados; não foi concluída a simulação de relógio no navegador.