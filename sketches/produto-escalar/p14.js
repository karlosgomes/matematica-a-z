/* =====================================================================
   Produto escalar · Problema 14 — a tangente que corta o cateto ao meio (Itália, Esame di Maturità 2026, suplementar, q. 1)
   Unidade = metade de BC: B(0, 0), C(2, 0), A(0, a); arrasta-se A no eixo Oy (a entre 0,8 e 3,6).
   Circunferência de diâmetro [BC]: centro M(1, 0), raio 1. D = A + t·AC com BD ⊥ AC ⇒ t = a²/(a² + 4),
   D = (2a², 4a)/(a² + 4); MD = (a² − 4, 4a)/(a² + 4); E(0, e) com ED · MD = 0 ⇒ e = a/2: AE/BE = 1.
   ===================================================================== */
SKETCHES['pe-p14'] = function (p, controlos) {
	const T = PLANO(p, { O: { x: 120, y: 468 }, K: 118 });
	const C = T.COR, B = [0, 0], Cc = [2, 0], M = [1, 0];
	const st = { a: 2.6 };
	let cxRef, cxSol;

	p.setup = function () {
		const cv = p.createCanvas(T.W, T.H).elt;
		p.textFont('Source Sans Pro');
		T.arrastar(cv, [{
			perto: (x, y) => T.perto([0, st.a], x, y),
			mover: (x, y) => { let a = p.constrain(y, 0.8, 3.6); if (Math.abs(a - 2) < 0.04) a = 2; st.a = a; },
			cursor: 'ns-resize'
		}]);
		p.createSpan('Arrasta o ponto A ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'Início', () => { st.a = 2.6; }, 'atalho');
		UT.quebra(p, controlos);
		cxRef = UT.caixa(p, controlos, 'Referencial', false);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) cxRef.checked(true); });
	};

	p.draw = function () {
		const a = st.a, sol = cxSol.checked(), q = a * a + 4;
		const A = [0, a], D = [2 * a * a / q, 4 * a / q], E = [0, a / 2];
		const ae = a - E[1], be = E[1];
		p.background(255);

		if (cxRef.checked()) {
			T.grelha(-0.7, 3.6, -1.05, 3.95, true, false);
			T.rot('x', T.X(3.5), T.Y(0) + 16, C.eixo, 18, p.RIGHT, p.ITALIC); T.rot('y', T.X(0) + 12, T.Y(3.85), C.eixo, 18, p.LEFT, p.ITALIC);
			for (const i of [1, 2, 3]) T.rot(String(i), T.X(i), T.Y(0) + 16, C.cinza, 15, p.CENTER, p.NORMAL);
			for (const j of [1, 2, 3]) T.rot(String(j), T.X(0) - 12, T.Y(j), C.cinza, 15, p.RIGHT, p.NORMAL);
		}
		// circunferência de diâmetro [BC]
		p.noFill(); p.stroke(...C.u); p.strokeWeight(2.2); p.circle(T.X(1), T.Y(0), 2 * T.K);
		// triângulo
		p.fill(...C.fig, 22); p.stroke(...C.texto); p.strokeWeight(2.4); p.strokeJoin(p.ROUND);
		p.triangle(...T.S(A), ...T.S(B), ...T.S(Cc));
		T.reto(B, Cc, A, C.texto, 14);
		// tangente em D
		const d = [D[0] - E[0], D[1] - E[1]], nd = Math.hypot(...d);
		T.seg([E[0] - 0.9 * d[0] / nd, E[1] - 0.9 * d[1] / nd], [D[0] + 1.3 * d[0] / nd, D[1] + 1.3 * d[1] / nd], C.reta, 2.6);
		T.seg(M, D, C.soma, 2, [6, 5]);
		T.reto(D, M, E, C.zero, 12);
		if (sol) {
			T.seg(B, D, C.v, 1.8, [6, 5]);
			T.reto(D, B, A, C.zero, 11);
			T.seta(M, D, C.soma, 3.2);
			T.seta(E, D, C.reta, 3.2);
			const sm = T.S([(M[0] + D[0]) / 2, (M[1] + D[1]) / 2]);
			T.nomeVetor('MD', sm[0] + 26, sm[1] + 8, C.soma, 19);
		}
		// marcas AE = EB
		for (const yy of [a * 0.75, a * 0.25]) { p.stroke(...C.pos); p.strokeWeight(2.4); p.line(T.X(0) - 8, T.Y(yy), T.X(0) + 8, T.Y(yy)); }

		T.ponto(B, 'B', -12, 16);
		T.ponto(Cc, 'C', 12, 16);
		T.ponto(M, 'M', 0, 20, C.u, false, 20);
		T.ponto(D, 'D', 12, -14);
		T.ponto(E, 'E', -14, 0, C.reta);
		T.ponto(A, 'A', -14, 0, C.texto, true);

		// leitura
		const x0 = 560;
		T.painel(x0 - 14, 12, T.W - x0 + 2, 116);
		T.linha([['AE ≈ ' + UT.fmt(ae, 2), null], ['     BE ≈ ' + UT.fmt(be, 2), null]], x0, 38);
		T.linha([['AE / BE = ', null], [UT.fmt(ae / be, 2), C.pos, p.BOLD]], x0, 72);
		T.linha([['para qualquer posição de A', C.cinza]], x0, 106, 19);

		if (!sol) return;
		T.painel(x0 - 14, 144, T.W - x0 + 2, 444);
		let y = 170;
		const L1 = (pecas, tam = 19, dy = 33) => { T.linha(pecas, x0, y, tam); y += dy; };
		L1([['B(0, 0), C(2, 0), A(0, a), M(1, 0)', null]], 19, 38);
		L1([['D = A + t', null], T.V('AC'), [',  ', null], T.V('AC'), [' = (2, −a)', null]]);
		L1([['BD ⊥ AC (D na circunferência):', null]]);
		L1([T.V('BD', C.v), [' · ', null], T.V('AC'), [' = (2t, a − at) · (2, −a) = 0', null]], 18);
		L1([['⇔ 4t − a² + a²t = 0 ⇔ t = a²/(a² + 4)', null]]);
		L1([['D = (2a², 4a)/(a² + 4)', null, p.BOLD]], 19, 38);
		L1([T.V('MD', C.soma), [' = (a² − 4, 4a)/(a² + 4)', null]]);
		L1([['E(0, e):  ', null], T.V('ED', C.reta), [' · ', null], T.V('MD', C.soma), [' = 0  (tangente ⊥ raio)', null]], 18);
		L1([['⇔ 2a²(a² − 4) + 16a² = 4ae(a² + 4)', null]], 18);
		L1([['⇔ 2a² = 4ae ⇔ e = a/2', null]], 19, 38);
		L1([['E é o ponto médio de [AB]: ', null], ['AE/BE = 1', C.pos, p.BOLD]], 20);
	};
};
