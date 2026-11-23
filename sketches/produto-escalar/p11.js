/* =====================================================================
   Produto escalar · Problema 11 — dois pontos a um terço dos lados (Itália, Esame di Stato 2025, quesito 1)
   A(0, 5,5), B(−4, 0) fixos; arrasta-se C. B' = A + ⅓AB, C' = A + ⅓AC, M = ponto médio de [BC].
   Íman quando MB' = MC' (C roda em torno de A até AC = AB).
   Solução com u = AB, v = AC: MB' = −⅙u − ½v, MC' = −½u − ⅙v,  MC'² − MB'² = (2/9)(‖u‖² − ‖v‖²).
   ===================================================================== */
SKETCHES['pe-p11'] = function (p, controlos) {
	const T = PLANO(p, { O: { x: 285, y: 470 }, K: 46 });
	const C = T.COR, A = [0, 5.5], B = [-4, 0];
	const AB = Math.hypot(B[0] - A[0], B[1] - A[1]);
	const st = { C: [5, 0.8], alvo: null };
	let cxVet, cxSol;

	const igualar = c => { const d = [c[0] - A[0], c[1] - A[1]], n = Math.hypot(...d); return [A[0] + AB * d[0] / n, A[1] + AB * d[1] / n]; };

	p.setup = function () {
		const cv = p.createCanvas(T.W, T.H).elt;
		p.textFont('Source Sans Pro');
		T.arrastar(cv, [{
			perto: (x, y) => T.perto(st.C, x, y),
			inicio: () => { st.alvo = null; },
			mover: (x, y) => {
				let c = [p.constrain(x, 0.6, 5.8), p.constrain(y, -1.6, 4.6)];
				if (Math.abs(dist(c) - AB) < 0.1) c = igualar(c);      // íman: AC = AB (e MB' = MC')
				st.C = c;
			}
		}]);
		p.createSpan('Arrasta o ponto C ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, "MB' = MC'", () => { st.alvo = igualar(st.C); }, 'atalho');
		UT.quebra(p, controlos);
		cxVet = UT.caixa(p, controlos, 'Vetores u e v', false);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) cxVet.checked(true); });
	};
	const dist = c => Math.hypot(c[0] - A[0], c[1] - A[1]);
	const lerp = (a, b, t) => [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];

	p.draw = function () {
		if (st.alvo) {
			let a, b, o1, o2;
			[a, o1] = T.suave(st.C[0], st.alvo[0], p.deltaTime); [b, o2] = T.suave(st.C[1], st.alvo[1], p.deltaTime);
			st.C = [a, b]; if (o1 && o2) { st.C = st.alvo; st.alvo = null; }
		}
		const Cc = st.C, sol = cxSol.checked();
		const B1 = lerp(A, B, 1 / 3), C1 = lerp(A, Cc, 1 / 3), M = lerp(B, Cc, 0.5);
		const mb = Math.hypot(B1[0] - M[0], B1[1] - M[1]), mc = Math.hypot(C1[0] - M[0], C1[1] - M[1]);
		const ac = dist(Cc), igual = Math.abs(ac - AB) < 1e-6;
		p.background(255);

		p.fill(...C.fig, 18); p.stroke(...C.texto); p.strokeWeight(2.2); p.strokeJoin(p.ROUND);
		p.triangle(...T.S(A), ...T.S(B), ...T.S(Cc));
		if (cxVet.checked()) {
			T.seta(A, B, C.u, 3.6); T.seta(A, Cc, C.v, 3.6);
			const sb = T.S(lerp(A, B, 0.62)), sc = T.S(lerp(A, Cc, 0.62));
			T.nomeVetor('u', sb[0] - 22, sb[1] - 8, C.u, 22); T.nomeVetor('v', sc[0] + 22, sc[1] - 8, C.v, 22);
		}
		T.seg(M, B1, C.soma, 3); T.seg(M, C1, C.reta, 3);
		if (igual) {                                                  // marcas AB = AC e MB' = MC'
			[[A, B], [A, Cc]].forEach(([u, v]) => {
				const m = T.S(lerp(u, v, 0.82)), d = [T.X(v[0]) - T.X(u[0]), T.Y(v[1]) - T.Y(u[1])], n = Math.hypot(...d);
				p.stroke(...C.pos); p.strokeWeight(2.4); p.line(m[0] - 7 * d[1] / n, m[1] + 7 * d[0] / n, m[0] + 7 * d[1] / n, m[1] - 7 * d[0] / n);
			});
		}
		T.ponto(A, 'A', 0, -22);
		T.ponto(B, 'B', -12, 14);
		T.ponto(B1, "B'", -12, -6, C.soma, false, 21);
		T.ponto(C1, "C'", 12, -6, C.reta, false, 21);
		T.ponto(M, 'M', 0, 22, C.texto, false, 21);
		T.ponto(Cc, 'C', 12, 14, C.texto, true);

		// leitura
		const x0 = 572;
		T.painel(x0 - 14, 12, T.W - x0 + 2, 116);
		T.linha([["MB' ≈ " + UT.fmt(mb, 2), C.soma, p.BOLD], ["     MC' ≈ " + UT.fmt(mc, 2), C.reta, p.BOLD]], x0, 38);
		T.linha([['AB ≈ ' + UT.fmt(AB, 2), null], ['     AC ≈ ' + UT.fmt(ac, 2), igual ? C.pos : C.texto, igual ? p.BOLD : p.NORMAL]], x0, 72);
		T.linha(igual ? [["MB' = MC'  e  AB = AC ✓", C.pos, p.BOLD]] : [["MB' ≠ MC'", C.cinza]], x0, 106);

		if (!sol) return;
		const u2 = AB * AB, v2 = ac * ac;
		T.painel(x0 - 14, 144, T.W - x0 + 2, 444);
		let y = 170;
		const L1 = (pecas, tam = 19, dy = 33) => { T.linha(pecas, x0, y, tam); y += dy; };
		const nu = (k = '') => [[k + '‖', null], T.V('u', C.u), ['‖²', null]], nv = () => [['‖', null], T.V('v', C.v), ['‖²', null]];
		L1([T.V('u', C.u), [' = ', null], T.V('AB'), [',  ', null], T.V('v', C.v), [' = ', null], T.V('AC'), [',  ', null], T.V('AM'), [' = ½(', null], T.V('u', C.u), [' + ', null], T.V('v', C.v), [')', null]], 18, 38);
		L1([T.V("MB'", C.soma), [' = ⅓', null], T.V('u', C.u), [' − ', null], T.V('AM'), [' = −⅙', null], T.V('u', C.u), [' − ½', null], T.V('v', C.v)]);
		L1([T.V("MC'", C.reta), [' = ⅓', null], T.V('v', C.v), [' − ', null], T.V('AM'), [' = −½', null], T.V('u', C.u), [' − ⅙', null], T.V('v', C.v)], 19, 40);
		L1([["MB'² = ", C.soma], ...nu('1/36'), [' + ', null], T.V('u', C.u), ['·', null], T.V('v', C.v), ['/6 + ¼', null], ...nv()]);
		L1([["MC'² = ", C.reta], ...nu('¼'), [' + ', null], T.V('u', C.u), ['·', null], T.V('v', C.v), ['/6 + (1/36)', null], ...nv()], 19, 40);
		L1([["MC'² − MB'² = (2/9)(", null], ...nu(), [' − ', null], ...nv(), [')', null]]);
		L1([['agora: (2/9)(' + UT.fmt(u2, 1) + ' − ' + UT.fmt(v2, 1) + ') ≈ ' + UT.fmt(2 / 9 * (u2 - v2), 2), C.cinza]], 17, 42);
		L1([["MB' = MC' ⇒ ", null], ['‖', null], T.V('u', C.u), ['‖ = ‖', null], T.V('v', C.v), ['‖ ⇒ ', null], ['AB = AC', C.pos, p.BOLD]], 21);
	};
};
