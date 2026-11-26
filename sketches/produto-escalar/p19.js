/* =====================================================================
   Produto escalar · Problema 19 — o plano que passa em O, A e C
   (Itália, Esame di Stato 2015, sessão suplementar, quesito 4; pedido do utilizador, 2026-11-26)
   A(−3, 4, 0), C(−2, 1, 2). n = (a, b, c) ⊥ OA e ⊥ OC (sem produto vetorial, que não é do 11.º ano):
   −3a + 4b = 0 e −2a + b + 2c = 0; com a = 8: b = 6, c = 5 ⇒ n = (8, 6, 5); E passa em O ⇒ E: 8x + 6y + 5z = 0.
   ===================================================================== */
SKETCHES['pe-p19'] = function (p, controlos) {
	const W = 920, H = 600;
	const A = [-3, 4, 0], C = [-2, 1, 2], n = [8, 6, 5];
	const COR = { texto: [30, 41, 59], cinza: [100, 116, 139], eixo: [71, 85, 105], plano: [123, 31, 162], u: [21, 101, 192], v: [123, 31, 162], n: [46, 125, 50], verde: [46, 125, 50], zero: [239, 108, 0] };
	const E = ESPACO3D(p, { W, H, cx: 470, cy: 350, k: 50, n, L: 4.2, az: 20, el: 22 });
	let cxPlano, cxSol;

	p.setup = function () {
		E.arrastar(p.createCanvas(W, H).elt);
		p.textFont('Source Sans Pro');
		p.createSpan('Arrasta para rodar a vista ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'Vista de lado (E de perfil)', () => { E.az = Math.atan2(E.e2[1], E.e2[0]) * 180 / Math.PI; E.el = Math.asin(E.e2[2]) * 180 / Math.PI; }, 'atalho');   // a olhar ao longo de e2: E fica de perfil e A não cai em O
		UT.botao(p, controlos, 'Vista inicial', () => { E.az = 20; E.el = 22; }, 'atalho');
		UT.quebra(p, controlos);
		cxPlano = UT.caixa(p, controlos, 'Plano E', true);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
	};

	p.draw = function () {
		E.camara();
		p.background(255);
		if (cxPlano.checked()) {
			E.desenharPlano(COR.plano, 38);
			const cant = E.pr(E.add(E.mul(E.e1, 3.8), E.mul(E.e2, -3.6)));
			E.rot('E', cant.x, cant.y, COR.plano, 26, p.CENTER, p.ITALIC);
		} else E.L = 0;                              // sem plano, nada fica escondido
		E.eixos(4.5, COR.eixo);
		E.L = 4.2;
		E.seta([0, 0, 0], A, COR.u, 3.2);
		E.seta([0, 0, 0], C, COR.v, 3.2);
		const ponto = (P, nome, cor, dx, dy, coord) => {
			const q = E.pr(P);
			p.noStroke(); p.fill(...cor); p.circle(q.x, q.y, 10);
			E.rot(nome, q.x + dx, q.y + dy, cor, 21, p.CENTER, p.ITALIC);
			E.rot(coord, q.x + dx, q.y + dy + 20, COR.cinza, 14, p.CENTER, p.NORMAL);
		};
		ponto(A, 'A', COR.u, 10, -26, '(−3, 4, 0)');
		ponto(C, 'C', COR.v, -10, -30, '(−2, 1, 2)');
		const q0 = E.pr([0, 0, 0]);
		p.noStroke(); p.fill(...COR.texto); p.circle(q0.x, q0.y, 8);
		E.rot('O', q0.x - 14, q0.y + 14, COR.texto, 19, p.CENTER, p.ITALIC);
		if (cxSol.checked()) {
			const u = E.mul(E.unit(n), 2.6);
			E.seta([0, 0, 0], u, COR.n, 3.4);
			const q = E.pr(E.mul(u, 1.12));
			E.nomeVetor('n', q.x + 14, q.y, COR.n, 22);
			E.reto(u, A, COR.zero, 0.4); E.reto(u, C, COR.zero, 0.4);
		}

		// textos
		let y = 24;
		const L1 = (pecas, tam = 18) => { E.linha(pecas, 18, y, tam); y += 27; };
		if (!cxSol.checked()) return;
		L1([['n', COR.n, p.BOLDITALIC, true], [' = (a, b, c) normal a E:  ', null], ['n', COR.n, p.BOLDITALIC, true], [' · ', null], ['OA', COR.u, p.BOLDITALIC, true], [' = 0  e  ', null], ['n', COR.n, p.BOLDITALIC, true], [' · ', null], ['OC', COR.v, p.BOLDITALIC, true], [' = 0', null]]);
		L1([['−3a + 4b = 0   e   −2a + b + 2c = 0', null]]);
		L1([['a = 8 ⇒ b = 6 ⇒ −16 + 6 + 2c = 0 ⇔ c = 5:  ', null], ['n', COR.n, p.BOLDITALIC, true], [' = (8, 6, 5)', COR.n]]);
		L1([['E passa em O ⇒ ', null], ['E: 8x + 6y + 5z = 0', COR.verde, p.BOLD]], 19);
	};
};
