## Visão geral

Crio uma área `/admin` protegida por role `admin`, com um painel lateral para editar todo o conteúdo dinâmico do site. As páginas públicas passam a ler do banco. Vídeos do YouTube abrem em modal embedado.

## Banco de dados (1 migração)

**Tabela `user_roles`** + enum `app_role` + função `has_role(uuid, app_role)` (security definer) — padrão recomendado, evita recursão de RLS.

**Tabela `site_content`** — chave/valor genérico para textos das páginas
- `page` (home, metodo, programas, cursos, comunidade)
- `section_key` (ex: hero_title, hero_subtitle, cta_text)
- `value` (texto)
- Único por (page, section_key)
- RLS: leitura pública, escrita só admin

**Tabela `blog_posts`**
- title, category, summary, sort_order, published
- RLS: leitura pública (published=true), escrita só admin

**Tabela `videos`**
- title, youtube_url, sort_order, published
- RLS: leitura pública, escrita só admin

**Tabela `testimonials`**
- name, role, content, avatar_url, sort_order, published
- RLS: leitura pública, escrita só admin

Seed inicial com os dados já existentes em `Conteudos.tsx`, `Depoimentos.tsx`, etc.

## Frontend

**Proteção**
- `useIsAdmin()` hook (consulta `has_role`)
- `<AdminRoute>` que redireciona não-admins para `/`

**Layout admin** (`/admin/*`)
- Sidebar (shadcn) com itens: Páginas, Blog, Vídeos, Depoimentos
- Header com voltar ao site + sair

**Páginas admin**
- `/admin` → dashboard simples
- `/admin/paginas` → editor por página (Home, Método, Programas, Cursos, Comunidade): formulários com inputs/textareas por section_key, salvar com toast
- `/admin/blog` → lista + form (criar/editar/remover) com título, categoria (select), resumo, ordem, publicado
- `/admin/videos` → lista + form com título, URL do YouTube, ordem; valida URL e extrai videoId
- `/admin/depoimentos` → lista + form

**Páginas públicas atualizadas**
- `Conteudos.tsx`: lê `blog_posts` e `videos` do banco; vídeos abrem em **modal com iframe** do YouTube (embed)
- `Depoimentos.tsx`: lê `testimonials`
- `Home/Metodo/Programas/Cursos/Comunidade`: textos principais vêm de `site_content` com fallback aos atuais

**Header**
- Item "Admin" aparece no menu dropdown apenas se usuário tem role admin

## Como te tornar admin

Após a migração, rode no banco:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('<seu-user-id>', 'admin');
```
Posso fazer isso por você se me passar seu e-mail logado.

## Escopo desta entrega

Foco no MVP funcional: CRUD completo das 4 áreas + edição de textos-chave das páginas principais + modal de vídeo. Não inclui upload de imagens (capa de blog, avatares) — fica como próximo passo se quiser.