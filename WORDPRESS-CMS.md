# WordPress CMS — ALINVEST

O site está preparado para carregar páginas editoriais e publicações do WordPress pela REST API pública. Enquanto o endereço do WordPress não estiver configurado, o site mantém o conteúdo estático de reserva.

## 1. Ligar o WordPress
1. Configure um WordPress com HTTPS e REST API pública activa.
2. Em `assets/js/cms-config.js`, altere `apiBase` para o domínio raiz do WordPress, sem barra final (ex.: `https://cms.exemplo.co.mz`).
3. Faça deploy. Não é necessário token para páginas e artigos publicados publicamente; não coloque credenciais privadas neste ficheiro.

## 2. Áreas editáveis na página inicial
Crie/publice páginas WordPress com estes slugs exactos. O conteúdo publicado substitui o bloco correspondente na homepage:

- `home-hero` — título, texto e botões do hero.
- `home-areas-intro` — título e texto introdutório das áreas de actuação.
- `home-areas` — cartões das áreas de actuação.
- `home-programas-intro` — título e texto dos programas.
- `home-programas` — cartões de capacitação.
- `home-solucoes-intro` — introdução das soluções empresariais.
- `home-solucoes-titulo` — cabeçalho “Áreas de apoio”.
- `home-solucoes` — ISO Performance, SSHE/HST e outras soluções.
- `home-cta` — chamada para acção.
- `home-blog-intro` — título e texto do blog/notícias.
- `home-contactos-intro` — texto introdutório da secção de contactos.
- `home-rodape` — descrição institucional do rodapé.

Para conservar o desenho, escreva cada página com blocos HTML que mantenham as classes e a estrutura do bloco actualmente apresentado. O conteúdo só é substituído quando a página está publicada; páginas em rascunho não alteram o site.

## 3. Blog e notícias
Todos os posts WordPress publicados aparecem num único feed na homepage, ordenados pelo WordPress. Configure a imagem destacada, título, excerto, categoria e link para cada publicação. O número de publicações é definido por `postsPerPage` em `cms-config.js` (máximo visual de 12).

## 4. Importante
- A integração está preparada, mas não fica activa até ser indicado o endereço real do WordPress em `apiBase`.
- A REST API e os conteúdos públicos têm de estar acessíveis pelo navegador; se o WordPress bloquear CORS, configure CORS no WordPress para permitir o domínio público do site.
- O conteúdo estático de reserva mantém a homepage funcional em caso de indisponibilidade da API.
- Não coloque chaves privadas, dados pessoais ou conteúdo confidencial nas páginas públicas.
