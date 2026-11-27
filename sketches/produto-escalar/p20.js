/* =====================================================================
   Produto escalar · Problema 20 — a · PQ = ‖PQ‖
   (teste do 11.º CT4, 25/11/2026, questão 10; pedido do utilizador, 2026-11-27)
   a(1 − k, k², −1), P(1, −1, 3), Q(3, 1, 2): PQ = (2, 2, −1), ‖PQ‖ = 3, a · PQ = 2k² − 2k + 3 = 3 ⇔ k = 0 ∨ k = 1.
   Interpretação: R = O + a = (1 − k, k², −1) percorre uma parábola no plano z = −1; a · PQ = 3 ⇔ R ∈ α: 2x + 2y − z = 3,
   o plano perpendicular a PQ à distância 1 de O (‖a‖ cos θ = 1: R projeta-se em H = O + PQ/3 na reta de O com a direção de PQ).
   Arrasta-se R ao longo da parábola (íman em k = 0 e k = 1); arrastar o fundo roda a vista (espaco3d.js, com o plano α deslocado: d = 1).
   ===================================================================== */
SKETCHES['pe-p20'] = function (p, controlos) {
	const W = 920, H = 600;
	const P = [1, -1, 3], Q = [3, 1, 2], PQ = [2, 2, -1], u = [2 / 3, 2 / 3, -1 / 3];   // u = PQ/‖PQ‖
	const K0 = -1.2, K1 = 2.2, R = k => [1 - k, k * k, -1];
	const COR = { texto: [30, 41, 59], cinza: [100, 116, 139], eixo: [71, 85, 105], plano: [21, 101, 192], a: [21, 101, 192], pq: [123, 31, 162], curva: [0, 131, 143], verde: [46, 125, 50], laranja: [239, 108, 0] };
	const AZ = 28, EL = 18;
	const E = ESPACO3D(p, { W, H, cx: 560, cy: 400, k: 64, n: PQ, L: 3.4, az: AZ, el: EL, d: 1 });
	let k = 2, cxPlano, cxProj, cxSol, cxInt, arrastoR = false;
	const fmt = x => UT.fmt(x, Math.abs(x - Math.round(x)) < 1e-9 ? 0 : 2);
	const dotPQ = kk => 2 * kk * kk - 2 * kk + 3;

	p.setup = function () {
		const cv = p.createCanvas(W, H).elt;
		p.textFont('Source Sans Pro');
		// arrastar R ao longo da parábola (perto de R) ou rodar a vista (no resto)
		cv.style.cursor = 'grab'; cv.style.touchAction = 'none';
		let ultimo = null;
		const local = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		const kMaisPerto = (x, y) => {
			let melhor = k, dm = Infinity;
			for (let kk = K0; kk <= K1 + 1e-9; kk += 0.005) { const q = E.pr(R(kk)), d = Math.hypot(q.x - x, q.y - y); if (d < dm) { dm = d; melhor = kk; } }
			for (const s of [0, 1]) if (Math.abs(melhor - s) < 0.07) return s;   // íman nas soluções
			return Math.round(melhor * 10) / 10;
		};
		cv.addEventListener('pointerdown', e => {
			const [x, y] = local(e), q = E.pr(R(k));
			arrastoR = Math.hypot(q.x - x, q.y - y) < 24;
			ultimo = [e.clientX, e.clientY];
			cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault();
		});
		cv.addEventListener('pointermove', e => {
			if (!ultimo) { const [x, y] = local(e), q = E.pr(R(k)); cv.style.cursor = Math.hypot(q.x - x, q.y - y) < 24 ? 'pointer' : 'grab'; return; }
			if (arrastoR) { const [x, y] = local(e); k = kMaisPerto(x, y); return; }
			const esc = (window.Reveal && Reveal.getScale && Reveal.getScale()) || 1;
			E.az -= (e.clientX - ultimo[0]) / esc * 0.4; E.el = Math.max(-60, Math.min(80, E.el + (e.clientY - ultimo[1]) / esc * 0.4));
			ultimo = [e.clientX, e.clientY];
		});
		const fim = () => { ultimo = null; arrastoR = false; cv.style.cursor = 'grab'; };
		cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
		['touchstart', 'touchmove', 'mousedown'].forEach(t => cv.addEventListener(t, e => e.stopPropagation(), { passive: true }));

		p.createSpan('Arrasta R ao longo da parábola, ou o fundo para rodar a vista ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'Vista de lado (α de perfil)', () => { E.az = Math.atan2(E.e1[1], E.e1[0]) * 180 / Math.PI; E.el = Math.asin(E.e1[2]) * 180 / Math.PI; }, 'atalho');
		UT.botao(p, controlos, 'Vista inicial', () => { E.az = AZ; E.el = EL; }, 'atalho');
		UT.quebra(p, controlos);
		cxProj = UT.caixa(p, controlos, 'Projeção na direção de ⇀PQ', false);
		cxPlano = UT.caixa(p, controlos, 'Plano α', false);
		UT.quebra(p, controlos);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxInt = UT.caixa(p, controlos, 'Interpretação geométrica', false);
		cxSol.changed(() => { if (cxSol.checked()) cxInt.checked(false); });
		cxInt.changed(() => { if (cxInt.checked()) { cxSol.checked(false); cxPlano.checked(true); cxProj.checked(true); } });
	};

	const ponto = (X, nome, cor, dx, dy, coord, r = 10) => {
		const q = E.pr(X);
		p.noStroke(); p.fill(...cor); p.circle(q.x, q.y, r);
		if (nome) E.rot(nome, q.x + dx, q.y + dy, cor, 21, p.CENTER, p.ITALIC);
		if (coord) E.rot(coord, q.x + dx, q.y + dy + 19, COR.cinza, 14, p.CENTER, p.NORMAL);
	};

	p.draw = function () {
		E.camara();
		p.background(255);
		const v = dotPQ(k), certo = Math.abs(v - 3) < 1e-9, corV = certo ? COR.verde : COR.laranja;
		if (cxPlano.checked()) {
			E.desenharPlano(COR.plano, 34);
			const cant = E.pr(E.add(E.mul(u, 1), E.add(E.mul(E.e1, 3.1), E.mul(E.e2, -3.0))));
			E.rot('α', cant.x, cant.y, COR.plano, 26, p.CENTER, p.ITALIC);
		} else E.L = 0;                              // sem plano, nada fica escondido
		E.eixos(4.5, COR.eixo);
		// a parábola de R
		for (let kk = K0; kk < K1 - 1e-9; kk += 0.05) E.seg(R(kk), R(Math.min(kk + 0.05, K1)), COR.curva, 1.8, 200);
		// P, Q e o vetor PQ
		E.seta(P, Q, COR.pq, 3);
		ponto(P, 'P', COR.pq, -12, -24, '(1, −1, 3)', 8);
		ponto(Q, 'Q', COR.pq, 14, -24, '(3, 1, 2)', 8);
		{ const m = E.pr(E.mul(E.add(P, Q), 0.5)); E.nomeVetor('PQ', m.x, m.y + 26, COR.pq, 20); }
		// projeção de R na reta de O com a direção de PQ
		const Rk = R(k);
		if (cxProj.checked()) {
			E.seg(E.mul(u, -2.5), E.mul(u, 4.2), COR.pq, 1.4, 150);
			const s = v / 3, F = E.mul(u, s);         // ‖a‖ cos θ = a · PQ / ‖PQ‖
			p.drawingContext.setLineDash([6, 6]); E.seg(Rk, F, COR.cinza, 1.6); p.drawingContext.setLineDash([]);
			E.seg([0, 0, 0], F, corV, 4.5);
			ponto(F, '', corV, 0, 0, '', 9);
			ponto(u, 'H', COR.texto, 14, 16, '', 7);
		}
		E.L = 3.4;
		// o vetor a = OR e o ponto R (arrasta-se)
		E.seta([0, 0, 0], Rk, COR.a, 3.4);
		{ const m = E.pr(E.mul(Rk, 0.55)); E.nomeVetor('a', m.x - 14, m.y - 14, COR.a, 22); }
		if (cxSol.checked() || cxInt.checked()) { ponto(R(0), '', COR.verde, 0, 0, '', 9); ponto(R(1), '', COR.verde, 0, 0, '', 9); }
		{ const q = E.pr(Rk); p.stroke(255); p.strokeWeight(3); p.fill(...COR.a); p.circle(q.x, q.y, 18); E.rot('R', q.x + 16, q.y - 16, COR.a, 22, p.CENTER, p.ITALIC); }
		const q0 = E.pr([0, 0, 0]);
		p.noStroke(); p.fill(...COR.texto); p.circle(q0.x, q0.y, 8);
		E.rot('O', q0.x - 14, q0.y + 14, COR.texto, 19, p.CENTER, p.ITALIC);

		// valores atuais: em baixo, à esquerda
		let y = H - (cxProj.checked() ? 78 : 52);
		const L1 = (pecas, tam = 18) => { E.linha(pecas, 16, y, tam); y += 26; };
		L1([['k = ' + fmt(k) + '     ', COR.texto, p.BOLD], ['a', COR.a, p.BOLDITALIC, true], [' = (' + fmt(Rk[0]) + '; ' + fmt(Rk[1]) + '; −1)', COR.a]]);
		L1([['a', COR.a, p.BOLDITALIC, true], [' · ', null], ['PQ', COR.pq, p.BOLDITALIC, true], [' = ' + fmt(v), corV, p.BOLD], [certo ? '  =  ' : '  ≠  ', corV, p.BOLD], ['‖', null], ['PQ', COR.pq, p.BOLDITALIC, true], ['‖ = 3', null]]);
		if (cxProj.checked()) L1([['‖', null], ['a', COR.a, p.BOLDITALIC, true], ['‖ cos θ = ', null], ['a', COR.a, p.BOLDITALIC, true], [' · ', null], ['PQ', COR.pq, p.BOLDITALIC, true], [' / 3 = ' + fmt(v / 3), corV, p.BOLD], ['   (H está a 1 de O)', COR.cinza]]);
		// solução e interpretação: em cima, à esquerda
		y = 22;
		if (cxSol.checked()) {
			L1([['PQ', COR.pq, p.BOLDITALIC, true], [' = Q − P = (2, 2, −1),   ‖', null], ['PQ', COR.pq, p.BOLDITALIC, true], ['‖ = √9 = 3', null]]);
			L1([['a', COR.a, p.BOLDITALIC, true], [' · ', null], ['PQ', COR.pq, p.BOLDITALIC, true], [' = 2(1 − k) + 2k² + 1 = 2k² − 2k + 3', null]]);
			L1([['2k² − 2k + 3 = 3 ⇔ 2k(k − 1) = 0 ⇔ ', null], ['k = 0  ∨  k = 1', COR.verde, p.BOLD]], 19);
		}
		if (cxInt.checked()) {
			L1([['R = O + ', null], ['a', COR.a, p.BOLDITALIC, true], [' = (1 − k, k², −1) percorre uma parábola no plano z = −1', null]]);
			L1([['a', COR.a, p.BOLDITALIC, true], [' · ', null], ['PQ', COR.pq, p.BOLDITALIC, true], [' = 3 ⇔ 2x + 2y − z = 3 (com R(x, y, z)) ⇔ R ∈ α, plano ⊥ ', null], ['PQ', COR.pq, p.BOLDITALIC, true]]);
			L1([['‖', null], ['a', COR.a, p.BOLDITALIC, true], ['‖ cos θ = 1: R projeta-se em H = O + ', null], ['PQ', COR.pq, p.BOLDITALIC, true], ['/3, a 1 de O', null]]);
			L1([['A parábola atravessa α em k = 0, R(1, 0, −1), e k = 1, R(0, 1, −1)', COR.verde, p.BOLD]]);
		}
	};
};
