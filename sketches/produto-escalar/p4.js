/* =====================================================================
   Produto escalar · Problema 4 — hexágono regular [ABCDEF] de lado 1
   AE (azul) e BC (roxo). Um representante de BC desloca-se (botões ou arrastando,
   com íman nos nós da quadrícula de triângulos): na ponta de AE vê-se AE + BC
   (2.1); na origem A de AE vê-se o ângulo dos dois vetores (2.2).
   ===================================================================== */
SKETCHES['pe-p4'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 440, y: 345 }, K = 145;           // centro do hexágono e escala (px por unidade)
	const R3 = Math.sqrt(3), h3 = R3 / 2;
	const COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], u: [21, 101, 192], v: [123, 31, 162], soma: [0, 131, 143],
		pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47], texto: [30, 41, 59], cinza: [100, 116, 139]
	};
	const P = {
		A: [-0.5, h3], B: [-1, 0], C: [-0.5, -h3], D: [0.5, -h3], E: [1, 0], F: [0.5, h3]
	};
	const AE = [P.E[0] - P.A[0], P.E[1] - P.A[1]], BC = [P.C[0] - P.B[0], P.C[1] - P.B[1]];
	const dot = AE[0] * BC[0] + AE[1] * BC[1];
	// origem do representante de BC que se desloca (e o alvo da animação)
	const rep = { x: P.B[0], y: P.B[1] }, alvo = { x: P.B[0], y: P.B[1] };
	let agarrado = false, desvio = [0, 0], cxGrelha, cxRef, cxSol;

	const X = x => O.x + x * K, Y = y => O.y - y * K;
	const em = (q, eps = 0.02) => Math.hypot(rep.x - q[0], rep.y - q[1]) < eps;

	p.setup = function () {
		arrastar(p.createCanvas(W, H).elt);
		p.textFont('Source Sans Pro');
		p.createSpan('Arrasta o vetor BC ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'Soma (4.1)', () => ir(P.E), 'atalho');
		UT.botao(p, controlos, 'Ângulo (4.2)', () => ir(P.A), 'atalho');
		UT.botao(p, controlos, 'Início', () => ir(P.B), 'atalho');
		UT.quebra(p, controlos);
		cxGrelha = UT.caixa(p, controlos, 'Quadrícula de triângulos', false);
		cxRef = UT.caixa(p, controlos, 'Referencial', false);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
	};
	function ir(q) { alvo.x = q[0]; alvo.y = q[1]; }
	// nó mais próximo da quadrícula de triângulos (i·(1, 0) + j·(1/2, √3/2))
	function no(x, y) {
		const j = p.constrain(Math.round(y / h3), -2, 2), i = p.constrain(Math.round(x - 0.5 * j), -3, 3);
		return [i + 0.5 * j, j * h3];
	}

	// arrastar o representante de BC (ponteiro convertido com o retângulo do canvas, que o Reveal escala)
	function arrastar(cv) {
		cv.style.touchAction = 'none';
		const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		const perto = (x, y) => {
			const ax = X(rep.x), ay = Y(rep.y), bx = X(rep.x + BC[0]), by = Y(rep.y + BC[1]);
			const dx = bx - ax, dy = by - ay, t = p.constrain(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1);
			return Math.hypot(ax + t * dx - x, ay + t * dy - y) < 22;
		};
		cv.addEventListener('pointerdown', e => {
			const [x, y] = pos(e);
			if (!perto(x, y)) return;
			agarrado = true; desvio = [(x - O.x) / K - rep.x, (O.y - y) / K - rep.y];
			cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault();
		});
		cv.addEventListener('pointermove', e => {
			const [x, y] = pos(e);
			if (!agarrado) { cv.style.cursor = perto(x, y) ? 'grab' : 'default'; return; }
			rep.x = p.constrain((x - O.x) / K - desvio[0], -2.6, 2.6);
			rep.y = p.constrain((O.y - y) / K - desvio[1], -1.5, 2);
			alvo.x = rep.x; alvo.y = rep.y;
		});
		const fim = () => { if (agarrado) ir(no(rep.x, rep.y)); agarrado = false; cv.style.cursor = 'default'; };
		cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
		['touchstart', 'touchmove'].forEach(t => cv.addEventListener(t, e => e.stopPropagation(), { passive: true }));
	}

	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	// nome de vetor (uma ou duas letras) com seta por cima
	function nomeVetor(l, x, y, cor, tam = 24) {
		rot(l, x, y, cor, tam, p.CENTER, p.BOLDITALIC);
		const w = p.textWidth(l), yy = y - tam * 0.66;
		p.stroke(...cor); p.strokeWeight(2); p.line(x - w * 0.5, yy, x + w * 0.5, yy);
		p.noStroke(); p.fill(...cor); p.triangle(x + w * 0.5 + 4, yy, x + w * 0.5 - 3, yy - 4, x + w * 0.5 - 3, yy + 4);
	}
	function seta(x1, y1, x2, y2, cor, peso = 4, alfa = 255) {
		p.stroke(...cor, alfa); p.strokeWeight(peso); p.line(x1, y1, x2, y2);
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...cor, alfa); p.triangle(0, 0, -18, -7, -18, 7); p.pop();
	}
	// texto às peças: [texto, cor, estilo, vetor?]; o 4.º elemento põe uma seta por cima
	function linha(pecas, x, y, tam = 22) {
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
	const vAE = ['AE', COR.u, p.BOLDITALIC, true], vBC = ['BC', COR.v, p.BOLDITALIC, true];

	p.draw = function () {
		// animação do representante de BC
		if (!agarrado) {
			const k = 1 - Math.exp(-p.deltaTime / 140);
			rep.x += (alvo.x - rep.x) * k; rep.y += (alvo.y - rep.y) * k;
			if (Math.hypot(alvo.x - rep.x, alvo.y - rep.y) < 0.002) { rep.x = alvo.x; rep.y = alvo.y; }
		}
		const parado = !agarrado && rep.x === alvo.x && rep.y === alvo.y;
		const naSoma = parado && em(P.E), noAngulo = parado && em(P.A);
		p.background(255);

		// quadrícula de triângulos (esbatida)
		if (cxGrelha.checked()) {
			const ctx = p.drawingContext; ctx.save(); ctx.beginPath(); ctx.rect(20, 150, W - 40, H - 170); ctx.clip();
			p.stroke(...COR.grelha); p.strokeWeight(1.2);
			for (let j = -4; j <= 4; j++) p.line(0, Y(j * h3), W, Y(j * h3));
			for (let i = -8; i <= 8; i++) {
				// x − y/√3 = i  e  x + y/√3 = i
				p.line(X(i - 3 / R3), Y(-3), X(i + 3 / R3), Y(3));
				p.line(X(i + 3 / R3), Y(-3), X(i - 3 / R3), Y(3));
			}
			ctx.restore();
			p.noStroke(); p.fill(...COR.cinza, 90);
			for (let j = -1; j <= 1; j++) for (let i = -4; i <= 4; i++) {
				const x = i + 0.5 * j; if (Math.abs(x) <= 2.6) p.circle(X(x), Y(j * h3), 5);
			}
		}
		// referencial (esbatido)
		if (cxRef.checked()) {
			p.stroke(...COR.eixo, 150); p.strokeWeight(1.4);
			p.line(X(-2.4), O.y, X(2.5), O.y); p.line(O.x, Y(-1.35), O.x, Y(1.35));
			p.noStroke(); p.fill(...COR.eixo, 150); p.triangle(X(2.5), O.y, X(2.5) - 10, O.y - 4, X(2.5) - 10, O.y + 4);
			p.triangle(O.x, Y(1.35), O.x - 4, Y(1.35) + 10, O.x + 4, Y(1.35) + 10);
			rot('x', X(2.5) - 4, O.y + 16, COR.eixo, 17, p.CENTER, p.ITALIC);
			rot('y', O.x + 14, Y(1.35) + 6, COR.eixo, 17, p.CENTER, p.ITALIC);
		}

		// hexágono
		const nomes = ['A', 'B', 'C', 'D', 'E', 'F'];
		p.fill(241, 245, 249, 160); p.stroke(...COR.texto); p.strokeWeight(2.2);
		p.beginShape(); for (const n of nomes) p.vertex(X(P[n][0]), Y(P[n][1])); p.endShape(p.CLOSE);
		p.noStroke(); p.fill(...COR.texto); p.circle(O.x, O.y, 7);
		rot('O', O.x + 14, O.y + 14, COR.cinza, 17);
		const coords = { A: '(−1/2, √3/2)', B: '(−1, 0)', C: '(−1/2, −√3/2)', D: '(1/2, −√3/2)', E: '(1, 0)', F: '(1/2, √3/2)' };
		for (const n of nomes) {
			const [x, y] = P[n], lx = X(x * 1.24), ly = Y(y * 1.24);
			p.noStroke(); p.fill(...COR.texto); p.circle(X(x), Y(y), 8);
			rot(n, lx, ly, COR.texto, 24);
			if (cxRef.checked()) {
				const dir = x > 0.1 ? 1 : x < -0.1 ? -1 : 0;
				if (Math.abs(y) < 0.1) rot(coords[n], lx, ly + 24, COR.cinza, 15, p.CENTER, p.NORMAL);
				else rot(coords[n], lx + dir * 14, ly + (y > 0 ? -22 : 22), COR.cinza, 15, dir > 0 ? p.LEFT : p.RIGHT, p.NORMAL);
			}
		}

		// representante original de BC, esbatido, quando o outro saiu de B
		const fora = !em(P.B, 0.01);
		if (fora) seta(X(P.B[0]), Y(P.B[1]), X(P.C[0]), Y(P.C[1]), COR.v, 3, 70);

		// 2.1: AE + BC com o paralelogramo esbatido
		const S = [P.A[0] + AE[0] + BC[0], P.A[1] + AE[1] + BC[1]], Q = [P.A[0] + BC[0], P.A[1] + BC[1]];
		if (naSoma) {
			p.noStroke(); p.fill(...COR.soma, 22);
			p.quad(X(P.A[0]), Y(P.A[1]), X(P.E[0]), Y(P.E[1]), X(S[0]), Y(S[1]), X(Q[0]), Y(Q[1]));
			p.drawingContext.setLineDash([7, 7]); p.stroke(...COR.soma, 120); p.strokeWeight(1.8);
			p.line(X(P.A[0]), Y(P.A[1]), X(Q[0]), Y(Q[1])); p.line(X(Q[0]), Y(Q[1]), X(S[0]), Y(S[1]));
			p.drawingContext.setLineDash([]);
			seta(X(P.A[0]), Y(P.A[1]), X(S[0]), Y(S[1]), COR.soma, 4.5);
			p.noStroke(); p.fill(...COR.soma); p.circle(X(S[0]), Y(S[1]), 9);
			// nome do vetor soma, abaixo do meio
			const mx = (X(P.A[0]) + X(S[0])) / 2, my = (Y(P.A[1]) + Y(S[1])) / 2;
			const xs = mx - 150, ys = my + 34;
			p.stroke(255); p.strokeWeight(8); p.fill(255); p.rect(xs - 4, ys - 26, 112, 40, 6);
			linha([['AE', COR.soma, p.BOLDITALIC, true], [' + ', COR.soma, p.BOLD], ['BC', COR.soma, p.BOLDITALIC, true]], xs, ys, 22);
		}

		// 2.2: ângulo dos vetores com origem comum em A
		if (noAngulo) {
			const cs = dot > 0 ? COR.pos : dot < 0 ? COR.neg : COR.zero;
			const a0 = Math.atan2(AE[1], AE[0]), a1 = Math.atan2(BC[1], BC[0]), r = 62;
			p.fill(...cs, 50); p.stroke(...cs); p.strokeWeight(2.5);
			p.arc(X(P.A[0]), Y(P.A[1]), 2 * r, 2 * r, -a0, -a1, p.PIE);
			const am = (a0 + a1) / 2;
			rot(cxSol.checked() ? '30°' : 'θ', X(P.A[0]) + (r + 22) * Math.cos(am), Y(P.A[1]) - (r + 22) * Math.sin(am), cs, 22, p.CENTER, cxSol.checked() ? p.BOLD : p.BOLDITALIC);
		}

		// vetores
		seta(X(P.A[0]), Y(P.A[1]), X(P.E[0]), Y(P.E[1]), COR.u);
		nomeVetor('AE', (X(P.A[0]) + X(P.E[0])) / 2 + 14, (Y(P.A[1]) + Y(P.E[1])) / 2 - 22, COR.u);
		const b0 = [X(rep.x), Y(rep.y)], b1 = [X(rep.x + BC[0]), Y(rep.y + BC[1])];
		seta(...b0, ...b1, COR.v);
		nomeVetor('BC', (b0[0] + b1[0]) / 2 + (rep.x > 0.2 ? 30 : -30), (b0[1] + b1[1]) / 2 + 2, COR.v);
		p.noStroke(); p.fill(...COR.v); p.circle(...b0, 8);

		// solução
		if (cxSol.checked()) {
			p.noStroke(); p.fill(255, 240); p.stroke(226, 232, 240); p.strokeWeight(1.5); p.rect(14, 10, 640, 140, 10);
			let y = 30;
			linha([vAE, [' = (3/2, −√3/2)      ', COR.u], vBC, [' = (1/2, −√3/2)', COR.v]], 28, y); y += 32;
			linha([vAE, [' + ', null], vBC, [' = (2, −√3)    ⇒   ‖', null], vAE, [' + ', null], vBC, ['‖ = √(4 + 3) = ', null], ['√7   (B)', COR.soma, p.BOLD]], 28, y); y += 32;
			linha([vAE, [' · ', null], vBC, [' = 3/4 + 3/4 = ', null], ['3/2', COR.pos, p.BOLD], ['      ‖', null], vAE, ['‖ = √3,  ‖', null], vBC, ['‖ = 1', null]], 28, y); y += 32;
			linha([['cos θ = (3/2) / (√3 × 1) = √3/2   ⇒   ', null], ['θ = 30°', COR.pos, p.BOLD]], 28, y);
		}
	};
};
