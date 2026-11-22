/* =====================================================================
   Ligação entre Reveal.js e os sketches p5.js

   Cada sketch regista-se em SKETCHES com:
       SKETCHES.id = function (p, controlos) { ... }
   onde  p          é a instância p5 (modo instância)
         controlos  é o <div class="controlos"> do slide (para sliders/botões)

   O sketch só anima quando o seu slide está visível.
   ===================================================================== */
window.SKETCHES = {};

const instancias = {};

// cria (ou recria, do zero) o sketch de uma secção, parado
function criarSketch(sec) {
	const id = sec.dataset.sketch;
	const tela = sec.querySelector('.tela');
	const controlos = sec.querySelector('.controlos');
	if (instancias[id]) { instancias[id].remove(); tela.innerHTML = ''; controlos.innerHTML = ''; }
	instancias[id] = new p5(p => SKETCHES[id](p, controlos), tela);
	instancias[id].noLoop();
}

function iniciarSketches() {
	document.querySelectorAll('section[data-sketch]').forEach(sec => {
		const id = sec.dataset.sketch;
		const fn = SKETCHES[id];
		if (!fn) { console.warn('Sketch em falta:', id); return; }
		criarSketch(sec);
	});

	// animação escondida ao abrir o problema (data-esconder): o aluno tenta primeiro e só depois a vê
	// (pedido do utilizador, 2026-11-17, problemas do Produto escalar). Escondida, o enunciado ocupa o slide todo;
	// o botão no topo mostra-a (texto encosta à esquerda, animação à direita). Volta a esconder-se ao sair do slide.
	// Ao esconder, a animação volta ao estado inicial e o enunciado fica sem destaques de alíneas
	// (pedido do utilizador, 2026-11-22); ao mostrar, o sketch recriado volta a correr.
	const esconder = (sec, sim) => {
		sec.classList.toggle('so-texto', sim);
		sec.querySelector('.botao-anim').textContent = sim ? '▶ Mostrar a animação' : '✕ Esconder a animação';
		const id = sec.dataset.sketch;
		if (sim) {
			sec.querySelectorAll('.enunciado .atual, .enunciado .outra').forEach(el => el.classList.remove('atual', 'outra'));
			if (id && instancias[id]) criarSketch(sec);
		} else if (id && instancias[id] && sec === Reveal.getCurrentSlide()) instancias[id].loop();
	};
	document.querySelectorAll('section[data-esconder]').forEach(sec => {
		const bt = document.createElement('button');
		bt.type = 'button'; bt.className = 'botao-anim';
		bt.addEventListener('click', e => { e.stopPropagation(); esconder(sec, !sec.classList.contains('so-texto')); });
		sec.appendChild(bt);
		esconder(sec, true);
	});

	const ativar = ({ currentSlide, previousSlide }) => {
		// ao sair de um problema: animação escondida e posta no estado inicial (pedido do utilizador, 2026-11-17)
		if (previousSlide && previousSlide.hasAttribute('data-esconder')) {
			esconder(previousSlide, true);       // também recria o sketch (estado inicial)
		}
		const ant = previousSlide && previousSlide.dataset.sketch;
		const atual = currentSlide && currentSlide.dataset.sketch;
		if (ant && instancias[ant]) instancias[ant].noLoop();
		if (atual && instancias[atual]) instancias[atual].loop();
	};
	Reveal.on('slidechanged', ativar);
	ativar({ currentSlide: Reveal.getCurrentSlide() });

	// devolver o teclado ao Reveal depois de usar um slider
	document.addEventListener('change', e => {
		if (e.target.matches('.controlos input')) e.target.blur();
	});
}

/* ---------- utilitários partilhados pelos sketches ---------- */
const UT = {
	fmt: (x, n = 2) => x.toFixed(n).replace('.', ','),

	// cria um slider com rótulo e valor; devolve o elemento p5
	slider(p, pai, rotulo, min, max, valor, passo) {
		const g = p.createDiv().parent(pai).addClass('grupo');
		p.createSpan(rotulo).parent(g);
		const s = p.createSlider(min, max, valor, passo).parent(g);
		return s;
	},
	botao(p, pai, texto, acao, classe) {
		const b = p.createButton(texto).parent(pai);
		if (classe) b.addClass(classe);
		b.mousePressed(acao);
		return b;
	},
	caixa(p, pai, texto, valor = false) {
		const c = p.createCheckbox(' ' + texto, valor).parent(pai);
		return c;
	},
	quebra(p, pai) { p.createDiv().parent(pai).addClass('quebra'); }
};
