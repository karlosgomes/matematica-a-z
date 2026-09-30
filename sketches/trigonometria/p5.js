/* =====================================================================
   Problema 5 — Losango [PQRS] de lado 5, ângulo α em R (0° < α ≤ 90°)
   Semidiagonais: OR = 5 cos(α/2), OQ = 5 sin(α/2)
   A(α) = 50 sin(α/2) cos(α/2)
   (ficheiro do problema 5; não confundir com a biblioteca p5.js)
   ===================================================================== */
SKETCHES['trig-p5'] = function (p, controlos) {
	const W = 940, H = 560;
	const L = 5;
	const A = a => 50 * Math.sin(p.radians(a / 2)) * Math.cos(p.radians(a / 2));

	const FIG = { cx: 270, cy: 300, s: 44 };
	const GR = { x0: 590, x1: 910, y0: 480, y1: 110, Amax: 27.5 };

	const COR = {
		los: [99, 102, 241], ang: [239, 68, 68], tri: [202, 138, 4], v: [29, 78, 216],
		h: [220, 38, 38], quad: [16, 185, 129], curva: [29, 78, 216], ponto: [219, 39, 119],
		texto: [30, 41, 59]
	};

	let alfa = 60, aAnimar = false, sentido = 1, rasto = new Set();
	let sl, btPlay, cxTri, cxMed, cxQuad, cxCurva;

	const X = x => FIG.cx + x * FIG.s;
	const Y = y => FIG.cy - y * FIG.s;

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');

		sl = UT.slider(p, controlos, 'α', 0, 90, alfa, 0.1);
		sl.input(() => { parar(); definir(sl.value()); });
		btPlay = UT.botao(p, controlos, '▶ Animar', () => {
			aAnimar = !aAnimar;
			btPlay.html(aAnimar ? '⏸ Pausa' : '▶ Animar');
		});
		UT.quebra(p, controlos);
		[['α = 10°', 10], ['α = 30°', 30], ['tan α = √3', 60], ['α = 90°', 90]]
			.forEach(([t, v]) => UT.botao(p, controlos, t, () => { parar(); definir(v); }, 'atalho'));
		UT.quebra(p, controlos);
		cxTri = UT.caixa(p, controlos, 'Diagonais e triângulos');
		cxMed = UT.caixa(p, controlos, 'Mostrar medidas');
		cxQuad = UT.caixa(p, controlos, 'Quadrado de lado 5');
		cxCurva = UT.caixa(p, controlos, 'Curva completa');
		UT.botao(p, controlos, 'Limpar rasto', () => { rasto = new Set([arred(alfa)]); }, 'atalho');
		definir(alfa);
	};

	function parar() { aAnimar = false; btPlay.html('▶ Animar'); }
	function arred(a) { return Math.round(a * 2) / 2; }
	function definir(a) {
		alfa = p.constrain(a, 0, 90);
		sl.value(alfa);
		rasto.add(arred(alfa));
	}

	p.draw = function () {
		if (aAnimar) {
			let n = alfa + sentido * 12 * p.deltaTime / 1000;   // 12 °/s
			if (n >= 90) { n = 90; sentido = -1; }
			if (n <= 1) { n = 1; sentido = 1; }
			definir(n);
		}
		p.background(255);
		figura();
		grafico();
		leitura();
	};

	/* ---------------- utilitários ---------------- */
	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	function tracejado(x1, y1, x2, y2) {
		p.drawingContext.setLineDash([6, 5]); p.line(x1, y1, x2, y2); p.drawingContext.setLineDash([]);
	}
	function poli(pts, fillC, strokeC, peso = 2) {
		fillC ? p.fill(...fillC) : p.noFill();
		strokeC ? (p.stroke(...strokeC), p.strokeWeight(peso)) : p.noStroke();
		p.beginShape(); pts.forEach(([x, y]) => p.vertex(X(x), Y(y))); p.endShape(p.CLOSE);
	}

	/* ---------------- figura ---------------- */
	function figura() {
		const m = p.radians(alfa / 2);
		const v = L * Math.cos(m), h = L * Math.sin(m);        // semidiagonais
		const R = [0, v], Q = [h, 0], P = [0, -v], S = [-h, 0], O = [0, 0];

		// quadrado de lado 5 (o losango com α = 90°)
		if (cxQuad.checked()) {
			const d = L / Math.SQRT2;
			p.drawingContext.setLineDash([8, 6]);
			poli([[0, d], [d, 0], [0, -d], [-d, 0]], [...COR.quad, 25], COR.quad, 2);
			p.drawingContext.setLineDash([]);
		}

		poli([P, Q, R, S], [...COR.los, 70], COR.los, 3);

		if (cxTri.checked()) {
			// 4 triângulos retângulos iguais; destaca [ORQ]
			poli([O, R, Q], [...COR.tri, 90], COR.tri, 1.5);
			p.stroke(...COR.v); p.strokeWeight(4); p.line(X(0), Y(-v), X(0), Y(v));
			p.stroke(...COR.h); p.line(X(-h), Y(0), X(h), Y(0));
			if (h > 0.15) {
				const q = 12;
				p.noFill(); p.stroke(80); p.strokeWeight(1.5); p.rect(X(0), Y(0) - q, q, q);
			}
			p.noStroke(); p.fill(...COR.texto); p.circle(X(0), Y(0), 8);
			rot('O', X(0) - 16, Y(0) + 16, COR.texto, 18);
		}

		// ângulo α em R (e α/2 quando há diagonais)
		const aQ = Math.atan2(Y(0) - Y(v), X(h) - X(0)), aS = Math.atan2(Y(0) - Y(v), X(-h) - X(0));
		if (alfa > 0.3) {
			p.noStroke(); p.fill(...COR.ang, 150);
			// com as diagonais, marca só metade do ângulo (entre RQ e RO)
			p.arc(X(0), Y(v), 70, 70, aQ, cxTri.checked() ? p.HALF_PI : aS, p.PIE);
		}
		rot(cxTri.checked() ? 'α/2' : 'α', X(0) + (cxTri.checked() ? 22 : 0), Y(v) + 58, COR.ang, 20);

		if (cxMed.checked()) {
			rot('5', (X(0) + X(h)) / 2 + 14, (Y(v) + Y(0)) / 2 - 10, COR.los, 20);
			if (cxTri.checked()) {
				rot('5 cos(α/2)', X(0) - 10, Y(v / 2), COR.v, 17, p.RIGHT);
				if (h > 0.5) rot('5 sin(α/2)', X(h / 2), Y(0) + 20, COR.h, 17);
			}
		}

		const o = 20;
		rot('R', X(0), Y(v) - o); rot('P', X(0), Y(-v) + o);
		rot('Q', X(h) + o, Y(0)); rot('S', X(-h) - o, Y(0));
	}

	/* ---------------- gráfico A(α) ---------------- */
	function grafico() {
		const GX = a => p.map(a, 0, 90, GR.x0, GR.x1);
		const GY = v => p.map(v, 0, GR.Amax, GR.y0, GR.y1);

		p.textStyle(p.NORMAL); p.textSize(14);
		for (let a = 0; a <= 90; a += 15) {
			p.stroke(230); p.strokeWeight(1); p.line(GX(a), GR.y0, GX(a), GR.y1);
			p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP); p.text(a + '°', GX(a), GR.y0 + 8);
		}
		for (let v = 0; v <= 25; v += 5) {
			p.stroke(230); p.line(GX(0), GY(v), GX(90), GY(v));
			p.noStroke(); p.fill(90); p.textAlign(p.RIGHT, p.CENTER); p.text(v, GX(0) - 8, GY(v));
		}
		p.stroke(80); p.strokeWeight(1.5);
		p.line(GX(0), GY(0), GX(90) + 10, GY(0));
		p.line(GX(0), GY(0), GX(0), GR.y1 - 10);
		rot('A(α)', GX(0) + 8, GR.y1 - 16, COR.texto, 18, p.LEFT);
		rot('α', GX(90) + 6, GY(0) + 30, COR.texto, 18, p.RIGHT);

		if (cxCurva.checked()) {
			p.noFill(); p.stroke(...COR.curva); p.strokeWeight(3);
			p.beginShape();
			for (let a = 0; a <= 90; a += 0.5) p.vertex(GX(a), GY(A(a)));
			p.endShape();
		} else {
			p.noStroke(); p.fill(...COR.curva);
			rasto.forEach(a => p.circle(GX(a), GY(A(a)), 5));
		}

		const v = A(alfa);
		p.stroke(...COR.ponto); p.strokeWeight(1.2);
		tracejado(GX(alfa), GY(0), GX(alfa), GY(v));
		tracejado(GX(0), GY(v), GX(alfa), GY(v));
		p.noStroke(); p.fill(...COR.ponto); p.circle(GX(alfa), GY(v), 13);
	}

	/* ---------------- leitura ---------------- */
	function leitura() {
		const m = p.radians(alfa / 2), f = x => UT.fmt(x, 3);
		const x = GR.x0 - 40;
		p.noStroke(); p.textSize(19); p.textAlign(p.LEFT, p.CENTER);
		p.textStyle(p.BOLD); p.fill(...COR.ang); p.text(`α = ${UT.fmt(alfa, 1)}°`, x, 22);
		p.textStyle(p.NORMAL); p.fill(...COR.v); p.text(`5 cos(α/2) ≈ ${f(5 * Math.cos(m))}`, x + 120, 22);
		p.fill(...COR.h); p.text(`5 sin(α/2) ≈ ${f(5 * Math.sin(m))}`, x + 120, 48);
		p.textStyle(p.BOLD); p.fill(...COR.ponto); p.text(`A(α) ≈ ${f(A(alfa))}`, x, 74);
	}
};
