/* =====================================================================
   Problema 6 — A cicloide
   Roda de raio 1 rola sem deslizar sobre Ox; a marca parte de (0,0).
   Ao fim da distância t: centro C(t, 1), marca M(t − sin t, 1 − cos t)
   ===================================================================== */
SKETCHES['trig-p6'] = function (p, controlos) {
	const W = 940, H = 560;
	const DOIS_PI = 2 * Math.PI;
	const marca = t => [t - Math.sin(t), 1 - Math.cos(t)];

	const FIG = { ox: 110, oy: 470, s: 110 };

	const COR = {
		roda: [100, 116, 139], arco: [219, 39, 119], curva: [124, 58, 237],
		sin: [220, 38, 38], cos: [29, 78, 216], marca: [219, 39, 119], texto: [30, 41, 59]
	};

	let t = 0.9, aAnimar = false;
	let sl, btPlay, cxRasto, cxArco, cxTri, cxCurva;

	const X = x => FIG.ox + x * FIG.s;
	const Y = y => FIG.oy - y * FIG.s;

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');

		sl = UT.slider(p, controlos, 't', 0, DOIS_PI, t, 0.001);
		sl.input(() => { parar(); definir(sl.value()); });
		btPlay = UT.botao(p, controlos, '▶ Rolar', () => {
			if (!aAnimar && t >= DOIS_PI - 1e-6) definir(0);
			aAnimar = !aAnimar;
			btPlay.html(aAnimar ? '⏸ Pausa' : '▶ Rolar');
		});
		UT.quebra(p, controlos);
		[['t = 0', 0], ['¼ de volta (π/2)', Math.PI / 2], ['t = π', Math.PI],
			['t = 3π/2', 3 * Math.PI / 2], ['1 volta (2π)', DOIS_PI]]
			.forEach(([txt, v]) => UT.botao(p, controlos, txt, () => { parar(); definir(v); }, 'atalho'));
		UT.quebra(p, controlos);
		cxArco = UT.caixa(p, controlos, 'Arco = distância percorrida', true);
		cxTri = UT.caixa(p, controlos, 'Triângulo retângulo');
		cxRasto = UT.caixa(p, controlos, 'Trajetória da marca', true);
		cxCurva = UT.caixa(p, controlos, 'Curva completa');
		definir(t);
	};

	function parar() { aAnimar = false; btPlay.html('▶ Rolar'); }
	function definir(v) {
		t = p.constrain(v, 0, DOIS_PI);
		sl.value(t);
	}

	p.draw = function () {
		if (aAnimar) {
			let n = t + 0.8 * p.deltaTime / 1000;   // 0,8 unidades por segundo
			if (n >= DOIS_PI) { n = DOIS_PI; parar(); }
			definir(n);
		}
		p.background(255);
		eixos();
		cicloide();
		roda();
		leitura();
	};

	/* ---------------- utilitários ---------------- */
	function rot(txt, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(txt, x, y);
	}
	function tracejado(x1, y1, x2, y2) {
		p.drawingContext.setLineDash([6, 5]); p.line(x1, y1, x2, y2); p.drawingContext.setLineDash([]);
	}

	/* ---------------- eixos ---------------- */
	function eixos() {
		p.stroke(80); p.strokeWeight(1.5); p.fill(80);
		p.line(X(-0.8), Y(0), W - 12, Y(0));
		p.triangle(W - 12, Y(0), W - 24, Y(0) - 5, W - 24, Y(0) + 5);
		p.line(X(0), Y(-0.5), X(0), Y(2.45));
		p.triangle(X(0), Y(2.45) - 10, X(0) - 5, Y(2.45) + 2, X(0) + 5, Y(2.45) + 2);
		rot('x', W - 18, Y(0) + 22, COR.texto, 20, p.CENTER, p.ITALIC);
		rot('y', X(0) - 18, Y(2.45), COR.texto, 20, p.CENTER, p.ITALIC);
		rot('O', X(0) - 16, Y(0) + 18, COR.texto, 18);

		// marcas π/2, π, 3π/2, 2π
		p.textStyle(p.NORMAL); p.textSize(16);
		[['π/2', 0.5], ['π', 1], ['3π/2', 1.5], ['2π', 2]].forEach(([txt, k]) => {
			const xx = X(k * Math.PI);
			p.stroke(80); p.strokeWeight(1.5); p.line(xx, Y(0) - 5, xx, Y(0) + 5);
			p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP); p.text(txt, xx, Y(0) + 26);
		});
		p.stroke(80); p.line(X(0) - 5, Y(1), X(0) + 5, Y(1)); p.line(X(0) - 5, Y(2), X(0) + 5, Y(2));
		p.noStroke(); p.fill(90); p.textAlign(p.RIGHT, p.CENTER);
		p.text('1', X(0) - 10, Y(1)); p.text('2', X(0) - 10, Y(2));
	}

	/* ---------------- cicloide ---------------- */
	function curva(t0, t1, cor, peso, alfa = 255) {
		p.noFill(); p.stroke(...cor, alfa); p.strokeWeight(peso);
		p.beginShape();
		for (let s = t0; s <= t1 + 1e-9; s += 0.02) { const [x, y] = marca(Math.min(s, t1)); p.vertex(X(x), Y(y)); }
		const [x, y] = marca(t1); p.vertex(X(x), Y(y));
		p.endShape();
	}
	function cicloide() {
		if (cxCurva.checked()) curva(0, DOIS_PI, COR.curva, 2, 90);
		if (cxRasto.checked() && t > 0) curva(0, t, COR.curva, 3.5);
		if (cxCurva.checked() || t >= DOIS_PI - 1e-6) {
			p.noStroke(); p.fill(...COR.texto); p.circle(X(DOIS_PI), Y(0), 9);
			rot('P', X(DOIS_PI) + 18, Y(0) - 16, COR.texto, 20);
		}
	}

	/* ---------------- roda ---------------- */
	function roda() {
		const cx = X(t), cy = Y(1), r = FIG.s;
		const [mx, my] = marca(t);
		const Mx = X(mx), My = Y(my);

		// roda e raios (rodam com a roda, no sentido dos ponteiros do relógio)
		p.fill(241, 245, 249, 160); p.stroke(...COR.roda); p.strokeWeight(2.5);
		p.circle(cx, cy, 2 * r);
		p.stroke(...COR.roda, 70); p.strokeWeight(1.2);
		for (let k = 1; k < 6; k++) {
			const a = p.HALF_PI + t + k * Math.PI / 3;   // ângulo no ecrã (y para baixo)
			p.line(cx, cy, cx + r * Math.cos(a), cy + r * Math.sin(a));
		}

		// arco TM e segmento [OT] com o mesmo comprimento t
		if (cxArco.checked() && t > 0.001) {
			p.noFill(); p.stroke(...COR.arco); p.strokeWeight(6); p.strokeCap(p.ROUND);
			p.line(X(0), Y(0), X(t), Y(0));
			p.arc(cx, cy, 2 * r, 2 * r, p.HALF_PI, p.HALF_PI + t);
			// ângulo ao centro
			p.stroke(...COR.arco); p.strokeWeight(2); p.fill(...COR.arco, 40);
			p.arc(cx, cy, 50, 50, p.HALF_PI, p.HALF_PI + t, p.PIE);
			const am = p.HALF_PI + t / 2;
			rot('t', cx + 40 * Math.cos(am), cy + 40 * Math.sin(am), COR.arco, 20, p.CENTER, p.ITALIC);
			rot('t', X(t / 2), Y(0) + 22, COR.arco, 20, p.CENTER, p.ITALIC);
		}

		// triângulo retângulo C, Q, M
		if (cxTri.checked()) {
			const Qy = My;
			p.strokeWeight(3);
			p.stroke(...COR.sin); p.line(Mx, Qy, cx, Qy);
			p.stroke(...COR.cos); p.line(cx, cy, cx, Qy);
			if (Math.abs(Mx - cx) > 14 && Math.abs(Qy - cy) > 14) {
				const q = 11, sx = Math.sign(Mx - cx), sy = Math.sign(cy - Qy);
				p.noFill(); p.stroke(80); p.strokeWeight(1.3);
				p.line(cx + sx * q, Qy, cx + sx * q, Qy + sy * q); p.line(cx + sx * q, Qy + sy * q, cx, Qy + sy * q);
			}
			if (Math.abs(Mx - cx) > 30)
				rot('|sin t|', (Mx + cx) / 2, Qy + (Qy > cy ? 20 : -20), COR.sin, 18, p.CENTER, p.NORMAL);
			if (Math.abs(Qy - cy) > 30)
				rot('|cos t|', cx + (Mx < cx ? 10 : -10), (cy + Qy) / 2, COR.cos, 18, Mx < cx ? p.LEFT : p.RIGHT, p.NORMAL);
		}

		// raio [CM] e raio [CT]
		p.stroke(...COR.texto); p.strokeWeight(2);
		p.line(cx, cy, Mx, My);
		p.stroke(...COR.texto, 120); p.strokeWeight(1.2); tracejado(cx, cy, cx, Y(0));

		p.noStroke(); p.fill(...COR.texto); p.circle(cx, cy, 9); p.circle(cx, Y(0), 7);
		// rótulo C no quadrante oposto ao da marca (fica livre do triângulo)
		rot('C', cx + (Mx > cx + 1 ? -28 : 28), cy + (My < cy ? 22 : -22), COR.texto, 19);
		rot('T', cx + 14, Y(0) + 16, COR.texto, 17);
		p.fill(...COR.marca); p.stroke(255); p.strokeWeight(2); p.circle(Mx, My, 16);
		const ang = p.HALF_PI + t;
		rot('M', Mx + 26 * Math.cos(ang), My + 26 * Math.sin(ang), COR.marca, 20);
	}

	/* ---------------- leitura ---------------- */
	function fracPi(v) {
		const tab = [[0, '0'], [Math.PI / 2, 'π/2'], [Math.PI, 'π'], [3 * Math.PI / 2, '3π/2'], [DOIS_PI, '2π']];
		const e = tab.find(([a]) => Math.abs(a - v) < 0.004);
		return e ? `${e[1]} ≈ ${UT.fmt(v, 2)}` : UT.fmt(v, 2);
	}
	function leitura() {
		const [mx, my] = marca(t);
		const x = 30;
		p.noStroke(); p.textSize(20); p.textAlign(p.LEFT, p.CENTER);
		p.textStyle(p.BOLD); p.fill(...COR.arco); p.text(`t = ${fracPi(t)}`, x, 26);
		p.textStyle(p.NORMAL); p.fill(...COR.texto);
		p.text(`voltas: ${UT.fmt(t / DOIS_PI, 3)}`, x, 54);
		p.text(`C = (t, 1) ≈ (${UT.fmt(t, 2)}; 1)`, x + 290, 26);
		p.textStyle(p.BOLD); p.fill(...COR.marca);
		p.text(`M = (t − sin t, 1 − cos t) ≈ (${UT.fmt(mx, 2)}; ${UT.fmt(my, 2)})`, x + 290, 54);
		p.textStyle(p.NORMAL); p.textSize(18);
		p.fill(...COR.sin); p.text(`sin t ≈ ${UT.fmt(Math.sin(t), 3)}`, x + 290, 84);
		p.fill(...COR.cos); p.text(`cos t ≈ ${UT.fmt(Math.cos(t), 3)}`, x + 470, 84);
	}
};
