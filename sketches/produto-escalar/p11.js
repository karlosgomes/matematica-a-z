/* =====================================================================
   Produto escalar · Problema 11 — os pontos médios dos lados de um losango (Itália, Esame di Stato 2019, suplementar, q. 3)
   Losango A(−a, 0), B(0, −b), C(a, 0), D(0, b); arrastam-se os vértices (A/C mudam a, B/D mudam b).
   Caixa «Losango»: desligada, os quatro vértices ficam livres (quadrilátero qualquer → [MNPQ] só paralelogramo).
   Solução: MN = ½AC = QP (paralelogramo), MQ = ½BD, AC · BD = ‖AD‖² − ‖AB‖² = 0 ⇒ MN · MQ = 0.
   ===================================================================== */
SKETCHES['pe-p11'] = function (p, controlos) {
	const T = PLANO(p, { O: { x: 275, y: 300 }, K: 48 });
	const C = T.COR, NOMES = ['A', 'B', 'C', 'D'];
	// losango rodado de 20° (para não ficar com os lados de [MNPQ] paralelos aos bordos)
	const RO = 20 * Math.PI / 180, E1 = [Math.cos(RO), Math.sin(RO)], E2 = [-Math.sin(RO), Math.cos(RO)];
	const comb = (s, e) => [s * e[0], s * e[1]];
	function losango(a, b) { return [comb(-a, E1), comb(-b, E2), comb(a, E1), comb(b, E2)]; }
	const semi = () => [Math.hypot(st.V[2][0] - st.V[0][0], st.V[2][1] - st.V[0][1]) / 2, Math.hypot(st.V[3][0] - st.V[1][0], st.V[3][1] - st.V[1][1]) / 2];
	const st = { V: losango(4, 2.6) };
	let cxLos, cxDiag, cxSol;


	p.setup = function () {
		const cv = p.createCanvas(T.W, T.H).elt;
		p.textFont('Source Sans Pro');
		T.arrastar(cv, [0, 1, 2, 3].map(i => ({
			perto: (x, y) => T.perto(st.V[i], x, y),
			mover: (x, y) => {
				x = p.constrain(x, -5.3, 5.3); y = p.constrain(y, -5.4, 5.4);
				if (cxLos.checked()) {
					const [a, b] = semi();
					st.V = i % 2 === 0 ? losango(p.constrain(Math.abs(x * E1[0] + y * E1[1]), 0.8, 5), b) : losango(a, p.constrain(Math.abs(x * E2[0] + y * E2[1]), 0.8, 4.6));
				} else st.V[i] = [x, y];
			}
		})));
		p.createSpan('Arrasta os vértices ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'Início', () => { cxLos.checked(true); st.V = losango(4, 2.6); }, 'atalho');
		UT.quebra(p, controlos);
		cxLos = UT.caixa(p, controlos, 'Losango', true);
		cxLos.changed(() => {
			if (cxLos.checked()) {
				const [a, b] = semi(); st.V = losango(p.constrain(a, 0.8, 5), p.constrain(b, 0.8, 4.6));
			}
		});
		cxDiag = UT.caixa(p, controlos, 'Diagonais', false);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) { cxDiag.checked(true); if (!cxLos.checked()) { cxLos.checked(true); st.V = losango(4, 2.6); } } });
	};

	const med = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
	const dot = (a, b) => a[0] * b[0] + a[1] * b[1];

	p.draw = function () {
		const [A, B, Cc, D] = st.V, sol = cxSol.checked();
		const M = med(A, B), N = med(B, Cc), P = med(Cc, D), Q = med(D, A);
		const mn = sub(N, M), mq = sub(Q, M), ac = sub(Cc, A), bd = sub(D, B);
		const cosM = dot(mn, mq) / (Math.hypot(...mn) * Math.hypot(...mq));
		const ang = Math.acos(p.constrain(cosM, -1, 1)) * 180 / Math.PI, reto = Math.abs(cosM) < 2e-3;
		const pe = dot(ac, bd);
		p.background(255);

		// losango / quadrilátero
		p.fill(...C.fig, 18); p.stroke(...C.texto); p.strokeWeight(2.4); p.strokeJoin(p.ROUND);
		p.beginShape(); st.V.forEach(v => p.vertex(...T.S(v))); p.endShape(p.CLOSE);
		if (cxLos.checked()) {                                       // marcas de lados iguais
			[[A, B], [B, Cc], [Cc, D], [D, A]].forEach(([u, v]) => {
				const m = T.S(med(u, v)), d = sub(T.S(v), T.S(u)), n = Math.hypot(...d);
				p.stroke(...C.texto); p.strokeWeight(2); p.line(m[0] - 7 * d[1] / n, m[1] + 7 * d[0] / n, m[0] + 7 * d[1] / n, m[1] - 7 * d[0] / n);
			});
		}
		if (cxDiag.checked()) {
			T.seg(A, Cc, sol ? C.u : C.cinza, 1.8, [7, 6]); T.seg(B, D, sol ? C.v : C.cinza, 1.8, [7, 6]);
			if (Math.abs(pe) < 1e-6) T.reto(med(A, Cc), Cc, D, C.zero, 12);
		}
		// [MNPQ]
		p.fill(...C.soma, 40); p.stroke(...C.soma); p.strokeWeight(2.6);
		p.beginShape(); [M, N, P, Q].forEach(v => p.vertex(...T.S(v))); p.endShape(p.CLOSE);
		if (reto) T.reto(M, N, Q, C.zero, 16); else T.arco(M, N, Q, C.neg, 26);
		if (sol) {
			T.seta(M, N, C.u, 3.6); T.seta(M, Q, C.v, 3.6);
			const sn = T.S(med(M, N)), sq = T.S(med(M, Q));
			T.nomeVetor('MN', sn[0] + 26, sn[1] + 18, C.u, 20);
			T.nomeVetor('MQ', sq[0] - 30, sq[1] + 16, C.v, 20);
		}
		// pontos
		const fora = (q, d = 20) => { const c = med(med(A, Cc), med(B, D)), s = sub(q, c), n = Math.hypot(...s) || 1; return [d * s[0] / n, -d * s[1] / n]; };
		st.V.forEach((v, i) => { const [dx, dy] = fora(v); T.ponto(v, NOMES[i], dx, dy, C.texto, true); });
		[[M, 'M'], [N, 'N'], [P, 'P'], [Q, 'Q']].forEach(([v, n]) => { const [dx, dy] = fora(v, 18); T.ponto(v, n, dx, dy, C.soma, false, 21); });

		// leitura
		const x0 = 580;
		T.painel(x0 - 14, 12, T.W - x0 + 2, 116);
		T.linha([['ângulo em M ≈ ' + UT.fmt(ang, 1) + '°', reto ? C.pos : C.neg, p.BOLD]], x0, 38);
		T.linha([T.V('AC'), [' · ', null], T.V('BD'), [' ≈ ' + UT.fmt(Math.abs(pe) < 1e-6 ? 0 : pe, 2), null]], x0, 72);
		T.linha([['[MNPQ]: ', null], reto ? ['retângulo ✓', C.pos, p.BOLD] : ['paralelogramo', C.neg, p.BOLD]], x0, 106);

		if (!sol) return;
		T.painel(x0 - 14, 144, T.W - x0 + 2, 444);
		let y = 172;
		const L1 = (pecas, tam = 19, dy = 33) => { T.linha(pecas, x0, y, tam); y += dy; };
		L1([T.V('MN', C.u), [' = ½', null], T.V('AB'), [' + ½', null], T.V('BC'), [' = ½', null], T.V('AC', C.u)]);
		L1([T.V('QP'), [' = ½', null], T.V('AD'), [' + ½', null], T.V('DC'), [' = ½', null], T.V('AC', C.u)]);
		L1([T.V('MN', C.u), [' = ', null], T.V('QP'), [': paralelogramo', null]], 19, 40);
		L1([T.V('MQ', C.v), [' = ½', null], T.V('BA'), [' + ½', null], T.V('AD'), [' = ½', null], T.V('BD', C.v)], 19, 40);
		L1([T.V('AC', C.u), [' = ', null], T.V('AD'), [' + ', null], T.V('AB'), [' ,  ', null], T.V('BD', C.v), [' = ', null], T.V('AD'), [' − ', null], T.V('AB')]);
		L1([T.V('AC', C.u), [' · ', null], T.V('BD', C.v), [' = AD² − AB² = 0', null]], 19, 40);
		L1([T.V('MN', C.u), [' · ', null], T.V('MQ', C.v), [' = ¼ ', null], T.V('AC', C.u), [' · ', null], T.V('BD', C.v), [' = 0', null]]);
		L1([['[MNPQ] é um ', null], ['retângulo', C.pos, p.BOLD]], 21);
	};
};
