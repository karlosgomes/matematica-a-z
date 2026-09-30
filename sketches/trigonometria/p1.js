/* =====================================================================
   Problema 1 — Quadrado [EFGH] (lado 5) inscrito no quadrado [ABCD]
   A(α) = 25 + 50 cos α sin α,  α ∈ [0°, 90°]
   ===================================================================== */
SKETCHES['trig-p1'] = function (p, controlos) {
	const W = 940, H = 560;
	const LADO = 5;
	const A = a => 25 + 50 * Math.cos(p.radians(a)) * Math.sin(p.radians(a));

	// regiões do canvas
	const FIG = { ox: 50, oy: 520, s: 54 };                 // figura (escala fixa em px/cm)
	const GR = { x0: 520, x1: 915, y0: 480, y1: 60,          // gráfico
		amin: 0, amax: 90, Amin: 0, Amax: 55 };

	const COR = {
		ext: [239, 68, 68], int: [16, 185, 129], ang: [124, 58, 237],
		aux: [202, 138, 4], curva: [29, 78, 216], ponto: [219, 39, 119], texto: [30, 41, 59]
	};

	let alfa = 30, aAnimar = false, sentido = 1;
	let rasto = new Set();
	let sl, cxTri, cxMed, cxCurva, btPlay;

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');   // fonte do tema white do Reveal

		sl = UT.slider(p, controlos, 'α', 0, 90, alfa, 0.1);
		sl.input(() => { parar(); definir(sl.value()); });
		btPlay = UT.botao(p, controlos, '▶ Animar', () => {
			aAnimar = !aAnimar;
			btPlay.html(aAnimar ? '⏸ Pausa' : '▶ Animar');
		});

		UT.quebra(p, controlos);
		[['α = 0°', 0], ['α = 45°', 45], ['tan α = 3/4', p.degrees(Math.atan(3 / 4))], ['α = 90°', 90]]
			.forEach(([t, v]) => UT.botao(p, controlos, t, () => { parar(); definir(v); }, 'atalho'));

		UT.quebra(p, controlos);
		cxTri = UT.caixa(p, controlos, 'Destacar triângulos');
		cxMed = UT.caixa(p, controlos, 'Mostrar medidas');
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
			let n = alfa + sentido * 15 * p.deltaTime / 1000;   // 15 °/s
			if (n >= 90) { n = 90; sentido = -1; }
			if (n <= 0) { n = 0; sentido = 1; }
			definir(n);
		}
		p.background(255);
		figura();
		grafico();
		leitura();
	};

	/* ---------------- figura ---------------- */
	const X = x => FIG.ox + x * FIG.s;
	const Y = y => FIG.oy - y * FIG.s;

	function quad(pts, fillC, strokeC, peso = 2) {
		fillC ? p.fill(...fillC) : p.noFill();
		p.stroke(...strokeC); p.strokeWeight(peso);
		p.beginShape();
		pts.forEach(([x, y]) => p.vertex(X(x), Y(y)));
		p.endShape(p.CLOSE);
	}

	function rotulo(t, x, y, cor = COR.texto, tam = 22) {
		p.noStroke(); p.fill(...cor); p.textSize(tam);
		p.textAlign(p.CENTER, p.CENTER); p.textStyle(p.BOLD);
		p.text(t, x, y);
	}

	// texto paralelo a um segmento, desviado perpendicularmente
	function rotuloSeg(t, [x1, y1], [x2, y2], desvio, cor) {
		let ang = Math.atan2(Y(y2) - Y(y1), X(x2) - X(x1));
		if (ang > p.HALF_PI || ang < -p.HALF_PI) ang += p.PI;
		p.push();
		p.translate((X(x1) + X(x2)) / 2, (Y(y1) + Y(y2)) / 2);
		p.rotate(ang);
		rotulo(t, 0, desvio, cor, 18);
		p.pop();
	}

	function figura() {
		const a = p.radians(alfa);
		const c = LADO * Math.cos(a), s = LADO * Math.sin(a), L = c + s;

		const Aa = [0, 0], B = [L, 0], C = [L, L], D = [0, L];
		const E = [0, s], F = [c, 0], G = [L, c], Hh = [s, L];

		quad([Aa, B, C, D], [...COR.ext, 40], COR.ext);

		if (cxTri.checked()) {
			[[Aa, F, E], [F, B, G], [G, C, Hh], [Hh, D, E]]
				.forEach(t => quad(t, [...COR.aux, 70], COR.aux, 1.5));
		}

		quad([E, F, G, Hh], [...COR.int, 70], COR.int, 3);

		// ângulo α em F, entre FA e FE
		if (alfa > 0.05) {
			p.noStroke(); p.fill(...COR.ang, 150);
			p.arc(X(F[0]), Y(F[1]), 90, 90, p.PI, p.PI + a, p.PIE);
		}
		const m = p.PI - a / 2;
		rotulo('α', X(F[0]) + 68 * Math.cos(m), Y(F[1]) - 68 * Math.sin(m) - (alfa < 15 ? 8 : 0), COR.ang, 24);

		rotuloSeg('5 cm', E, F, -16, COR.int);

		const o = 18;
		rotulo('A', X(0) - o, Y(0) + o);
		rotulo('B', X(L) + o, Y(0) + o);
		rotulo('C', X(L) + o, Y(L) - o);
		rotulo('D', X(0) - o, Y(L) - o);
		rotulo('E', X(E[0]) - o, Y(E[1]), COR.int);
		rotulo('F', X(F[0]), Y(F[1]) + o, COR.int);
		rotulo('G', X(G[0]) + o, Y(G[1]), COR.int);
		rotulo('H', X(Hh[0]), Y(Hh[1]) - o, COR.int);

		if (cxMed.checked()) {
			if (c > 0.4) rotuloSeg('5 cos α', Aa, F, 36, COR.aux);
			if (s > 0.4) rotuloSeg('5 sin α', F, B, 36, COR.aux);
			if (s > 0.4) rotuloSeg('5 sin α', Aa, E, -30, COR.aux);
			if (c > 0.4) rotuloSeg('5 cos α', E, D, -30, COR.aux);
		}
	}

	/* ---------------- gráfico A(α) ---------------- */
	const GX = a => p.map(a, GR.amin, GR.amax, GR.x0, GR.x1);
	const GY = v => p.map(v, GR.Amin, GR.Amax, GR.y0, GR.y1);

	function grafico() {
		p.textStyle(p.NORMAL); p.textSize(15);

		// grelha
		for (let a = 0; a <= 90; a += 15) {
			p.stroke(230); p.strokeWeight(1); p.line(GX(a), GY(0), GX(a), GY(GR.Amax));
			p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP); p.text(a + '°', GX(a), GY(0) + 8);
		}
		for (let v = 0; v <= 50; v += 10) {
			p.stroke(230); p.line(GX(0), GY(v), GX(90), GY(v));
			p.noStroke(); p.fill(90); p.textAlign(p.RIGHT, p.CENTER); p.text(v, GX(0) - 8, GY(v));
		}
		p.stroke(80); p.strokeWeight(1.5);
		p.line(GX(0), GY(0), GX(90) + 10, GY(0));
		p.line(GX(0), GY(0), GX(0), GY(GR.Amax) - 10);
		p.noStroke(); p.fill(...COR.texto); p.textStyle(p.BOLD); p.textSize(18);
		p.textAlign(p.LEFT, p.CENTER); p.text('A(α)', GX(0) + 8, GY(GR.Amax) - 12);
		p.textAlign(p.RIGHT, p.TOP); p.text('α', GX(90) + 10, GY(0) + 30);

		// curva completa ou rasto
		if (cxCurva.checked()) {
			p.noFill(); p.stroke(...COR.curva); p.strokeWeight(3);
			p.beginShape();
			for (let a = 0; a <= 90; a += 0.5) p.vertex(GX(a), GY(A(a)));
			p.endShape();
		} else {
			p.noStroke(); p.fill(...COR.curva);
			rasto.forEach(a => p.circle(GX(a), GY(A(a)), 5));
		}

		// ponto atual
		const v = A(alfa);
		p.stroke(...COR.ponto); p.strokeWeight(1.2);
		p.drawingContext.setLineDash([6, 5]);
		p.line(GX(alfa), GY(0), GX(alfa), GY(v));
		p.line(GX(0), GY(v), GX(alfa), GY(v));
		p.drawingContext.setLineDash([]);
		p.noStroke(); p.fill(...COR.ponto); p.circle(GX(alfa), GY(v), 13);
	}

	/* ---------------- leitura numérica ---------------- */
	function leitura() {
		const a = p.radians(alfa);
		const L = LADO * (Math.cos(a) + Math.sin(a));
		p.noStroke(); p.textStyle(p.NORMAL); p.textSize(20); p.textAlign(p.LEFT, p.CENTER);
		p.fill(...COR.texto);
		p.text(`α = ${UT.fmt(alfa, 1)}°`, 20, 24);
		p.text(`AB ≈ ${UT.fmt(L)} cm`, 150, 24);
		p.fill(...COR.ponto); p.textStyle(p.BOLD);
		p.text(`A(α) ≈ ${UT.fmt(A(alfa))} cm²`, 320, 24);
	}
};
