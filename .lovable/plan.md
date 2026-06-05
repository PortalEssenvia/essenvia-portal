## Objetivo
No modal de vídeo da página Conteúdos, esconder todos os controles/branding do YouTube (play/pause, barra de progresso, título, logo YouTube, "Mais vídeos", botão de inscrever-se, etc.) e exibir apenas um botão "Fechar" (X) controlado por nós.

## Mudanças

### 1. `src/lib/youtube.ts`
Atualizar `youtubeEmbed()` para acrescentar parâmetros que removem ao máximo a UI do YouTube:
- `controls=0` — esconde barra de controles
- `modestbranding=1` — remove logo do YouTube na barra
- `rel=0` — não sugere vídeos relacionados de outros canais
- `showinfo=0` — legacy, ainda ajuda em alguns clientes
- `iv_load_policy=3` — remove anotações
- `disablekb=1` — desabilita teclado
- `fs=0` — esconde botão fullscreen
- `playsinline=1` — evita fullscreen automático no iOS
- `autoplay=1&mute=0` — mantém autoplay (autoplay com som pode ser bloqueado pelo navegador; se necessário entraremos com `mute=1` + botão custom de som — ver "Observação" abaixo)

### 2. `src/pages/Conteudos.tsx`
No `<DialogContent>` do modal:
- Adicionar um botão "Fechar" customizado (ícone X) posicionado no canto superior direito, fora da área do iframe (ou sobreposto com z-index alto), que chama `setActive(null)`.
- Esconder o botão `X` padrão do `DialogContent` do shadcn (já existe um — vamos manter ou estilizar; se duplicar, sobrescrevemos com CSS/classe).
- Envolver o `<iframe>` numa div com `pointer-events-none` opcional? **Não** — isso bloquearia o áudio/play. Em vez disso, sobrepor uma camada transparente (`absolute inset-0`) acima do iframe para capturar/ignorar cliques do usuário no player, evitando que ele interaja com a área que faria os controles aparecerem ao mover o mouse. Essa camada pode ter `pointer-events: auto` apenas para "comer" hover/clicks. Como `controls=0`, mesmo sem essa camada os botões já não aparecem — então a camada é opcional e só será adicionada se observarmos resíduos visuais.

## Observação importante
Com `controls=0` o YouTube **não exibe** play/pause, barra de progresso, volume, CC, settings, fullscreen, título, "Mais vídeos" nem o botão YouTube no canto. É exatamente o que o usuário pediu. O vídeo toca automaticamente (autoplay) e o único controle é o botão "Fechar" que adicionaremos.

Limitação técnica: o YouTube não permite ocultar 100% via querystring em todos os navegadores móveis (especialmente iOS Safari). Para esses casos a camada transparente acima resolve.

## Arquivos afetados
- `src/lib/youtube.ts` — atualizar parâmetros do embed
- `src/pages/Conteudos.tsx` — botão de fechar customizado + camada de bloqueio de hover
