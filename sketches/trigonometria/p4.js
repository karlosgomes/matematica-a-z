/* =====================================================================
   Problema 4 — Quadrado [ABCD] (lado 5) e triângulo isósceles [ABP]
   B(0,0), C(5,0), D(5,5), A(0,5), M(5; 2,5), P(2,5/tan α; 2,5)
   PM = 5 − 5/(2 tan α)   (P no quadrado ⇔ tan α ≥ 1/2)
   ===================================================================== */
SKETCHES['trig-p4'] = function (p, controlos) {
	const W = 940, H = 560;
	const L = 5, h = L / 2;
	const AMIN = 22, AMAX = 90;
	const aLim = Math.atan(0.5) * 180 / Math.PI;            // ≈ 26,57°: P coincide com M
	const PM = a => a >= 89.999 ? L : L - h / Math.tan(p.radians(a));

	const FIG = { ox: 60, oy: 490, s: 70 };
	const GR = { x0: 620, x1: 910, y0: 480, y1: 90, ymin: -1.5, ymax: 5.5 };

	const COR = {
		quad: [239, 68, 68], tri: [239, 68, 68], ang: [124, 58, 237], pm: [5, 150, 105],
		aux: [29, 78, 216], alt: [202, 138, 4], curva: [29, 78, 216], ponto: [219, 39, 119],
		texto: [30, 41, 59], erro: [220, 38, 38]
	};

	let alfa = 30, aAnimar = false, sentido = 1, rasto = new Set();
	let sl, btPlay, cxProj, cxMed, cxCurva;

	const X = x => FIG.ox + x * FIG.s;
	const Y = y => FIG.oy - y * FIG.s;

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');

		sl = UT.slider(p, controlos, 'α', AMIN, AMAX, alfa, 0.1);
		sl.input(() => { parar(); definir(sl.value()); });
		btPlay = UT.botao(p, controlos, '▶ Animar', () => {
			aAnimar = !aAnimar;
			btPlay.html(aAnimar ? '⏸ Pausa' : '▶ Animar');
		});
		UT.quebra(p, controlos);
		[['α = 30°', 30], ['α = 45°', 45], ['α = 60°', 60], ['tan α = 1/2', aLim], ['α = 90°', 90]]
			.forEach(([t, v]) => UT.botao(p, controlos, t, () => { parar(); definir(v); }, 'atalho'));
		UT.quebra(p, controlos);
		cxProj = UT.caixa(p, controlos, 'Projetar P em [BC]');
		cxMed = UT.caixa(p, controlos, 'Mostrar medidas');
		cxCurva = UT.caixa(p, controlos, 'Curva completa');
		UT.botao(p, controlos, 'Limpar rasto', () => { rasto = new Set([arred(alfa)]); }, 'atalho');
		definir(alfa);
	};

	function parar() { aAnimar = false; btPlay.html('▶ Animar'); }
	function arred(a) { return Math.round(a * 2) / 2; }
	function definir(a) {
		alfa = p.constrain(a, AMIN, AMAX);
		sl.value(alfa);
		rasto.add(arred(alfa));
	}

	p.draw = function () {
		if (aAnimar) {
			let n = alfa + sentido * 10 * p.deltaTime / 1000;   // 10 °/s
			if (n >= AMAX) { n = AMAX; sentido = -1; }
			if (n <= AMIN) { n = AMIN; sentido = 1; }
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
	function ponto(x, y, cor, d = 11) { p.noStroke(); p.fill(...cor); p.circle(X(x), Y(y), d); }

	/* ---------------- figura ---------------- */
	function figura() {
		const t = p.radians(alfa);
		const xP = alfa >= 89.999 ? 0 : h / Math.tan(t);
		const dentro = xP <= L + 1e-9;

		// quadrado
		p.noFill(); p.stroke(...COR.quad); p.strokeWeight(2.5);
		p.rect(X(0), Y(L), L * FIG.s, L * FIG.s);

		// eixo de simetria de [AB] (onde P se desloca)
		p.stroke(150); p.strokeWeight(1);
		tracejado(X(0), Y(h), X(6.4), Y(h));

		// triângulo [ABP]
		p.fill(...COR.tri, 60); p.stroke(...COR.tri); p.strokeWeight(2.5);
		p.triangle(X(0), Y(L), X(0), Y(0), X(xP), Y(h));

		// projeção Q de P em [BC]: PQ = 2,5 ; BQ = 2,5/tan α ; QC = PM
		if (cxProj.checked()) {
			p.stroke(...COR.alt); p.strokeWeight(3);
			tracejado(X(xP), Y(h), X(xP), Y(0));
			p.stroke(...COR.aux); p.strokeWeight(6);
			p.line(X(0), Y(0), X(xP), Y(0));
			if (dentro) { p.stroke(...COR.pm); p.line(X(xP), Y(0), X(L), Y(0)); }
			if (alfa < 88) {
				const q = 12;
				p.noFill(); p.stroke(80); p.strokeWeight(1.5);
				p.rect(X(xP) - q, Y(0) - q, q, q);
			}
			ponto(xP, 0, COR.alt);
			rot('Q', X(xP), Y(0) + 22, COR.alt);
			rot('2,5', X(xP) + 8, Y(h / 2), COR.alt, 18, p.LEFT);
			rot('2,5 / tan α', X(xP / 2), Y(0) + 46, COR.aux, 18);
			if (dentro && L - xP > 0.3) rot('QC = PM', X((xP + L) / 2), Y(0) - 18, COR.pm, 17);
		}

		// segmento [PM]
		p.stroke(...(dentro ? COR.pm : COR.erro)); p.strokeWeight(4);
		p.line(X(xP), Y(h), X(L), Y(h));
		rot('PM', X((xP + L) / 2), Y(h) + (dentro ? -18 : 20), dentro ? COR.pm : COR.erro, 18);

		// ângulo α em B, entre BC e BP
		if (alfa < 89.9) {
			p.noStroke(); p.fill(...COR.ang, 110);
			p.arc(X(0), Y(0), 90, 90, -t, 0, p.PIE);
		}
		rot('α', X(0) + 64 * Math.cos(t / 2), Y(0) - 64 * Math.sin(t / 2), COR.ang, 22);

		if (cxMed.checked()) {
			rot('5', X(L / 2), Y(L) - 18, COR.quad, 18);
			rot('2,5', X(L) + 12, Y(3 * h / 2), COR.quad, 18, p.LEFT);
			rot('2,5', X(L) + 12, Y(h / 2), COR.quad, 18, p.LEFT);
		}

		// vértices
		ponto(xP, h, COR.ponto, 13); ponto(L, h, COR.texto, 11);
		const o = 18;
		rot('A', X(0) - o, Y(L) - o); rot('D', X(L) + o, Y(L) - o);
		rot('B', X(0) - o, Y(0) + o); rot('C', X(L) + o, Y(0) + o);
		rot('M', X(L) + o + 4, Y(h) - (dentro ? 0 : 20));
		rot('P', X(xP) + (dentro ? -4 : 10), Y(h) - 22, COR.ponto);

	}

	/* ---------------- gráfico PM(α) ---------------- */
	function grafico() {
		const GX = a => p.map(a, 0, 90, GR.x0, GR.x1);
		const GY = v => p.map(v, GR.ymin, GR.ymax, GR.y0, GR.y1);

		// zona onde P está dentro do quadrado
		p.noStroke(); p.fill(...COR.pm, 25);
		p.rect(GX(aLim), GR.y1, GX(90) - GX(aLim), GR.y0 - GR.y1);

		p.textStyle(p.NORMAL); p.textSize(14);
		for (let a = 0; a <= 90; a += 15) {
			p.stroke(230); p.strokeWeight(1); p.line(GX(a), GR.y0, GX(a), GR.y1);
			p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP); p.text(a + '°', GX(a), GR.y0 + 8);
		}
		for (let v = -1; v <= 5; v++) {
			p.stroke(230); p.line(GX(0), GY(v), GX(90), GY(v));
			p.noStroke(); p.fill(90); p.textAlign(p.RIGHT, p.CENTER); p.text(v, GX(0) - 8, GY(v));
		}
		p.stroke(80); p.strokeWeight(1.5);
		p.line(GX(0), GY(0), GX(90) + 10, GY(0));
		p.line(GX(0), GR.y0, GX(0), GR.y1 - 10);
		p.stroke(...COR.pm); p.strokeWeight(1.5);
		tracejado(GX(aLim), GR.y0, GX(aLim), GR.y1);
		rot('tan α = 1/2', GX(aLim) + 6, GR.y0 - 14, COR.pm, 14, p.LEFT, p.NORMAL);
		rot('PM(α)', GX(0) + 8, GR.y1 - 16, COR.texto, 18, p.LEFT);
		rot('α', GX(90) + 6, GY(0) + 30, COR.texto, 18, p.RIGHT);

		if (cxCurva.checked()) {
			p.noFill(); p.stroke(...COR.curva); p.strokeWeight(3);
			p.beginShape();
			for (let a = AMIN; a <= AMAX; a += 0.5) p.vertex(GX(a), GY(PM(a)));
			p.endShape();
		} else {
			p.noStroke();
			rasto.forEach(a => { p.fill(...(a < aLim ? COR.erro : COR.curva)); p.circle(GX(a), GY(PM(a)), 5); });
		}

		const v = PM(alfa), cor = alfa < aLim - 1e-6 ? COR.erro : COR.ponto;
		p.stroke(...cor); p.strokeWeight(1.2);
		tracejado(GX(alfa), GY(0), GX(alfa), GY(v));
		tracejado(GX(0), GY(v), GX(alfa), GY(v));
		p.noStroke(); p.fill(...cor); p.circle(GX(alfa), GY(v), 13);
	}

	/* ---------------- leitura ---------------- */
	function leitura() {
		const t = p.radians(alfa);
		const f = x => UT.fmt(x, 3);
		p.noStroke(); p.textSize(20); p.textAlign(p.LEFT, p.CENTER);
		p.textStyle(p.BOLD); p.fill(...COR.ang); p.text(`α = ${UT.fmt(alfa, 1)}°`, 20, 22);
		p.textStyle(p.NORMAL); p.fill(...COR.aux);
		p.text(alfa >= 89.999 ? 'tan α não definida' : `tan α ≈ ${f(Math.tan(t))}`, 150, 22);
		p.fill(...COR.aux); p.text(`BQ = 2,5 / tan α ≈ ${alfa >= 89.999 ? '0' : f(h / Math.tan(t))}`, 330, 22);
		p.textStyle(p.BOLD); p.fill(...(alfa < aLim - 1e-6 ? COR.erro : COR.pm));
		p.text(`PM = 5 − 5 / (2 tan α) ≈ ${f(PM(alfa))}`, 20, 52);
		if (alfa < aLim - 1e-6) p.text('→ P fora do quadrado: a fórmula dá PM < 0', 290, 52);
	}
};
