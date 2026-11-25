/* =====================================================================
   Problema 15 — A roda gigante de 50 metros
   (problema 28 de ~/MAT_A_26_27/trigonometria/fichas/trig-osciladores-harmonicos.tex,
   adaptado de Sullivan, Algebra and Trigonometry)
   Diâmetro 50 m, ponto mais baixo a 5 m do solo, 1,6 voltas por minuto (T = 37,5 s),
   partida no ponto mais baixo:  h(t) = 30 − 25 cos(4πt/75)  (forma D + A cos(ωt), com A = −25).
   À esquerda a roda (escala real), à direita o gráfico de h com o MESMO solo e a
   MESMA escala vertical. Segue o padrão dos problemas do produto escalar: a animação
   começa escondida (data-esconder), os botões 15.1 … 15.4 preparam a figura e destacam
   a alínea no enunciado, e as respostas só aparecem com «Mostrar a solução».
   ===================================================================== */
SKETCHES['trig-p15'] = function (p, controlos) {
	const W = 940, H = 560;
	const S = 7.5, GY = 538;                          // px por metro; y do solo
	const RODA = { cx: 228, r: 25, c: 30 };         // centro a 30 m, raio 25 m
	const T = 37.5, w = 2 * Math.PI / T;            // período (s) e ω = 4π/75 rad/s
	const GR = { x0: 500, x1: 905, tmax: 2 * T };   // gráfico: duas voltas
	const COR = {
		roda: [71, 85, 105], pass: [219, 39, 119], h: [234, 88, 12], curva: [29, 78, 216],
		aux: [5, 150, 105], texto: [30, 41, 59], cinza: [100, 116, 139], grelha: [226, 232, 240]
	};
	const h = t => 30 - 25 * Math.cos(w * t);
	const Y = m => GY - m * S;
	const GX = t => p.map(t, 0, GR.tmax, GR.x0, GR.x1);
	const A0 = Math.acos(-0.6);                     // h = 45 ⇔ cos(ωt) = −0,6
	const T1 = A0 / w, T2 = (2 * Math.PI - A0) / w; // ≈ 13,22 s e ≈ 24,28 s

	let t = 0, aAnimar = false, al = 0;
	let sl, btPlay, cxSol, itens = [];
	const botoes = {};

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');
		sl = UT.slider(p, controlos, 't (s)', 0, GR.tmax, t, 0.01);
		sl.input(() => { parar(); t = sl.value(); });
		btPlay = UT.botao(p, controlos, '▶ Rodar', () => {
			if (!aAnimar && t >= GR.tmax) definir(0);
			aAnimar ? parar() : (aAnimar = true, btPlay.html('⏸ Pausa'));
		});
		UT.quebra(p, controlos);
		// alíneas: cada botão põe t no instante que interessa e destaca a alínea no enunciado
		[[1, 0], [2, 0], [3, 10], [4, T / 2]].forEach(([a, ti]) => {
			botoes[a] = UT.botao(p, controlos, `15.${a}`, () => { parar(); escolher(al === a ? 0 : a); if (al) definir(ti); }, 'atalho');
		});
		UT.quebra(p, controlos);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		itens = [...controlos.closest('section').querySelectorAll('ul.condicoes li')];
		escolher(0);
	};

	function parar() { aAnimar = false; btPlay.html('▶ Rodar'); }
	function definir(v) { t = p.constrain(v, 0, GR.tmax); sl.value(t); }
	// a alínea escolhida: botão azul (os outros claros) e destaque no enunciado
	function escolher(a) {
		al = a;
		Object.entries(botoes).forEach(([k, b]) => +k === al ? b.removeClass('atalho') : b.addClass('atalho'));
		itens.forEach((li, i) => { li.classList.toggle('atual', al === i + 1); li.classList.toggle('outra', al !== 0 && al !== i + 1); });
	}

	p.draw = function () {
		if (aAnimar) { definir(t + 5 * p.deltaTime / 1000); if (t >= GR.tmax) parar(); }   // uma volta em 7,5 s
		p.background(255);
		grafico();
		roda();
		ligacao();
		textos();
	};

	/* ---------------- utilitários ---------------- */
	function rot(txt, x, y, cor = COR.texto, tam = 20, ah = p.CENTER, estilo = p.BOLD) {
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
		p.triangle(x1, y1, x1 - 11 * Math.cos(a - 0.4), y1 - 11 * Math.sin(a - 0.4), x1 - 11 * Math.cos(a + 0.4), y1 - 11 * Math.sin(a + 0.4));
	}
	const posicao = ti => {                        // cabina do passageiro (a partir do ponto mais baixo)
		const a = w * ti;
		return { x: RODA.cx + RODA.r * S * Math.sin(a), y: Y(h(ti)) };
	};

	/* ---------------- a roda ---------------- */
	function roda() {
		const cx = RODA.cx, cy = Y(RODA.c), R = RODA.r * S, a = w * t;
		// solo e estrutura
		p.stroke(...COR.cinza); p.strokeWeight(3); p.line(10, GY, 460, GY);
		p.stroke(...COR.roda); p.strokeWeight(5);
		p.line(cx, cy, cx - 80, GY); p.line(cx, cy, cx + 80, GY);
		// 15.4: a parte da roda acima dos 45 m
		if (al === 4) {
			tracejado(10, Y(45), 470, Y(45), COR.aux, 2);
			p.noFill(); p.stroke(...COR.aux, 160); p.strokeWeight(12);
			p.beginShape();
			for (let b = A0; b <= 2 * Math.PI - A0 + 1e-9; b += 0.02) p.vertex(cx + R * Math.sin(b), cy + R * Math.cos(b));
			p.endShape();
			rot('h > 45 m', cx - 110, Y(45) + 22, COR.aux, 18);
		}
		// 15.2: linha média (centro), ponto mais baixo e ponto mais alto
		if (al === 2) {
			for (const m of [5, 30, 55]) tracejado(10, Y(m), 470, Y(m), m === 30 ? COR.aux : COR.cinza, 1.5);
		}
		// aro e raios (a rodar)
		p.noFill(); p.stroke(...COR.roda); p.strokeWeight(3); p.circle(cx, cy, 2 * R);
		p.strokeWeight(1.5);
		for (let k = 0; k < 12; k++) {
			const b = a + k * Math.PI / 6;
			const x = cx + R * Math.sin(b), y = cy + R * Math.cos(b);
			p.stroke(...COR.roda, 120); p.line(cx, cy, x, y);
			p.noStroke(); p.fill(...COR.roda, 150); p.circle(x, y, 11);
		}
		p.noStroke(); p.fill(...COR.roda); p.circle(cx, cy, 12);
		// 15.2: raio = amplitude, centro = linha média (com a solução)
		if (al === 2 && cxSol.checked()) {
			seta(cx, cy, cx, Y(55) + 2, COR.aux, 2.5);
			rot('25 m', cx + 10, Y(42.5), COR.aux, 18, p.LEFT);
			rot('centro: 5 + 25 = 30 m', cx + 10, cy + 16, COR.aux, 17, p.LEFT, p.NORMAL);
		}
		// a altura do passageiro: do solo até à cabina
		const q = posicao(t);
		p.stroke(...COR.h); p.strokeWeight(4); p.line(q.x, GY, q.x, q.y);
		rot('h(t)', q.x + (q.x < cx ? -12 : 12), (q.y + GY) / 2, COR.h, 20, q.x < cx ? p.RIGHT : p.LEFT);
		p.noStroke(); p.fill(...COR.pass); p.circle(q.x, q.y, 18);
		rot('passageiro', q.x, q.y + (h(t) > 50 ? 24 : -22), COR.pass, 17);
	}

	/* ---------------- o gráfico de h ---------------- */
	function grafico() {
		for (let m = 0; m <= 55; m += 5) { p.stroke(...COR.grelha); p.strokeWeight(1); p.line(GR.x0, Y(m), GR.x1, Y(m)); }
		for (let ti = 10; ti <= GR.tmax; ti += 10) { p.stroke(...COR.grelha); p.line(GX(ti), Y(0), GX(ti), Y(56)); }
		p.stroke(...COR.texto); p.strokeWeight(1.5);
		p.line(GR.x0, GY, GR.x1 + 12, GY); p.line(GR.x0, GY, GR.x0, Y(58));
		p.noStroke(); p.fill(...COR.texto); p.textSize(15); p.textStyle(p.NORMAL);
		p.textAlign(p.CENTER, p.TOP);
		for (let ti = 0; ti <= 70; ti += 10) p.text(ti, GX(ti), GY + 5);
		p.textAlign(p.RIGHT, p.CENTER);
		for (const m of [5, 15, 30, 45, 55]) p.text(m, GR.x0 - 6, Y(m));
		rot('t (s)', GR.x1 + 14, GY - 16, COR.texto, 17, p.RIGHT, p.NORMAL);
		rot('h (m)', GR.x0 + 8, Y(57.5), COR.texto, 17, p.LEFT, p.NORMAL);

		// 15.4: a reta h = 45 e os intervalos em que h > 45
		if (al === 4) {
			for (const k of [0, 1]) {
				p.noStroke(); p.fill(...COR.aux, 35);
				p.rect(GX(T1 + k * T), Y(56), GX(T2) - GX(T1), GY - Y(56));
			}
			tracejado(GR.x0, Y(45), GR.x1, Y(45), COR.aux, 2);
			rot('h = 45', GR.x1 - 2, Y(45) + 14, COR.aux, 16, p.RIGHT);
		}
		// 15.2: linha média e extremos
		if (al === 2) {
			tracejado(GR.x0, Y(30), GR.x1, Y(30), COR.aux, 2);
			tracejado(GR.x0, Y(55), GR.x1, Y(55), COR.cinza, 1.2, [3, 4]);
			tracejado(GR.x0, Y(5), GR.x1, Y(5), COR.cinza, 1.2, [3, 4]);
			rot('linha média', GR.x1 - 2, Y(30) - 14, COR.aux, 16, p.RIGHT, p.NORMAL);
			if (cxSol.checked()) {
				const x = GX(T);
				seta(x, Y(30), x, Y(5) - 2, COR.aux, 2.5);
				rot('A = −25', x + 8, Y(17.5), COR.aux, 17, p.LEFT);
				rot('D = 30', GR.x0 + 8, Y(30) - 14, COR.aux, 17, p.LEFT);
			}
		}
		// curva: toda esbatida e, até ao instante t, a cheio
		p.noFill(); p.strokeWeight(2); p.stroke(...COR.curva, 70);
		p.beginShape(); for (let ti = 0; ti <= GR.tmax; ti += 0.1) p.vertex(GX(ti), Y(h(ti))); p.endShape();
		p.strokeWeight(3.5); p.stroke(...COR.curva);
		p.beginShape(); for (let ti = 0; ti < t; ti += 0.1) p.vertex(GX(ti), Y(h(ti))); p.vertex(GX(t), Y(h(t))); p.endShape();

		const marca = (ti, txt, cor = COR.pass, acima = true) => {
			p.noStroke(); p.fill(...cor); p.circle(GX(ti), Y(h(ti)), 11);
			if (txt) rot(txt, GX(ti), Y(h(ti)) + (acima ? -18 : 18), cor, 16, p.CENTER, p.NORMAL);
		};
		// 15.1: uma volta = um período (de mínimo a mínimo)
		if (al === 1) {
			marca(0, '', COR.pass); marca(T, '', COR.pass); marca(2 * T, '', COR.pass);
			const yy = Y(5) - 28;
			seta(GX(0) + 4, yy, GX(T) - 2, yy, COR.aux, 2);
			seta(GX(T) + 4, yy, GX(2 * T) - 2, yy, COR.aux, 2);
			rot(cxSol.checked() ? 'T = 37,5 s' : 'uma volta', GX(T / 2), yy - 14, COR.aux, 17);
			rot(cxSol.checked() ? 'T = 37,5 s' : 'uma volta', GX(1.5 * T), yy - 14, COR.aux, 17);
		}
		// 15.3: o instante t = 10
		if (al === 3) {
			tracejado(GX(10), GY, GX(10), Y(h(10)), COR.pass, 1.2, [3, 4]);
			tracejado(GR.x0, Y(h(10)), GX(10), Y(h(10)), COR.pass, 1.2, [3, 4]);
			marca(10, cxSol.checked() ? 'h(10) ≈ 32,61' : 'h(10)', COR.pass, true);
		}
		// 15.4: os instantes t₁ e t₂ (com a solução)
		if (al === 4 && cxSol.checked()) {
			for (const ti of [T1, T2]) {
				p.noStroke(); p.fill(...COR.aux); p.circle(GX(ti), Y(45), 10);
				tracejado(GX(ti), Y(45), GX(ti), GY, COR.aux, 1.2, [3, 4]);
			}
			rot(`t₁ ≈ ${UT.fmt(T1, 2)}`, GX(T1) - 4, GY - 16, COR.aux, 15, p.RIGHT, p.NORMAL);
			rot(`t₂ ≈ ${UT.fmt(T2, 2)}`, GX(T2) + 4, GY - 16, COR.aux, 15, p.LEFT, p.NORMAL);
		}
	}

	/* ---------------- da cabina ao gráfico ---------------- */
	function ligacao() {
		const q = posicao(t), gx = GX(t), gy = Y(h(t));
		tracejado(q.x, q.y, gx, gy, COR.h, 1.5);
		tracejado(gx, gy, gx, GY, COR.h, 1.2, [3, 4]);
		p.noStroke(); p.fill(...COR.h); p.circle(gx, gy, 12);
	}

	/* ---------------- leitura e solução ---------------- */
	function textos() {
		const linha = (txt, y, cor = COR.texto, tam = 18, est = p.NORMAL) => {
			p.noStroke(); p.fill(...cor); p.textSize(tam); p.textStyle(est); p.textAlign(p.LEFT, p.CENTER); p.text(txt, 20, y);
		};
		linha(`t = ${UT.fmt(t, 1)} s      h(t) = ${UT.fmt(h(t), 1)} m`, 20, COR.h, 21, p.BOLD);
		if (!cxSol.checked()) return;
		if (!al) { linha('Escolhe uma alínea (15.1 … 15.4).', 46, COR.cinza, 17); return; }
		const L = {
			1: ['1,6 voltas por minuto: em 60 s a roda dá 1,6 voltas.',
				'Uma volta demora 60 / 1,6 = 37,5 s, logo o período é T = 37,5 s.'],
			2: ['ω = 2π / T = 2π / 37,5 = 4π/75;   D = 5 + 25 = 30 (altura do centro da roda).',
				'h(0) = 5 ⇔ D + A cos 0 = 5 ⇔ 30 + A = 5 ⇔ A = −25   (|A| = 25 é o raio).',
				'h(t) = 30 − 25 cos(4πt/75)'],
			3: ['h(10) = 30 − 25 cos(8π/15) ≈ 30 − 25 × (−0,1045) ≈ 32,61 m'],
			4: ['h(t) > 45 ⇔ 30 − 25 cos(4πt/75) > 45 ⇔ cos(4πt/75) < −0,6',
				`Na 1.ª volta, h(t) = 45 em t₁ ≈ ${UT.fmt(T1, 2)} s e t₂ ≈ ${UT.fmt(T2, 2)} s (gráficos de y = h(t) e y = 45).`,
				`Tempo acima dos 45 m: t₂ − t₁ ≈ ${UT.fmt(T2 - T1, 2)} s ≈ 11,1 s em cada volta.`]
		}[al];
		L.forEach((txt, i) => linha(txt, 46 + 22 * i, i === L.length - 1 ? COR.aux : COR.texto, 17, i === L.length - 1 ? p.BOLD : p.NORMAL));
	}
};
