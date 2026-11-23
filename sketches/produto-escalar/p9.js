/* =====================================================================
   Produto escalar · Problema 9 — a tangente a uma circunferência (Itália, Esame di Stato 2023, quesito 5;
   a pedido do utilizador, 2026-11-23, a curva y = √(25 − x²) passou a circunferência x² + y² = 25)
   Circunferência de centro O e raio 5; T(3, 4) (abcissa 3 e ordenada positiva).
   Arrasta-se a reta que passa em T (pega na ponta da reta): declive m, íman em m = −3/4.
   O segundo ponto comum com a circunferência é S = T + u(1, m), com u = −(6 + 8m)/(1 + m²);
   só há um ponto comum quando 6 + 8m = 0. Dois métodos na solução (botões «1.º método» / «2.º método»):
   1) OT ⊥ tangente: OT · TX = 0 ⇒ 3x + 4y = 25;  2) um só ponto comum ⇒ m = −3/4.
   ===================================================================== */
SKETCHES['pe-p9'] = function (p, controlos) {
	const T = PLANO(p, { O: { x: 270, y: 300 }, K: 40 });
	const C = T.COR, TT = [3, 4], M0 = -0.75, L = 2.8;
	const st = { m: 0.9, alvo: null, met: 0 };
	let cxSol, bts = {};

	const dir = m => { const n = Math.hypot(1, m); return [1 / n, m / n]; };
	const pega = () => { const d = dir(st.m); return [TT[0] + L * d[0], TT[1] + L * d[1]]; };

	p.setup = function () {
		const cv = p.createCanvas(T.W, T.H).elt;
		p.textFont('Source Sans Pro');
		T.arrastar(cv, [{
			perto: (x, y) => T.perto(pega(), x, y, 30),
			inicio: () => { st.alvo = null; },
			mover: (x, y) => {
				let dx = x - TT[0], dy = y - TT[1];
				if (dx < 0) { dx = -dx; dy = -dy; }               // a pega pode passar para o outro lado de T
				let m = dx < 0.05 ? (dy > 0 ? 8 : -8) : dy / dx;
				m = p.constrain(m, -8, 8);
				if (Math.abs(m - M0) < 0.06) m = M0;              // íman: a tangente
				st.m = m;
			}
		}]);
		p.createSpan('Arrasta a ponta da reta que passa em T ·').parent(controlos).addClass('dica-arrastar');
		bts[1] = UT.botao(p, controlos, '1.º método', () => escolher(st.met === 1 ? 0 : 1), 'atalho');
		bts[2] = UT.botao(p, controlos, '2.º método', () => escolher(st.met === 2 ? 0 : 2), 'atalho');
		UT.quebra(p, controlos);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) { st.alvo = M0; if (!st.met) escolher(1); } });
	};
	function escolher(k) {
		st.met = k;
		Object.entries(bts).forEach(([i, b]) => +i === k ? b.removeClass('atalho') : b.addClass('atalho'));
	}

	p.draw = function () {
		if (st.alvo !== null) { let ok; [st.m, ok] = T.suave(st.m, st.alvo, p.deltaTime); if (ok) st.alvo = null; }
		const m = st.m, tang = Math.abs(m - M0) < 1e-6, sol = cxSol.checked();
		const u = -(6 + 8 * m) / (1 + m * m), S = [TT[0] + u, TT[1] + m * u];
		const sNaCurva = !tang;
		p.background(255);
		T.grelha(-6.2, 6.5, -6.6, 6.6);

		// a circunferência
		p.noFill(); p.stroke(...C.texto); p.strokeWeight(2.6);
		p.circle(T.X(0), T.Y(0), 10 * T.K);
		T.rot('x² + y² = 25', T.X(-6), T.Y(6.1), C.texto, 20, p.LEFT, p.ITALIC);

		// OT (com o 1.º método ou quando a reta é tangente)
		if (st.met === 1 || tang) {
			T.seta([0, 0], TT, C.u, 3.2);
			T.nomeVetor('OT', T.X(1.1), T.Y(2.4), C.u, 20);
		}

		// a reta por T
		const d = dir(m), A = [TT[0] - 30 * d[0], TT[1] - 30 * d[1]], B = [TT[0] + 30 * d[0], TT[1] + 30 * d[1]];
		p.drawingContext.save(); p.drawingContext.beginPath(); p.drawingContext.rect(0, 0, 536, T.H); p.drawingContext.clip();
		T.seg(A, B, tang ? C.pos : C.reta, tang ? 3 : 2.4);
		p.drawingContext.restore();
		if (tang && (st.met === 1 || sol)) T.reto(TT, [0, 0], [TT[0] + d[0], TT[1] + d[1]], C.zero, 15);

		// segundo ponto comum
		if (sNaCurva) T.ponto(S, 'S', S[0] < TT[0] ? -12 : 12, -18, C.neg);
		T.ponto([0, 0], 'O', -10, 14, C.cinza);
		T.ponto(TT, 'T', 10, -18, C.texto);
		T.rot('(3, 4)', T.X(3) + 30, T.Y(4) - 18, C.cinza, 15, p.LEFT, p.NORMAL);
		T.ponto(pega(), '', 0, 0, tang ? C.pos : C.reta, true);

		// leitura
		const x0 = 552;
		T.painel(x0 - 14, 12, T.W - x0 + 2, 112);
		T.linha([['declive da reta:  m = ', null], [UT.fmt(m, 2), tang ? C.pos : C.texto, p.BOLD]], x0, 38);
		if (tang) T.linha([['só T é comum à reta e à circunferência ✓', C.pos, p.BOLD]], x0, 72, 20);
		else T.linha([['pontos comuns: T e S', null]], x0, 72);
		T.linha(tang ? [['a reta é tangente em T', C.pos]] : [['a reta é secante à circunferência', C.cinza]], x0, 104, 19);

		if (!sol) return;
		T.painel(x0 - 14, 140, T.W - x0 + 2, 448);
		let y = 166;
		const L1 = (pecas, tam = 20, dy = 31) => { T.linha(pecas, x0, y, tam); y += dy; };
		L1([['x² + y² = 25;  T(3, 4)', C.cinza]], 19, 36);
		if (st.met === 1) {
			L1([['1.º método: ', C.u, p.BOLD], ['a tangente é ⊥ ao raio', null]]);
			L1([['X(x, y) na tangente ⇔ ', null], T.V('OT', C.u), [' · ', null], T.V('TX'), [' = 0', null]]);
			L1([['⇔ (3, 4) · (x − 3, y − 4) = 0', null]]);
			L1([['⇔ 3x − 9 + 4y − 16 = 0', null]]);
			L1([['⇔ 3x + 4y = 25', null]], 20, 40);
			L1([['⇔ ', null], ['y = −¾x + 25/4', C.pos, p.BOLD]], 23);
		} else if (st.met === 2) {
			L1([['2.º método: ', C.u, p.BOLD], ['um só ponto comum', null]]);
			L1([['reta: y = 4 + m(x − 3);  u = x − 3', null]]);
			L1([['(u + 3)² + (4 + mu)² = 25', null]]);
			L1([['⇔ (1 + m²) u² + (6 + 8m) u = 0', null]]);
			L1([['⇔ u = 0  ∨  u = −(6 + 8m)/(1 + m²)', null]]);
			L1([['só T (u = 0) ⇔ 6 + 8m = 0 ⇔ m = −3/4', null]], 20, 40);
			L1([['y = 4 − ¾(x − 3) ⇔ ', null], ['y = −¾x + 25/4', C.pos, p.BOLD]], 22);
		}
	};
};
