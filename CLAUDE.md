# Matemática A...Z — Ver para compreender

Apresentação Reveal.js com problemas de Matemática A (secundário, currículo português) e animações p5.js. Texto sempre em português europeu.

## Stack
- Reveal.js 5.1.0, plugin Math (KaTeX) e p5.js 1.9.4, todos via CDN jsDelivr — a apresentação é usada **online** (não descarregar bibliotecas).
- Plugins reveal.js-plugins 4.6.0 (CDN): **chalkboard** (tema `whiteboard`; C = caneta sobre o slide, B = quadro, Del = apagar) e **customcontrols** (botões no canto inferior esquerdo: índice, todos os slides, caneta, quadro, apagar, ecrã inteiro). Ícones Font Awesome 6 (cdnjs).
- Sem build: abrir `index.html` no browser.

## Estrutura dos slides (ordem em `index.html`)
1. **Índice** (`#indice`, 1.º slide desde 2026-11-15, pedido do utilizador: a apresentação abre logo com o índice; a antiga capa «Problemas selecionados» saiu) — a faixa escura com o título "Matemática A...Z" é `div.faixa-capa`, **fora do `.reveal`** (para não ser escalada): mesmas medidas do weblog (Jost 600 34px, faixa 126px, alinhada como a coluna do weblog) e só visível no 1.º slide (classe `na-capa` no `<html>`, função `atualizarCapa()` que também ajusta o `padding-top` do índice; o índice tem a classe `capa`). Um bloco `.topico` por tópico, com links **Resumo · Problemas**, e por baixo a tabela `.ajuda` com os atalhos de teclado. O botão «Índice» (customcontrols) faz `Reveal.slide(0)`. O MACS A...Z (`~/site/macs-a-z`) segue o mesmo modelo.

**Menu do weblog** (`nav.barra-weblog`, fora do `.reveal`): barra fixa no topo igual à do weblog (logótipo, Início, Artigos, Reflexões/Problemas, Software, Apps de Matemática, Matemática A...Z ativo, MACS A...Z (2026-11-15), ícones). O `.reveal` começa abaixo dela (`--barra: 62px`, como no weblog); em ecrã inteiro a barra esconde-se (classe `ecra-inteiro` no `<html>`). Se o menu do weblog mudar, atualizar aqui à mão. **Sem modo escuro, de propósito** (decisão de 2026-10-12): a apresentação é para projetar e fica sempre clara; o menu e a faixa já são sempre #170C3A.
2. Por tópico (ex.: Trigonometria, prefixo `trig-`):
   - slide de abertura do capítulo (`section.capitulo`, id = prefixo: `#/trig`, `#/pe`), com «Capítulo n» e o nome ao centro (pedido do utilizador, 2026-11-15: quem anda só com → tem de ver que mudou de capítulo); tópico novo → acrescentar um igual antes do primeiro resumo;
   - slides de resumo teórico (`trig-circulo`, `trig-fundamental`, `trig-reducao`) — enunciado/teoria à esquerda, animação à direita (a redução ao 1.º quadrante tem a tabela à esquerda, com a linha do ângulo escolhido destacada pelo sketch `sketches/trigonometria/reducao.js`);
   - **navegação em 2D** (pedido do utilizador, 2026-11-15): a abertura e os resumos seguem para a direita; o último resumo, a lista de problemas e os problemas formam uma pilha vertical (`<section>` exterior sem id à volta de `trig-reducao`, `trig-problemas`, `trig-p1`…) — os problemas seguem para baixo, e → passa ao capítulo seguinte. Os links por id (`#/trig-p4`) continuam a funcionar. No Produto escalar ainda não há pilha (sem problemas): quando houver, envolver `pe-espaco` + `pe-problemas` + problemas da mesma maneira;
   - slide-lista de problemas (`trig-problemas`), em duas colunas (`div.indice.largo` + `ol.duas-colunas`; as fórmulas não se partem);
   - um slide por problema (`trig-p1`, `trig-p2`, …).

