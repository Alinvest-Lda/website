# ALINVEST — Website institucional

Website institucional responsivo para capacitação e desenvolvimento profissional, orientado ao mercado moçambicano e preparado para comunicar com potenciais clientes internacionais.

## Estrutura
- `index.html` — página institucional completa, CSS responsivo e interacções JavaScript sem dependências externas.
- `assets/alinvest-logo.svg` — variante principal do logótipo para fundos claros.
- `assets/alinvest-logo-white.svg` — variante branca para utilização em fundos escuros.
- Navegação responsiva com menu móvel.
- Secções de apresentação, seis áreas de actuação, abordagem, metodologia, chamada para empresas e formulário de contacto.
- Metadados SEO básicos, Open Graph, estados de foco visíveis, campos identificados e mensagens acessíveis.

## Áreas de actuação
1. Normas ISO
2. SSHE / HST
3. Recursos Humanos
4. Finanças
5. Governança
6. Gestão de Riscos e Compliance

## Identidade visual
Paleta baseada nos ficheiros de referência fornecidos:
- Azul-marinho: `#061833`
- Cinzento-azulado: `#44546A`
- Fundos claros: `#F7F8FA` e branco

Os logótipos SVG actuais são versões vectoriais reconstruídas para uso no website, não cópias exactas dos ficheiros PNG fornecidos. Substituí-los pelos ficheiros oficiais quando necessário para garantir fidelidade tipográfica e de proporções.

## Contacto e formulário
- Email institucional: `info@alinvest-group.com`.
- WhatsApp: `+258 85 165 8131` (`https://wa.me/258851658131`).
- Instagram: `@alinvest.lda` (`https://www.instagram.com/alinvest.lda/`).
- Facebook: `alinvest.lda` (`https://www.facebook.com/alinvest.lda`).
- O email está visível na secção de contacto e no rodapé, com ligações `mailto:`.
- O formulário valida os campos e abre uma mensagem no programa de email do visitante, com o destinatário, assunto e dados preenchidos. O visitante tem de confirmar o envio no seu próprio programa.
- Não existe backend nem armazenamento automático de pedidos nesta versão.

## Checklist antes do lançamento
- Confirmar e integrar a versão oficial do logótipo.
- Configurar o email de destino e testar o fluxo de contacto.
- Rever juridicamente a política de privacidade em `politica-de-privacidade.html` e ajustá-la às práticas reais da organização.
- Confirmar os contactos oficiais e a informação institucional publicada.
- Testar em navegadores e dispositivos reais.
- Confirmar qualquer referência a acreditações ou certificações antes de a publicar.

## Desenvolvimento
Website estático sem dependências de build. Abrir `index.html` num navegador para pré-visualizar. Para publicação em subcaminho, rever os caminhos absolutos dos recursos antes do deploy.
