/* =====================================================================
   Produto escalar · Problema 3 — projeção de um ponto numa reta
   A(2, 6), r: (x, y) = (5, 5) + k(2, 1). O aluno arrasta P ao longo de r
   e vê AP · r⃗ na cor do sinal (ângulo reto quando dá 0; íman em k = −1).
   Solução: 5 + 5k = 0 ⇔ k = −1, P(3, 4), ‖OP‖ = 5 → (D).
   ===================================================================== */
SKETCHES['pe-p3'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 140, y: 520 }, K = 58;
	const COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], u: [21, 101, 192], v: [123, 31, 162],
		pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47], texto: [30, 41, 59],
		r: [230, 81, 0], cinza: [100, 116, 139], op: [15, 118, 110]
	};
	const A = { x: 2, y: 6 }, R0 = { x: 5, y: 5 }, D = { x: 2, y: 1 };
	const XMIN = -2.2, XMAX = 13.3, YMIN = -1.3, YMAX = 8.8, KMIN = -3.5, KMAX = 3.5;
	let k = 2, agarrado = false, cxSol;

	const X = x => O.x + x * K, Y = y => O.y - y * K;
	const Pk = t => ({ x: R0.x + t * D.x, y: R0.y + t * D.y });
	const corSinal = d => Math.abs(d) < 1e-9 ? COR.zero : d > 0 ? COR.pos : COR.neg;

	p.setup = function () {
		arrastar(p.createCanvas(W, H).elt);
		p.textFont('Source Sans Pro');
		p.createSpan('Arrasta o ponto P ao longo da reta r ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'Início', () => { k = 2; }, 'atalho');
		UT.quebra(p, controlos);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) k = -1; });
	};

	// arrastar P sobre r: k da projeção do ponteiro, às décimas, com íman nos inteiros (mais forte em k = −1)
	function arrastar(cv) {
		cv.style.touchAction = 'none';
		const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		const perto = (x, y) => { const P = Pk(k); return Math.hypot(X(P.x) - x, Y(P.y) - y) < 30; };
		cv.addEventListener('pointerdown', e => {
			const [x, y] = pos(e); agarrado = perto(x, y);
			if (agarrado) { cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault(); }
		});
		cv.addEventListener('pointermove', e => {
			const [x, y] = pos(e);
			if (!agarrado) { cv.style.cursor = perto(x, y) ? 'grab' : 'default'; return; }
			const ux = (x - O.x) / K, uy = (O.y - y) / K;
			let t = ((ux - R0.x) * D.x + (uy - R0.y) * D.y) / (D.x * D.x + D.y * D.y);
			if (Math.abs(t + 1) < 0.2) t = -1;
			else if (Math.abs(t - Math.round(t)) < 0.08) t = Math.round(t);
			else t = Math.round(t * 10) / 10;
			k = p.constrain(t, KMIN, KMAX);
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
	const inteiro = v => Math.abs(v - Math.round(v)) < 1e-9;
	const num = v => (v < -1e-9 ? '−' : '') + UT.fmt(Math.abs(v), inteiro(v) ? 0 : 1);
	const par = v => v < -1e-9 ? '(' + num(v) + ')' : num(v);
	const ponto = (x, y) => '(' + num(x) + (inteiro(x) && inteiro(y) ? ', ' : ' ; ') + num(y) + ')';
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
		const P = Pk(k), ax = P.x - A.x, ay = P.y - A.y, na = Math.hypot(ax, ay);
		const d = ax * D.x + ay * D.y, cs = corSinal(d);
		p.background(255);
		grelha();

		// reta r, com marcas nos valores inteiros de k
		const t0 = (XMIN - R0.x) / D.x, t1 = (XMAX - R0.x) / D.x;
		p.stroke(...COR.r); p.strokeWeight(3);
		p.line(X(R0.x + t0 * D.x), Y(R0.y + t0 * D.y), X(R0.x + t1 * D.x), Y(R0.y + t1 * D.y));
		const nr = Math.hypot(D.x, D.y), qx = -D.y / nr * 6, qy = D.x / nr * 6;   // perpendicular (px)
		p.strokeWeight(2);
		for (let t = Math.ceil(KMIN); t <= KMAX; t++) { const M = Pk(t); p.line(X(M.x) - qx, Y(M.y) + qy, X(M.x) + qx, Y(M.y) - qy); }
		rot('r', X(11.6), Y(R0.y + (11.6 - R0.x) / 2) + 26, COR.r, 26, p.CENTER, p.BOLDITALIC);

		// solução: OP
		if (sol) {
			seta(O.x, O.y, X(P.x), Y(P.y), COR.op, 3.5);
			const mx = (O.x + X(P.x)) / 2, my = (O.y + Y(P.y)) / 2;
			nomeVetor('OP', mx + 26, my + 12, COR.op, 22);
		}

		// ponto (5, 5) e vetor diretor r⃗ = (2, 1)
		bola(R0.x, R0.y, COR.cinza, 10);
		rot('(5, 5)', X(R0.x) + 4, Y(R0.y) + 24, COR.cinza, 16, p.LEFT, p.NORMAL);
		seta(X(R0.x), Y(R0.y), X(R0.x + D.x), Y(R0.y + D.y), COR.u, 4);
		nomeVetor('r', X(R0.x + D.x) + 6, Y(R0.y + D.y) - 26, COR.u);
		rot('(2, 1)', X(R0.x + D.x) + 20, Y(R0.y + D.y) - 22, COR.u, 17, p.LEFT, p.NORMAL);

		// ângulo de AP com r⃗, em P (cópia esbatida de r⃗ e prolongamento de AP)
		if (na > 1e-9) {
			const aAP = Math.atan2(ay, ax), aR = Math.atan2(D.y, D.x);
			p.stroke(...COR.u, 70); p.strokeWeight(2);
			p.line(X(P.x), Y(P.y), X(P.x) + 60 * Math.cos(aR), Y(P.y) - 60 * Math.sin(aR));
			p.stroke(...COR.v, 70);
			p.line(X(P.x), Y(P.y), X(P.x) + 50 * Math.cos(aAP), Y(P.y) - 50 * Math.sin(aAP));
			if (Math.abs(d) < 1e-9) {
				const q = 18, P1 = [X(P.x) + q * Math.cos(aAP), Y(P.y) - q * Math.sin(aAP)], P2 = [X(P.x) + q * Math.cos(aR), Y(P.y) - q * Math.sin(aR)];
				p.noFill(); p.stroke(...cs); p.strokeWeight(2.5);
				p.beginShape(); p.vertex(...P1); p.vertex(P1[0] + P2[0] - X(P.x), P1[1] + P2[1] - Y(P.y)); p.vertex(...P2); p.endShape();
			} else {
				let da = aR - aAP; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
				const ini = da >= 0 ? aAP : aR;
				p.fill(...cs, 50); p.stroke(...cs); p.strokeWeight(2);
				p.arc(X(P.x), Y(P.y), 56, 56, -(ini + Math.abs(da)), -ini, p.PIE);
			}
		}

		// A e o vetor AP
		if (na > 1e-9) {
			seta(X(A.x), Y(A.y), X(P.x), Y(P.y), COR.v, 3.5);
			const mx = (X(A.x) + X(P.x)) / 2, my = (Y(A.y) + Y(P.y)) / 2;
			// nome do lado de cima/esquerda de AP
			let ox = ay / na, oy = ax / na;
			if (ox > 0 || (Math.abs(ox) < 1e-9 && oy > 0)) { ox = -ox; oy = -oy; }
			nomeVetor('AP', mx + ox * 26, my + oy * 26 + 4, COR.v, 22);
		}
		bola(A.x, A.y, COR.texto, 12);
		rot('A(2, 6)', X(A.x) - 14, Y(A.y) - 18, COR.texto, 19, p.RIGHT, p.BOLD);

		// P (pega)
		p.noFill(); p.stroke(...cs, 120); p.strokeWeight(2); p.circle(X(P.x), Y(P.y), 26);
		bola(P.x, P.y, cs, 14);
		rot('P', X(P.x) + 14, Y(P.y) + 22, cs, 22, p.LEFT, p.BOLDITALIC);
		rot(ponto(P.x, P.y), X(P.x) + 30, Y(P.y) + 24, cs, 17, p.LEFT, p.NORMAL);

		// contas, em baixo à direita
		const bx = 372, by = sol ? 392 : 470;
		p.noStroke(); p.fill(255, 215); p.rect(bx, by, W - bx - 10, H - by - 10, 10);
		let y = by + 26;
		linha([['k = ' + num(k), COR.texto, p.BOLD], ['     P = (5 + 2k, 5 + k) = ' + ponto(P.x, P.y)]], bx + 14, y); y += 38;
		linha([['AP', COR.v, p.BOLDITALIC, 'v'], [' · '], ['r', COR.u, p.BOLDITALIC, 'v'], [' = ' + par(ax) + ' × 2 + ' + par(ay) + ' × 1 = '],
			[num(d), cs, p.BOLD]], bx + 14, y); y += 38;
		if (sol) {
			linha([['2(3 + 2k) + (−1 + k) = 5 + 5k = 0  ⇔  '], ['k = −1', COR.zero, p.BOLD]], bx + 14, y); y += 38;
			linha([['P = (3, 4),   '], ['‖', COR.op, p.BOLD], ['OP', COR.op, p.BOLD, 'v'], ['‖', COR.op, p.BOLD], [' = √(3² + 4²) = 5   → '], ['(D)', COR.op, p.BOLD]], bx + 14, y);
		}
	};
};