3. **Produto escalar** (prefixo `pe-`, 2026-11-15): só resumo por agora — `pe-definicao` (u·v nas coordenadas; arrastam-se as pontas de u e v, sem cursores; etiquetas pequenas com as coordenadas junto do nome, sem linhas auxiliares; ângulo θ na cor do sinal), `pe-angulo` (u·v = ‖u‖‖v‖cos θ, sinal, projeção H; u e v arrastam-se pelas pontas — direção ao grau, norma de 0,1 em 0,1, entre 0,5 e 5,5 —, sem cursores; «Rodar v» a 70°/s), `pe-retas` (declive, inclinação, ângulo de duas retas, perpendicularidade; retas por P(1, 2)), `pe-espaco` (vetor normal, plano, posição reta/plano e plano/plano; 3D à mão, mas em **perspetiva** — `pr` com o olho a `DIST` = 19 da origem, e as partes escondidas por raio até ao olho — e a vista roda só arrastando, sem cursores, pedido do utilizador 2026-11-15). Sketches em `sketches/produto-escalar/` (definicao.js, angulo.js, retas.js, espaco.js). Cores como na app Produto escalar: u `#1565c0`, v `#7b1fa2`, sinal verde `#2e7d32` / laranja `#ef6c00` / vermelho `#d32f2f`, reta r `#e65100`. Problemas (2026-11-15, «para já» os 9 «Problemas adaptados» da Parte II da ficha 2 do produto escalar, ~/MAT_A_26_27/geometria/fichas/partes/pe2_parte4a/4b.tex): lista `pe-problemas` e `pe-p1`…`pe-p8` — ordem pedida pelo utilizador: primeiro os do plano (2D), do mais simples para o mais difícil (1 ângulo de retas, 2 projeção, 3 hexágono, 4 trapézio, 5 circunferência, 6 desafio), depois os 3D (7 reta e xOy, 8 tabela); o antigo Problema 1 (reta ⊥ vetor) saiu a pedido do utilizador em 2026-11-17 e os outros foram renumerados (também as alíneas: 3.1, 4.1, 8.1…, e os botões «Soma (3.1)»/«Ângulo (3.2)» do p3.js) — (sketches `p1.js`…`p8.js`). **Animação escondida ao abrir** (2026-11-17): as secções dos problemas têm `data-esconder`; `js/main.js` põe por cima da `.animacao` uma capa «Tenta resolver primeiro!» com o botão «Mostrar a animação» (classe `oculta`); depois de mostrada, o botão «Esconder a animação» (por cima da animação, à esquerda do «↩ problemas») volta a escondê-la; ao sair do slide fica escondida outra vez; usar `data-esconder` também em problemas novos, na pilha vertical por baixo de `pe-espaco`; escolha múltipla em `p.opcoes` (um `<span>` por opção; `.duas` = grelha de 2 colunas), tabela `table.produtos`, `section.compacto` para enunciados longos (letra 0,78em). Em todos, a resposta só aparece com «Mostrar a solução» (ou por passos, no 9), desligada ao início; arrastam-se pontos em vez de cursores. Cada resumo tem um link de apoio para a app no modo respetivo, sempre com `&texto` (ou `#texto`) para a app abrir com o texto da esquerda à vista. Nos textos KaTeX dos vetores coloridos usar `\textcolor{…}{\vec u}` (não `\color`).

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
- **Não depender do rato dentro do canvas**: o Reveal escala o slide e as coordenadas do rato no p5 ficam erradas — usar sliders/botões. Exceção 2 (pe-definicao, 2026-11-15): arrastar pontos é possível convertendo o ponteiro com `canvas.getBoundingClientRect()` (x·W/largura do retângulo), com `stopPropagation` para o Reveal não mudar de slide — ver `arrastar()` em `sketches/produto-escalar/definicao.js`. Exceção: arrastar para rodar uma vista (só os deslocamentos do ponteiro, com eventos `pointer*` nativos no canvas e `touch*` com `stopPropagation`; ver `arrastar()` em `p10.js`).
- Números com vírgula decimal: `UT.fmt(x, casas)`.
- Problema com várias alíneas visualizadas separadamente → um slide por alínea (`trig-p3a`, `trig-p3b`, …), com todas as alíneas no enunciado e a atual destacada (`ul.condicoes li.atual` / `li.outra`).
- Figuras 3D (ex.: `sketches/trigonometria/p10.js`, a Terra): projeção ortogonal feita à mão no canvas 2D (`camara()`/`pr()`), sem WEBGL (assim o texto continua em Source Sans Pro); linhas da frente a cheio e de trás a tracejado, como nas figuras do manual; a vista roda com cursores «Rodar a vista» e «Inclinação» ou arrastando com o rato/dedo.
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
