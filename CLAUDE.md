# Matemática A...Z — Ver para compreender

Apresentação Reveal.js com problemas de Matemática A (secundário, currículo português) e animações p5.js. Texto sempre em português europeu.

## Stack
- Reveal.js 5.1.0, plugin Math (KaTeX) e p5.js 1.9.4, todos via CDN jsDelivr — a apresentação é usada **online** (não descarregar bibliotecas).
- Plugins reveal.js-plugins 4.6.0 (CDN): **chalkboard** (tema `whiteboard`; C = caneta sobre o slide, B = quadro, Del = apagar) e **customcontrols** (botões no canto inferior esquerdo: índice, todos os slides, caneta, quadro, apagar, ecrã inteiro). Ícones Font Awesome 6 (cdnjs).
- Sem build: abrir `index.html` no browser.

## Estrutura dos slides (ordem em `index.html`)
1. **Capa** — faixa escura `.banda` (#170C3A, como as páginas do weblog) com o título "Matemática A...Z" a branco (fonte Jost, 1.7em, tamanho próximo dos títulos do weblog); por baixo, "Problemas selecionados" (mesmo tamanho do h3 "Índice") e a tabela `.ajuda` com os atalhos de teclado.

**Menu do weblog** (`nav.barra-weblog`, fora do `.reveal`): barra fixa no topo igual à do weblog (logótipo, Início, Artigos, Reflexões/Problemas, Software, Apps de Matemática, Matemática A...Z ativo, ícones). O `.reveal` começa abaixo dela (`--barra: 56px`); em ecrã inteiro a barra esconde-se (classe `ecra-inteiro` no `<html>`). Se o menu do weblog mudar, atualizar aqui à mão.
2. **Índice** (`#indice`) — um bloco `.topico` por tópico, com links **Resumo · Problemas**.
3. Por tópico (ex.: Trigonometria, prefixo `trig-`):
   - slides de resumo teórico (`trig-circulo`, `trig-fundamental`, `trig-reducao`) — enunciado/teoria à esquerda, animação à direita (a redução ao 1.º quadrante tem a tabela à esquerda, com a linha do ângulo escolhido destacada pelo sketch `sketches/trigonometria/reducao.js`);
   - slide-lista de problemas (`trig-problemas`);
   - um slide por problema (`trig-p1`, `trig-p2`, …).

## Convenções
- **Numeração dos problemas desde 1** dentro de cada tópico (não usar o n.º do manual); alíneas 1.1, 1.2, …
- **Layout de problema/resumo**: `<section class="sans" data-sketch="...">` com `.problema` = grelha de 2 colunas: `.enunciado` à esquerda, `.animacao` (`.tela` + `.controlos`) à direita. Tudo tem de caber no slide (1600×900).
- Resumo usa também `class="resumo"` (mesma fonte dos problemas, um pouco maior).
- Links de retorno (`a.voltar`): resumo/listas → `#/indice`; problemas → `#/<prefixo>-problemas`.
- **Fontes**: capa e índices em fonte tipo Palatino (`--r-main-font`); resumo e problemas em Source Sans Pro (classe `.sans`). No p5 usar `p.textFont('Source Sans Pro')` (um único nome, sem lista).
- Tema claro (`white`); cores das animações: cosseno azul `#1d4ed8`, seno vermelho `#dc2626`, tangente verde `#059669`, α violeta.

## Sketches p5
- Um ficheiro por problema em `sketches/<tópico>/pN.js`, incluído no fim de `index.html`.
- Registo em modo instância: `SKETCHES['trig-pN'] = function (p, controlos) { ... }` — a chave é igual ao `data-sketch` do slide.
- `js/main.js` cria as instâncias e só faz `loop()` no slide visível.
- Controlos com os helpers `UT.slider`, `UT.botao`, `UT.caixa`, `UT.quebra` (HTML dentro de `.controlos`).
- **Não depender do rato dentro do canvas**: o Reveal escala o slide e as coordenadas do rato no p5 ficam erradas — usar sliders/botões.
- Números com vírgula decimal: `UT.fmt(x, casas)`.
- Problema com várias alíneas visualizadas separadamente → um slide por alínea (`trig-p3a`, `trig-p3b`, …), com todas as alíneas no enunciado e a atual destacada (`ul.condicoes li.atual` / `li.outra`).
- Modelo reutilizável `exploradorK(cfg)` em `sketches/trigonometria/p3.js` para condições com parâmetro k: círculo com arco do domínio + gráfico da expressão em k com faixa de valores admissíveis + eixo de k pintado verde/vermelho + caixa "Mostrar solução".

## Acrescentar
- **Problema**: copiar um `<section>` de problema, mudar `id`/`data-sketch`, criar `sketches/<tópico>/pN.js`, adicionar `<script>` e a linha na lista do tópico.
- **Tópico**: novo prefixo, bloco no `#indice`, slides de resumo, slide-lista de problemas, pasta `sketches/<tópico>/`.

## Verificação
Screenshot headless por slide:
`google-chrome --headless=new --window-size=1600,900 --virtual-time-budget=6000 --screenshot=out.png "file://$PWD/index.html#/trig-p1"`

## Publicação
- Repositório público: https://github.com/karlosgomes/matematica-a-z (ramo `main`).
- GitHub Pages (a partir de `main`, raiz): https://karlosgomes.github.io/matematica-a-z/ — links diretos por slide, ex. `#/trig-p4`.
- Publicar = `git commit` + `git push`; o site atualiza em ~1 min. Pedir confirmação ao utilizador antes de fazer push.
- Enunciados transcritos de manual escolar: o utilizador foi alertado para questões de direitos de autor.
