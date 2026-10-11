/* =====================================================================
   Problema 9 — O limite de sin θ / θ (teorema das funções enquadradas)
   E = (0, 0), N = (1, 0), P = (cos θ, sin θ), T = (cos θ, 0), D = (1, tan θ)
   [PET] ⊂ setor PEN ⊂ [DEN]:  ½ sin θ cos θ < θ/2 < ½ tan θ
   ⇒ cos θ < θ / sin θ < 1 / cos θ  ⇒  sin θ / θ → 1 quando θ → 0
   ===================================================================== */
SKETCHES['trig-p9'] = function (p, controlos) {
	const W = 940, H = 560;
	const FIG = { x0: 0, x1: 545, y0: 100, y1: H };                     // zona da figura
	const BAR = { x0: 600, x1: 915, y0: 118, y1: 262 };                // barras das áreas
	const GR = { x0: 610, x1: 915, y0: 515, y1: 312, tmax: 1, ymin: 0.4, ymax: 2 };

	const COR = {
		pet: [220, 38, 38], set: [124, 58, 237], den: [5, 150, 105], razao: [29, 78, 216],
		circ: [30, 41, 59], eixo: [100, 116, 139], texto: [30, 41, 59], cinza: [100, 116, 139]
	};

	let teta = 0.7, aAnimar = false;
	let sl, btPlay, cxAreas, cxComp, cxZoom, cxRazao;

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');

		sl = UT.slider(p, controlos, 'θ (rad)', 0.005, 1, teta, 0.001);
		sl.input(() => { parar(); teta = sl.value(); });
		btPlay = UT.botao(p, controlos, '▶ θ → 0', () => {
			if (aAnimar) { parar(); return; }
			if (teta < 0.01) definir(0.7);
			aAnimar = true; btPlay.html('⏸ Pausa');
		});
		[['θ = 1', 1], ['θ = 0,5', 0.5], ['θ = 0,1', 0.1], ['θ = 0,01', 0.01]]
			.forEach(([t, v]) => UT.botao(p, controlos, t, () => { parar(); definir(v); }, 'atalho'));
		UT.quebra(p, controlos);
		cxAreas = UT.caixa(p, controlos, 'Áreas', true);
		cxComp = UT.caixa(p, controlos, 'Comprimentos sin θ, θ, tan θ');
		cxZoom = UT.caixa(p, controlos, 'Ampliar junto de N');
		cxRazao = UT.caixa(p, controlos, 'sin θ / θ');
	};

	function parar() { aAnimar = false; btPlay.html('▶ θ → 0'); }
	function definir(t) { teta = p.constrain(t, 0.005, 1); sl.value(teta); }

	p.draw = function () {
		if (aAnimar) {
			definir(teta * Math.exp(-0.45 * p.deltaTime / 1000));
			if (teta <= 0.0051) parar();
		}
		p.background(255);
		figura();
		barras();
		grafico();
		leitura();
	};

	/* ---------------- utilitários ---------------- */
	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	function multicor(partes, x, y, tam) {
		p.noStroke(); p.textSize(tam); p.textAlign(p.LEFT, p.CENTER);
		for (const [t, cor, est] of partes) {
			p.textStyle(est || p.NORMAL); p.fill(...cor); p.text(t, x, y); x += p.textWidth(t);
		}
		return x;
	}
	const f4 = x => UT.fmt(x, 4);

	/* ---------------- figura ---------------- */
	function figura() {
		const c = Math.cos(teta), s = Math.sin(teta), tg = Math.tan(teta);
		const zoom = cxZoom.checked();
		// escala (px por unidade) e posição de N no ecrã
		const k = zoom ? 330 / tg : 240;
		const N = zoom ? { x: 420, y: 525 } : { x: 70 + k, y: 525 };
		const X = x => N.x + (x - 1) * k;
		const Y = y => N.y - y * k;
		const E = { x: X(0), y: Y(0) };

		p.drawingContext.save(); p.drawingContext.beginPath();
		p.drawingContext.rect(FIG.x0, FIG.y0, FIG.x1 - FIG.x0, FIG.y1 - FIG.y0); p.drawingContext.clip();

		// eixos
		p.stroke(...COR.eixo); p.strokeWeight(1.5);
		p.line(FIG.x0, E.y, FIG.x1 - 5, E.y);
		if (E.x > FIG.x0) p.line(E.x, FIG.y1, E.x, FIG.y0);

		// regiões: [DEN] ⊃ setor PEN ⊃ [PET]
		const area = cxAreas.checked();
		p.strokeWeight(2.5);
		p.stroke(...COR.den); p.fill(...COR.den, area ? 45 : 0);
		p.triangle(E.x, E.y, X(1), Y(0), X(1), Y(tg));
		p.stroke(...COR.set); p.fill(...COR.set, area ? 55 : 0);
		p.arc(E.x, E.y, 2 * k, 2 * k, -teta, 0, p.PIE);
		p.stroke(...COR.pet); p.fill(...COR.pet, area ? 70 : 0);
		p.triangle(E.x, E.y, X(c), Y(0), X(c), Y(s));

		// quarto de circunferência
		p.noFill(); p.stroke(...COR.circ); p.strokeWeight(2);
		p.arc(E.x, E.y, 2 * k, 2 * k, -Math.PI / 2 - 0.05, 0);

		// semirreta EP até D e tangente em N
		p.stroke(...COR.circ); p.strokeWeight(2);
		p.line(E.x, E.y, X(1), Y(tg));
		p.line(X(1), Y(0), X(1), Math.min(Y(tg), FIG.y0));

		// ângulo reto em T
		if (Math.abs(X(c) - X(1)) > 14) {
			p.stroke(80); p.strokeWeight(1.2); p.noFill();
			p.rect(X(c) - 11, Y(0) - 11, 11, 11);
		}

		// comprimentos sin θ, θ (arco) e tan θ
		if (cxComp.checked()) {
			p.strokeWeight(6); p.strokeCap(p.SQUARE);
			p.stroke(...COR.pet); p.line(X(c), Y(0), X(c), Y(s));
			p.stroke(...COR.den); p.line(X(1), Y(0), X(1), Y(tg));
			p.noFill(); p.stroke(...COR.set); p.arc(E.x, E.y, 2 * k, 2 * k, -teta, 0);
			p.strokeCap(p.ROUND);
			const ym = Y(s / 2);
			rot('sin θ', X(c) - 12, ym, COR.pet, 19, p.RIGHT);
			rot('tan θ', X(1) + 12, Y(tg / 2), COR.den, 19, p.LEFT);
			if (zoom) rot('θ', X(1) + 12, Y(tg / 2) + 26, COR.set, 19, p.LEFT);
			else rot('θ', E.x + (k + 22) * Math.cos(teta / 2), E.y - (k + 22) * Math.sin(teta / 2), COR.set, 19);
		}

		// ângulo θ em E
		if (E.x > FIG.x0) {
			p.noFill(); p.stroke(...COR.circ); p.strokeWeight(1.5);
			p.arc(E.x, E.y, 90, 90, -teta, 0);
			rot('θ', E.x + 60 * Math.cos(teta / 2), E.y - 60 * Math.sin(teta / 2) - (teta < 0.25 ? 10 : 0), COR.circ, 20);
		}

		// pontos
		p.noStroke(); p.fill(...COR.circ);
		[[0, 0], [1, 0], [c, 0], [c, s], [1, tg]].forEach(([x, y]) => p.circle(X(x), Y(y), 9));
		rot('E', E.x - 14, E.y + 18, COR.circ, 20);
		rot('N', X(1) + 14, Y(0) + 18, COR.circ, 20);
		rot('T', X(c) - (zoom ? 0 : 2), Y(0) + 20, COR.circ, 20, zoom ? p.RIGHT : p.CENTER);
		rot('P', X(c) - 8, Y(s) - 18, COR.circ, 20, p.RIGHT);
		rot('D', X(1) + 10, Y(tg) - 14, COR.circ, 20, p.LEFT);
		p.drawingContext.restore();

		if (zoom) rot(`ampliação ×${UT.fmt(k / 240, k / 240 < 10 ? 1 : 0)}`, FIG.x1 - 10, FIG.y0 + 14, COR.cinza, 16, p.RIGHT, p.NORMAL);
	}

	/* ---------------- barras com as três áreas ---------------- */
	function barras() {
		const c = Math.cos(teta), s = Math.sin(teta), tg = Math.tan(teta);
		const v = [
			['[PET]', s * c / 2, COR.pet],
			['setor PEN', teta / 2, COR.set],
			['[DEN]', tg / 2, COR.den]
		];
		const vmax = v[2][1] * 1.08;                                  // escala relativa ao maior
		const h = (BAR.y1 - BAR.y0) / 3;
		rot('Áreas (escala relativa à maior)', BAR.x0, BAR.y0 - 12, COR.cinza, 15, p.LEFT, p.NORMAL);
		v.forEach(([nome, a, cor], i) => {
			const y = BAR.y0 + i * h + 6;
			const x0 = BAR.x0 + 78;
			p.noStroke(); p.fill(...cor, 170);
			p.rect(x0, y, (BAR.x1 - x0 - 70) * a / vmax, h - 14, 3);
			rot(nome, x0 - 6, y + (h - 14) / 2, cor, 16, p.RIGHT);
			rot(f4(a), x0 + (BAR.x1 - x0 - 70) * a / vmax + 6, y + (h - 14) / 2, cor, 15, p.LEFT, p.NORMAL);
		});
	}

	/* ---------------- gráfico de cos θ < θ/sin θ < 1/cos θ ---------------- */
	function grafico() {
		const GX = t => p.map(t, 0, GR.tmax, GR.x0, GR.x1);
		const GY = y => p.map(y, GR.ymin, GR.ymax, GR.y0, GR.y1);

		p.textStyle(p.NORMAL); p.textSize(14);
		for (let t = 0; t <= GR.tmax + 1e-9; t += 0.25) {
			p.stroke(232); p.strokeWeight(1); p.line(GX(t), GR.y0, GX(t), GR.y1);
			p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP); p.text(UT.fmt(t, 2).replace(/,?0+$/, ''), GX(t), GR.y0 + 6);
		}
		for (let y = 0.5; y <= GR.ymax + 1e-9; y += 0.5) {
			p.stroke(y === 1 ? 200 : 232); p.strokeWeight(1); p.line(GX(0), GY(y), GX(GR.tmax), GY(y));
			p.noStroke(); p.fill(90); p.textAlign(p.RIGHT, p.CENTER); p.text(UT.fmt(y, 1), GX(0) - 6, GY(y));
		}
		p.stroke(80); p.strokeWeight(1.5);
		p.line(GX(0), GR.y0, GX(GR.tmax) + 8, GR.y0);
		p.line(GX(0), GR.y0, GX(0), GR.y1 - 8);
		rot('θ', GX(GR.tmax) + 2, GR.y0 + 32, COR.texto, 17, p.RIGHT, p.ITALIC);

		const fs = [
			[t => Math.cos(t), COR.pet, 'cos θ'],
			[t => t / Math.sin(t), COR.set, 'θ / sin θ'],
			[t => 1 / Math.cos(t), COR.den, '1 / cos θ']
		];
		if (cxRazao.checked()) fs.push([t => Math.sin(t) / t, COR.razao, 'sin θ / θ']);

		p.drawingContext.save(); p.drawingContext.beginPath();
		p.drawingContext.rect(GR.x0, GR.y1 - 4, GR.x1 - GR.x0 + 4, GR.y0 - GR.y1 + 8); p.drawingContext.clip();
		fs.forEach(([f, cor], i) => {
			p.noFill(); p.stroke(...cor); p.strokeWeight(i === 3 ? 2.5 : 3);
			if (i === 3) p.drawingContext.setLineDash([7, 5]);
			p.beginShape();
			for (let t = 0.002; t <= GR.tmax; t += 0.005) p.vertex(GX(t), GY(f(t)));
			p.endShape();
			p.drawingContext.setLineDash([]);
		});
		p.drawingContext.restore();

		// rótulos no fim das curvas
		fs.forEach(([f, cor, nome], i) => {
			const y = GY(f(GR.tmax)) + (i === 3 ? 14 : 0);
			if (y > GR.y1 - 10) rot(nome, GX(GR.tmax) - 14, y - 14, cor, 15, p.RIGHT);
		});

		// ponto (0, 1) para onde convergem
		p.stroke(...COR.texto); p.strokeWeight(2); p.fill(255); p.circle(GX(0), GY(1), 11);

		// valores no θ atual
		p.stroke(150); p.strokeWeight(1); p.drawingContext.setLineDash([5, 4]);
		p.line(GX(teta), GR.y0, GX(teta), GR.y1); p.drawingContext.setLineDash([]);
		fs.forEach(([f, cor]) => { p.noStroke(); p.fill(...cor); p.circle(GX(teta), GY(f(teta)), 11); });
	}

	/* ---------------- leitura (topo) ---------------- */
	function leitura() {
		const c = Math.cos(teta), s = Math.sin(teta), tg = Math.tan(teta);
		const x0 = 16;
		multicor([[`θ = ${UT.fmt(teta, 3)} rad  (${UT.fmt(teta * 180 / Math.PI, 2)}°)`, COR.texto, p.BOLD]], x0, 20, 21);
		multicor([['½ sin θ cos θ = ', COR.pet], [f4(s * c / 2), COR.pet, p.BOLD], ['   <   θ / 2 = ', COR.set],
			[f4(teta / 2), COR.set, p.BOLD], ['   <   ½ tan θ = ', COR.den], [f4(tg / 2), COR.den, p.BOLD]], x0, 50, 18);
		multicor([['cos θ = ', COR.pet], [f4(c), COR.pet, p.BOLD], ['   <   θ / sin θ = ', COR.set],
			[f4(teta / s), COR.set, p.BOLD], ['   <   1 / cos θ = ', COR.den], [f4(1 / c), COR.den, p.BOLD]], x0, 78, 18);
		if (cxRazao.checked())
			multicor([['sin θ / θ = ', COR.razao], [UT.fmt(s / teta, 6), COR.razao, p.BOLD]], 640, 20, 18);
	}
};
