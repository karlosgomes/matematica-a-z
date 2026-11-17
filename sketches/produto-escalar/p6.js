/* =====================================================================
   Produto escalar · Problema 6 — quatro pontos numa circunferência
   Diâmetro [AB] (AB = 8; O na origem, raio 4). Arrasta-se C na semicircunferência de cima:
   AC ⊥ BC (ângulo inscrito numa semicircunferência). D = A + ½AB − 2BC, construído com as
   pontas encadeadas; |OD| em tempo real, com íman quando D está na circunferência (cos φ = 7/8).
   ===================================================================== */
SKETCHES['pe-p6'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 262, y: 190 }, K = 42, R = 4;
	const FMIN = 5, FMAX = 72;                               // amplitude de φ (graus) permitida a C
	const F0 = Math.acos(7 / 8) * 180 / Math.PI;            // ≈ 28,96°
	const COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], u: [21, 101, 192], v: [123, 31, 162], soma: [0, 131, 143],
		pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47], texto: [30, 41, 59], cinza: [100, 116, 139]
	};
	const st = { f: 50, alvo: null };
	let agarrado = false, cxCaminho, cxSol;

	const X = x => O.x + x * K, Y = y => O.y - y * K;

	p.setup = function () {
		arrastar(p.createCanvas(W, H).elt);
		p.textFont('Source Sans Pro');
		p.createSpan('Arrasta o ponto C na circunferência ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'Início', () => { st.alvo = 50; }, 'atalho');
		UT.quebra(p, controlos);
		cxCaminho = UT.caixa(p, controlos, 'Caminho de D', false);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) st.alvo = F0; });
	};

	// arrastar C (ponteiro convertido com o retângulo do canvas, que o Reveal escala)
	function arrastar(cv) {
		cv.style.touchAction = 'none';
		const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		const perto = (x, y) => { const f = p.radians(st.f); return Math.hypot(X(R * Math.cos(f)) - x, Y(R * Math.sin(f)) - y) < 28; };
		cv.addEventListener('pointerdown', e => {
			const [x, y] = pos(e);
			if (!perto(x, y)) return;
			agarrado = true; st.alvo = null;
			cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault();
		});
		cv.addEventListener('pointermove', e => {
			const [x, y] = pos(e);
			if (!agarrado) { cv.style.cursor = perto(x, y) ? 'grab' : 'default'; return; }
			let f = Math.atan2(O.y - y, x - O.x) * 180 / Math.PI;
			if (f < -90) f = FMAX;                                // ponteiro à esquerda, em baixo
			f = p.constrain(f, FMIN, FMAX);
			if (Math.abs(f - F0) < 1.5) f = F0;                   // íman: D na circunferência
			st.f = f;
		});
		const fim = () => { agarrado = false; cv.style.cursor = 'default'; };
		cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
		['touchstart', 'touchmove'].forEach(t => cv.addEventListener(t, e => e.stopPropagation(), { passive: true }));
	}

	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	// nome de vetor com seta por cima; pre = coeficiente antes (sem seta)
	function nomeVetor(l, x, y, cor, tam = 22, pre = '') {
		p.textSize(tam); p.textStyle(p.BOLDITALIC);
		const wp = pre ? (p.textStyle(p.BOLD), p.textWidth(pre)) : 0;
		p.textStyle(p.BOLDITALIC); const w = p.textWidth(l), x0 = x - (wp + w) / 2;
		if (pre) rot(pre, x0, y, cor, tam, p.LEFT, p.BOLD);
		rot(l, x0 + wp, y, cor, tam, p.LEFT, p.BOLDITALIC);
		const yy = y - tam * 0.66, a = x0 + wp, b = a + w;
		p.stroke(...cor); p.strokeWeight(2); p.line(a, yy, b, yy);
		p.noStroke(); p.fill(...cor); p.triangle(b + 4, yy, b - 3, yy - 4, b - 3, yy + 4);
	}
	function seta(x1, y1, x2, y2, cor, peso = 4, alfa = 255) {
		p.stroke(...cor, alfa); p.strokeWeight(peso); p.line(x1, y1, x2, y2);
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...cor, alfa); p.triangle(0, 0, -16, -6, -16, 6); p.pop();
	}
	function linha(pecas, x, y, tam = 21) {
		p.textSize(tam); p.textAlign(p.LEFT, p.CENTER); p.noStroke();
		for (const [t, cor, est, vec] of pecas) {
			const c = cor || COR.texto;
			p.textStyle(est || p.NORMAL); p.fill(...c); p.text(t, x, y);
			const w = p.textWidth(t);
			if (vec) {
				const yy = y - tam * 0.62;
				p.stroke(...c); p.strokeWeight(1.6); p.line(x + 1, yy, x + w - 1, yy);
				p.noStroke(); p.triangle(x + w + 2, yy, x + w - 4, yy - 3.5, x + w - 4, yy + 3.5);
			}
			x += w;
		}
		return x;
	}
	const V = (t, cor) => [t, cor, p.BOLDITALIC, true];

	p.draw = function () {
		if (st.alvo !== null && !agarrado) {
			st.f += (st.alvo - st.f) * (1 - Math.exp(-p.deltaTime / 150));
			if (Math.abs(st.alvo - st.f) < 0.05) { st.f = st.alvo; st.alvo = null; }
		}
		const f = p.radians(st.f), cf = Math.cos(f), sf = Math.sin(f);
		const A = [-R, 0], B = [R, 0], C = [R * cf, R * sf];
		const D = [8 - 8 * cf, -8 * sf], M = [0, 0];               // M = A + ½AB = O
		const od = Math.hypot(...D), naCirc = Math.abs(st.f - F0) < 1e-6;
		const sol = cxSol.checked();
		p.background(255);

		// eixos esbatidos
		p.stroke(...COR.grelha); p.strokeWeight(1);
		for (let i = -5; i <= 6; i++) p.line(X(i), Y(-8.6), X(i), Y(4.6));
		for (let j = -8; j <= 4; j++) p.line(X(-5), Y(j), X(6), Y(j));
		p.stroke(...COR.eixo, 130); p.strokeWeight(1.3);
		p.line(X(-5), O.y, X(6), O.y); p.line(O.x, Y(-8.6), O.x, Y(4.6));

		// circunferência
		p.noFill(); p.stroke(...COR.texto); p.strokeWeight(2.2); p.circle(O.x, O.y, 2 * R * K);
		// caminho de D (circunferência de centro (8, 0) e raio 8), só para os valores de φ permitidos
		if (cxCaminho.checked()) {
			p.drawingContext.setLineDash([6, 6]); p.stroke(...COR.soma, 120); p.strokeWeight(1.8); p.noFill();
			p.beginShape();
			for (let g = FMIN; g <= FMAX; g += 1) { const r = p.radians(g); p.vertex(X(8 - 8 * Math.cos(r)), Y(-8 * Math.sin(r))); }
			p.endShape(); p.drawingContext.setLineDash([]);
		}

		// diâmetro [AB]
		p.stroke(...COR.texto, 160); p.strokeWeight(1.6); p.line(X(A[0]), Y(0), X(B[0]), Y(0));

		// AC e BC com o ângulo reto em C
		seta(X(A[0]), Y(A[1]), X(C[0]), Y(C[1]), COR.u, 3);
		seta(X(B[0]), Y(B[1]), X(C[0]), Y(C[1]), COR.v, 3);
		{
			const q = 14, ua = [A[0] - C[0], A[1] - C[1]], ub = [B[0] - C[0], B[1] - C[1]];
			const na = Math.hypot(...ua), nb = Math.hypot(...ub);
			const P1 = [X(C[0]) + q * ua[0] / na, Y(C[1]) - q * ua[1] / na], P2 = [X(C[0]) + q * ub[0] / nb, Y(C[1]) - q * ub[1] / nb];
			p.noFill(); p.stroke(...COR.zero); p.strokeWeight(2.2);
			p.beginShape(); p.vertex(...P1); p.vertex(P1[0] + P2[0] - X(C[0]), P1[1] + P2[1] - Y(C[1])); p.vertex(...P2); p.endShape();
		}

		// construção de AD: ½AB (de A até O) e −2BC (de O até D), esbatidos
		seta(X(A[0]), Y(A[1]) + 0, X(M[0]), Y(M[1]), COR.cinza, 4, 130);
		seta(X(M[0]), Y(M[1]), X(D[0]), Y(D[1]), COR.v, 4, 110);
		// AD
		seta(X(A[0]), Y(A[1]), X(D[0]), Y(D[1]), COR.soma, 4.5);
		// |OD| como segmento fino
		p.drawingContext.setLineDash([4, 5]); p.stroke(...(naCirc ? COR.pos : COR.cinza), 170); p.strokeWeight(1.5);
		p.line(O.x, O.y, X(D[0]), Y(D[1])); p.drawingContext.setLineDash([]);

		// nomes dos vetores
		nomeVetor('AB', X(-2), Y(0) + 26, COR.cinza, 20, '½');
		{
			const mx = X(D[0] / 2), my = Y(D[1] / 2), nx = -D[1], ny = D[0], n = Math.hypot(nx, ny);
			nomeVetor('BC', mx + 34 * nx / n, my - 34 * ny / n + 6, [...COR.v], 20, '−2');
		}
		{
			const mx = X((A[0] + D[0]) / 2), my = Y((A[1] + D[1]) / 2);
			nomeVetor('AD', mx - 30, my + 18, COR.soma, 22);
		}
		{
			const mx = X((A[0] + C[0]) / 2), my = Y((A[1] + C[1]) / 2);
			nomeVetor('AC', mx - 22, my - 16, COR.u, 21);
			const bx = X((B[0] + C[0]) / 2), by = Y((B[1] + C[1]) / 2);
			nomeVetor('BC', bx + 28, by + 4, COR.v, 21);
		}

		// pontos
		const pt = (q, n, dx, dy, cor = COR.texto, etq = '') => {
			p.noStroke(); p.fill(...cor); p.circle(X(q[0]), Y(q[1]), 9);
			rot(n, X(q[0]) + dx, Y(q[1]) + dy, cor, 24, dx < 0 ? p.RIGHT : dx > 0 ? p.LEFT : p.CENTER);
			if (etq) rot(etq, X(q[0]) + dx + (dx < 0 ? -22 : 22), Y(q[1]) + dy + 1, COR.cinza, 15, dx < 0 ? p.RIGHT : p.LEFT, p.NORMAL);
		};
		pt(A, 'A', -12, -16, COR.texto, '(−4, 0)');
		pt(B, 'B', 12, -16, COR.texto, '(4, 0)');
		pt(M, 'O', -8, -16, COR.cinza);
		pt(C, 'C', 12, -16, COR.texto, sol && naCirc ? '(7/2, √15/2)' : '');
		pt(D, 'D', 14, 12, naCirc ? COR.pos : COR.texto, sol && naCirc ? '(1, −√15)' : '');
		p.noStroke(); p.fill(...COR.texto); p.circle(X(C[0]), Y(C[1]), 13);       // C é o que se arrasta
		p.fill(255); p.circle(X(C[0]), Y(C[1]), 5);

		// leitura em tempo real
		const x0 = 545, cl = naCirc ? COR.pos : COR.texto;
		p.noStroke(); p.fill(255, 235); p.rect(x0 - 14, 12, W - x0 + 4, 116, 10);
		linha([V('AC', COR.u), [' · ', null], V('BC', COR.v), [' = 0', null], ['   (ângulo reto em C)', COR.cinza]], x0, 36);
		linha([['|OD| ≈ ' + UT.fmt(od, 2), cl, naCirc ? p.BOLD : p.NORMAL], ['   (raio 4)', COR.cinza]], x0, 72);
		linha(naCirc ? [['D pertence à circunferência ✓', COR.pos, p.BOLD]] : [['D ainda não está na circunferência', COR.cinza]], x0, 106);

		// solução
		if (sol) {
			p.noStroke(); p.fill(255, 240); p.stroke(226, 232, 240); p.strokeWeight(1.5); p.rect(x0 - 14, 300, W - x0 + 4, 288, 10);
			let y = 324;
			linha([['C = (4 cos φ, 4 sen φ)', null]], x0, y); y += 32;
			linha([V('AD'), [' = ½', null], V('AB'), [' − 2', null], V('BC'), [' ⇒ ', null]], x0, y); y += 32;
			linha([['D = (8 − 8 cos φ, −8 sen φ)', null]], x0, y); y += 32;
			linha([['|OD| = 4 ⇔ 128 (1 − cos φ) = 16', null]], x0, y); y += 32;
			linha([['⇔ ', null], ['cos φ = 7/8', COR.pos, p.BOLD], ['  ⇒  sen φ = √15/8', null]], x0, y); y += 32;
			linha([['D = (1, −√15)   ', null], V('AD', COR.soma), [' = (5, −√15)', COR.soma]], x0, y); y += 36;
			linha([['‖', null], V('AD', COR.soma), ['‖² = 25 + 15 = ', null], ['40   (D)', COR.pos, p.BOLD]], x0, y, 23);
		}
	};
};
