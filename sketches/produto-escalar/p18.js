/* =====================================================================
   Produto escalar · Problema 18 — reta perpendicular a um plano, pela origem
   (Itália, Esame di Stato 2015, sessão ordinária, quesito 5; pedido do utilizador, 2026-11-26)
   α: x + y − z = 0 ⇒ n = (1, 1, −1) é normal a α; a reta pela origem perpendicular a α tem a direção de n:
   r: (x, y, z) = k(1, 1, −1), k ∈ ℝ.
   3D em perspetiva (espaco3d.js): a vista roda arrastando o fundo; o que está atrás do plano fica a tracejado.
   ===================================================================== */
SKETCHES['pe-p18'] = function (p, controlos) {
	const W = 920, H = 600;
	const n = [1, 1, -1];
	const COR = { texto: [30, 41, 59], cinza: [100, 116, 139], eixo: [71, 85, 105], plano: [21, 101, 192], reta: [230, 81, 0], n: [21, 101, 192], verde: [46, 125, 50], zero: [239, 108, 0] };
	const E = ESPACO3D(p, { W, H, cx: 470, cy: 330, k: 62, n, L: 3.2, az: -32, el: 20 });
	let cxN, cxSol;

	p.setup = function () {
		E.arrastar(p.createCanvas(W, H).elt);
		p.textFont('Source Sans Pro');
		p.createSpan('Arrasta para rodar a vista ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'Vista de lado (α de perfil)', () => { E.az = 135; E.el = 0; }, 'atalho');
		UT.botao(p, controlos, 'Vista inicial', () => { E.az = -32; E.el = 20; }, 'atalho');
		UT.quebra(p, controlos);
		cxN = UT.caixa(p, controlos, 'Vetor normal ao plano', false);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) cxN.checked(true); });
	};

	p.draw = function () {
		E.camara();
		p.background(255);
		E.desenharPlano(COR.plano, 45);
		E.eixos(4, COR.eixo);
		const q0 = E.pr([0, 0, 0]);
		const cant = E.pr(E.add(E.mul(E.e1, 2.6), E.mul(E.e2, 2.6)));
		E.rot('α', cant.x, cant.y, COR.plano, 26, p.CENTER, p.ITALIC);
		if (cxSol.checked()) {
			const u = E.unit(n);
			E.seg(E.mul(u, -4.2), E.mul(u, 4.2), COR.reta, 3.2);
			const fim = E.pr(E.mul(u, 4.2));
			E.rot('r', fim.x + 14, fim.y, COR.reta, 24, p.LEFT, p.ITALIC);
			E.reto(n, E.e1, COR.zero, 0.42);
		}
		if (cxN.checked()) {
			E.seta([0, 0, 0], n, COR.n, 3.4);
			const q = E.pr(E.mul(n, 1.15));
			E.nomeVetor('n', q.x + 16, q.y, COR.n, 22);
		}
		p.noStroke(); p.fill(...COR.texto); p.circle(q0.x, q0.y, 8);
		E.rot('O', q0.x - 14, q0.y + 14, COR.texto, 19, p.CENTER, p.ITALIC);

		// textos
		let y = 26;
		const L1 = (pecas, tam = 19) => { E.linha(pecas, 20, y, tam); y += 29; };
		L1([['α: x + y − z = 0', COR.plano, p.BOLD]], 20);
		if (cxN.checked()) L1([['Um vetor normal a α: ', null], ['n', COR.n, p.BOLDITALIC, true], [' = (1, 1, −1)', COR.n]]);
		if (!cxSol.checked()) return;
		L1([['A reta r é perpendicular a α ⇔ tem a direção de ', null], ['n', COR.n, p.BOLDITALIC, true]]);
		L1([['r passa na origem: ', null], ['r: (x, y, z) = k(1, 1, −1), k ∈ ℝ', COR.verde, p.BOLD]]);
	};
};
