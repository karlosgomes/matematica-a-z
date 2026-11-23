/* =====================================================================
   Produto escalar · Problema 13 — o centro do quadrado sobre a hipotenusa (Itália, Esame di Stato 2023, quesito 1)
   A(0, 0), B(b, 0), C(0, c); arrastam-se B (no eixo Ox) e C (no eixo Oy).
   Quadrado [BCDE] do lado oposto a A: w = (c, b) ⊥ BC = (−b, c), com a mesma norma; D = C + w, E = B + w.
   Centro O = M + ½w = ((b + c)/2, (b + c)/2): está à mesma distância dos eixos (as retas AB e AC).
   ===================================================================== */
SKETCHES['pe-p13'] = function (p, controlos) {
	const T = PLANO(p, { O: { x: 95, y: 530 }, K: 44 });
	const C = T.COR;
	const st = { b: 4, c: 2.4 };
	let cxRef, cxBis, cxSol;

	p.setup = function () {
		const cv = p.createCanvas(T.W, T.H).elt;
		p.textFont('Source Sans Pro');
		const ajusta = v => { v = p.constrain(v, 1, 5.2); return Math.abs(v - Math.round(v)) < 0.08 ? Math.round(v) : v; };
		T.arrastar(cv, [
			{ perto: (x, y) => T.perto([st.b, 0], x, y), mover: x => { st.b = ajusta(x); }, cursor: 'ew-resize' },
			{ perto: (x, y) => T.perto([0, st.c], x, y), mover: (x, y) => { st.c = ajusta(y); }, cursor: 'ns-resize' }
		]);
		p.createSpan('Arrasta os pontos B e C ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'Início', () => { st.b = 4; st.c = 2.4; }, 'atalho');
		UT.quebra(p, controlos);
		cxRef = UT.caixa(p, controlos, 'Referencial', false);
		cxBis = UT.caixa(p, controlos, 'Bissetriz do ângulo A', false);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) cxRef.checked(true); });
	};

	p.draw = function () {
		const b = st.b, c = st.c, sol = cxSol.checked(), ref = cxRef.checked();
		const A = [0, 0], B = [b, 0], Cc = [0, c], w = [c, b];
		const D = [Cc[0] + w[0], Cc[1] + w[1]], E = [B[0] + w[0], B[1] + w[1]];
		const M = [b / 2, c / 2], O = [(b + c) / 2, (b + c) / 2];
		const Hh = [O[0], 0], Kk = [0, O[1]];
		p.background(255);

		if (ref) T.grelha(-0.6, 11, -0.6, 11.4, true, true);
		else { T.seg([0, 0], [11, 0], C.cinza, 1.4, null, 110); T.seg([0, 0], [0, 11.2], C.cinza, 1.4, null, 110); }
		if (cxBis.checked()) T.seg([0, 0], [10.6, 10.6], C.cinza, 1.6, [8, 7]);

		// quadrado e triângulo
		p.fill(...C.soma, 26); p.stroke(...C.soma); p.strokeWeight(2.2); p.strokeJoin(p.ROUND);
		p.beginShape(); [B, Cc, D, E].forEach(v => p.vertex(...T.S(v))); p.endShape(p.CLOSE);
		p.fill(...C.fig, 30); p.stroke(...C.texto); p.strokeWeight(2.6);
		p.triangle(...T.S(A), ...T.S(B), ...T.S(Cc));
		T.reto(A, B, Cc, C.texto, 14);
		// diagonais do quadrado, esbatidas
		T.seg(B, D, C.soma, 1.2, [4, 5], 150); T.seg(Cc, E, C.soma, 1.2, [4, 5], 150);

		// distâncias de O às retas AB e AC
		T.seg(O, Hh, C.u, 2.4, [7, 6]); T.seg(O, Kk, C.v, 2.4, [7, 6]);
		T.reto(Hh, O, [Hh[0] + 1, 0], C.u, 11); T.reto(Kk, O, [0, Kk[1] + 1], C.v, 11);

		if (sol) {
			T.seta(B, E, C.reta, 3.4);
			T.seta(M, O, C.reta, 3.4);
			const se = T.S([(B[0] + E[0]) / 2, (B[1] + E[1]) / 2]);
			T.nomeVetor('w', se[0] + 20, se[1] + 6, C.reta, 22);
			const so = T.S([(M[0] + O[0]) / 2, (M[1] + O[1]) / 2]);
			T.nomeVetor('w', so[0] - 8, so[1] - 18, C.reta, 20, '½');
			T.ponto(M, 'M', -10, 14, C.texto, false, 20);
		}
		T.ponto(A, 'A', -12, 14);
		T.ponto(D, 'D', -10, -16, C.soma);
		T.ponto(E, 'E', 12, 0, C.soma);
		T.ponto(Hh, 'H', 0, 22, C.u, false, 21);
		T.ponto(Kk, 'K', -16, 0, C.v, false, 21);
		T.ponto(O, 'O', 14, -14, C.texto);
		T.ponto(B, 'B', 4, 24, C.texto, true);
		T.ponto(Cc, 'C', -16, 0, C.texto, true);
		T.rot('b', T.X(b / 2), T.Y(0) + 20, C.cinza, 19, p.CENTER, p.ITALIC);
		T.rot('c', T.X(0) - 14, T.Y(c / 2), C.cinza, 19, p.CENTER, p.ITALIC);

		// leitura
		const x0 = 585;
		T.painel(x0 - 14, 12, T.W - x0 + 2, 116);
		T.linha([['b = ' + UT.fmt(b, 2) + '    c = ' + UT.fmt(c, 2), C.cinza]], x0, 38);
		T.linha([['OH ≈ ' + UT.fmt(O[1], 2), C.u, p.BOLD], ['     OK ≈ ' + UT.fmt(O[0], 2), C.v, p.BOLD]], x0, 72);
		T.linha([['OH = OK ✓', C.pos, p.BOLD]], x0, 106);

		if (!sol) return;
		T.painel(x0 - 14, 144, T.W - x0 + 2, 444);
		let y = 172;
		const L1 = (pecas, tam = 19, dy = 34) => { T.linha(pecas, x0, y, tam); y += dy; };
		L1([['A(0, 0),  B(b, 0),  C(0, c)', null]]);
		L1([T.V('BC'), [' = (−b, c);   ', null], T.V('w', C.reta), [' = (c, b)', C.reta]]);
		L1([T.V('w', C.reta), [' · ', null], T.V('BC'), [' = −bc + bc = 0', null]]);
		L1([['‖', null], T.V('w', C.reta), ['‖ = ‖', null], T.V('BC'), ['‖ = √(b² + c²)', null]], 19, 42);
		L1([['M(b/2, c/2), ponto médio de [BC]', null]]);
		L1([['O = M + ½', null], T.V('w', C.reta)]);
		L1([['O = ((b + c)/2, (b + c)/2)', null, p.BOLD]], 19, 42);
		L1([['OH = ordenada de O = (b + c)/2', C.u]]);
		L1([['OK = abcissa de O = (b + c)/2', C.v]], 19, 38);
		L1([['O está à mesma distância de AB e AC', C.pos, p.BOLD]], 19);
	};
};
