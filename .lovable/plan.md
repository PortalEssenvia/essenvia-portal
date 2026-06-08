## Problema

No topo da home (antes do scroll), o header é transparente sobre a imagem escura do herói. Os textos do menu, logo "NOVA ESSENVIA" e o botão "Olá, Carlos" usam `text-verde-profundo` (verde escuro), ficando ilegíveis contra o fundo escuro.

## Solução

Tornar o header adaptativo: claro quando sobre o herói (topo da página), e mantém o estilo atual (bege com texto verde) após o scroll.

### Mudanças em `src/components/layout/Header.tsx`

1. **Estado `scrolled` já existe** — usá-lo para alternar cores.
2. **Logo texto "NOVA ESSENVIA"**: `text-verde-profundo` quando scrolled, `text-bege-claro` (com leve drop-shadow) quando no topo.
3. **Links de navegação**:
   - Topo: `text-bege-claro` com hover `text-dourado-claro`; ativo `text-dourado-claro`.
   - Scrolled: comportamento atual (verde-profundo / dourado).
4. **Botão "Olá, {nome}"** (dropdown trigger):
   - Topo: borda `border-dourado-claro`, texto `text-bege-claro`, hover `bg-bege-claro/10`.
   - Scrolled: estilo atual.
5. **Ícone do menu mobile**: mesma lógica de cor.
6. **Sombra sutil** no texto claro (`drop-shadow-sm`) para legibilidade sobre fotos variadas.
7. Adicionar uma leve faixa de gradiente no topo (`bg-gradient-to-b from-black/20 to-transparent`) apenas quando não-scrolled, para reforçar contraste sem cobrir a imagem.

### Sem mudanças

- Tokens de design (`index.css`, `tailwind.config.ts`) permanecem iguais.
- Layout/estrutura, rotas, lógica de auth — intactos.
- Header continua fixo e com mesma altura.

## Resultado

Topo da página: menu e logo legíveis em bege claro sobre o herói. Após rolar, o header volta ao fundo bege com texto verde-profundo como hoje.
