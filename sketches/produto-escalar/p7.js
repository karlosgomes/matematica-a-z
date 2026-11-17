/* =====================================================================
   Produto escalar · Problema 7 (desafio) — um ponto no interior de um triângulo
   Referencial com origem em P e C(t, 0) no semieixo positivo Ox (C arrasta-se:
   a escala t não altera k). Passos: 1) P e C; 2) A(0, 3t), PA ⊥ PC;
   3) B: ângulo BPC = 135° e ‖PB‖ = 2√2 t ⇒ B(−2t, −2t); 4) triângulo, reta AP,
   D(0, −2t/3), AD = 11t/3, PD = 2t/3. Solução: k = AD/PD = 11/2 → (A).
   ===================================================================== */
SKETCHES['pe-p7'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 262, y: 362 }, K = 85;
	const COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], u: [21, 101, 192], v: [123, 31, 162],
		pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47], texto: [30, 41, 59],
		b: [0, 121, 107], cinza: [148, 163, 184], tri: [230, 81, 0]
	};
	const XMIN = -2.9, XMAX = 1.9, YMIN = -2.7, YMAX = 3.9;
	let t = 1, passo = 0, a = 1, agarrado = false, cxSol, bts = [];

	const X = x => O.x + x * K, Y = y => O.y - y * K;
	const suave = s => s * s * (3 - 2 * s);
	const R2 = Math.SQRT2;

	p.setup = function () {
		arrastar(p.createCanvas(W, H).elt);
		p.textFont('Source Sans Pro');
		for (let n = 1; n <= 4; n++) bts.push(UT.botao(p, controlos, 'Passo ' + n, () => irPara(n), 'atalho'));
		UT.botao(p, controlos, 'Início', () => irPara(0), 'atalho');
		UT.quebra(p, controlos);
		p.createSpan('Arrasta C (muda a escala) ·').parent(controlos).addClass('dica-arrastar');
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked() && passo < 4) { passo = 4; a = 1; } });
	};
	function irPara(n) { passo = n; a = n ? 0 : 1; if (n < 4) cxSol.checked(false); }

	// arrastar C ao longo do semieixo positivo Ox (t às décimas, entre 0,6 e 1,2)
	function arrastar(cv) {
		cv.style.touchAction = 'none';
		const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		const perto = (x, y) => passo >= 1 && Math.hypot(X(t) - x, O.y - y) < 30;
		cv.addEventListener('pointerdown', e => {
			const [x, y] = pos(e); agarrado = perto(x, y);
			if (agarrado) { a = 1; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault(); }
		});
		cv.addEventListener('pointermove', e => {
			const [x, y] = pos(e);
			if (!agarrado) { cv.style.cursor = perto(x, y) ? 'grab' : 'default'; return; }
			const v = (x - O.x) / K;
			t = p.constrain(Math.abs(v - Math.round(v)) < 0.06 ? Math.round(v) : Math.round(v * 10) / 10, 0.6, 1.2);
		});
		const fim = () => { agarrado = false; cv.style.cursor = 'default'; };
		cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
		['touchstart', 'touchmove', 'mousedown'].forEach(tp => cv.addEventListener(tp, e => { if (agarrado || tp !== 'mousedown') e.stopPropagation(); }, { passive: true }));
	}

	/* ---------- desenho ---------- */
	function rot(s, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(s, x, y);
	}
	function setaTopo(x0, x1, yy, cor, peso = 2) {
		p.stroke(...cor); p.strokeWeight(peso); p.line(x0, yy, x1, yy);
		p.noStroke(); p.fill(...cor); p.triangle(x1 + 3, yy, x1 - 3, yy - 3.5, x1 - 3, yy + 3.5);
	}
	function nomeVetor(l, x, y, cor, tam = 24) {
		rot(l, x, y, cor, tam, p.CENTER, p.BOLDITALIC);
		const w = p.textWidth(l);
		setaTopo(x - w * 0.55, x + w * 0.55, y - tam * 0.62, cor);
	}
	function seta(x1, y1, x2, y2, cor, peso = 4, ponta = 16) {
		p.stroke(...cor); p.strokeWeight(peso); p.line(x1, y1, x2, y2);
		if (Math.hypot(x2 - x1, y2 - y1) < 4) return;
		const ang = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(ang);
		p.noStroke(); p.fill(...cor); p.triangle(0, 0, -ponta, -ponta * 0.4, -ponta, ponta * 0.4); p.pop();
	}
	// texto com marcação: [AB] = vetor AB (com seta por cima)
	function txt(s, x, y, cor = COR.texto, tam = 20, est = p.NORMAL) {
		p.textSize(tam); p.textAlign(p.LEFT, p.CENTER);
		for (const pc of s.split(/(\[[A-Z]+\])/)) {
			if (!pc) continue;
			const vec = pc[0] === '[', t2 = vec ? pc.slice(1, -1) : pc;
			p.noStroke(); p.fill(...cor); p.textStyle(vec ? (est === p.BOLD ? p.BOLDITALIC : p.ITALIC) : est); p.text(t2, x, y);
			const w = p.textWidth(t2);
			if (vec) setaTopo(x + 1, x + w - 1, y - tam * 0.62, cor, 1.5);
			x += w;
		}
		return x;
	}
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
		for (let j = Math.ceil(YMIN); j <= YMAX; j++) if (j) p.text(j, O.x - 6, Y(j) + 8);
		rot('x', X(XMAX) - 8, O.y - 14, COR.eixo, 18, p.CENTER, p.ITALIC);
		rot('y', O.x + 14, Y(YMAX) + 10, COR.eixo, 18, p.CENTER, p.ITALIC);
	}

	p.draw = function () {
		const sol = cxSol.checked();
		if (a < 1) a = Math.min(1, a + p.deltaTime / 1000 / 1.4);
		const e = suave(a);
		const f = n => passo > n ? 1 : passo === n ? e : 0;       // progresso do passo n
		p.background(255);
		grelha();

		// no passo 4 os vetores dos passos anteriores ficam esbatidos
		const esbater = fn => { p.drawingContext.globalAlpha = passo >= 4 ? 0.35 : 1; fn(); p.drawingContext.globalAlpha = 1; };
		const A = { x: 0, y: 3 * t }, B = { x: -2 * t, y: -2 * t }, C = { x: t, y: 0 }, D = { x: 0, y: -2 * t / 3 };

		// passo 4: triângulo e reta AP
		if (passo >= 4) {
			const g = f(4);
			p.fill(...COR.tri, 22 * g); p.stroke(...COR.tri, 255 * g); p.strokeWeight(2.5);
			p.triangle(X(A.x), Y(A.y), X(B.x), Y(B.y), X(C.x), Y(C.y));
			p.stroke(...COR.texto, 120 * g); p.strokeWeight(1.5);
			p.line(X(0), Y(YMAX), X(0), Y(YMIN));
		}

		// passo 3: B, ângulo de 135° e ‖PB‖ = 2√2 t
		if (passo >= 3) {
			const g = f(3), ang = -135 * g * Math.PI / 180, len = 2 * R2 * t * Math.max(g, 0.05);
			const bx = len * Math.cos(ang), by = len * Math.sin(ang);
			p.fill(...COR.neg, 40); p.stroke(...COR.neg); p.strokeWeight(2);
			if (g > 0.01) p.arc(O.x, O.y, 64, 64, 0, -ang, p.PIE);
			if (g > 0.6 && passo < 4) rot('135°', O.x + 44 * Math.cos(ang / 2) + 18, O.y - 44 * Math.sin(ang / 2) + 4, COR.neg, 18, p.LEFT, p.BOLD);
			esbater(() => seta(O.x, O.y, X(bx), Y(by), COR.b, passo === 3 ? 4 : 3));
			if (g > 0.95) {
				if (passo < 4) nomeVetor('PB', X(bx / 2) + 22, Y(by / 2) + 14, COR.b, 22);
				bola(B.x, B.y, COR.texto, 11);
				rot('B', X(B.x) - 12, Y(B.y) + 14, COR.texto, 22, p.RIGHT, p.BOLDITALIC);
				rot('(−2t, −2t)', X(B.x) + 2, Y(B.y) + 24, COR.texto, 16, p.LEFT, p.NORMAL);
			}
		}

		// passo 2: A no eixo Oy, PA ⊥ PC, ‖PA‖ = 3‖PC‖
		if (passo >= 2) {
			const g = f(2), ay = 3 * t * Math.max(g, 0.03);
			const q = 16;
			p.noFill(); p.stroke(...COR.zero); p.strokeWeight(2.5);
			p.beginShape(); p.vertex(O.x + q, O.y); p.vertex(O.x + q, O.y - q); p.vertex(O.x, O.y - q); p.endShape();
			esbater(() => seta(O.x, O.y, X(0), Y(ay), COR.v, passo === 2 ? 4 : 3));
			if (g > 0.95) {
				if (passo < 4) nomeVetor('PA', X(0) - 26, Y(ay / 2) - 6, COR.v, 22);
				bola(A.x, A.y, COR.texto, 11);
				rot('A', X(0) + 14, Y(A.y) - 2, COR.texto, 22, p.LEFT, p.BOLDITALIC);
				rot('(0, 3t)', X(0) + 30, Y(A.y), COR.texto, 16, p.LEFT, p.NORMAL);
			}
		}

		// passo 1: P na origem e C no semieixo positivo Ox
		if (passo >= 1) {
			const g = f(1), cx = t * Math.max(g, 0.03);
			esbater(() => seta(O.x, O.y, X(cx), O.y, COR.u, passo === 1 ? 4 : 3, 14));
			if (g > 0.95) {
				if (passo < 4) nomeVetor('PC', X(t / 2) + 6, O.y - 22, COR.u, 22);
				p.noFill(); p.stroke(...COR.u, 110); p.strokeWeight(2); p.circle(X(t), O.y, 26);
				bola(t, 0, COR.texto, 11);
				rot('C', X(t) + 8, O.y - 18, COR.texto, 22, p.LEFT, p.BOLDITALIC);
				rot('(t, 0)', X(t) + 24, O.y - 16, COR.texto, 16, p.LEFT, p.NORMAL);
			}
			bola(0, 0, COR.texto, 12);
			rot('P', O.x - 12, O.y - 16, COR.texto, 22, p.RIGHT, p.BOLDITALIC);
		}

		// passo 4: D, AD e PD
		if (passo >= 4) {
			const g = f(4);
			if (g > 0.5) {
				const h = (g - 0.5) * 2;
				// AD (à direita da reta) e PD (à esquerda), como vetores
				p.push(); p.drawingContext.globalAlpha = h;
				seta(X(0) + 16, Y(A.y), X(0) + 16, Y(D.y), COR.pos, 3, 13);
				seta(X(0) - 12, O.y, X(0) - 12, Y(D.y), COR.zero, 3, 10);
				nomeVetor('AD', X(0) + 40, Y(A.y * 0.55), COR.pos, 20);
				rot('11t/3', X(0) + 22, Y(A.y * 0.55) + 24, COR.pos, 16, p.LEFT, p.NORMAL);
				rot('2t/3', X(0) - 20, Y(D.y / 2) + 2, COR.zero, 16, p.RIGHT, p.BOLD);
				bola(D.x, D.y, COR.texto, 11);
				rot('D', X(0) + 26, Y(D.y) + 12, COR.texto, 22, p.LEFT, p.BOLDITALIC);
				rot('(0, −2t/3)', X(0) + 44, Y(D.y) + 14, COR.texto, 16, p.LEFT, p.NORMAL);
				p.pop();
			}
		}

		// painel à direita: o passo atual a cheio, os anteriores esbatidos
		const x0 = 470, LH = 31;
		let y = 30;
		if (passo === 0) {
			txt('Usa os botões «Passo 1» … «Passo 4».', x0, y, COR.cinza, 20);
		}
		const cor = n => passo === n ? COR.texto : COR.cinza;
		const tit = (n, s) => { txt(n + ') ' + s, x0, y, passo === n ? COR.u : COR.cinza, 21, p.BOLD); y += LH; };
		if (passo >= 1) {
			tit(1, 'Referencial com origem em P');
			txt('P = (0, 0),   C = (t, 0),   ‖[PC]‖ = t', x0 + 18, y, cor(1)); y += LH;
			txt('t = ' + UT.fmt(t, Number.isInteger(t) ? 0 : 1) + '  (arrasta C: a escala não muda k)', x0 + 18, y, cor(1), 17); y += LH + 6;
		}
		if (passo >= 2) {
			tit(2, 'O ponto A');
			txt('[PA] · [PC] = 0  ⇒  PA ⊥ PC  ⇒  A no eixo Oy', x0 + 18, y, cor(2)); y += LH;
			txt('‖[PA]‖ = 3‖[PC]‖ = 3t  ⇒  A = (0, 3t)', x0 + 18, y, cor(2)); y += LH + 6;
		}
		if (passo >= 3) {
			tit(3, 'O ponto B');
			txt('[PB] · [PC] = −(√2/2)‖[PB]‖‖[PC]‖  ⇒  ∠BPC = 135°', x0 + 18, y, cor(3)); y += LH;
			txt('−(√2/2)‖[PB]‖ t = −2t²  ⇒  ‖[PB]‖ = 2√2 t', x0 + 18, y, cor(3)); y += LH;
			txt('B = (−2t, −2t)  (3.º quadrante: P no interior)', x0 + 18, y, cor(3)); y += LH + 6;
		}
		if (passo >= 4) {
			tit(4, 'O ponto D = AP ∩ [BC]');
			txt('[BC]: (−2t, −2t) + u(3t, 2t);  x = 0 ⇒ u = 2/3', x0 + 18, y, cor(4)); y += LH;
			txt('D = (0, −2t/3)', x0 + 18, y, cor(4)); y += LH;
			let xx = txt('AD = 3t + 2t/3 = ', x0 + 18, y, cor(4));
			xx = txt('11t/3', xx, y, COR.pos, 20, p.BOLD);
			xx = txt(',   PD = ', xx, y, cor(4));
			txt('2t/3', xx, y, COR.zero, 20, p.BOLD); y += LH + 6;
		}
		if (sol) {
			p.noStroke(); p.fill(254, 243, 199); p.rect(x0 - 10, y - 20, W - x0, 2 * LH + 10, 8);
			txt('[AD] = k [PD]  (mesmo sentido)', x0, y + 2, COR.texto, 20); y += LH;
			txt('k = AD / PD = (11t/3) / (2t/3) = 11/2  → (A)', x0, y + 2, COR.texto, 21, p.BOLD);
		}
	};
};
