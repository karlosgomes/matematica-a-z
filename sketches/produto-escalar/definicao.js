/* =====================================================================
   Produto escalar · Resumo 1 — definição e expressão nas coordenadas
   Dois vetores do plano com coordenadas inteiras (cursores) e a conta
   u·v = u1 v1 + u2 v2, com o resultado na cor do sinal.
   ===================================================================== */
SKETCHES['pe-definicao'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 470, y: 330 }, K = 46;            // origem e escala (px por unidade)
	const COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], u: [21, 101, 192], v: [123, 31, 162],
		pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47], texto: [30, 41, 59]
	};
	let s = {}, cxComp, cxQuad;

	const X = x => O.x + x * K, Y = y => O.y - y * K;

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');
		const ini = { u1: 3, u2: 1, v1: 1, v2: 2 };
		for (const k of ['u1', 'u2', 'v1', 'v2']) {
			s[k] = UT.slider(p, controlos, k[0] + '₁₂'[+k[1] - 1] , -5, 5, ini[k], 1);
			if (k === 'u2') UT.quebra(p, controlos);
		}
		UT.quebra(p, controlos);
		UT.botao(p, controlos, 'Perpendiculares', () => set(3, 1, -1, 3), 'atalho');
		UT.botao(p, controlos, 'Ângulo obtuso', () => set(3, 1, -2, 2), 'atalho');
		UT.botao(p, controlos, 'Mesma direção', () => set(2, 1, 4, 2), 'atalho');
		UT.botao(p, controlos, 'Início', () => set(3, 1, 1, 2), 'atalho');
		UT.quebra(p, controlos);
		cxComp = UT.caixa(p, controlos, 'Mostrar as coordenadas', true);
		cxQuad = UT.caixa(p, controlos, 'Mostrar u · u = ‖u‖²', false);
	};
	function set(a, b, c, d) { s.u1.value(a); s.u2.value(b); s.v1.value(c); s.v2.value(d); }

	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	// letra com seta por cima (vetor)
	function nomeVetor(l, x, y, cor, tam = 26) {
		rot(l, x, y, cor, tam, p.CENTER, p.BOLDITALIC);
		const w = p.textWidth(l);
		p.stroke(...cor); p.strokeWeight(2);
		const yy = y - tam * 0.62;
		p.line(x - w * 0.55, yy, x + w * 0.55, yy);
		p.noStroke(); p.fill(...cor); p.triangle(x + w * 0.55 + 4, yy, x + w * 0.55 - 3, yy - 4, x + w * 0.55 - 3, yy + 4);
	}
	function seta(x1, y1, x2, y2, cor, peso = 4) {
		p.stroke(...cor); p.strokeWeight(peso); p.line(x1, y1, x2, y2);
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...cor); p.triangle(0, 0, -18, -7, -18, 7); p.pop();
	}
	// texto às peças: [[texto, cor], …] a partir de (x, y), alinhado à esquerda
	function linha(pecas, x, y, tam = 24) {
		p.textSize(tam); p.textStyle(p.NORMAL); p.textAlign(p.LEFT, p.CENTER); p.noStroke();
		for (const [t, cor, est] of pecas) {
			p.textStyle(est || p.NORMAL); p.fill(...(cor || COR.texto)); p.text(t, x, y); x += p.textWidth(t);
		}
		return x;
	}
	const par = v => v < 0 ? '(' + v + ')' : '' + v;

	p.draw = function () {
		const u1 = s.u1.value(), u2 = s.u2.value(), v1 = s.v1.value(), v2 = s.v2.value();
		const d = u1 * v1 + u2 * v2, cs = d > 0 ? COR.pos : d < 0 ? COR.neg : COR.zero;
		p.background(255);

		// quadrícula e eixos
		p.strokeWeight(1); p.stroke(...COR.grelha);
		for (let i = -9; i <= 9; i++) { p.line(X(i), Y(-5.6), X(i), Y(5.6)); }
		for (let j = -5; j <= 5; j++) { p.line(X(-9.5), Y(j), X(9.5), Y(j)); }
		p.stroke(...COR.eixo); p.strokeWeight(1.6);
		p.line(X(-9.5), O.y, X(9.5), O.y); p.line(O.x, Y(-5.6), O.x, Y(5.6));
		p.noStroke(); p.fill(...COR.eixo); p.textSize(14); p.textStyle(p.NORMAL); p.textAlign(p.CENTER, p.TOP);
		for (let i = -9; i <= 9; i++) if (i && Math.abs(i) <= 9) p.text(i, X(i), O.y + 5);
		p.textAlign(p.RIGHT, p.CENTER);
		for (let j = -5; j <= 5; j++) if (j) p.text(j, O.x - 6, Y(j));
		rot('O', O.x - 14, O.y + 16, COR.eixo, 18);

		// coordenadas (componentes a tracejado)
		if (cxComp.checked()) {
			p.drawingContext.setLineDash([6, 6]); p.strokeWeight(1.8);
			for (const [a, b, cor] of [[u1, u2, COR.u], [v1, v2, COR.v]]) {
				p.stroke(...cor, 160);
				p.line(X(a), Y(b), X(a), O.y); p.line(X(a), Y(b), O.x, Y(b));
			}
			p.drawingContext.setLineDash([]);
		}
		// vetores
		const vec = (a, b, cor, l) => {
			if (a === 0 && b === 0) { p.noStroke(); p.fill(...cor); p.circle(O.x, O.y, 12); return; }
			seta(O.x, O.y, X(a), Y(b), cor);
			const n = Math.hypot(a, b);
			nomeVetor(l, X(a) + a / n * 26, Y(b) - b / n * 26 + 4, cor);
		};
		vec(u1, u2, COR.u, 'u'); vec(v1, v2, COR.v, 'v');

		// a conta, em cima à esquerda
		p.noStroke(); p.fill(255, 235); p.rect(14, 12, 470, cxQuad.checked() ? 132 : 92, 10);
		let x = linha([['u', COR.u, p.BOLDITALIC], [' = (' + u1 + ', ' + u2 + ')     ', COR.u], ['v', COR.v, p.BOLDITALIC], [' = (' + v1 + ', ' + v2 + ')', COR.v]], 28, 36);
		x = linha([['u', COR.u, p.BOLDITALIC], [' · ', null], ['v', COR.v, p.BOLDITALIC], [' = ', null],
			[par(u1), COR.u], [' × ', null], [par(v1), COR.v], [' + ', null], [par(u2), COR.u], [' × ', null], [par(v2), COR.v],
			[' = ', null], ['' + d, cs, p.BOLD]], 28, 76);
		if (cxQuad.checked()) {
			const q = u1 * u1 + u2 * u2;
			linha([['u', COR.u, p.BOLDITALIC], [' · ', null], ['u', COR.u, p.BOLDITALIC], [' = ' + par(u1) + '² + ' + par(u2) + '² = ' + q + ' = ‖', null],
				['u', COR.u, p.BOLDITALIC], ['‖²', null]], 28, 116);
		}
		// sinal
		const txt = d > 0 ? 'u · v > 0 : ângulo agudo' : d < 0 ? 'u · v < 0 : ângulo obtuso' : (u1 || u2) && (v1 || v2) ? 'u · v = 0 : vetores perpendiculares' : 'um dos vetores é nulo';
		rot(txt, W - 20, H - 24, cs, 22, p.RIGHT, p.BOLD);
	};
};
