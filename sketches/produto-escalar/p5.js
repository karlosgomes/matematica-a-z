/* =====================================================================
   Produto escalar · Problema 5 — reta perpendicular a um vetor
   r passa em Q(4, 1) e é perpendicular a n = (1, 2). O aluno arrasta um
   ponto X pelo plano e vê n · QX = (x − 4) + 2(y − 1) na cor do sinal;
   o rasto (verde / vermelho, laranja onde dá 0) deixa ver a reta.
   Solução: x + 2y − 6 = 0, (6, 0) e (0, 3), a + b = 9.
   ===================================================================== */
SKETCHES['pe-p5'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 250, y: 410 }, K = 50;            // origem e escala (px por unidade)
	const COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], u: [21, 101, 192], v: [123, 31, 162],
		pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47], texto: [30, 41, 59],
		r: [230, 81, 0], cinza: [100, 116, 139]
	};
	const Q = { x: 4, y: 1 }, N = { x: 1, y: 2 };
	const XMIN = -4.8, XMAX = 13.2, YMIN = -3.6, YMAX = 8;
	const s = { x: 7, y: 4 };                          // ponto X (arrasta-se)
	let rasto = new Map(), agarrado = false, cxSol;

	const X = x => O.x + x * K, Y = y => O.y - y * K;
	const prod = (x, y) => N.x * (x - Q.x) + N.y * (y - Q.y);
	const corSinal = d => Math.abs(d) < 1e-9 ? COR.zero : d > 0 ? COR.pos : COR.neg;

	p.setup = function () {
		arrastar(p.createCanvas(W, H).elt);
		p.textFont('Source Sans Pro');
		p.createSpan('Arrasta o ponto X ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'Limpar o rasto', () => { rasto = new Map(); }, 'atalho');
		UT.quebra(p, controlos);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		marcar();
	};

	function marcar() {
		const k = Math.round(s.x * 10) + ',' + Math.round(s.y * 10);
		if (!rasto.has(k)) rasto.set(k, { x: s.x, y: s.y, d: prod(s.x, s.y) });
		if (rasto.size > 4000) rasto.delete(rasto.keys().next().value);
	}

	// íman: inteiros (perto) ou décimas
	const iman = v => Math.abs(v - Math.round(v)) < 0.12 ? Math.round(v) : Math.round(v * 10) / 10;

	// arrastar X (ponteiro convertido com o retângulo do canvas, que o Reveal escala)
	function arrastar(cv) {
		cv.style.touchAction = 'none';
		const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		const perto = (x, y) => Math.hypot(X(s.x) - x, Y(s.y) - y) < 30;
		cv.addEventListener('pointerdown', e => {
			const [x, y] = pos(e); agarrado = perto(x, y);
			if (agarrado) { cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault(); }
		});
		cv.addEventListener('pointermove', e => {
			const [x, y] = pos(e);
			if (!agarrado) { cv.style.cursor = perto(x, y) ? 'grab' : 'default'; return; }
			s.x = p.constrain(iman((x - O.x) / K), -4.5, 12.5);
			s.y = p.constrain(iman((O.y - y) / K), -3.4, 7.6);
			marcar();
		});
		const fim = () => { agarrado = false; cv.style.cursor = 'default'; };
		cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
		['touchstart', 'touchmove', 'mousedown'].forEach(t => cv.addEventListener(t, e => { if (agarrado || t !== 'mousedown') e.stopPropagation(); }, { passive: true }));
	}

	/* ---------- desenho ---------- */
	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	function setaTopo(x0, x1, yy, cor) {
		p.stroke(...cor); p.strokeWeight(2); p.line(x0, yy, x1, yy);
		p.noStroke(); p.fill(...cor); p.triangle(x1 + 4, yy, x1 - 3, yy - 4, x1 - 3, yy + 4);
	}
	function nomeVetor(l, x, y, cor, tam = 26) {
		rot(l, x, y, cor, tam, p.CENTER, p.BOLDITALIC);
		const w = p.textWidth(l);
		setaTopo(x - w * 0.55, x + w * 0.55, y - tam * 0.62, cor);
	}
	function seta(x1, y1, x2, y2, cor, peso = 4) {
		p.stroke(...cor); p.strokeWeight(peso); p.line(x1, y1, x2, y2);
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...cor); p.triangle(0, 0, -18, -7, -18, 7); p.pop();
	}
	// texto às peças: [texto, cor, estilo, 'v' = com seta de vetor]
	function linha(pecas, x, y, tam = 23) {
		p.textSize(tam); p.textAlign(p.LEFT, p.CENTER); p.noStroke();
		for (const [t, cor, est, vec] of pecas) {
			p.textStyle(est || p.NORMAL); p.fill(...(cor || COR.texto)); p.noStroke(); p.text(t, x, y);
			const w = p.textWidth(t);
			if (vec) setaTopo(x + 1, x + w - 2, y - tam * 0.62, cor || COR.texto);
			x += w;
		}
		return x;
	}
	const num = v => (v < 0 ? '−' : '') + UT.fmt(Math.abs(v), Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 1);
	const par = v => v < 0 ? '(' + num(v) + ')' : num(v);
	const ponto = (x, y) => {
		const inteiros = Math.abs(x - Math.round(x)) < 1e-9 && Math.abs(y - Math.round(y)) < 1e-9;
		return '(' + num(x) + (inteiros ? ', ' : ' ; ') + num(y) + ')';
	};
	function bola(x, y, cor, d = 12) { p.stroke(255); p.strokeWeight(2); p.fill(...cor); p.circle(X(x), Y(y), d); }

	function grelha() {
		p.strokeWeight(1); p.stroke(...COR.grelha);
		for (let i = Math.ceil(XMIN); i <= XMAX; i++) p.line(X(i), Y(YMIN), X(i), Y(YMAX));
		for (let j = Math.ceil(YMIN); j <= YMAX; j++) p.line(X(XMIN), Y(j), X(XMAX), Y(j));
		p.stroke(...COR.eixo); p.strokeWeight(1.6);
		p.line(X(XMIN), O.y, X(XMAX), O.y); p.line(O.x, Y(YMIN), O.x, Y(YMAX));
		p.noStroke(); p.fill(...COR.eixo); p.textSize(14); p.textStyle(p.NORMAL); p.textAlign(p.CENTER, p.TOP);
		for (let i = Math.ceil(XMIN); i <= XMAX; i++) if (i) p.text(i, X(i), O.y + 5);
		p.textAlign(p.RIGHT, p.CENTER);
		for (let j = Math.ceil(YMIN); j <= YMAX; j++) if (j) p.text(j, O.x - 6, Y(j));
		rot('O', O.x - 14, O.y + 16, COR.eixo, 18);
		rot('x', X(XMAX) - 10, O.y - 16, COR.eixo, 18, p.CENTER, p.ITALIC);
		rot('y', O.x + 14, Y(YMAX) + 12, COR.eixo, 18, p.CENTER, p.ITALIC);
	}

	p.draw = function () {
		const sol = cxSol.checked();
		const d = prod(s.x, s.y), cs = corSinal(d);
		p.background(255);
		grelha();

		// rasto: pontinhos na cor do sinal; os de produto nulo maiores
		p.noStroke();
		for (const r of rasto.values()) {
			if (Math.abs(r.d) < 1e-9) continue;
			p.fill(...corSinal(r.d), 90); p.circle(X(r.x), Y(r.y), 6);
		}
		for (const r of rasto.values()) if (Math.abs(r.d) < 1e-9) { p.fill(...COR.zero); p.circle(X(r.x), Y(r.y), 11); }

		// solução: a reta r e os pontos dos eixos
		if (sol) {
			p.stroke(...COR.r); p.strokeWeight(3.5);
			p.line(X(XMIN), Y((6 - XMIN) / 2), X(XMAX), Y((6 - XMAX) / 2));
			rot('r', X(10.4), Y(-2.2) + 22, COR.r, 26, p.CENTER, p.BOLDITALIC);
			bola(6, 0, COR.r, 14); bola(0, 3, COR.r, 14);
			rot('(6, 0)', X(6) + 10, Y(0) - 18, COR.r, 19, p.LEFT, p.BOLD);
			rot('(0, 3)', X(0) + 12, Y(3) - 20, COR.r, 19, p.LEFT, p.BOLD);
		}

		// ângulo entre n e QX, em Q
		const qx = s.x - Q.x, qy = s.y - Q.y, nq = Math.hypot(qx, qy);
		if (nq > 1e-9) {
			const a0 = Math.atan2(N.y, N.x), a1 = Math.atan2(qy, qx);
			if (Math.abs(d) < 1e-9) {
				const q = 18, P1 = [X(Q.x) + q * Math.cos(a0), Y(Q.y) - q * Math.sin(a0)], P2 = [X(Q.x) + q * Math.cos(a1), Y(Q.y) - q * Math.sin(a1)];
				p.noFill(); p.stroke(...cs); p.strokeWeight(2.5);
				p.beginShape(); p.vertex(...P1); p.vertex(P1[0] + P2[0] - X(Q.x), P1[1] + P2[1] - Y(Q.y)); p.vertex(...P2); p.endShape();
			} else {
				let da = a1 - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
				const ini = da >= 0 ? a0 : a1, r = Math.min(40, 0.45 * K * Math.min(nq, Math.hypot(N.x, N.y)) + 12);
				if (Math.abs(da) > 1e-6) { p.fill(...cs, 50); p.stroke(...cs); p.strokeWeight(2); p.arc(X(Q.x), Y(Q.y), 2 * r, 2 * r, -(ini + Math.abs(da)), -ini, p.PIE); }
			}
		}

		// vetores n (a partir de Q) e QX; os nomes ficam de lados opostos
		let sx = 1;                                        // lado (em ecrã) do nome de QX
		if (nq > 1e-9) sx = (qy * N.x - qx * N.y) > 0 ? 1 : -1;   // sinal do produto vetorial
		const nn = Math.hypot(N.x, N.y), pnx = sx * N.y / nn, pny = sx * N.x / nn;   // perpendicular a n, longe de QX
		seta(X(Q.x), Y(Q.y), X(Q.x + N.x), Y(Q.y + N.y), COR.u);
		const lnx = X(Q.x + N.x / 2) + pnx * 24, lny = Y(Q.y + N.y / 2) + pny * 24 + 4;
		nomeVetor('n', lnx, lny, COR.u);
		rot('(1, 2)', lnx + (pnx < 0 ? -12 : 12), lny + 22, COR.u, 17, pnx < 0 ? p.RIGHT : p.LEFT, p.NORMAL);
		if (nq > 1e-9) {
			seta(X(Q.x), Y(Q.y), X(s.x), Y(s.y), COR.v, 3.5);
			const mx = (X(Q.x) + X(s.x)) / 2, my = (Y(Q.y) + Y(s.y)) / 2;
			const ox = -sx * qy / nq, oy = -sx * qx / nq;    // perpendicular a QX, do lado contrário a n
			nomeVetor('QX', mx + ox * 26, my + oy * 26 + 4, COR.v, 22);
		}
		bola(Q.x, Q.y, COR.texto, 12);
		rot('Q(4, 1)', X(Q.x) + 4, Y(Q.y) + 22, COR.texto, 19, p.LEFT, p.BOLD);

		// X (pega)
		p.noFill(); p.stroke(...cs, 120); p.strokeWeight(2); p.circle(X(s.x), Y(s.y), 26);
		bola(s.x, s.y, cs, 14);
		const dir = qx >= -0.3 ? 1 : -1;
		rot('X', X(s.x) + dir * 16, Y(s.y) - 16, cs, 22, dir > 0 ? p.LEFT : p.RIGHT, p.BOLDITALIC);
		const wX = p.textWidth('X');
		rot(ponto(s.x, s.y), X(s.x) + dir * (22 + wX), Y(s.y) - 14, cs, 17, dir > 0 ? p.LEFT : p.RIGHT, p.NORMAL);

		// contas, em cima à esquerda
		p.noStroke(); p.fill(255, 235); p.rect(12, 10, 476, sol ? 172 : 96, 10);
		linha([['QX', COR.v, p.BOLDITALIC, 'v'], [' = (x − 4, y − 1) = ' + ponto(qx, qy), COR.v]], 26, 36);
		linha([['n', COR.u, p.BOLDITALIC, 'v'], [' · '], ['QX', COR.v, p.BOLDITALIC, 'v'], [' = 1 × ' + par(qx) + ' + 2 × ' + par(qy) + ' = '],
			[num(d), cs, p.BOLD]], 26, 76);
		if (sol) {
			linha([['n', COR.u, p.BOLDITALIC, 'v'], [' · '], ['QX', COR.v, p.BOLDITALIC, 'v'], [' = 0  ⇔  x + 2y − 6 = 0', COR.r, p.BOLD]], 26, 116);
			linha([['y = 0 → a = 6,   x = 0 → b = 3,   '], ['a + b = 9', COR.r, p.BOLD]], 26, 154);
		}
		// sinal
		const txt = d > 0 ? 'n · QX > 0' : d < 0 ? 'n · QX < 0' : nq > 1e-9 ? 'n · QX = 0 : X está na reta r' : 'X = Q';
		rot(txt, 20, H - 24, cs, 22, p.LEFT, p.BOLD);
	};
};
