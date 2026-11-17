/* =====================================================================
   Produto escalar · Problema 2 — ângulo das diagonais de um trapézio isósceles
   A(0, 0), B(5, 0), C(4, h), D(1, h); as diagonais cortam-se em I(5/2, 5h/8).
   θ = ângulo CIB (o da figura), com IC na direção de AC e IB na direção de DB:
   cos θ = AC·DB / (‖AC‖‖DB‖) = (16 − h²)/(16 + h²); com h = 2, cos θ = 3/5 e θ ≈ 53,1°.
   Arrasta-se o lado [DC] na vertical (altura h, íman em h = 2); com h = 4 as diagonais são perpendiculares.
   ===================================================================== */
SKETCHES['pe-p2'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 330, y: 400 }, K = 90;
	const HMIN = 0.6, HMAX = 4;
	const COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], u: [21, 101, 192], v: [123, 31, 162],
		pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47], texto: [30, 41, 59], cinza: [100, 116, 139]
	};
	const st = { h: 1.4, alvo: null };
	let agarrado = false, cxRef, cxVet, cxSol;

	const X = x => O.x + x * K, Y = y => O.y - y * K;

	p.setup = function () {
		arrastar(p.createCanvas(W, H).elt);
		p.textFont('Source Sans Pro');
		p.createSpan('Arrasta o lado [DC] para cima ou para baixo ·').parent(controlos).addClass('dica-arrastar');
		UT.botao(p, controlos, 'h = 2', () => { st.alvo = 2; }, 'atalho');
		UT.botao(p, controlos, 'h = 4', () => { st.alvo = 4; }, 'atalho');
		UT.quebra(p, controlos);
		cxRef = UT.caixa(p, controlos, 'Referencial', false);
		cxVet = UT.caixa(p, controlos, 'Vetores das diagonais', false);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		cxSol.changed(() => { if (cxSol.checked()) { st.alvo = 2; cxRef.checked(true); cxVet.checked(true); } });
	};

	// arrastar o lado [DC] (ponteiro convertido com o retângulo do canvas, que o Reveal escala)
	function arrastar(cv) {
		cv.style.touchAction = 'none';
		const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		const perto = (x, y) => x > X(1) - 26 && x < X(4) + 26 && Math.abs(y - Y(st.h)) < 22;
		cv.addEventListener('pointerdown', e => {
			const [x, y] = pos(e);
			if (!perto(x, y)) return;
			agarrado = true; st.alvo = null;
			cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault();
		});
		cv.addEventListener('pointermove', e => {
			const [x, y] = pos(e);
			if (!agarrado) { cv.style.cursor = perto(x, y) ? 'ns-resize' : 'default'; return; }
			let h = p.constrain((O.y - y) / K, HMIN, HMAX);
			for (const m of [2, 4]) if (Math.abs(h - m) < 0.08) h = m;   // ímanes em h = 2 e h = 4
			st.h = Math.round(h * 100) / 100;
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
	function nomeVetor(l, x, y, cor, tam = 24) {
		rot(l, x, y, cor, tam, p.CENTER, p.BOLDITALIC);
		const w = p.textWidth(l), yy = y - tam * 0.66;
		p.stroke(...cor); p.strokeWeight(2); p.line(x - w * 0.5, yy, x + w * 0.5, yy);
		p.noStroke(); p.fill(...cor); p.triangle(x + w * 0.5 + 4, yy, x + w * 0.5 - 3 - 1, yy - 5.5, x + w * 0.5 - 3, yy);
	}
	function seta(x1, y1, x2, y2, cor, peso = 4) {
		p.stroke(...cor); p.strokeWeight(peso); p.line(x1, y1, x2, y2);
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...cor); p.triangle(0, 0, -18, -7, -18, 7); p.pop();
	}
	function linha(pecas, x, y, tam = 22) {
		p.textSize(tam); p.textAlign(p.LEFT, p.CENTER); p.noStroke();
		for (const [t, cor, est, vec] of pecas) {
			const c = cor || COR.texto;
			p.textStyle(est || p.NORMAL); p.fill(...c); p.text(t, x, y);
			const w = p.textWidth(t);
			if (vec) {
				const yy = y - tam * 0.62;
				p.stroke(...c); p.strokeWeight(1.6); p.line(x + 1, yy, x + w - 1, yy);
				p.noStroke(); p.triangle(x + w + 2, yy, x + w - 4 - 1, yy - 5, x + w - 4, yy);
			}
			x += w;
		}
		return x;
	}
	const V = (t, cor) => [t, cor, p.BOLDITALIC, true];
	// marca de lado igual (dois traços) a meio de [P, Q]
	function marcas(P, Q) {
		const mx = (X(P[0]) + X(Q[0])) / 2, my = (Y(P[1]) + Y(Q[1])) / 2;
		const dx = X(Q[0]) - X(P[0]), dy = Y(Q[1]) - Y(P[1]), L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
		p.stroke(...COR.texto); p.strokeWeight(2);
		for (const s of [-4, 4]) { const cx = mx + s * ux, cy = my + s * uy; p.line(cx + 8 * uy, cy - 8 * ux, cx - 8 * uy, cy + 8 * ux); }
	}

	p.draw = function () {
		if (st.alvo !== null && !agarrado) {
			st.h += (st.alvo - st.h) * (1 - Math.exp(-p.deltaTime / 150));
			if (Math.abs(st.alvo - st.h) < 0.003) { st.h = st.alvo; st.alvo = null; }
		}
		const h = st.h, ref = cxRef.checked(), vet = cxVet.checked(), sol = cxSol.checked();
		const A = [0, 0], B = [5, 0], C = [4, h], D = [1, h], I = [2.5, 5 * h / 8];
		const cs = (16 - h * h) / (16 + h * h), th = Math.acos(cs) * 180 / Math.PI;
		const reto = Math.abs(h - 4) < 1e-9, dois = Math.abs(h - 2) < 1e-9;
		const cc = Math.abs(cs) < 0.005 ? COR.zero : cs > 0 ? COR.pos : COR.neg;
		p.background(255);

		// referencial (opcional)
		if (ref) {
			p.stroke(...COR.grelha); p.strokeWeight(1);
			for (let i = -1; i <= 6; i++) p.line(X(i), Y(-0.6), X(i), Y(4.3));
			for (let j = 0; j <= 4; j++) p.line(X(-1.2), Y(j), X(6.2), Y(j));
			p.stroke(...COR.eixo, 160); p.strokeWeight(1.4);
			p.line(X(-1.2), O.y, X(6.2), O.y); p.line(O.x, Y(-0.6), O.x, Y(4.3));
			rot('x', X(6.2) - 4, O.y + 18, COR.eixo, 18, p.CENTER, p.ITALIC);
			rot('y', O.x - 16, Y(4.3) + 6, COR.eixo, 18, p.CENTER, p.ITALIC);
		}

		// trapézio e diagonais
		p.fill(241, 245, 249, 170); p.stroke(...COR.texto); p.strokeWeight(2.2);
		p.quad(X(A[0]), Y(A[1]), X(B[0]), Y(B[1]), X(C[0]), Y(C[1]), X(D[0]), Y(D[1]));
		p.stroke(...COR.texto, agarrado ? 255 : 200); p.strokeWeight(agarrado ? 5 : 3.5); p.line(X(D[0]), Y(D[1]), X(C[0]), Y(C[1]));
		marcas(A, D); marcas(B, C);
		if (vet) {
			seta(X(A[0]), Y(A[1]), X(C[0]), Y(C[1]), COR.u, 4);
			seta(X(D[0]), Y(D[1]), X(B[0]), Y(B[1]), COR.v, 4);
			nomeVetor('AC', X(1.2), Y(0.3 * h) + 30, COR.u);
			nomeVetor('DB', X(3.8), Y(0.3 * h) + 30, COR.v);
		} else {
			p.stroke(...COR.texto); p.strokeWeight(2.2);
			p.line(X(A[0]), Y(A[1]), X(C[0]), Y(C[1])); p.line(X(D[0]), Y(D[1]), X(B[0]), Y(B[1]));
		}

		// ângulo θ = CIB
		const aC = Math.atan2(h * 3 / 8, 1.5), aB = Math.atan2(-h * 5 / 8, 2.5);   // direções de I para C e de I para B
		if (reto) {
			const q = 22, P1 = [X(I[0]) + q * Math.cos(aC), Y(I[1]) - q * Math.sin(aC)], P2 = [X(I[0]) + q * Math.cos(aB), Y(I[1]) - q * Math.sin(aB)];
			p.noFill(); p.stroke(...cc); p.strokeWeight(2.5);
			p.beginShape(); p.vertex(...P1); p.vertex(P1[0] + P2[0] - X(I[0]), P1[1] + P2[1] - Y(I[1])); p.vertex(...P2); p.endShape();
		} else {
			p.fill(...cc, 50); p.stroke(...cc); p.strokeWeight(2.5);
			p.arc(X(I[0]), Y(I[1]), 70, 70, -aC, -aB, p.PIE);
		}
		p.noStroke(); p.fill(...COR.texto); p.circle(X(I[0]), Y(I[1]), 7);
		rot('θ', X(I[0]) + 48, Y(I[1]), cc, 24, p.LEFT, p.BOLDITALIC);

		// medidas: bases e altura
		rot('5', X(2.5), O.y + 26, COR.texto, 22, p.CENTER, p.BOLD);
		rot('3', X(2.5), Y(h) - 22, COR.texto, 22, p.CENTER, p.BOLD);
		p.stroke(...COR.cinza, 170); p.strokeWeight(1.5);
		const xa = X(-0.45);
		p.line(xa, Y(0), xa, Y(h)); p.line(xa - 6, Y(0), xa + 6, Y(0)); p.line(xa - 6, Y(h), xa + 6, Y(h));
		rot('h = ' + UT.fmt(h, 2).replace(/,00$/, ''), xa - 10, Y(h / 2), dois ? COR.pos : COR.cinza, 20, p.RIGHT, p.ITALIC);

		// vértices (com as coordenadas, se houver referencial)
		const pts = { A, B, C, D };
		const etq = { A: '(0, 0)', B: '(5, 0)', C: '(4, ' + UT.fmt(h, 2).replace(/,00$/, '') + ')', D: '(1, ' + UT.fmt(h, 2).replace(/,00$/, '') + ')' };
		for (const n of 'ABCD') {
			const [x, y] = pts[n], cima = n === 'C' || n === 'D', esq = n === 'A' || n === 'D';
			p.noStroke(); p.fill(...COR.texto); p.circle(X(x), Y(y), 9);
			const lx = X(x) + (esq ? -14 : 14), ly = Y(y) + (cima ? -16 : 18);
			rot(n, lx, ly, COR.texto, 24, esq ? p.RIGHT : p.LEFT);
			if (ref) rot(etq[n], lx + (esq ? -22 : 22), ly + 1, COR.cinza, 15, esq ? p.RIGHT : p.LEFT, p.NORMAL);
		}

		// leitura em tempo real
		p.noStroke(); p.fill(255, 235); p.rect(14, 12, 280, 74, 10);
		linha([['cos θ ≈ ' + UT.fmt(cs, 3), cc, dois || reto ? p.BOLD : p.NORMAL], [dois ? '  = 3/5' : reto ? '  = 0' : '', COR.pos, p.BOLD]], 28, 32, 22);
		linha([['θ ≈ ' + UT.fmt(th, 1) + '°', cc, dois || reto ? p.BOLD : p.NORMAL], [reto ? '  diagonais ⊥' : '', COR.zero, p.BOLD]], 28, 64, 22);

		// solução
		if (sol) {
			p.noStroke(); p.fill(255, 240); p.stroke(226, 232, 240); p.strokeWeight(1.5); p.rect(14, H - 152, 640, 140, 10);
			let y = H - 132;
			linha([['A(0, 0), B(5, 0), C(4, 2), D(1, 2):   ', null], V('AC', COR.u), [' = (4, 2),   ', null], V('DB', COR.v), [' = (4, −2)', null]], 28, y); y += 32;
			linha([['θ é o ângulo de ', null], V('AC', COR.u), [' e ', null], V('DB', COR.v), [' (têm o sentido de ', null], V('IC'), [' e ', null], V('IB'), [')', null]], 28, y); y += 32;
			linha([V('AC', COR.u), [' · ', null], V('DB', COR.v), [' = 16 − 4 = 12;   ‖', null], V('AC', COR.u), ['‖ = ‖', null], V('DB', COR.v), ['‖ = √20', null]], 28, y); y += 32;
			linha([['cos θ = 12 / (√20 × √20) = 12/20 = ', null], ['3/5', COR.pos, p.BOLD], ['   ⇒   θ ≈ ', null], ['53,1°', COR.pos, p.BOLD]], 28, y);
		}
	};
};
