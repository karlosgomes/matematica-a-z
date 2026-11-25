/* =====================================================================
   Problema 17 — A agulha da máquina de costura
   (problema 37 de ~/MAT_A_26_27/trigonometria/fichas/trig-osciladores-harmonicos.tex)
   600 subidas e descidas por minuto: T = 0,1 s, ω = 20π rad/s;  h(t) = 12 + 15 cos(20πt) (mm, em relação à base).
   Máxima 27 mm, mínima −3 mm (a ponta passa 3 mm abaixo da base, por um orifício).
   Tecido de 3 mm: h(t) = 3 ⇔ cos(20πt) = −0,6 ⇒ t₁ ≈ 0,035 s, t₂ ≈ 0,065 s; h < 3 durante ≈ 0,0295 s em cada 0,1 s (≈ 30 %).
   900 pontos/min: h(t) = 12 + 15 cos(30πt) — a percentagem mantém-se.
   À esquerda a agulha (escala real em mm), à direita o gráfico de h com a MESMA escala vertical (como nos problemas 11 e 15).
   Padrão do Problema 15: animação escondida ao abrir, botões 17.1–17.4 que destacam a alínea, respostas só com «Mostrar a solução».
   ===================================================================== */
SKETCHES['trig-p17'] = function (p, controlos) {
	const W = 940, H = 560;
	const S = 13, GY = 470;                            // px por mm; y da base (h = 0)
	const AG = 215;                                  // x da agulha
	const GR = { x0: 500, x1: 905, tmax: 0.2 };      // gráfico: dois ciclos
	const COR = {
		agulha: [71, 85, 105], ponta: [219, 39, 119], h: [234, 88, 12], curva: [29, 78, 216], nova: [124, 58, 237],
		aux: [5, 150, 105], tecido: [251, 191, 36], base: [148, 163, 184], texto: [30, 41, 59], cinza: [100, 116, 139], grelha: [226, 232, 240]
	};
	const h = (t, w = 20 * Math.PI) => 12 + 15 * Math.cos(w * t);
	const Y = m => GY - m * S;
	const GX = t => p.map(t, 0, GR.tmax, GR.x0, GR.x1);
	const AL = Math.acos(-0.6);                       // ≈ 2,2143
	const T1 = AL / (20 * Math.PI), T2 = (2 * Math.PI - AL) / (20 * Math.PI);   // ≈ 0,0352 e ≈ 0,0648

	let t = 0, aAnimar = false, al = 0;
	let sl, btPlay, cxSol, itens = [];
	const botoes = {};

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');
		sl = UT.slider(p, controlos, 't (s)', 0, GR.tmax, t, 0.0005);
		sl.input(() => { parar(); t = sl.value(); });
		btPlay = UT.botao(p, controlos, '▶ Coser (câmara lenta)', () => {
			if (!aAnimar && t >= GR.tmax) definir(0);
			aAnimar ? parar() : (aAnimar = true, btPlay.html('⏸ Pausa'));
		});
		UT.quebra(p, controlos);
		[[1, 0], [2, 0.05], [3, (T1 + T2) / 2], [4, 0]].forEach(([a, ti]) => {
			botoes[a] = UT.botao(p, controlos, `17.${a}`, () => { parar(); escolher(al === a ? 0 : a); if (al) definir(ti); }, 'atalho');
		});
		UT.quebra(p, controlos);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		itens = [...controlos.closest('section').querySelectorAll('ul.condicoes li')];
		escolher(0);
	};

	function parar() { aAnimar = false; btPlay.html('▶ Coser (câmara lenta)'); }
	function definir(v) { t = p.constrain(v, 0, GR.tmax); sl.value(t); }
	function escolher(a) {
		al = a;
		Object.entries(botoes).forEach(([k, b]) => +k === al ? b.removeClass('atalho') : b.addClass('atalho'));
		itens.forEach((li, i) => { li.classList.toggle('atual', al === i + 1); li.classList.toggle('outra', al !== 0 && al !== i + 1); });
	}

	p.draw = function () {
		if (aAnimar) { definir(t + 0.004 * p.deltaTime / 1000 * 5); if (t >= GR.tmax) parar(); }   // 1/50 da velocidade real
		p.background(255);
		grafico();
		maquina();
		ligacao();
		textos();
	};

	function rot(txt, x, y, cor = COR.texto, tam = 18, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(5); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo); p.textAlign(ah, p.CENTER); p.text(txt, x, y);
	}
	function tracejado(x0, y0, x1, y1, cor, peso = 1.5, d = [6, 5]) {
		p.stroke(...cor); p.strokeWeight(peso); p.drawingContext.setLineDash(d);
		p.line(x0, y0, x1, y1); p.drawingContext.setLineDash([]);
	}
	function seta(x0, y0, x1, y1, cor, peso = 2) {
		p.stroke(...cor); p.strokeWeight(peso); p.line(x0, y0, x1, y1);
		const a = Math.atan2(y1 - y0, x1 - x0);
		p.noStroke(); p.fill(...cor);
		p.triangle(x1, y1, x1 - 10 * Math.cos(a - 0.4), y1 - 10 * Math.sin(a - 0.4), x1 - 10 * Math.cos(a + 0.4), y1 - 10 * Math.sin(a + 0.4));
	}

	/* ---------------- a máquina: base com orifício, tecido e agulha ---------------- */
	function maquina() {
		const hh = h(t);
		// linhas de referência por alínea
		if (al === 2) for (const m of [27, -3]) tracejado(20, Y(m), 470, Y(m), COR.aux, 1.5);
		if (al === 3) tracejado(20, Y(3), 470, Y(3), COR.aux, 2);
		// base (placa com um orifício por baixo da agulha)
		p.noStroke(); p.fill(...COR.base);
		p.rect(30, GY, AG - 12 - 30, 5 * S); p.rect(AG + 12, GY, 440 - AG - 12, 5 * S);
		p.fill(...COR.base, 70); p.rect(AG - 12, GY, 24, 5 * S);
		p.noStroke(); p.fill(255); p.textSize(15); p.textStyle(p.BOLD); p.textAlign(p.LEFT, p.CENTER); p.text('base', 44, GY + 2.5 * S);
		// tecido (3 mm)
		p.fill(...COR.tecido, al === 3 ? 230 : 170); p.rect(40, Y(3), 390, 3 * S);
		rot('tecido (3 mm)', 340, Y(1.5), COR.texto, 14, p.CENTER, p.NORMAL);
		// barra da agulha e agulha (a ponta está à altura h)
		p.fill(...COR.agulha); p.rect(AG - 9, 0, 18, Y(hh + 6));
		p.fill(...COR.agulha); p.triangle(AG - 4, Y(hh + 6), AG + 4, Y(hh + 6), AG, Y(hh));
		p.stroke(...COR.agulha); p.strokeWeight(4); p.line(AG, Y(hh + 6), AG, Y(hh + 0.6));
		// h(t): da base até à ponta
		if (Math.abs(hh) > 0.6) seta(AG + 34, Y(0), AG + 34, Y(hh), COR.h, 3);
		rot('h(t)', AG + 42, Y(hh / 2), COR.h, 19, p.LEFT);
		p.noStroke(); p.fill(...COR.ponta); p.circle(AG, Y(hh), 10);
		if (al === 2 && cxSol.checked()) {
			rot('máx: 12 + 15 = 27 mm', 40, Y(27) - 14, COR.aux, 16, p.LEFT);
			rot('mín: 12 − 15 = −3 mm (3 mm abaixo da base)', 30, GY + 5 * S + 12, COR.aux, 15, p.LEFT);
		}
		if (al === 3) rot(hh < 3 ? 'ponta dentro do tecido / abaixo dele' : 'ponta acima do tecido', AG, Y(29.5), hh < 3 ? COR.ponta : COR.cinza, 16);
	}

	/* ---------------- o gráfico de h ---------------- */
	function grafico() {
		for (let m = -3; m <= 27; m += 3) { p.stroke(...COR.grelha); p.strokeWeight(1); p.line(GR.x0, Y(m), GR.x1, Y(m)); }
		for (let ti = 0.025; ti <= GR.tmax + 1e-9; ti += 0.025) { p.stroke(...COR.grelha); p.line(GX(ti), Y(-3.5), GX(ti), Y(28)); }
		p.stroke(...COR.texto); p.strokeWeight(1.5);
		p.line(GR.x0, GY, GR.x1 + 12, GY); p.line(GR.x0, Y(-4), GR.x0, Y(29));
		p.noStroke(); p.fill(...COR.texto); p.textSize(14); p.textStyle(p.NORMAL);
		p.textAlign(p.CENTER, p.TOP);
		for (let ti = 0.05; ti <= GR.tmax + 1e-9; ti += 0.05) p.text(UT.fmt(ti, 2), GX(ti), GY + 5);
		p.textAlign(p.RIGHT, p.CENTER);
		for (const m of [-3, 3, 12, 27]) p.text(m, GR.x0 - 6, Y(m));
		rot('t (s)', GR.x1 + 14, GY - 16, COR.texto, 16, p.RIGHT, p.NORMAL);
		rot('h (mm)', GR.x0 + 8, Y(29.5), COR.texto, 16, p.LEFT, p.NORMAL);

		// 17.3: h = 3 e os intervalos em que h < 3
		if (al === 3) {
			for (const k of [0, 1]) { p.noStroke(); p.fill(...COR.ponta, 30); p.rect(GX(T1 + 0.1 * k), Y(28), GX(T2) - GX(T1), Y(-3.5) - Y(28)); }
			tracejado(GR.x0, Y(3), GR.x1, Y(3), COR.aux, 2);
			rot('h = 3', GR.x1 - 2, Y(3) - 13, COR.aux, 15, p.RIGHT);
		}
		// 17.2: máximo e mínimo
		if (al === 2) {
			tracejado(GR.x0, Y(27), GR.x1, Y(27), COR.aux, 1.5); tracejado(GR.x0, Y(-3), GR.x1, Y(-3), COR.aux, 1.5);
			tracejado(GR.x0, Y(12), GR.x1, Y(12), COR.cinza, 1.2, [3, 4]);
		}
		// 17.4: com 900 pontos por minuto (ω = 30π), a tracejado
		if (al === 4) {
			p.noFill(); p.stroke(...COR.nova); p.strokeWeight(2.5); p.drawingContext.setLineDash([7, 5]);
			p.beginShape(); for (let ti = 0; ti <= GR.tmax; ti += 0.0005) p.vertex(GX(ti), Y(h(ti, 30 * Math.PI))); p.endShape();
			p.drawingContext.setLineDash([]);
			rot('900 pontos/min', GX(0.2) - 4, Y(27) - 14, COR.nova, 15, p.RIGHT);
			if (cxSol.checked()) {
				const a1 = AL / (30 * Math.PI), a2 = (2 * Math.PI - AL) / (30 * Math.PI);
				for (const k of [0, 1, 2]) { p.noStroke(); p.fill(...COR.nova, 28); if (a1 + k / 15 < GR.tmax) p.rect(GX(a1 + k / 15), Y(1), GX(Math.min(a2 + k / 15, GR.tmax)) - GX(a1 + k / 15), Y(-3.5) - Y(1)); }
				for (const k of [0, 1]) { p.noStroke(); p.fill(...COR.curva, 28); p.rect(GX(T1 + 0.1 * k), Y(5), GX(T2) - GX(T1), Y(1) - Y(5)); }
				tracejado(GR.x0, Y(3), GR.x1, Y(3), COR.aux, 1.5);
			}
		}
		// curva: toda esbatida e, até ao instante t, a cheio
		p.noFill(); p.strokeWeight(2); p.stroke(...COR.curva, 70);
		p.beginShape(); for (let ti = 0; ti <= GR.tmax; ti += 0.0005) p.vertex(GX(ti), Y(h(ti))); p.endShape();
		p.strokeWeight(3.5); p.stroke(...COR.curva);
		p.beginShape(); for (let ti = 0; ti < t; ti += 0.0005) p.vertex(GX(ti), Y(h(ti))); p.vertex(GX(t), Y(h(t))); p.endShape();

		// 17.1: um ciclo = um período
		if (al === 1) {
			const yy = Y(27) - 14;
			seta(GX(0) + 3, yy, GX(0.1) - 2, yy, COR.aux, 2); seta(GX(0.1) + 3, yy, GX(0.2) - 2, yy, COR.aux, 2);
			for (const ti of [0, 0.1, 0.2]) { p.noStroke(); p.fill(...COR.ponta); p.circle(GX(ti), Y(27), 10); }
			rot(cxSol.checked() ? 'T = 0,1 s' : 'um ciclo', GX(0.05), yy - 14, COR.aux, 16);
			rot(cxSol.checked() ? 'T = 0,1 s' : 'um ciclo', GX(0.15), yy - 14, COR.aux, 16);
		}
		// 17.3: t₁ e t₂ (com a solução)
		if (al === 3 && cxSol.checked()) {
			for (const ti of [T1, T2]) { p.noStroke(); p.fill(...COR.aux); p.circle(GX(ti), Y(3), 9); tracejado(GX(ti), Y(3), GX(ti), GY, COR.aux, 1.2, [3, 4]); }
			rot(`t₁ ≈ ${UT.fmt(T1, 3)}`, GX(T1) - 4, GY + 30, COR.aux, 14, p.RIGHT, p.NORMAL);
			rot(`t₂ ≈ ${UT.fmt(T2, 3)}`, GX(T2) + 4, GY + 30, COR.aux, 14, p.LEFT, p.NORMAL);
		}
	}

	/* ---------------- da ponta ao gráfico ---------------- */
	function ligacao() {
		const gx = GX(t), gy = Y(h(t));
		tracejado(AG, gy, gx, gy, COR.h, 1.2, [3, 5]);
		tracejado(gx, gy, gx, GY, COR.h, 1.2, [3, 4]);
		p.noStroke(); p.fill(...COR.h); p.circle(gx, gy, 11);
	}

	/* ---------------- leitura e solução ---------------- */
	function textos() {
		const linha = (txt, y, cor = COR.texto, tam = 17, est = p.NORMAL) => {
			p.noStroke(); p.fill(...cor); p.textSize(tam); p.textStyle(est); p.textAlign(p.LEFT, p.CENTER); p.text(txt, AG + 36, y);
		};
		linha(`t = ${UT.fmt(t, 3)} s      h(t) = ${UT.fmt(h(t), 1)} mm`, 18, COR.h, 20, p.BOLD);
		if (!cxSol.checked()) return;
		if (!al) { linha('Escolhe uma alínea (17.1 … 17.4).', 42, COR.cinza, 16); return; }
		const L = {
			1: ['600 ciclos em 60 s: T = 60/600 = 0,1 s;   ω = 2π/T = 2π/0,1 = 20π rad/s.'],
			2: ['Máxima: 12 + 15 = 27 mm;   mínima: 12 − 15 = −3 mm:',
				'no ponto mais baixo, a ponta fica 3 mm abaixo da base (passa por um orifício).'],
			3: [`h(t) = 3 ⇔ cos(20πt) = −0,6;   t₁ ≈ ${UT.fmt(T1, 3)} s e t₂ ≈ ${UT.fmt(T2, 3)} s;`,
				`h < 3 durante t₂ − t₁ ≈ ${UT.fmt(T2 - T1, 4)} s em cada ciclo de 0,1 s: ≈ 30 % do tempo.`],
			4: ['900 pontos/min: T = 60/900 = 1/15 s, ω = 30π;   h(t) = 12 + 15 cos(30πt).',
				'A percentagem não muda (≈ 30 %): o gráfico só encolhe na horizontal (todos os tempos × 2/3).']
		}[al];
		L.forEach((txt, i) => linha(txt, 42 + 21 * i, i === L.length - 1 ? COR.aux : COR.texto, 15.5, i === L.length - 1 ? p.BOLD : p.NORMAL));
	}
};
