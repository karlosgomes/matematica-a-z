/* =====================================================================
   Produto escalar · Problema 10 — a mediana igual a metade do lado (Itália, Esame di Stato 2019, extraordinária, q. 3)
   B(−4, 0), C(4, 0), M = O; arrasta-se A. Íman quando AM = BC/2 = 4 (A na circunferência de diâmetro [BC]).
   Solução: AB · AC = (AM + MB) · (AM − MB) = ‖AM‖² − ‖MB‖² = 0.
   ===================================================================== */
SKETCHES['pe-p10'] = function (p, controlos) {
	const T = PLANO(p, { O: { x: 270, y: 430 }, K: 46 });
	const C = T.COR, B = [-4, 0], Cc = [4, 0], M = [0, 0];
	const st = { A: [-1.6, 5.4], alvo: null };
	let cxCirc, cxSol;

	p.setup = function () {
		const cv = p.createCanvas(T.W, T.H).elt;
		p.textFont('Source Sans Pro');
		T.arrastar(cv, [{
			perto: (x, y) => T.perto(st.A, x, y),
			inicio: () => { st.alvo = null; },
			mover: (x, y) => {
				x = p.constrain(x, -5.3, 5.3); y = p.constrain(y, 0.5, 8.2);
				const r = Math.hypot(x, y);
				if (Math.abs(r - 4) < 0.12) { x *= 4 / r; y *= 4 / r; }   // íman: AM = 4
				st.A = [x, y];
			}
		}]);
		p.createSpan('Arrasta o ponto A ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'AM = BC/2', () => { const r = Math.hypot(...st.A); st.alvo = [4 * st.A[0] / r, 4 * st.A[1] / r]; }, 'atalho');
		UT.quebra(p, controlos);
		cxCirc = UT.caixa(p, controlos, 'Circunferência de diâmetro [BC]', false);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) { const r = Math.hypot(...st.A); st.alvo = [4 * st.A[0] / r, 4 * st.A[1] / r]; } });
	};

	p.draw = function () {
		if (st.alvo) {
			let a, b, ok1, ok2;
			[a, ok1] = T.suave(st.A[0], st.alvo[0], p.deltaTime); [b, ok2] = T.suave(st.A[1], st.alvo[1], p.deltaTime);
			st.A = [a, b]; if (ok1 && ok2) { st.A = st.alvo; st.alvo = null; }
		}
		const A = st.A, sol = cxSol.checked();
		const am = Math.hypot(...A), igual = Math.abs(am - 4) < 1e-6;
		const ab = [B[0] - A[0], B[1] - A[1]], ac = [Cc[0] - A[0], Cc[1] - A[1]];
		const pe = ab[0] * ac[0] + ab[1] * ac[1];
		const corPe = Math.abs(pe) < 1e-6 ? C.zero : pe > 0 ? C.pos : C.neg;
		p.background(255);

		if (cxCirc.checked()) {
			p.noFill(); p.stroke(...C.cinza, 150); p.strokeWeight(1.6); p.drawingContext.setLineDash([6, 6]);
			p.circle(T.X(0), T.Y(0), 8 * T.K); p.drawingContext.setLineDash([]);
		}
		// triângulo
		p.fill(...C.fig, 22); p.stroke(...C.texto); p.strokeWeight(2.2); p.strokeJoin(p.ROUND);
		p.triangle(...T.S(A), ...T.S(B), ...T.S(Cc));
		// mediana [AM]
		T.seg(A, M, C.soma, 2.6);
		// ângulo em A
		if (igual) T.reto(A, B, Cc, C.zero, 16); else T.arco(A, B, Cc, corPe, 30);

		if (sol) {
			T.seta(A, M, C.soma, 3.6);
			T.seta(M, B, C.u, 3.6);
			T.seta(M, Cc, C.v, 3.6);
			T.nomeVetor('MB', T.X(-2), T.Y(0) + 26, C.u, 20);
			T.nomeVetor('MC', T.X(2), T.Y(0) + 26, C.v, 20);
		} else {
			// marcas de BM = MC
			for (const xm of [-2, 2]) { p.stroke(...C.texto); p.strokeWeight(2); p.line(T.X(xm), T.Y(0) - 7, T.X(xm), T.Y(0) + 7); }
		}
		{
			const mx = A[0] / 2, my = A[1] / 2, n = Math.hypot(A[1], A[0]);
			const ox = 24 * A[1] / n * (A[0] >= 0 ? 1 : -1), oy = 24 * A[0] / n * (A[0] >= 0 ? -1 : 1);
			if (sol) T.nomeVetor('AM', T.X(mx) + ox, T.Y(my) - oy, C.soma, 20);
		}
		T.ponto(B, 'B', -12, 14);
		T.ponto(Cc, 'C', 12, 14);
		T.ponto(M, 'M', 0, 22, C.soma);
		T.ponto(A, 'A', A[0] < 0 ? -12 : 12, -18, C.texto, true);

		// leitura
		const x0 = 568;
		T.painel(x0 - 14, 12, T.W - x0 + 2, 116);
		T.linha([['AM ≈ ' + UT.fmt(am, 2), igual ? C.pos : C.texto, igual ? p.BOLD : p.NORMAL], ['    BC/2 = 4', C.cinza]], x0, 38);
		T.linha([T.V('AB'), [' · ', null], T.V('AC'), [' ≈ ' + UT.fmt(Math.abs(pe) < 1e-6 ? 0 : pe, 2), corPe, p.BOLD]], x0, 72);
		const ang = Math.acos(p.constrain(pe / (Math.hypot(...ab) * Math.hypot(...ac)), -1, 1)) * 180 / Math.PI;
		T.linha([['ângulo em A ≈ ' + UT.fmt(ang, 1) + '°', igual ? C.pos : corPe, igual ? p.BOLD : p.NORMAL]], x0, 106);

		if (!sol) return;
		T.painel(x0 - 14, 144, T.W - x0 + 2, 444);
		let y = 172;
		const L1 = (pecas, tam = 20, dy = 34) => { T.linha(pecas, x0, y, tam); y += dy; };
		L1([['M é o ponto médio de [BC]:', null]]);
		L1([T.V('MC', C.v), [' = −', null], T.V('MB', C.u), ['  e  AM = MB', null]], 20, 44);
		L1([T.V('AB'), [' = ', null], T.V('AM', C.soma), [' + ', null], T.V('MB', C.u)]);
		L1([T.V('AC'), [' = ', null], T.V('AM', C.soma), [' + ', null], T.V('MC', C.v), [' = ', null], T.V('AM', C.soma), [' − ', null], T.V('MB', C.u)], 20, 44);
		L1([T.V('AB'), [' · ', null], T.V('AC'), [' = (', null], T.V('AM', C.soma), [' + ', null], T.V('MB', C.u), [') · (', null], T.V('AM', C.soma), [' − ', null], T.V('MB', C.u), [')', null]], 19);
		L1([['= AM² − MB² = 0', null]], 20, 44);
		L1([T.V('AB'), [' ⊥ ', null], T.V('AC'), [': ', null], ['retângulo em A', C.pos, p.BOLD]], 22);
	};
};
