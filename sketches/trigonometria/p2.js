/* =====================================================================
   Problema 2 — Triângulo [OPA] no círculo trigonométrico
   A(−1, 0), P(cos θ, sin θ), 0° < θ < 180°
   Área = sin θ / 2      d² = AP² = 2 + 2 cos θ
   ===================================================================== */
SKETCHES['trig-p2'] = function (p, controlos) {
	const W = 940, H = 560;
	const O = { x: 265, y: 318 }, R = 182;                 // círculo (px)
	const GR = { x0: 580, x1: 915, y0: 480, y1: 90 };      // gráfico

	const COR = {
		tri: [239, 68, 68], circ: [30, 41, 59], eixo: [100, 116, 139], ang: [124, 58, 237],
		alt: [220, 38, 38], base: [29, 78, 216], d: [5, 150, 105], R: [234, 88, 12],
		curva: [29, 78, 216], ponto: [219, 39, 119], texto: [30, 41, 59]
	};

	// funções representáveis no gráfico
	const GRAFICOS = {
		area: { nome: 'Área(θ)', f: t => Math.sin(p.radians(t)) / 2, max: 0.6, passo: 0.1, casas: 1 },
		d:    { nome: 'd(θ)',    f: t => Math.sqrt(2 + 2 * Math.cos(p.radians(t))), max: 2.2, passo: 0.5, casas: 1 },
		d2:   { nome: 'd²(θ)',   f: t => 2 + 2 * Math.cos(p.radians(t)), max: 4.4, passo: 1, casas: 0 }
	};
	let modo = 'area';

	let teta = 30, aAnimar = false, sentido = 1, rasto = new Set();
	let sl, btPlay, cxAlt, cxDec, cxR, cxCurva, btModos = {};

	const X = x => O.x + x * R;
	const Y = y => O.y - y * R;

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');

		sl = UT.slider(p, controlos, 'θ', 0, 180, teta, 0.1);
		sl.input(() => { parar(); definir(sl.value()); });
		btPlay = UT.botao(p, controlos, '▶ Animar', () => {
			aAnimar = !aAnimar;
			btPlay.html(aAnimar ? '⏸ Pausa' : '▶ Animar');
		});

		UT.quebra(p, controlos);
		[['θ = 30°', 30], ['θ = 90°', 90], ['θ = 150°', 150],
		 ['d = 1,2', p.degrees(Math.acos(-0.28))]]
			.forEach(([t, v]) => UT.botao(p, controlos, t, () => { parar(); definir(v); }, 'atalho'));
		p.createSpan('&nbsp;&nbsp;Gráfico:').parent(controlos);
		[['area', 'Área'], ['d', 'd'], ['d2', 'd²']].forEach(([m, t]) => {
			btModos[m] = UT.botao(p, controlos, t, () => escolherModo(m), 'atalho');
		});
		escolherModo(modo);

		UT.quebra(p, controlos);
		cxAlt = UT.caixa(p, controlos, 'Altura do triângulo');
		cxDec = UT.caixa(p, controlos, 'Decompor d');
		cxR = UT.caixa(p, controlos, 'Pontos R com a mesma área');
		cxCurva = UT.caixa(p, controlos, 'Curva completa');
		UT.botao(p, controlos, 'Limpar rasto', () => { rasto = new Set([arred(teta)]); }, 'atalho');

		definir(teta);
	};

	function escolherModo(m) {
		modo = m;
		Object.entries(btModos).forEach(([k, b]) =>
			b.style('background', k === m ? '#1d4ed8' : '').style('color', k === m ? 'white' : ''));
	}
	function parar() { aAnimar = false; btPlay.html('▶ Animar'); }
	function arred(t) { return Math.round(t * 2) / 2; }
	function definir(t) {
		teta = p.constrain(t, 0, 180);
		sl.value(teta);
		rasto.add(arred(teta));
	}

	p.draw = function () {
		if (aAnimar) {
			let n = teta + sentido * 20 * p.deltaTime / 1000;   // 20 °/s
			if (n >= 180) { n = 180; sentido = -1; }
			if (n <= 0) { n = 0; sentido = 1; }
			definir(n);
		}
		p.background(255);
		figura();
		grafico();
		leitura();
	};

	/* ---------------- utilitários de desenho ---------------- */
	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	function tracejado(x1, y1, x2, y2) {
		p.drawingContext.setLineDash([6, 5]);
		p.line(x1, y1, x2, y2);
		p.drawingContext.setLineDash([]);
	}
	function seta(x1, y1, x2, y2) {
		p.stroke(...COR.eixo); p.strokeWeight(1.5);
		p.line(x1, y1, x2, y2);
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...COR.eixo); p.triangle(0, 0, -12, -5, -12, 5); p.pop();
	}

	/* ---------------- figura ---------------- */
	function figura() {
		const t = p.radians(teta), c = Math.cos(t), s = Math.sin(t);

		// eixos e circunferência
		seta(X(-1.3), O.y, X(1.35), O.y);
		seta(O.x, Y(-1.15), O.x, Y(1.22));
		rot('x', X(1.35), O.y + 20, COR.eixo, 20, p.CENTER, p.ITALIC);
		rot("y", O.x - 16, Y(1.22), COR.eixo, 20, p.CENTER, p.ITALIC);
		rot('1', X(1) + 12, O.y + 18, COR.eixo, 18, p.LEFT, p.NORMAL);
		rot('1', O.x - 10, Y(1) - 14, COR.eixo, 18, p.RIGHT, p.NORMAL);
		rot('−1', O.x - 10, Y(-1) + 16, COR.eixo, 18, p.RIGHT, p.NORMAL);
		p.noFill(); p.stroke(...COR.circ); p.strokeWeight(2);
		p.circle(O.x, O.y, 2 * R);

		// pontos R com a mesma área: (−cos θ, sin θ), (cos θ, −sin θ), (−cos θ, −sin θ)
		if (cxR.checked()) {
			[[-c, s], [c, -s], [-c, -s]].forEach(([rx, ry], i) => {
				if (Math.abs(rx - c) < 1e-6 && Math.abs(ry - s) < 1e-6) return;   // coincide com P
				p.fill(...COR.R, 35); p.stroke(...COR.R); p.strokeWeight(1.5);
				p.drawingContext.setLineDash([6, 5]);
				p.triangle(X(-1), O.y, O.x, O.y, X(rx), Y(ry));
				p.drawingContext.setLineDash([]);
				p.noStroke(); p.fill(...COR.R); p.circle(X(rx), Y(ry), 12);
				rot(`R${i + 1}`, X(1.14 * rx), Y(1.14 * ry), COR.R, 20);
			});
		}

		// triângulo [OPA]
		p.fill(...COR.tri, 70); p.stroke(...COR.tri); p.strokeWeight(2.5);
		p.triangle(X(-1), O.y, O.x, O.y, X(c), Y(s));

		// decomposição de d: triângulo retângulo A, Q(cos θ, 0), P
		if (cxDec.checked()) {
			p.stroke(...COR.base); p.strokeWeight(5);
			p.line(X(-1), O.y + 0, X(c), O.y);
			p.stroke(...COR.alt); p.line(X(c), O.y, X(c), Y(s));
			if (s > 0.08 && c > -0.92) {
				const q = 12;
				p.noFill(); p.stroke(80); p.strokeWeight(1.5);
				p.rect(X(c) - q, O.y - q, q, q);
			}
			rot('1 + cos θ', (X(-1) + X(c)) / 2, O.y + 24, COR.base, 19);
			rot('sin θ', X(c) + 10, Y(s / 2), COR.alt, 19, p.LEFT);
		} else if (cxAlt.checked()) {
			// altura relativa à base [OA]
			p.stroke(...COR.alt); p.strokeWeight(3);
			tracejado(X(c), Y(s), X(c), O.y);
			if (c > -1 && c < 0) { p.stroke(...COR.alt, 120); p.strokeWeight(1); tracejado(X(c), O.y, X(-1), O.y); }
			if (c > 0) { p.stroke(...COR.alt, 120); p.strokeWeight(1); tracejado(O.x, O.y, X(c), O.y); }
			rot('h = sin θ', X(c) + 10, Y(s / 2), COR.alt, 19, p.LEFT);
			rot('base = 1', (X(-1) + O.x) / 2, O.y + 24, COR.base, 19);
		}

		// segmento AP = d
		p.stroke(...COR.d); p.strokeWeight(3.5);
		p.line(X(-1), O.y, X(c), Y(s));
		const mx = (X(-1) + X(c)) / 2, my = (O.y + Y(s)) / 2;
		rot('d', mx - 14, my - 14, COR.d, 24);

		// ângulo θ
		if (teta > 0.1) {
			p.noStroke(); p.fill(...COR.ang, 60);
			p.arc(O.x, O.y, 80, 80, -t, 0, p.PIE);
			p.noFill(); p.stroke(...COR.ang); p.strokeWeight(2);
			p.arc(O.x, O.y, 80, 80, -t, 0);
		}
		rot('θ', O.x + 58 * Math.cos(t / 2), O.y - 58 * Math.sin(t / 2), COR.ang, 22);

		// pontos
		p.noStroke(); p.fill(...COR.circ);
		p.circle(X(-1), O.y, 10); p.circle(O.x, O.y, 8);
		rot('A', X(-1) - 18, O.y - 18);
		rot('O', O.x - 16, O.y + 20);
		p.noStroke(); p.fill(...COR.ponto); p.circle(X(c), Y(s), 14);
		rot('P', X(1.12 * c), Y(1.12 * s) - 4, COR.ponto, 24);
	}

	/* ---------------- gráfico ---------------- */
	function grafico() {
		const g = GRAFICOS[modo];
		const GX = t => p.map(t, 0, 180, GR.x0, GR.x1);
		const GY = v => p.map(v, 0, g.max, GR.y0, GR.y1);

		p.textStyle(p.NORMAL); p.textSize(15); p.noStroke();
		for (let t = 0; t <= 180; t += 30) {
			p.stroke(230); p.strokeWeight(1); p.line(GX(t), GY(0), GX(t), GY(g.max));
			p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP); p.text(t + '°', GX(t), GY(0) + 8);
		}
		for (let v = 0; v <= g.max + 1e-9; v += g.passo) {
			p.stroke(230); p.line(GX(0), GY(v), GX(180), GY(v));
			p.noStroke(); p.fill(90); p.textAlign(p.RIGHT, p.CENTER);
			p.text(UT.fmt(v, g.casas), GX(0) - 8, GY(v));
		}
		p.stroke(80); p.strokeWeight(1.5);
		p.line(GX(0), GY(0), GX(180) + 10, GY(0));
		p.line(GX(0), GY(0), GX(0), GY(g.max) - 10);
		rot(g.nome, GX(0) + 8, GY(g.max) - 16, COR.texto, 18, p.LEFT);
		rot('θ', GX(180) + 4, GY(0) + 34, COR.texto, 18, p.RIGHT);

		if (cxCurva.checked()) {
			p.noFill(); p.stroke(...COR.curva); p.strokeWeight(3);
			p.beginShape();
			for (let t = 0; t <= 180; t += 1) p.vertex(GX(t), GY(g.f(t)));
			p.endShape();
		} else {
			p.noStroke(); p.fill(...COR.curva);
			rasto.forEach(t => p.circle(GX(t), GY(g.f(t)), 5));
		}

		const v = g.f(teta);
		p.stroke(...COR.ponto); p.strokeWeight(1.2);
		p.drawingContext.setLineDash([6, 5]);
		p.line(GX(teta), GY(0), GX(teta), GY(v));
		p.line(GX(0), GY(v), GX(teta), GY(v));
		p.drawingContext.setLineDash([]);
		p.noStroke(); p.fill(...COR.ponto); p.circle(GX(teta), GY(v), 13);
	}

	/* ---------------- leitura numérica ---------------- */
	function leitura() {
		const t = p.radians(teta), c = Math.cos(t), s = Math.sin(t);
		const f = x => UT.fmt(x, 3);
		const semTan = Math.abs(c) < 1e-9;
		p.noStroke(); p.textSize(20); p.textAlign(p.LEFT, p.CENTER);
		p.textStyle(p.BOLD); p.fill(...COR.ang); p.text(`θ = ${UT.fmt(teta, 1)}°`, 20, 22);
		p.textStyle(p.NORMAL); p.fill(...COR.ponto); p.text(`P(${f(c)} ; ${f(s)})`, 150, 22);
		p.fill(...COR.tri); p.textStyle(p.BOLD); p.text(`Área ≈ ${f(s / 2)}`, 20, 52);
		p.fill(...COR.d); p.text(`d ≈ ${f(Math.sqrt(2 + 2 * c))}`, 170, 52);
		p.textStyle(p.NORMAL); p.text(`d² ≈ ${f(2 + 2 * c)}`, 300, 52);
		p.fill(...COR.texto); p.text(semTan ? 'tan θ não definida' : `tan θ ≈ ${f(s / c)}`, 440, 52);
	}
};
