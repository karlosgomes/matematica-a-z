/* =====================================================================
   Problema 12 — A esfera suspensa da mola
   Equilíbrio a 60 cm do teto, puxada 8 cm para baixo e largada em t = 0,
   3 oscilações em 2 s (T = 2/3 s, ω = 3π):  d(t) = 60 + 8 cos(3πt)
   À esquerda a mola (escala real), à direita o gráfico de d com o eixo d PARA BAIXO,
   a partir do teto, e a MESMA escala vertical: a esfera liga-se ao gráfico por uma
   linha horizontal. Os botões 12.1 … 12.3 preparam a figura para cada alínea.
   ===================================================================== */
SKETCHES['trig-p12'] = function (p, controlos) {
	const W = 940, H = 560;
	const S = 6.8, TY = 52;                       // px por cm; y do teto (d = 0)
	const MOLA = { cx: 110, r: 20 };              // eixo da mola; raio da esfera (px)
	const GR = { x0: 300, x1: 905, tmax: 2 };     // gráfico de 0 a 2 s (três oscilações)
	const COR = {
		mola: [71, 85, 105], esfera: [194, 65, 12], d: [234, 88, 12], curva: [29, 78, 216],
		aux: [5, 150, 105], texto: [30, 41, 59], cinza: [100, 116, 139], grelha: [226, 232, 240], teto: [203, 213, 225]
	};
	const d = t => 60 + 8 * Math.cos(3 * Math.PI * t);
	const Y = cm => TY + cm * S;                  // distância ao teto (cm) → ecrã
	const GX = t => p.map(t, 0, GR.tmax, GR.x0, GR.x1);
	const FR = { 1: '1/9', 3: '1/3', 5: '5/9', 6: '2/3', 7: '7/9', 9: '1', 12: '4/3', 15: '5/3', 18: '2' };   // t = n/9

	let t = 0, aAnimar = false, alinea = 0;
	let sl, btPlay, cxLenta, cxCalc, itens = [];

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');
		sl = UT.slider(p, controlos, 't (s)', 0, GR.tmax, t, 0.001);
		sl.input(() => { parar(); t = sl.value(); });
		btPlay = UT.botao(p, controlos, '▶ Largar', () => {
			if (!aAnimar && t >= GR.tmax) definir(0);
			aAnimar ? parar() : (aAnimar = true, btPlay.html('⏸ Pausa'));
		});
		cxLenta = UT.caixa(p, controlos, 'Câmara lenta (¼×)', true);
		UT.quebra(p, controlos);
		[[1, 0], [2, 1 / 3], [3, 5 / 9]].forEach(([a, ti]) =>
			UT.botao(p, controlos, `12.${a}`, () => { parar(); escolher(alinea === a ? 0 : a); if (alinea) definir(ti); }, 'atalho'));
		cxCalc = UT.caixa(p, controlos, 'Mostrar cálculos');
		itens = [...controlos.closest('section').querySelectorAll('ul.condicoes li')];
	};

	function parar() { aAnimar = false; btPlay.html('▶ Largar'); }
	function definir(v) { t = p.constrain(v, 0, GR.tmax); sl.value(t); }
	function escolher(a) {
		alinea = a;
		itens.forEach((li, i) => { li.classList.toggle('atual', a === i + 1); li.classList.toggle('outra', a !== 0 && a !== i + 1); });
	}

	p.draw = function () {
		if (aAnimar) {
			definir(t + (cxLenta.checked() ? 0.25 : 1) * p.deltaTime / 1000);
			if (t >= GR.tmax) parar();
		}
		p.background(255);
		grafico();
		mola();
		ligacao();
		textos();
	};

	/* ---------------- utilitários ---------------- */
	function rot(txt, x, y, cor = COR.texto, tam = 20, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(5); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo); p.textAlign(ah, p.CENTER); p.text(txt, x, y);
	}
	function tracejado(x0, y0, x1, y1, cor, peso = 1.5, dd = [6, 5]) {
		p.stroke(...cor); p.strokeWeight(peso); p.drawingContext.setLineDash(dd);
		p.line(x0, y0, x1, y1); p.drawingContext.setLineDash([]);
	}
	function seta(x, y0, y1, cor) {               // seta vertical de duas pontas
		p.stroke(...cor); p.strokeWeight(2); p.line(x, y0, x, y1);
		p.noStroke(); p.fill(...cor);
		const s = Math.sign(y1 - y0) || 1;
		p.triangle(x, y0, x - 5, y0 + 10 * s, x + 5, y0 + 10 * s);
		p.triangle(x, y1, x - 5, y1 - 10 * s, x + 5, y1 - 10 * s);
	}

	/* ---------------- a mola e a esfera ---------------- */
	function mola() {
		const cx = MOLA.cx, yb = Y(d(t)), R = MOLA.r;
		// teto
		p.noStroke(); p.fill(...COR.teto); p.rect(20, TY - 14, 190, 14);
		p.stroke(...COR.texto); p.strokeWeight(2); p.line(20, TY, 210, TY);
		// linha de equilíbrio (continua no gráfico)
		tracejado(20, Y(60), GR.x0 - 30, Y(60), COR.cinza, 1.2);
		rot('equilíbrio', 20, Y(60) - 13, COR.cinza, 16, p.LEFT, p.NORMAL);
		// alíneas: posições extremas / 64 cm
		if (alinea === 2) { tracejado(20, Y(52), GR.x0 - 30, Y(52), COR.aux, 2); tracejado(20, Y(68), GR.x0 - 30, Y(68), COR.aux, 2); }
		if (alinea === 3) { tracejado(20, Y(64), GR.x0 - 30, Y(64), COR.aux, 2); rot('64', GR.x0 - 6, Y(64), COR.aux, 15, p.RIGHT); }
		// mola: espiras em zigue-zague do teto ao topo da esfera
		const y0 = TY, y1 = yb - R, n = 22, lg = 13;
		p.noFill(); p.stroke(...COR.mola); p.strokeWeight(2);
		p.beginShape();
		p.vertex(cx, y0); p.vertex(cx, y0 + 12);
		for (let i = 1; i < n; i++) p.vertex(cx + (i % 2 ? lg : -lg), p.lerp(y0 + 12, y1 - 10, i / n));
		p.vertex(cx, y1 - 10); p.vertex(cx, y1);
		p.endShape();
		// esfera
		p.noStroke(); p.fill(...COR.esfera); p.circle(cx, yb, 2 * R);
		p.fill(255, 255, 255, 90); p.circle(cx - R * 0.35, yb - R * 0.35, R * 0.7);
		p.fill(30); p.circle(cx, yb, 5);
		// a distância ao teto
		seta(cx + 52, TY, yb, COR.d);
		tracejado(cx + 4, yb, cx + 60, yb, COR.d, 1, [2, 3]);
		rot('d(t)', cx + 60, (TY + yb) / 2, COR.d, 20, p.LEFT);
	}

	/* ---------------- o gráfico de d (eixo para baixo) ---------------- */
	function grafico() {
		// grelha: só na zona onde a esfera anda (48 a 72 cm) e de 1/3 em 1/3 s
		for (let cm = 48; cm <= 72; cm += 4) { p.stroke(...COR.grelha); p.strokeWeight(1); p.line(GR.x0, Y(cm), GR.x1, Y(cm)); }
		for (let k = 1; k <= 6; k++) { p.stroke(...COR.grelha); p.line(GX(k / 3), Y(0), GX(k / 3), Y(72)); }
		// eixos: t ao nível do teto, d para baixo
		p.stroke(...COR.texto); p.strokeWeight(1.5);
		p.line(GR.x0, TY, GR.x1 + 12, TY); p.line(GR.x0, TY, GR.x0, Y(73));
		p.noStroke(); p.fill(...COR.texto);
		p.triangle(GR.x1 + 14, TY, GR.x1 + 4, TY - 5, GR.x1 + 4, TY + 5);
		p.triangle(GR.x0, Y(73) + 6, GR.x0 - 5, Y(73) - 4, GR.x0 + 5, Y(73) - 4);
		p.textSize(15); p.textStyle(p.NORMAL); p.textAlign(p.CENTER, p.BOTTOM);
		for (let k = 0; k <= 6; k++) p.text(k === 0 ? '0' : FR[3 * k], GX(k / 3), TY - 4);
		p.textAlign(p.RIGHT, p.CENTER);
		for (const cm of [10, 20, 30, 40, 52, 60, 68]) p.text(cm, GR.x0 - 6, Y(cm));
		rot('t (s)', GR.x1 + 10, TY - 30, COR.texto, 17, p.RIGHT, p.NORMAL);
		rot('d (cm)', GR.x0 - 12, Y(73) + 2, COR.texto, 17, p.RIGHT, p.NORMAL);
		tracejado(GR.x0, Y(60), GR.x1, Y(60), COR.cinza, 1.2);

		// alínea 2: faixa [52, 68] e o primeiro mínimo de d
		if (alinea === 2) {
			p.noStroke(); p.fill(...COR.aux, 28); p.rect(GR.x0, Y(52), GR.x1 - GR.x0, Y(68) - Y(52));
			rot('máx. 68', GR.x1 - 4, Y(68) + 14, COR.aux, 17, p.RIGHT); rot('mín. 52', GR.x1 - 4, Y(52) - 14, COR.aux, 17, p.RIGHT);
		}
		// alínea 3: d > 64 em [0, 1]
		if (alinea === 3) {
			tracejado(GR.x0, Y(64), GR.x1, Y(64), COR.aux, 2);
			p.noStroke(); p.fill(...COR.aux, 35);
			p.rect(GX(0), Y(64), GX(1 / 9) - GX(0), Y(72) - Y(64));
			p.rect(GX(5 / 9), Y(64), GX(7 / 9) - GX(5 / 9), Y(72) - Y(64));
			p.fill(...COR.cinza, 25); p.rect(GX(1), Y(0) + 1, GX(GR.tmax) - GX(1), Y(73) - Y(0));   // fora de [0, 1]
			for (const n of [1, 5, 7]) {
				p.noStroke(); p.fill(...COR.aux); p.circle(GX(n / 9), Y(64), 9);
				tracejado(GX(n / 9), Y(64), GX(n / 9), TY, COR.aux, 1.2, [3, 4]);
				rot(FR[n], GX(n / 9), TY + 14, COR.aux, 16, p.CENTER);
			}
			p.stroke(...COR.aux); p.strokeWeight(5);
			p.line(GX(0), TY, GX(1 / 9), TY); p.line(GX(5 / 9), TY, GX(7 / 9), TY);
		}
		// curva: toda esbatida e, até ao instante t, a cheio
		p.noFill(); p.strokeWeight(2); p.stroke(...COR.curva, 70);
		p.beginShape(); for (let ti = 0; ti <= GR.tmax; ti += 0.004) p.vertex(GX(ti), Y(d(ti))); p.endShape();
		p.strokeWeight(3.5); p.stroke(...COR.curva);
		p.beginShape(); for (let ti = 0; ti < t; ti += 0.004) p.vertex(GX(ti), Y(d(ti))); p.vertex(GX(t), Y(d(t))); p.endShape();

		const marca = (ti, txt, acima) => {
			p.noStroke(); p.fill(...COR.esfera); p.circle(GX(ti), Y(d(ti)), 11);
			rot(txt, GX(ti), Y(d(ti)) + (acima ? -18 : 18), COR.esfera, 17, p.CENTER, p.NORMAL);
		};
		if (alinea === 1) {
			p.noStroke(); p.fill(...COR.esfera); p.circle(GX(0), Y(68), 11);
			rot('(0, 68)', GX(0) + 12, Y(68) + 14, COR.esfera, 17, p.LEFT, p.NORMAL);
			// um período: de 0 a 2/3
			const yy = Y(46);
			p.stroke(...COR.aux); p.strokeWeight(2); p.line(GX(0), yy, GX(2 / 3), yy);
			p.line(GX(0), yy - 6, GX(0), yy + 6); p.line(GX(2 / 3), yy - 6, GX(2 / 3), yy + 6);
			rot('T = 2/3 s', GX(1 / 3), yy - 12, COR.aux, 16, p.CENTER);
			rot('3 oscilações em 2 s', GX(5 / 3), yy - 12, COR.aux, 16, p.CENTER, p.NORMAL);
		}
		if (alinea === 2) { marca(1 / 3, 't = 1/3', true); marca(1, 't = 1', true); }
	}

	/* ---------------- da esfera ao gráfico ---------------- */
	function ligacao() {
		const yb = Y(d(t)), gx = GX(t);
		tracejado(MOLA.cx + MOLA.r, yb, gx, yb, COR.d, 1.5);
		tracejado(gx, yb, gx, TY, COR.d, 1.2, [3, 4]);
		p.noStroke(); p.fill(...COR.d); p.circle(gx, yb, 12);
	}

	/* ---------------- leituras e cálculos ---------------- */
	function textos() {
		const linha = (txt, y, cor = COR.texto, tam = 19, est = p.NORMAL) => {
			rot(txt, GR.x0 + 24, y, cor, tam, p.LEFT, est);
		};
		linha(`t = ${UT.fmt(t, 2)} s      d(t) = ${UT.fmt(d(t), 1)} cm`, Y(10), COR.d, 21, p.BOLD);
		if (!cxCalc.checked() || !alinea) return;
		const C = {
			1: ['3 oscilações em 2 s  ⇒  T = 2/3 s  ⇒  ω = 2π/T = 3π',
				'Em t = 0 está no ponto mais baixo: d(0) = 60 + 8 = 68 = 60 + 8 cos 0',
				'Logo  d(t) = 60 + 8 cos(3πt).'],
			2: ['−1 ≤ cos(3πt) ≤ 1  ⇒  52 ≤ d(t) ≤ 68: máximo 68 cm, mínimo 52 cm.',
				'd(t) = 52 ⇔ cos(3πt) = −1 ⇔ 3πt = π + 2kπ ⇔ t = 1/3 + 2k/3',
				'Mais perto do teto, pela primeira vez, em t = 1/3 s (meio período).'],
			3: ['d(t) > 64 ⇔ cos(3πt) > 1/2, com 3πt ∈ [0, 3π]',
				'⇔ 3πt ∈ [0, π/3[ ∪ ]5π/3, 7π/3[ ⇔ t ∈ [0, 1/9[ ∪ ]5/9, 7/9[',
				'Tempo: 1/9 + 2/9 = 1/3 s.']
		}[alinea];
		C.forEach((txt, i) => linha(txt, Y(16) + i * 26, i === 2 ? COR.aux : COR.texto, 18, i === 2 ? p.BOLD : p.NORMAL));
	}
};
