/* =====================================================================
   Problema 8 — Os parâmetros k e a em y = k + a cos x  (x em graus)
   Gráfico da figura: y = 2 + 7 cos x (máximo 9 em 0°, mínimo −5 em 180°).
   O aluno ajusta a e k até a sua curva coincidir com a da figura.
   (Baseado na app «Parâmetros k e a» de apps-matematica.)
   ===================================================================== */
SKETCHES['trig-p8'] = function (p, controlos) {
	const W = 940, H = 560;
	const ALVO = { a: 7, k: 2 };
	const GR = { x0: 70, x1: 900, y0: 108, y1: 548, xmin: -420, xmax: 560, ymin: -7, ymax: 11 };

	const COR = {
		cos: [29, 78, 216], k: [22, 163, 74], a: [234, 88, 12], fig: [148, 163, 184],
		ref: [124, 58, 237], texto: [30, 41, 59], cinza: [100, 116, 139]
	};

	let a = 1, k = 0;
	let anim = null;                       // tempo da animação (s) ou null
	let slA, slK, btPlay, cxFig, cxCos, cxSol;

	const GX = x => p.map(x, GR.xmin, GR.xmax, GR.x0, GR.x1);
	const GY = y => p.map(y, GR.ymin, GR.ymax, GR.y1, GR.y0);
	const cosd = x => Math.cos(x * Math.PI / 180);
	const num = v => UT.fmt(v, Number.isInteger(Math.round(v * 10) / 10) ? 0 : 1).replace('-', '−');

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');

		slA = UT.slider(p, controlos, 'a', -8, 8, a, 0.5);
		slA.input(() => { parar(); a = slA.value(); });
		slK = UT.slider(p, controlos, 'k', -5, 5, k, 0.5);
		slK.input(() => { parar(); k = slK.value(); });
		UT.quebra(p, controlos);
		btPlay = UT.botao(p, controlos, '▶ Animar', () => {
			if (anim === null) { anim = 0; btPlay.html('⏸ Pausa'); } else parar();
		});
		[['y = cos x', 1, 0], ['a = 7, k = 0', 7, 0], ['a = 7, k = 2', 7, 2], ['a = −7, k = 2', -7, 2]]
			.forEach(([txt, va, vk]) => UT.botao(p, controlos, txt, () => { parar(); definir(va, vk); }, 'atalho'));
		UT.quebra(p, controlos);
		cxFig = UT.caixa(p, controlos, 'Gráfico da figura', true);
		cxCos = UT.caixa(p, controlos, 'y = cos x');
		cxSol = UT.caixa(p, controlos, 'Mostrar solução');
	};

	function parar() { anim = null; btPlay.html('▶ Animar'); }
	function definir(va, vk) { a = va; k = vk; slA.value(a); slK.value(k); }

	// animação: parte de y = cos x, dilata (a: 1 → 7) e depois translada (k: 0 → 2)
	function passoAnim() {
		anim += p.deltaTime / 1000;
		const s = (t0, t1) => p.constrain((anim - t0) / (t1 - t0), 0, 1);
		definir(1 + 6 * s(0.6, 3), 2 * s(3.8, 5.3));
		if (anim > 6) parar();
	}
	function fase() {
		if (anim === null) return null;
		if (anim < 0.6) return ['ponto de partida: y = cos x', COR.cos];
		if (anim < 3.4) return ['a: dilatação vertical — o gráfico estica, a linha média fica', COR.a];
		if (anim < 5.6) return ['k: translação vertical — o gráfico sobe, a amplitude fica', COR.k];
		return ['y = 2 + 7 cos x', COR.cos];
	}

	p.draw = function () {
		if (anim !== null) passoAnim();
		p.background(255);
		referencial();
		curvas();
		leitura();
	};

	/* ---------------- utilitários ---------------- */
	function rot(txt, x, y, cor = COR.texto, tam = 20, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(txt, x, y);
	}
	function tracejado(x1, y1, x2, y2, c = 6, d = 5) {
		p.drawingContext.setLineDash([c, d]); p.line(x1, y1, x2, y2); p.drawingContext.setLineDash([]);
	}
	function seta(x, y1, y2, cor, peso = 3) {
		if (Math.abs(y2 - y1) < 4) return;
		const s = Math.sign(y2 - y1), h = Math.min(12, Math.abs(y2 - y1) / 2);
		p.stroke(...cor); p.strokeWeight(peso); p.line(x, y1, x, y2 - s * h);
		p.noStroke(); p.fill(...cor); p.triangle(x, y2, x - 7, y2 - s * h, x + 7, y2 - s * h);
	}
	// texto com partes de cores diferentes: [[texto, cor, estilo], ...]
	function multicor(partes, x, y, tam) {
		p.noStroke(); p.textSize(tam); p.textAlign(p.LEFT, p.CENTER);
		for (const [t, cor, est] of partes) {
			p.textStyle(est || p.NORMAL); p.fill(...cor); p.text(t, x, y); x += p.textWidth(t);
		}
		return x;
	}
	function curva(f, cor, peso, tracos) {
		p.noFill(); p.stroke(...cor); p.strokeWeight(peso);
		if (tracos) p.drawingContext.setLineDash(tracos);
		p.beginShape();
		for (let x = GR.xmin; x <= GR.xmax; x += 2) p.vertex(GX(x), GY(f(x)));
		p.endShape();
		p.drawingContext.setLineDash([]);
	}

	/* ---------------- referencial ---------------- */
	function referencial() {
		p.strokeWeight(1);
		for (let y = GR.ymin; y <= GR.ymax; y++) { p.stroke(238); p.line(GR.x0, GY(y), GR.x1, GY(y)); }
		for (let x = -360; x <= 540; x += 90) { p.stroke(x % 180 ? 242 : 228); p.line(GX(x), GR.y0, GX(x), GR.y1); }

		const ox = GX(0), oy = GY(0);
		p.stroke(80); p.strokeWeight(1.5);
		p.line(GR.x0, oy, GR.x1 + 12, oy);
		p.line(ox, GR.y1, ox, GR.y0 - 6);
		p.noStroke(); p.fill(80);
		p.triangle(GR.x1 + 20, oy, GR.x1 + 8, oy - 5, GR.x1 + 8, oy + 5);
		p.triangle(ox, GR.y0 - 14, ox - 5, GR.y0 - 2, ox + 5, GR.y0 - 2);
		rot('x', GR.x1 + 18, oy - 18, COR.texto, 20, p.CENTER, p.ITALIC);
		rot('y', ox + 16, GR.y0 - 8, COR.texto, 20, p.CENTER, p.ITALIC);

		p.textStyle(p.NORMAL); p.textSize(14);
		for (let x = -360; x <= 540; x += 90) {
			if (!x) continue;
			p.stroke(80); p.strokeWeight(1.5); p.line(GX(x), oy - 4, GX(x), oy + 4);
			if (x % 180 === 0) {
				p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP);
				p.text(String(x).replace('-', '−') + '°', GX(x), oy + 7);
			}
		}
		for (let y = GR.ymin; y <= GR.ymax; y++) {
			if (!y) continue;
			p.stroke(80); p.strokeWeight(1.5); p.line(ox - 4, GY(y), ox + 4, GY(y));
			if (y % 2 === 0) {
				p.noStroke(); p.fill(90); p.textAlign(p.RIGHT, p.CENTER);
				p.text(String(y).replace('-', '−'), ox - 8, GY(y));
			}
		}
	}

	/* ---------------- curvas, linha média, máximo e mínimo ---------------- */
	function curvas() {
		const M = k + Math.abs(a), m = k - Math.abs(a);
		p.drawingContext.save(); p.drawingContext.beginPath();
		p.drawingContext.rect(GR.x0 - 10, GR.y0 - 4, GR.x1 - GR.x0 + 20, GR.y1 - GR.y0 + 8); p.drawingContext.clip();

		if (cxFig.checked()) curva(x => ALVO.k + ALVO.a * cosd(x), COR.fig, 7);
		if (cxCos.checked()) curva(cosd, COR.cinza, 2, [6, 5]);

		// máximo e mínimo, linha média
		if (Math.abs(a) > 1e-9) {
			p.stroke(...COR.a); p.strokeWeight(1.5);
			tracejado(GR.x0, GY(M), GR.x1, GY(M), 3, 5); tracejado(GR.x0, GY(m), GR.x1, GY(m), 3, 5);
		}
		p.stroke(...COR.k); p.strokeWeight(2.5); tracejado(GR.x0, GY(k), GR.x1, GY(k), 10, 6);

		curva(x => k + a * cosd(x), COR.cos, 4);

		// k: seta de y = 0 até à linha média;  a: seta da linha média até ao máximo em x = 360°
		const xk = GX(-270), xa = GX(360);
		seta(xk, GY(0), GY(k), COR.k);
		if (Math.abs(k) >= 0.5) rot(`k = ${num(k)}`, xk + 12, (GY(0) + GY(k)) / 2, COR.k, 19, p.LEFT);
		seta(xa, GY(k), GY(k + a), COR.a);
		if (Math.abs(a) >= 0.5) rot(`a = ${num(a)}`, xa + 12, (GY(k) + GY(k + a)) / 2, COR.a, 19, p.LEFT);
		p.drawingContext.restore();

		// etiquetas à direita
		const lx = GR.x1 - 4;
		if (Math.abs(a) > 1e-9) {
			if (GY(M) > GR.y0 + 8) rot(`máx. ${num(M)}`, lx, GY(M) - 13, COR.a, 16, p.RIGHT);
			if (GY(m) < GR.y1 - 8) rot(`mín. ${num(m)}`, lx, GY(m) + 13, COR.a, 16, p.RIGHT);
		}
		if (GY(k) > GR.y0 && GY(k) < GR.y1) rot(`y = ${num(k)}`, GR.x0 + 4, GY(k) - 13, COR.k, 16, p.LEFT);

		// solução: pontos lidos no gráfico da figura
		if (cxSol.checked()) {
			[[0, 9, 'LEFT', '(0°, 9)'], [180, -5, 'LEFT', '(180°, −5)']].forEach(([x, y, , t]) => {
				p.stroke(255); p.strokeWeight(3); p.fill(...COR.ref); p.circle(GX(x), GY(y), 14);
				rot(t, GX(x) + 12, GY(y) + (y > 0 ? -16 : 16), COR.ref, 17, p.LEFT);
			});
		}
	}

	/* ---------------- leitura (topo) ---------------- */
	function leitura() {
		const x0 = 20, M = k + Math.abs(a), m = k - Math.abs(a);
		const sinal = a < 0 ? ' − ' : ' + ';
		multicor([['y = k + a cos x  =  ', COR.texto, p.BOLD], [num(k), COR.k, p.BOLD], [sinal, COR.texto, p.BOLD],
			[num(Math.abs(a)), COR.a, p.BOLD], [' cos x', COR.cos, p.BOLD]], x0, 22, 22);
		multicor([["D' = [", COR.cinza], [num(m), COR.a], ['; ', COR.cinza], [num(M), COR.a], [']', COR.cinza],
			['      linha média  y = ', COR.cinza], [num(k), COR.k],
			['      amplitude  |a| = ', COR.cinza], [num(Math.abs(a)), COR.a]], x0, 52, 18);

		let nota;
		const f = fase();
		if (cxSol.checked())
			nota = [['máx. 9, mín. −5:   a = (9 − (−5)) / 2 = 7,   k = (9 + (−5)) / 2 = 2', COR.ref, p.BOLD]];
		else if (f) nota = [[f[0], f[1], p.BOLD]];
		else if (a === ALVO.a && k === ALVO.k)
			nota = [['✓ A curva coincide com o gráfico da figura.', COR.k, p.BOLD]];
		else if (a === -ALVO.a && k === ALVO.k)
			nota = [['Máximo e mínimo certos, mas a < 0: em x = 0° há um mínimo e não um máximo.', COR.a, p.BOLD]];
		else nota = [['Ajusta a e k até a curva azul coincidir com o gráfico da figura (a cinzento).', COR.cinza]];
		multicor(nota, x0, 82, 17);
	}
};
