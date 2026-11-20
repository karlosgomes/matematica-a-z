/* =====================================================================
   Problema 14 — O pêndulo
   θ(t) = 20 cos(3πt) (graus; θ > 0 à direita da vertical), T = 2/3 s, f = 1,5 Hz.
   À esquerda o pêndulo (ângulo real), à direita o gráfico de θ de 0 a 2 s.
   Os botões 14.1 … 14.4 preparam a figura para cada alínea.
   ===================================================================== */
SKETCHES['trig-p14'] = function (p, controlos) {
	const W = 940, H = 560;
	const PV = { x: 150, y: 70, L: 300, r: 17 };          // pivô, comprimento (px), raio da massa
	const GR = { x0: 340, x1: 905, yc: 230, s: 6, tmax: 2 }; // gráfico: θ = 0 em yc, 6 px por grau
	const COR = {
		fio: [71, 85, 105], massa: [30, 64, 175], ang: [124, 58, 237], curva: [29, 78, 216],
		aux: [5, 150, 105], marca: [220, 38, 38], texto: [30, 41, 59], cinza: [100, 116, 139],
		grelha: [226, 232, 240], teto: [203, 213, 225]
	};
	const th = t => 20 * Math.cos(3 * Math.PI * t);
	const GX = t => p.map(t, 0, GR.tmax, GR.x0, GR.x1);
	const GY = g => GR.yc - g * GR.s;
	const FR = ['0', '1/6', '1/3', '1/2', '2/3', '5/6', '1', '7/6', '4/3', '3/2', '5/3', '11/6', '2'];   // t = n/6
	const ZEROS = [1, 3, 5, 7, 9, 11];                                                                    // θ = 0 em n/6

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
		[[1, 0], [2, 0], [3, 1 / 3], [4, 1 / 6]].forEach(([a, ti]) =>
			UT.botao(p, controlos, `14.${a}`, () => { parar(); escolher(alinea === a ? 0 : a); if (alinea) definir(ti); }, 'atalho'));
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
		pendulo();
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
	const ponta = g => {                                   // posição da massa para o ângulo g (graus)
		const a = g * Math.PI / 180;
		return [PV.x + PV.L * Math.sin(a), PV.y + PV.L * Math.cos(a)];
	};

	/* ---------------- o pêndulo ---------------- */
	function pendulo() {
		const g = th(t), [mx, my] = ponta(g);
		// suporte
		p.noStroke(); p.fill(...COR.teto); p.rect(PV.x - 90, PV.y - 14, 180, 14);
		p.stroke(...COR.texto); p.strokeWeight(2); p.line(PV.x - 90, PV.y, PV.x + 90, PV.y);
		// vertical (posição de repouso)
		tracejado(PV.x, PV.y, PV.x, PV.y + PV.L + 40, COR.cinza, 1.2);
		// as posições extremas (±20°) e o arco percorrido
		for (const e of [-20, 20]) {
			const [ex, ey] = ponta(e);
			tracejado(PV.x, PV.y, ex, ey, (alinea === 1 || alinea === 3) ? COR.aux : COR.grelha, 1.2, [4, 4]);
		}
		p.noFill(); p.stroke(...COR.grelha); p.strokeWeight(2);
		p.arc(PV.x, PV.y, 2 * PV.L, 2 * PV.L, Math.PI / 2 - Math.PI / 9, Math.PI / 2 + Math.PI / 9);
		if (alinea === 1) {
			rot('20°', ponta(20)[0] + 14, ponta(20)[1] + 24, COR.aux, 17, p.LEFT);
			rot('20°', ponta(-20)[0] - 14, ponta(-20)[1] + 24, COR.aux, 17, p.RIGHT);
		}
		// ângulo θ (arco do vertical até ao fio)
		const R = 110, a = g * Math.PI / 180;
		if (Math.abs(g) > 0.5) {
			p.noFill(); p.stroke(...COR.ang); p.strokeWeight(2.5);
			const a0 = Math.PI / 2, a1 = Math.PI / 2 - a;      // ângulos do p5 (y para baixo)
			p.arc(PV.x, PV.y, 2 * R, 2 * R, Math.min(a0, a1), Math.max(a0, a1));
			rot('θ', PV.x + (R + 18) * Math.sin(a / 2), PV.y + (R + 18) * Math.cos(a / 2), COR.ang, 20);
		}
		// fio e massa
		p.stroke(...COR.fio); p.strokeWeight(2.5); p.line(PV.x, PV.y, mx, my);
		p.noStroke(); p.fill(...COR.texto); p.circle(PV.x, PV.y, 8);
		p.fill(...COR.massa); p.circle(mx, my, 2 * PV.r);
		p.fill(255, 255, 255, 90); p.circle(mx - PV.r * 0.35, my - PV.r * 0.35, PV.r * 0.7);
		// esquerda / direita
		rot('θ < 0', PV.x - 95, PV.y + PV.L + 50, COR.cinza, 16, p.CENTER, p.NORMAL);
		rot('θ > 0', PV.x + 95, PV.y + PV.L + 50, COR.cinza, 16, p.CENTER, p.NORMAL);
		// passagem pela vertical
		if (alinea === 4 && Math.abs(g) < 1.2) rot('na vertical!', PV.x, PV.y + PV.L + 80, COR.marca, 18);
	}

	/* ---------------- o gráfico de θ ---------------- */
	function grafico() {
		for (let g = -20; g <= 20; g += 10) { p.stroke(...COR.grelha); p.strokeWeight(1); p.line(GR.x0, GY(g), GR.x1, GY(g)); }
		for (let k = 1; k <= 12; k++) { p.stroke(...COR.grelha); p.strokeWeight(1); p.line(GX(k / 6), GY(24), GX(k / 6), GY(-24)); }
		// eixos
		p.stroke(...COR.texto); p.strokeWeight(1.5);
		p.line(GR.x0, GR.yc, GR.x1 + 12, GR.yc); p.line(GR.x0, GY(-25), GR.x0, GY(26));
		p.noStroke(); p.fill(...COR.texto);
		p.triangle(GR.x1 + 14, GR.yc, GR.x1 + 4, GR.yc - 5, GR.x1 + 4, GR.yc + 5);
		p.triangle(GR.x0, GY(26) - 6, GR.x0 - 5, GY(26) + 4, GR.x0 + 5, GY(26) + 4);
		p.textSize(15); p.textStyle(p.NORMAL); p.textAlign(p.CENTER, p.TOP);
		for (let k = 2; k <= 12; k += 2) p.text(FR[k], GX(k / 6), GY(-24) + 6);
		p.textAlign(p.RIGHT, p.CENTER);
		for (const g of [-20, -10, 10, 20]) p.text(g, GR.x0 - 6, GY(g));
		rot('t (s)', GR.x1 + 10, GR.yc + 18, COR.texto, 17, p.RIGHT, p.NORMAL);
		rot('θ (graus)', GR.x0 - 8, GY(26) - 4, COR.texto, 17, p.RIGHT, p.NORMAL);

		if (alinea === 1) {
			p.noStroke(); p.fill(...COR.aux, 28); p.rect(GR.x0, GY(20), GR.x1 - GR.x0, GY(-20) - GY(20));
			rot('máx. 20', GR.x1 - 4, GY(20) - 12, COR.aux, 16, p.RIGHT);
			rot('mín. −20', GR.x1 - 4, GY(-20) + 12, COR.aux, 16, p.RIGHT);
		}
		if (alinea === 2) {
			for (let k = 0; k < 3; k++) {
				const yy = GY(23), xa = GX(2 * k / 3), xb = GX(2 * (k + 1) / 3);
				p.stroke(...COR.aux); p.strokeWeight(2); p.line(xa + 2, yy, xb - 2, yy);
				p.line(xa + 2, yy - 6, xa + 2, yy + 6); p.line(xb - 2, yy - 6, xb - 2, yy + 6);
				rot(k === 0 ? 'T = 2/3 s' : 'T', (xa + xb) / 2, yy - 11, COR.aux, 16, p.CENTER);
			}
			rot('3 oscilações em 2 s', GR.x1, 410, COR.aux, 17, p.RIGHT);
		}
		// curva: esbatida e, até ao instante t, a cheio
		p.noFill(); p.strokeWeight(2); p.stroke(...COR.curva, 70);
		p.beginShape(); for (let ti = 0; ti <= GR.tmax; ti += 0.003) p.vertex(GX(ti), GY(th(ti))); p.endShape();
		p.strokeWeight(3.5); p.stroke(...COR.curva);
		p.beginShape(); for (let ti = 0; ti < t; ti += 0.003) p.vertex(GX(ti), GY(th(ti))); p.vertex(GX(t), GY(th(t))); p.endShape();

		if (alinea === 3) {
			p.noStroke(); p.fill(...COR.marca); p.circle(GX(1 / 3), GY(-20), 11);
			rot('(1/3, −20)', GX(1 / 3) + 10, GY(-20) + 13, COR.marca, 16, p.LEFT);
		}
		if (alinea === 4) {
			ZEROS.forEach(n => {
				p.noStroke(); p.fill(...COR.marca); p.circle(GX(n / 6), GR.yc, 10);
				rot(FR[n], GX(n / 6), GR.yc - 16, COR.marca, 15, p.CENTER);
			});
		}
		// ponto atual
		p.noStroke(); p.fill(...COR.ang); p.circle(GX(t), GY(th(t)), 12);
		tracejado(GX(t), GY(th(t)), GX(t), GR.yc, COR.ang, 1.2, [3, 4]);
	}

	/* ---------------- leituras e cálculos ---------------- */
	function textos() {
		const x = GR.x0 + 10;
		rot(`t = ${UT.fmt(t, 2)} s      θ(t) = ${UT.fmt(th(t), 1)}°`, x, 410, COR.ang, 21, p.LEFT);
		if (!cxCalc.checked() || !alinea) return;
		const C = {
			1: ['−1 ≤ cos(3πt) ≤ 1  ⇒  −20 ≤ θ(t) ≤ 20',
				'A amplitude é 20: o maior ângulo com a vertical é 20°.'],
			2: ['T = 2π/ω = 2π/(3π) = 2/3 s',
				'f = 1/T = 3/2 = 1,5 Hz (1,5 oscilações por segundo).'],
			3: ['θ(1/3) = 20 cos(π) = −20',
				'Posição extrema da esquerda (meio período depois da direita).'],
			4: ['θ(t) = 0 ⇔ cos(3πt) = 0 ⇔ 3πt = π/2 + kπ ⇔ t = 1/6 + k/3, k ∈ ℤ',
				'Em [0, 2]: k = 0, …, 5  ⇒  6 vezes: 1/6, 1/2, 5/6, 7/6, 3/2, 11/6 s.']
		}[alinea];
		C.forEach((txt, i) => rot(txt, x, 450 + i * 28, i === C.length - 1 ? COR.aux : COR.texto, 18, p.LEFT, i === C.length - 1 ? p.BOLD : p.NORMAL));
	}
};
