/* =====================================================================
   Produto escalar · Problema 3 — a roda dentro do trapézio isósceles
   A(0, 0), B(18, 0), C(15, 4), D(3, 4); roda de raio 2, centro em y = 2, entre P(4, 2) e Q(14, 2).
   Encostada a [AD], toca em T(12/5, 16/5): TP = (2/5)(4, −3) ⊥ AD = (3, 4) e ‖TP‖ = 2.
   Encostada a [BC], toca em T'(78/5, 16/5): T'Q = (2/5)(−4, −3) ⊥ BC = (−3, 4). PQ = 10.
   Arrasta-se a roda na horizontal (rola: o raio marcado roda); botões para encostar a cada lado e ▶ para rolar.
   ===================================================================== */
SKETCHES['pe-p3'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 75, y: 300 }, K = 42, R = 2, XP = 4, XQ = 14;
	const COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], roda: [21, 101, 192], pq: [211, 47, 47], n: [46, 125, 50],
		lado: [123, 31, 162], zero: [239, 108, 0], texto: [30, 41, 59], cinza: [100, 116, 139]
	};
	const st = { x: 9, alvo: null, rolar: false, sentido: 1 };
	let agarrado = false, cxRef, cxSol, btRolar;

	const X = x => O.x + x * K, Y = y => O.y - y * K;

	p.setup = function () {
		arrastar(p.createCanvas(W, H).elt);
		p.textFont('Source Sans Pro');
		p.createSpan('Arrasta a roda ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'Encostar a [AD]', () => { st.rolar = false; st.alvo = XP; }, 'atalho');
		UT.botao(p, controlos, 'Encostar a [BC]', () => { st.rolar = false; st.alvo = XQ; }, 'atalho');
		btRolar = UT.botao(p, controlos, '▶ Rolar', () => { st.rolar = !st.rolar; st.alvo = null; }, 'atalho');
		UT.quebra(p, controlos);
		cxRef = UT.caixa(p, controlos, 'Referencial', false);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) { cxRef.checked(true); st.rolar = false; st.alvo = XP; } });
	};

	function arrastar(cv) {
		cv.style.touchAction = 'none';
		const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		const perto = (x, y) => Math.hypot(x - X(st.x), y - Y(R)) < R * K + 6;
		let dx0 = 0;
		cv.addEventListener('pointerdown', e => {
			const [x, y] = pos(e);
			if (!perto(x, y)) return;
			agarrado = true; st.alvo = null; st.rolar = false; dx0 = x - X(st.x);
			cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault();
		});
		cv.addEventListener('pointermove', e => {
			const [x, y] = pos(e);
			if (!agarrado) { cv.style.cursor = perto(x, y) ? 'ew-resize' : 'default'; return; }
			st.x = p.constrain((x - dx0 - O.x) / K, XP, XQ);
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
	function seta(x1, y1, x2, y2, cor, peso = 3.5) {
		p.stroke(...cor); p.strokeWeight(peso); p.line(x1, y1, x2, y2);
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...cor); p.triangle(0, 0, -15, -6, -15, 6); p.pop();
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
	// ângulo reto em T entre as direções u1 e u2 (vetores unitários no referencial)
	function anguloReto(T, u1, u2, cor) {
		const q = 14, a = [X(T[0]) + q * u1[0], Y(T[1]) - q * u1[1]], b = [X(T[0]) + q * u2[0], Y(T[1]) - q * u2[1]];
		p.noFill(); p.stroke(...cor); p.strokeWeight(2);
		p.beginShape(); p.vertex(...a); p.vertex(a[0] + b[0] - X(T[0]), a[1] + b[1] - Y(T[1])); p.vertex(...b); p.endShape();
	}

	p.draw = function () {
		const dt = Math.min(p.deltaTime, 50) / 1000;
		if (st.rolar && !agarrado) {
			st.x += st.sentido * 2.5 * dt;
			if (st.x >= XQ) { st.x = XQ; st.sentido = -1; } else if (st.x <= XP) { st.x = XP; st.sentido = 1; }
		} else if (st.alvo !== null && !agarrado) {
			st.x += (st.alvo - st.x) * (1 - Math.exp(-p.deltaTime / 150));
			if (Math.abs(st.alvo - st.x) < 0.003) { st.x = st.alvo; st.alvo = null; }
		}
		btRolar.html(st.rolar ? '❚❚ Parar' : '▶ Rolar');
		const ref = cxRef.checked(), sol = cxSol.checked(), x = st.x;
		const naP = Math.abs(x - XP) < 0.02, naQ = Math.abs(x - XQ) < 0.02;
		p.background(255);

		if (ref) {
			p.stroke(...COR.grelha); p.strokeWeight(1);
			for (let i = 0; i <= 18; i++) p.line(X(i), Y(-0.5), X(i), Y(4.6));
			for (let j = 0; j <= 4; j++) p.line(X(-0.6), Y(j), X(18.6), Y(j));
			p.stroke(...COR.eixo, 160); p.strokeWeight(1.4);
			p.line(X(-0.6), O.y, X(18.8), O.y); p.line(O.x, Y(-0.5), O.x, Y(4.8));
			rot('x', X(18.8), O.y + 18, COR.eixo, 18, p.CENTER, p.ITALIC);
			rot('y', O.x - 14, Y(4.8), COR.eixo, 18, p.CENTER, p.ITALIC);
			p.drawingContext.setLineDash([6, 6]); p.stroke(...COR.cinza, 150); p.strokeWeight(1.3);
			p.line(X(0), Y(2), X(18), Y(2)); p.drawingContext.setLineDash([]);
			rot('y = 2', X(18) + 8, Y(2), COR.cinza, 16, p.LEFT, p.ITALIC);
		}

		// trapézio
		p.fill(248, 250, 252); p.stroke(...COR.texto); p.strokeWeight(2.4);
		p.quad(X(0), Y(0), X(18), Y(0), X(15), Y(4), X(3), Y(4));
		rot('18', X(9), O.y + 26, COR.texto, 20); rot('12', X(9), Y(4) - 20, COR.texto, 20);
		rot('5', X(1.5) - 16, Y(2), COR.texto, 20); rot('5', X(16.5) + 16, Y(2), COR.texto, 20);

		// segmento PQ (percurso do centro)
		p.stroke(...COR.pq, 200); p.strokeWeight(2.5); p.line(X(XP), Y(R), X(XQ), Y(R));
		p.noStroke(); p.fill(...COR.pq); p.circle(X(XP), Y(R), 9); p.circle(X(XQ), Y(R), 9);
		rot('P', X(XP) - 4, Y(R) + 20, COR.pq, 22); rot('Q', X(XQ) + 4, Y(R) + 20, COR.pq, 22);

		// roda (o raio marcado roda quando ela rola)
		const ang = -x / R;
		p.fill(21, 101, 192, 25); p.stroke(...COR.roda); p.strokeWeight(3); p.circle(X(x), Y(R), 2 * R * K);
		p.stroke(...COR.roda, 160); p.strokeWeight(2);
		p.line(X(x), Y(R), X(x) + R * K * Math.cos(ang), Y(R) - R * K * Math.sin(ang));
		p.noStroke(); p.fill(...COR.roda); p.circle(X(x), Y(R), 8);

		// encostada a um lado: ponto de tangência, raio perpendicular e vetor normal
		if (naP || naQ) {
			const T = naP ? [12 / 5, 16 / 5] : [78 / 5, 16 / 5], C0 = naP ? [XP, R] : [XQ, R];
			const nu = naP ? [4 / 5, -3 / 5] : [-4 / 5, -3 / 5], lu = naP ? [-3 / 5, -4 / 5] : [3 / 5, -4 / 5];
			p.stroke(...COR.lado); p.strokeWeight(5);
			naP ? p.line(X(0), Y(0), X(3), Y(4)) : p.line(X(18), Y(0), X(15), Y(4));
			seta(X(T[0]), Y(T[1]), X(C0[0]), Y(C0[1]), COR.n);
			anguloReto(T, nu, lu, COR.zero);
			p.noStroke(); p.fill(...COR.texto); p.circle(X(T[0]), Y(T[1]), 8);
			rot(naP ? 'T' : "T'", X(T[0]) + (naP ? -14 : 14), Y(T[1]) - 8, COR.texto, 22, naP ? p.RIGHT : p.LEFT);
			rot(naP ? '‖TP‖ = 2' : "‖T'Q‖ = 2", X((T[0] + C0[0]) / 2) + (naP ? 10 : -10), Y((T[1] + C0[1]) / 2) - 18, COR.n, 18, naP ? p.LEFT : p.RIGHT, p.BOLD);
		}

		// vértices
		const pts = { A: [0, 0], B: [18, 0], C: [15, 4], D: [3, 4] };
		const etq = { A: '(0, 0)', B: '(18, 0)', C: '(15, 4)', D: '(3, 4)' };
		for (const n of 'ABCD') {
			const [vx, vy] = pts[n], cima = n === 'C' || n === 'D', esq = n === 'A' || n === 'D';
			p.noStroke(); p.fill(...COR.texto); p.circle(X(vx), Y(vy), 9);
			const lx = X(vx) + (esq ? -12 : 12), ly = Y(vy) + (cima ? -16 : 18);
			rot(n, lx, ly, COR.texto, 22, esq ? p.RIGHT : p.LEFT);
			if (ref) rot(etq[n], X(vx), ly + (cima ? -22 : 22), COR.cinza, 15, p.CENTER, p.NORMAL);
		}

		// leitura: centro da roda
		p.noStroke(); p.fill(255, 235); p.rect(W - 300, 14, 286, 40, 10);
		linha([['centro: (' + UT.fmt(x, 2).replace(/,00$/, '') + ', 2)', COR.roda, p.BOLD], [naP ? '  = P' : naQ ? '  = Q' : '', COR.pq, p.BOLD]], W - 288, 34, 21);

		if (sol) {
			p.noStroke(); p.fill(255, 240); p.stroke(226, 232, 240); p.strokeWeight(1.5); p.rect(14, H - 212, W - 28, 200, 10);
			let y = H - 192;
			linha([['dados  ', COR.cinza, p.BOLD], ['raio 2 e o centro a 2 de cada base: centro sempre em y = 2;  ', null], V('AD'), [' = (3, 4)', null]], 28, y); y += 31;
			linha([['3.1  ', COR.cinza, p.BOLD], V('n', COR.n), [' · ', null], V('AD'), [' = (4, −3) · (3, 4) = 12 − 12 = 0', null]], 28, y); y += 31;
			linha([['3.2  ', COR.cinza, p.BOLD], ['o raio ', null], V('TP', COR.n), [' é ⊥ ao lado [AD], com ‖', null], V('TP', COR.n), ['‖ = 2 e ‖', null], V('n', COR.n), ['‖ = 5  ⇒  ', null], V('TP', COR.n), [' = (2/5)', null], V('n', COR.n)], 28, y); y += 31;
			linha([['3.3  ', COR.cinza, p.BOLD], ['T = (3k, 4k),  P = T + (8/5, −6/5);  4k − 6/5 = 2 ⇒ k = 4/5:  ', null], ['T(12/5, 16/5),  P(4, 2)', COR.pq, p.BOLD]], 28, y); y += 31;
			linha([['3.4  ', COR.cinza, p.BOLD], ['por simetria (reta x = 9):  ', null], ['Q(14, 2)', COR.pq, p.BOLD], ['   ⇒   ', null], ['PQ = 14 − 4 = 10', COR.pq, p.BOLD]], 28, y);
		}
	};
};
