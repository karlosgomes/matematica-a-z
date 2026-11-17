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

function iniciarSketches() {
	document.querySelectorAll('section[data-sketch]').forEach(sec => {
		const id = sec.dataset.sketch;
		const fn = SKETCHES[id];
		if (!fn) { console.warn('Sketch em falta:', id); return; }
		const tela = sec.querySelector('.tela');
		const controlos = sec.querySelector('.controlos');
		instancias[id] = new p5(p => fn(p, controlos), tela);
		instancias[id].noLoop();
	});

	// animação escondida ao abrir o problema (data-esconder): o aluno tenta primeiro e só depois a vê
	// (pedido do utilizador, 2026-11-17, problemas do Produto escalar); volta a esconder-se ao sair do slide
	document.querySelectorAll('section[data-esconder] .animacao').forEach(an => {
		const capa = document.createElement('div');
		capa.className = 'capa-anim';
		capa.innerHTML = '<p>Tenta resolver primeiro!</p><button type="button">Mostrar a animação</button>';
		capa.querySelector('button').addEventListener('click', e => { e.stopPropagation(); an.classList.remove('oculta'); });
		an.appendChild(capa);
		// botão para voltar a esconder (canto superior direito da animação)
		const esc = document.createElement('button');
		esc.type = 'button'; esc.className = 'esconder-anim'; esc.textContent = 'Esconder a animação';
		esc.addEventListener('click', e => { e.stopPropagation(); an.classList.add('oculta'); });
		an.appendChild(esc);
		an.classList.add('oculta');
	});

	const ativar = ({ currentSlide, previousSlide }) => {
		if (previousSlide && previousSlide.hasAttribute('data-esconder'))
			previousSlide.querySelector('.animacao').classList.add('oculta');
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
