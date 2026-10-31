/* =====================================================================
   Problema 11 — A roda gigante
   Raio 8 m, centro a 9 m do chão, uma volta em 24 s, partida no ponto mais baixo:
   h(t) = 9 − 8 cos(πt/12)
   À esquerda a roda (escala real), à direita o gráfico de h com o MESMO chão e a
   MESMA escala vertical: a altura da Inês liga-se ao gráfico por uma linha horizontal.
   Os botões 11.1 … 11.5 preparam a figura para cada alínea e destacam-na no enunciado.
   ===================================================================== */
SKETCHES['trig-p11'] = function (p, controlos) {
	const W = 940, H = 560;
	const S = 24, GY = 532;                       // px por metro; y do chão
	const RODA = { cx: 215, r: 8, c: 9 };         // centro a 9 m, raio 8 m
	const GR = { x0: 470, x1: 905, tmax: 48 };    // gráfico de 0 a 48 s (duas voltas)
	const COR = {
		roda: [71, 85, 105], ines: [219, 39, 119], h: [234, 88, 12], curva: [29, 78, 216],
		aux: [5, 150, 105], texto: [30, 41, 59], cinza: [100, 116, 139], grelha: [226, 232, 240]
	};
	const h = t => 9 - 8 * Math.cos(Math.PI * t / 12);
	const Y = m => GY - m * S;                    // altura (m) → ecrã
	const GX = t => p.map(t, 0, GR.tmax, GR.x0, GR.x1);
	const T3 = 12 / Math.PI * Math.acos(-1 / 8);  // h(t) = 10 ⇔ t ≈ 6,48 (e 24 − 6,48, …)

	let t = 0, aAnimar = false, alinea = 0;
	let sl, btPlay, cxCalc, itens = [];

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
		[[1, 0], [2, 16], [3, T3], [4, 5], [5, 0]].forEach(([a, ti]) =>
			UT.botao(p, controlos, `11.${a}`, () => { parar(); escolher(alinea === a ? 0 : a); if (alinea) definir(ti); }, 'atalho'));
		cxCalc = UT.caixa(p, controlos, 'Mostrar cálculos');
		itens = [...controlos.closest('section').querySelectorAll('ul.condicoes li')];
	};

	function parar() { aAnimar = false; btPlay.html('▶ Rodar'); }
	function definir(v) { t = p.constrain(v, 0, GR.tmax); sl.value(t); }
	function escolher(a) {
		alinea = a;
		itens.forEach((li, i) => { li.classList.toggle('atual', a === i + 1); li.classList.toggle('outra', a !== 0 && a !== i + 1); });
	}

	p.draw = function () {
		if (aAnimar) { definir(t + 3 * p.deltaTime / 1000); if (t >= GR.tmax) parar(); }   // uma volta em 8 s
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
	const posicao = ti => {                      // posição da Inês na roda (sentido positivo, a partir de baixo)
		const a = Math.PI * ti / 12;
		return { x: RODA.cx + RODA.r * S * Math.sin(a), y: Y(h(ti)) };
	};

	/* ---------------- a roda ---------------- */
	function roda() {
		const cx = RODA.cx, cy = Y(RODA.c), R = RODA.r * S, a = Math.PI * t / 12;
		// chão e estrutura
		p.stroke(...COR.cinza); p.strokeWeight(3); p.line(10, GY, 430, GY);
		p.stroke(...COR.roda); p.strokeWeight(5);
		p.line(cx, cy, cx - 70, GY); p.line(cx, cy, cx + 70, GY);
		// alínea 5: o ponto mais baixo e o mais alto
		if (alinea === 5) {
			tracejado(cx - R - 20, Y(1), 440, Y(1), COR.aux, 2);
			tracejado(cx - R - 20, Y(17), 440, Y(17), COR.aux, 2);
		}
		// alínea 3: a altura de 10 m corta a roda em dois pontos
		if (alinea === 3) tracejado(cx - R - 20, Y(10), 440, Y(10), COR.aux, 2);
		// aro e raios (a rodar)
		p.noFill(); p.stroke(...COR.roda); p.strokeWeight(3); p.circle(cx, cy, 2 * R);
		p.strokeWeight(1.5);
		for (let k = 0; k < 8; k++) {
			const b = a + k * Math.PI / 4;
			const x = cx + R * Math.sin(b), y = cy + R * Math.cos(b);
			p.stroke(...COR.roda, 140); p.line(cx, cy, x, y);
			p.noStroke(); p.fill(...COR.roda, 160); p.circle(x, y, 12);
		}
		p.noStroke(); p.fill(...COR.roda); p.circle(cx, cy, 12);
		// posições de referência das alíneas
		const fantasma = (ti, txt) => {
			const q = posicao(ti);
			p.noFill(); p.stroke(...COR.ines); p.strokeWeight(2.5); p.circle(q.x, q.y, 18);
			// etiqueta para dentro da roda e por baixo (não sai da figura nem tapa «Inês»)
			rot(txt, q.x + (q.x < cx ? 14 : -14), q.y + 20, COR.ines, 17, q.x < cx ? p.LEFT : p.RIGHT, p.NORMAL);
		};
		if (alinea === 2) { fantasma(8, 't = 8'); fantasma(16, 't = 16'); }
		if (alinea === 3) { fantasma(T3, `t ≈ ${UT.fmt(T3, 2)}`); fantasma(24 - T3, `t ≈ ${UT.fmt(24 - T3, 2)}`); }
		// a altura da Inês: do chão até à cadeira
		const q = posicao(t);
		p.stroke(...COR.h); p.strokeWeight(4); p.line(q.x, GY, q.x, q.y);
		rot('h(t)', q.x + (q.x < cx ? -12 : 12), (q.y + GY) / 2, COR.h, 20, q.x < cx ? p.RIGHT : p.LEFT);
		p.noStroke(); p.fill(...COR.ines); p.circle(q.x, q.y, 18);
		rot('Inês', q.x, q.y - 22, COR.ines, 18);
	}

	/* ---------------- o gráfico de h ---------------- */
	function grafico() {
		// grelha e eixos (mesmo chão e mesma escala vertical que a roda)
		for (let m = 0; m <= 18; m += 2) { p.stroke(...COR.grelha); p.strokeWeight(1); p.line(GR.x0, Y(m), GR.x1, Y(m)); }
		for (let ti = 6; ti <= GR.tmax; ti += 6) { p.stroke(...COR.grelha); p.line(GX(ti), Y(0), GX(ti), Y(18)); }
		p.stroke(...COR.texto); p.strokeWeight(1.5);
		p.line(GR.x0, GY, GR.x1 + 12, GY); p.line(GR.x0, GY, GR.x0, Y(18.6));
		p.noStroke(); p.fill(...COR.texto); p.textSize(15); p.textStyle(p.NORMAL);
		p.textAlign(p.CENTER, p.TOP);
		for (let ti = 0; ti <= GR.tmax; ti += 6) p.text(ti, GX(ti), GY + 5);
		p.textAlign(p.RIGHT, p.CENTER);
		for (const m of [1, 5, 9, 13, 17]) p.text(m, GR.x0 - 6, Y(m));
		rot('t (s)', GR.x1 + 14, GY - 16, COR.texto, 17, p.RIGHT, p.NORMAL);
		rot('h (m)', GR.x0 + 8, Y(18.2), COR.texto, 17, p.LEFT, p.NORMAL);

		// alínea 5: a faixa [1, 17]
		if (alinea === 5) {
			p.noStroke(); p.fill(...COR.aux, 30); p.rect(GR.x0, Y(17), GR.x1 - GR.x0, Y(1) - Y(17));
			rot('h = 17', GR.x1 - 4, Y(17) - 12, COR.aux, 17, p.RIGHT); rot('h = 1', GR.x1 - 4, Y(1) - 12, COR.aux, 17, p.RIGHT);
		}
		if (alinea === 3) {
			for (const ti of [T3, 24 - T3, 24 + T3, 48 - T3]) {
				p.noStroke(); p.fill(...COR.aux); p.circle(GX(ti), Y(10), 9);
				tracejado(GX(ti), Y(10), GX(ti), GY, COR.aux, 1.2, [3, 4]);
			}
		}
		// curva: toda esbatida e, até ao instante t, a cheio
		p.noFill(); p.strokeWeight(2); p.stroke(...COR.curva, 70);
		p.beginShape(); for (let ti = 0; ti <= GR.tmax; ti += 0.1) p.vertex(GX(ti), Y(h(ti))); p.endShape();
		p.strokeWeight(3.5); p.stroke(...COR.curva);
		p.beginShape(); for (let ti = 0; ti < t; ti += 0.1) p.vertex(GX(ti), Y(h(ti))); p.vertex(GX(t), Y(h(t))); p.endShape();

		// marcas das alíneas
		const marca = (ti, txt, cor = COR.ines, acima = true) => {
			p.noStroke(); p.fill(...cor); p.circle(GX(ti), Y(h(ti)), 11);
			rot(txt, GX(ti), Y(h(ti)) + (acima ? -18 : 18), cor, 17, p.CENTER, p.NORMAL);
		};
		if (alinea === 1) marca(0, '(0, 1)', COR.ines, false);
		if (alinea === 2) { tracejado(GR.x0, Y(13), GR.x1, Y(13), COR.ines, 1.2, [3, 4]); marca(8, 'h(8)'); marca(16, 'h(16)'); }
		if (alinea === 4 && t + 24 <= GR.tmax) {
			marca(t, 't', COR.ines, h(t) < 15); marca(t + 24, 't + 24', COR.ines, h(t) < 15);
			// seta de t a t + 24 (uma volta)
			const yy = Y(h(t)) + (h(t) < 15 ? 26 : -26);
			p.stroke(...COR.aux); p.strokeWeight(2); p.line(GX(t), yy, GX(t + 24), yy);
			p.noStroke(); p.fill(...COR.aux);
			p.triangle(GX(t + 24), yy, GX(t + 24) - 10, yy - 5, GX(t + 24) - 10, yy + 5);
			rot('24 s = uma volta', (GX(t) + GX(t + 24)) / 2, yy + (h(t) < 15 ? 14 : -14), COR.aux, 16, p.CENTER, p.NORMAL);
		}
	}

	/* ---------------- da cadeira ao gráfico ---------------- */
	function ligacao() {
		const q = posicao(t), gx = GX(t), gy = Y(h(t));
		tracejado(q.x, q.y, gx, gy, COR.h, 1.5);
		tracejado(gx, gy, gx, GY, COR.h, 1.2, [3, 4]);
		p.noStroke(); p.fill(...COR.h); p.circle(gx, gy, 12);
	}

	/* ---------------- leituras e cálculos ---------------- */
	function textos() {
		const linha = (txt, y, cor = COR.texto, tam = 19, est = p.NORMAL) => {
			p.noStroke(); p.fill(...cor); p.textSize(tam); p.textStyle(est); p.textAlign(p.LEFT, p.CENTER); p.text(txt, 20, y);
		};
		linha(`t = ${UT.fmt(t, 1)} s      h(t) = ${UT.fmt(h(t), 1)} m`, 22, COR.h, 21, p.BOLD);
		if (!cxCalc.checked() || !alinea) return;
		const C = {
			1: ['h(0) = 9 − 8 cos 0 = 9 − 8 = 1', 'No início, a Inês está a 1 m do chão (ponto mais baixo da roda).'],
			2: ['h(8) = 9 − 8 cos(2π/3) = 13   e   h(16) = 9 − 8 cos(4π/3) = 13',
				'Aos 8 s e aos 16 s, a Inês está em posições simétricas em relação ao eixo vertical.'],
			3: [`9 − 8 cos(πt/12) = 10 ⇔ cos(πt/12) = −1/8 ⇔ t ≈ ${UT.fmt(T3, 2)} s (ou ${UT.fmt(24 - T3, 2)} s, …)`,
				`Ao fim de cerca de ${UT.fmt(T3, 1)} s, a Inês está, pela primeira vez, a 10 m do chão.`],
			4: ['h(t + 24) = 9 − 8 cos(πt/12 + 2π) = 9 − 8 cos(πt/12) = h(t)',
				'Em 24 s a roda dá uma volta completa: a Inês volta à mesma posição.'],
			5: ['−1 ≤ cos(πt/12) ≤ 1  ⇒  1 ≤ 9 − 8 cos(πt/12) ≤ 17',
				'h(t) toma todos os valores de [1, 17]: do ponto mais baixo (1 m) ao mais alto (17 m).']
		}[alinea];
		linha(C[0], 48, COR.texto, 18);
		linha(C[1], 70, COR.cinza, 17);
	}
};
