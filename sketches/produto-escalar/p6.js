/* =====================================================================
   Produto escalar · Problema 6 — trapézio isósceles [ABCD]
   B(−2, 0), C(2, 0), A(−1, h), D(1, h). Arrasta-se o lado [AD] na vertical (altura h);
   AB + AC construído a partir de A (paralelogramo esbatido) e ‖AB + AC‖ em tempo real,
   com íman em h = 2 (‖AB + AC‖ = 2√5). Caixa «Diagonais»: AC, BD e o ângulo entre elas.
   ===================================================================== */
SKETCHES['pe-p6'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 560, y: 300 }, K = 85;
	const HMIN = 0.6, HMAX = 3.2;
	const COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], u: [21, 101, 192], v: [123, 31, 162], soma: [0, 131, 143],
		bd: [109, 76, 65], pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47], texto: [30, 41, 59], cinza: [100, 116, 139]
	};
	const st = { h: 1.2, alvo: null };
	let agarrado = false, cxDiag, cxSol;
	let al = 0, itens = [];
	const botoes = {};

	const X = x => O.x + x * K, Y = y => O.y - y * K;

	p.setup = function () {
		arrastar(p.createCanvas(W, H).elt);
		p.textFont('Source Sans Pro');
		p.createSpan('Arrasta o lado [AD] para cima ou para baixo ·').parent(controlos).addClass('dica-arrastar');
		botoes[1] = UT.botao(p, controlos, '6.1', () => escolher(al === 1 ? 0 : 1), 'atalho');
		botoes[2] = UT.botao(p, controlos, '6.2', () => escolher(al === 2 ? 0 : 2), 'atalho');
		UT.botao(p, controlos, 'Início', () => { escolher(0); st.alvo = 1.2; }, 'atalho');
		UT.quebra(p, controlos);
		cxDiag = UT.caixa(p, controlos, 'Diagonais', false);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) st.alvo = 2; });
		itens = [...controlos.closest('section').querySelectorAll('.item-al')];
	};
	// alínea escolhida: botão azul e destaque no enunciado (2026-11-22); 6.1 a soma, 6.2 as diagonais
	function escolher(a) {
		al = a;
		Object.entries(botoes).forEach(([k, b]) => +k === al ? b.removeClass('atalho') : b.addClass('atalho'));
		itens.forEach((el, i) => { el.classList.toggle('atual', al === i + 1); el.classList.toggle('outra', al !== 0 && al !== i + 1); });
		if (al) { cxDiag.checked(al === 2); st.alvo = 2; }
	}

	// arrastar o lado [AD] (ponteiro convertido com o retângulo do canvas, que o Reveal escala)
	function arrastar(cv) {
		cv.style.touchAction = 'none';
		const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		const perto = (x, y) => x > X(-1) - 26 && x < X(1) + 26 && Math.abs(y - Y(st.h)) < 22;
		cv.addEventListener('pointerdown', e => {
			const [x, y] = pos(e);
			if (!perto(x, y)) return;
			agarrado = true; st.alvo = null;
			cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault();
		});
		cv.addEventListener('pointermove', e => {
			const [x, y] = pos(e);
			if (!agarrado) { cv.style.cursor = perto(x, y) ? 'ns-resize' : 'default'; return; }
			let h = p.constrain((O.y - y) / K, HMIN, HMAX);
			if (Math.abs(h - 2) < 0.08) h = 2;                       // íman em h = 2
			st.h = Math.round(h * 100) / 100;
		});
		const fim = () => { agarrado = false; cv.style.cursor = 'default'; };
		cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
		['touchstart', 'touchmove'].forEach(t => cv.addEventListener(t, e => e.stopPropagation(), { passive: true }));
	}

	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	function nomeVetor(l, x, y, cor, tam = 24) {
		rot(l, x, y, cor, tam, p.CENTER, p.BOLDITALIC);
		const w = p.textWidth(l), yy = y - tam * 0.66;
		p.stroke(...cor); p.strokeWeight(2); p.line(x - w * 0.5, yy, x + w * 0.5, yy);
		p.noStroke(); p.fill(...cor); p.triangle(x + w * 0.5 + 4, yy, x + w * 0.5 - 3 - 1, yy - 5.5, x + w * 0.5 - 3, yy);
	}
	function seta(x1, y1, x2, y2, cor, peso = 4, alfa = 255) {
		p.stroke(...cor, alfa); p.strokeWeight(peso); p.line(x1, y1, x2, y2);
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...cor, alfa); p.triangle(0, 0, -18, -7, -18, 7); p.pop();
	}
	function linha(pecas, x, y, tam = 22) {
		p.textSize(tam); p.textAlign(p.LEFT, p.CENTER); p.noStroke();
		for (const [t, cor, est, vec] of pecas) {
			const c = cor || COR.texto;
			p.textStyle(est || p.NORMAL); p.fill(...c); p.text(t, x, y);
			const w = p.textWidth(t);
			if (vec) {
				const yy = y - tam * 0.62;
				p.stroke(...c); p.strokeWeight(1.6); p.line(x + 1, yy, x + w - 1, yy);
				p.noStroke(); p.triangle(x + w + 2, yy, x + w - 4 - 1, yy - 5, x + w - 4, yy);
			}
			x += w;
		}
		return x;
	}
	const V = (t, cor) => [t, cor, p.BOLDITALIC, true];

	p.draw = function () {
		if (st.alvo !== null && !agarrado) {
			st.h += (st.alvo - st.h) * (1 - Math.exp(-p.deltaTime / 150));
			if (Math.abs(st.alvo - st.h) < 0.003) { st.h = st.alvo; st.alvo = null; }
		}
		const h = st.h, diag = cxDiag.checked(), sol = cxSol.checked();
		const A = [-1, h], B = [-2, 0], C = [2, 0], D = [1, h], S = [1, -h];       // S = A + AB + AC
		const norma = Math.sqrt(4 + 4 * h * h), certo = Math.abs(h - 2) < 1e-9;
		p.background(255);

		// referencial esbatido
		p.stroke(...COR.grelha); p.strokeWeight(1);
		for (let i = -3; i <= 3; i++) p.line(X(i), Y(-3.4), X(i), Y(3.4));
		for (let j = -3; j <= 3; j++) p.line(X(-3.6), Y(j), X(3.6), Y(j));
		p.stroke(...COR.eixo, 150); p.strokeWeight(1.4);
		p.line(X(-3.6), O.y, X(3.6), O.y); p.line(O.x, Y(-3.4), O.x, Y(3.4));

		// trapézio
		p.fill(241, 245, 249, 170); p.stroke(...COR.texto); p.strokeWeight(2.2);
		p.quad(X(A[0]), Y(A[1]), X(B[0]), Y(B[1]), X(C[0]), Y(C[1]), X(D[0]), Y(D[1]));
		// lado de cima mais grosso (é o que se arrasta)
		p.stroke(...COR.texto, agarrado ? 255 : 200); p.strokeWeight(agarrado ? 5 : 3.5); p.line(X(A[0]), Y(A[1]), X(D[0]), Y(D[1]));
		// altura h, esbatida
		p.drawingContext.setLineDash([6, 6]); p.stroke(...COR.cinza, 140); p.strokeWeight(1.5);
		p.line(X(D[0]), Y(h), X(D[0]), O.y); p.drawingContext.setLineDash([]);
		rot('h', X(D[0]) + 12, Y(h / 2), COR.cinza, 20, p.LEFT, p.ITALIC);

		const af = diag ? 70 : 255;          // com as diagonais, a soma fica esbatida

		// AB + AC: paralelogramo esbatido A, B, S, C
		p.noStroke(); p.fill(...COR.soma, diag ? 10 : 22);
		p.quad(X(A[0]), Y(A[1]), X(B[0]), Y(B[1]), X(S[0]), Y(S[1]), X(C[0]), Y(C[1]));
		p.drawingContext.setLineDash([7, 7]); p.stroke(...COR.soma, diag ? 50 : 120); p.strokeWeight(1.8);
		p.line(X(B[0]), Y(B[1]), X(S[0]), Y(S[1])); p.line(X(C[0]), Y(C[1]), X(S[0]), Y(S[1]));
		p.drawingContext.setLineDash([]);
		seta(X(A[0]), Y(A[1]), X(S[0]), Y(S[1]), COR.soma, 4.5, af);
		seta(X(A[0]), Y(A[1]), X(B[0]), Y(B[1]), COR.u, 4, af);
		if (!diag) seta(X(A[0]), Y(A[1]), X(C[0]), Y(C[1]), COR.v, 4, af);
		p.noStroke(); p.fill(...COR.soma, af); p.circle(X(S[0]), Y(S[1]), 9);

		// diagonais AC e BD, e o ângulo no ponto de interseção I(0, 2h/3)
		if (diag) {
			seta(X(A[0]), Y(A[1]), X(C[0]), Y(C[1]), COR.v, 4);
			seta(X(B[0]), Y(B[1]), X(D[0]), Y(D[1]), COR.bd, 4);
			const I = [0, 2 * h / 3], d = 9 - h * h, cs = Math.abs(d) < 0.02 ? COR.zero : d > 0 ? COR.pos : COR.neg;
			const a0 = Math.atan2(-h, 3), a1 = Math.atan2(h, 3);               // direções de AC e BD
			if (Math.abs(d) < 0.02) {
				const q = 20, P1 = [X(I[0]) + q * Math.cos(a0), Y(I[1]) - q * Math.sin(a0)], P2 = [X(I[0]) + q * Math.cos(a1), Y(I[1]) - q * Math.sin(a1)];
				p.noFill(); p.stroke(...cs); p.strokeWeight(2.5);
				p.beginShape(); p.vertex(...P1); p.vertex(P1[0] + P2[0] - X(I[0]), P1[1] + P2[1] - Y(I[1])); p.vertex(...P2); p.endShape();
			} else {
				p.fill(...cs, 50); p.stroke(...cs); p.strokeWeight(2.5);
				p.arc(X(I[0]), Y(I[1]), 80, 80, -a1, -a0, p.PIE);
			}
			p.noStroke(); p.fill(...COR.texto); p.circle(X(I[0]), Y(I[1]), 7);
			rot(sol && certo ? 'cos θ = 5/13' : 'θ', X(I[0]) + 58, Y(I[1]), cs, sol && certo ? 19 : 22, p.LEFT, sol && certo ? p.BOLD : p.BOLDITALIC);
			nomeVetor('AC', X(1.3) - 18, Y(0.7 * h / 3) + 30, COR.v);
			nomeVetor('BD', X(-1.35), Y(0.55 * h) - 6, COR.bd);
		} else {
			nomeVetor('AB', X(-1.5) - 30, Y(h / 2) + 2, COR.u);
			nomeVetor('AC', X(0.2) - 6, Y(0.6 * h) + 34, COR.v);
		}

		// nome do vetor soma (abaixo, junto da ponta)
		{
			const xs = X(S[0]) + 18, ys = Y(S[1]) + (h > 2.9 ? -18 : 6);
			p.textSize(22); p.textStyle(p.BOLDITALIC);
			const c = [...COR.soma]; if (diag) c.push(110);
			if (!diag) linha([V('AB', COR.soma), [' + ', COR.soma, p.BOLD], V('AC', COR.soma)], xs, ys);
		}

		// vértices
		const pts = { A, B, C, D };
		const etq = { A: '(−1, h)', B: '(−2, 0)', C: '(2, 0)', D: '(1, h)' };
		for (const n of 'ABCD') {
			const [x, y] = pts[n], cima = n === 'A' || n === 'D', esq = n === 'A' || n === 'B';
			p.noStroke(); p.fill(...COR.texto); p.circle(X(x), Y(y), 9);
			const lx = X(x) + (esq ? -16 : 16), ly = Y(y) + (cima ? -18 : 18);
			rot(n, lx, ly, COR.texto, 24, esq ? p.RIGHT : p.LEFT);
			rot(etq[n], lx + (esq ? -22 : 22), ly + 1, COR.cinza, 15, esq ? p.RIGHT : p.LEFT, p.NORMAL);
		}

		// leitura em tempo real
		const cl = certo ? COR.pos : COR.texto;
		p.noStroke(); p.fill(255, 235); p.rect(14, 12, 330, 74, 10);
		linha([['h = ' + UT.fmt(h, 2), COR.cinza]], 28, 32, 20);
		linha([['‖', cl], V('AB', COR.soma), [' + ', COR.soma], V('AC', COR.soma), ['‖ ≈ ' + UT.fmt(norma, 2), cl, certo ? p.BOLD : p.NORMAL],
			[certo ? '  = 2√5 ✓' : '', COR.pos, p.BOLD]], 28, 64, 22);

		// solução
		if (sol) {
			// só as linhas da alínea escolhida (todas, sem alínea)
			const L = [];
			if (al !== 2) {
				L.push([V('AB'), [' + ', null], V('AC'), [' = (−1, −h) + (3, −h) = (2, −2h)', null]]);
				L.push([['4 + 4h² = 20   ⇒   ', null], ['h = 2', COR.pos, p.BOLD], ['        ', null], V('BD', COR.bd), [' = (3, 2)  ⇒  ‖', null], V('BD', COR.bd), ['‖ = ', null], ['√13  (C)', COR.pos, p.BOLD]]);
			}
			if (al !== 1) {
				if (al === 2) L.push([['h = 2:   ', null], V('AC', COR.v), [' = (3, −2),   ', null], V('BD', COR.bd), [' = (3, 2),   ‖', null], V('AC', COR.v), ['‖ = ‖', null], V('BD', COR.bd), ['‖ = √13', null]]);
				L.push([V('AC', COR.v), [' · ', null], V('BD', COR.bd), [' = 9 − 4 = 5;   cos θ = 5 / (√13 × √13) = ', null], ['5/13', COR.pos, p.BOLD]]);
				L.push([['5/13 ≈ 0,385 ≠ 0   ⇒   as diagonais não são perpendiculares', null]]);
			}
			p.noStroke(); p.fill(255, 240); p.stroke(226, 232, 240); p.strokeWeight(1.5); p.rect(14, H - 12 - (12 + 32 * L.length), 560, 12 + 32 * L.length, 10);
			L.forEach((l, k) => linha(l, 28, H - 12 - (12 + 32 * L.length) + 20 + 32 * k));
		}
	};
};
