/* =====================================================================
   Problema 18 — O refletor da bicicleta
   (problema 26 de ~/MAT_A_26_27/trigonometria/fichas/ficha-matematica-b.tex — Exame Nacional de Matemática B,
   2017, 1.ª fase; pedido do utilizador, 2026-11-26: sem alíneas, a 26.1 no corpo do texto, tom «tu», sem o
   pedido de arredondamento de b)
   d(t) = 20 + a cos(bt), b ∈ [0, 12]; d(0) = 30 ⇒ a = 10; d(0,15) = 20 ⇒ cos(0,15b) = 0 ⇒ b = 10π/3 (≈ 10,47).
   A roda (raio 20 cm) rola para a direita; o refletor está a 10 cm do eixo e começa no ponto mais alto.
   À esquerda a roda, à direita o gráfico de d com a MESMA escala vertical (como no 15). Animação escondida ao abrir,
   resposta só com «Mostrar a solução».
   ===================================================================== */
SKETCHES['trig-p18'] = function (p, controlos) {
	const W = 940, H = 560;
	const S = 9, GY = 505;                          // px por cm; y do solo
	const R = 20, RR = 10, CX = 230;                // raio da roda, distância do refletor ao eixo (cm)
	const B = 10 * Math.PI / 3, T = 2 * Math.PI / B; // b = 10π/3, período 0,6 s
	const GR = { x0: 520, x1: 905, tmax: 1.2 };
	const COR = {
		roda: [51, 65, 85], refl: [234, 88, 12], d: [219, 39, 119], curva: [29, 78, 216], aux: [5, 150, 105],
		texto: [30, 41, 59], cinza: [100, 116, 139], grelha: [226, 232, 240], estrada: [120, 113, 108]
	};
	const d = t => 20 + 10 * Math.cos(B * t);
	const Y = c => GY - c * S;
	const GX = t => p.map(t, 0, GR.tmax, GR.x0, GR.x1);

	let t = 0, aAnimar = false, sl, btPlay, cxSol, cxRoda;

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');
		sl = UT.slider(p, controlos, 't (s)', 0, GR.tmax, t, 0.001);
		sl.input(() => { parar(); t = sl.value(); });
		btPlay = UT.botao(p, controlos, '▶ Pedalar (câmara lenta)', () => {
			if (!aAnimar && t >= GR.tmax) definir(0);
			aAnimar ? parar() : (aAnimar = true, btPlay.html('⏸ Pausa'));
		});
		UT.botao(p, controlos, 't = 0', () => { parar(); definir(0); }, 'atalho');
		UT.botao(p, controlos, 't = 0,15', () => { parar(); definir(0.15); }, 'atalho');
		UT.quebra(p, controlos);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		// outra resolução (pedido do utilizador, 2026-11-26): de 30 a 20 cm o refletor dá ¼ de volta ⇒ T/4 = 0,15; exclusiva com a outra
		cxRoda = UT.caixa(p, controlos, 'Resolução pela volta da roda', false);
		cxSol.changed(() => { if (cxSol.checked()) cxRoda.checked(false); });
		cxRoda.changed(() => { if (cxRoda.checked()) { cxSol.checked(false); parar(); definir(0.15); } });
	};
	function parar() { aAnimar = false; btPlay.html('▶ Pedalar (câmara lenta)'); }
	function definir(v) { t = p.constrain(v, 0, GR.tmax); sl.value(t); }

	p.draw = function () {
		if (aAnimar) { definir(t + 0.2 * p.deltaTime / 1000); if (t >= GR.tmax) parar(); }   // 1/5 da velocidade real
		p.background(255);
		grafico();
		roda();
		ligacao();
		textos();
	};

	function rot(txt, x, y, cor = COR.texto, tam = 18, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(5); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo); p.textAlign(ah, p.CENTER); p.text(txt, x, y);
	}
	function tracejado(x0, y0, x1, y1, cor, peso = 1.5, dd = [6, 5]) {
		p.stroke(...cor); p.strokeWeight(peso); p.drawingContext.setLineDash(dd);
		p.line(x0, y0, x1, y1); p.drawingContext.setLineDash([]);
	}
	const refletor = ti => {                       // começa no ponto mais alto e roda no sentido dos ponteiros (a roda vai para a direita)
		const a = B * ti;
		return { x: CX + RR * S * Math.sin(a), y: Y(R) - RR * S * Math.cos(a) };
	};

	/* ---------------- a roda e a estrada ---------------- */
	function roda() {
		const cy = Y(R), a = B * t;
		// estrada (as marcas andam para a esquerda: a bicicleta vai para a direita)
		p.stroke(...COR.estrada); p.strokeWeight(3); p.line(10, GY, 480, GY);
		const passo = 60, desl = (R * S * a) % passo;
		p.strokeWeight(4); p.stroke(...COR.estrada, 140);
		for (let x = 10 - desl; x < 480; x += passo) p.line(Math.max(10, x), GY + 10, Math.min(480, x + 26), GY + 10);
		// raios (rodam com a roda)
		p.strokeWeight(1.2); p.stroke(...COR.roda, 140);
		for (let k = 0; k < 20; k++) { const b = a + k * Math.PI / 10; p.line(CX, cy, CX + (R - 1) * S * Math.sin(b), cy - (R - 1) * S * Math.cos(b)); }
		p.noFill(); p.stroke(...COR.roda); p.strokeWeight(9); p.circle(CX, cy, 2 * R * S - 8);
		p.noStroke(); p.fill(...COR.roda); p.circle(CX, cy, 12);
		// circunferência descrita pelo refletor
		p.noFill(); p.stroke(...COR.refl, 90); p.strokeWeight(1.5); p.drawingContext.setLineDash([4, 5]);
		p.circle(CX, cy, 2 * RR * S); p.drawingContext.setLineDash([]);
		// distância ao solo
		const q = refletor(t);
		p.stroke(...COR.d); p.strokeWeight(3.5); p.line(q.x, GY, q.x, q.y);
		rot('d(t)', q.x + (q.x < CX ? -10 : 10), (q.y + GY) / 2, COR.d, 19, q.x < CX ? p.RIGHT : p.LEFT);
		p.noStroke(); p.fill(...COR.refl); p.circle(q.x, q.y, 18);
		rot('refletor', q.x, q.y + (q.y < cy ? -20 : 20), COR.refl, 16);
		if (cxRoda.checked()) {
			tracejado(10, cy, 480, cy, COR.aux, 1.5);
			rot('eixo: 20 cm', 14, cy - 13, COR.aux, 15, p.LEFT);
			p.noFill(); p.stroke(...COR.aux); p.strokeWeight(6);
			p.arc(CX, cy, 2 * RR * S, 2 * RR * S, -Math.PI / 2, 0);
			for (const [px, py, txt, dx] of [[CX, cy - RR * S, 'd = 30', -12], [CX + RR * S, cy, 'd = 20', 12]]) {
				p.noStroke(); p.fill(...COR.aux); p.circle(px, py, 12);
				rot(txt, px + dx, py - 16, COR.aux, 15, dx < 0 ? p.RIGHT : p.LEFT);
			}
			rot('¼ de volta', CX + RR * S * 0.8, cy - RR * S * 0.95, COR.aux, 17, p.LEFT);
		}
		if (cxSol.checked()) {
			tracejado(10, cy, 480, cy, COR.aux, 1.5);
			rot('eixo: 20 cm', 14, cy - 13, COR.aux, 15, p.LEFT);
			p.stroke(...COR.aux); p.strokeWeight(2.5); p.line(CX, cy, CX, cy - RR * S);
			rot('a = 10', CX + 8, cy - RR * S / 2, COR.aux, 16, p.LEFT);
		}
	}

	/* ---------------- o gráfico de d ---------------- */
	function grafico() {
		for (let c = 0; c <= 40; c += 5) { p.stroke(...COR.grelha); p.strokeWeight(1); p.line(GR.x0, Y(c), GR.x1, Y(c)); }
		for (let ti = 0.15; ti <= GR.tmax + 1e-9; ti += 0.15) { p.stroke(...COR.grelha); p.line(GX(ti), Y(0), GX(ti), Y(41)); }
		p.stroke(...COR.texto); p.strokeWeight(1.5);
		p.line(GR.x0, GY, GR.x1 + 12, GY); p.line(GR.x0, GY, GR.x0, Y(42));
		p.noStroke(); p.fill(...COR.texto); p.textSize(14); p.textStyle(p.NORMAL);
		p.textAlign(p.CENTER, p.TOP);
		for (let ti = 0.15; ti <= GR.tmax + 1e-9; ti += 0.15) p.text(UT.fmt(ti, 2), GX(ti), GY + 5);
		p.textAlign(p.RIGHT, p.CENTER);
		for (const c of [10, 20, 30]) p.text(c, GR.x0 - 6, Y(c));
		rot('t (s)', GR.x1 + 14, GY - 16, COR.texto, 16, p.RIGHT, p.NORMAL);
		rot('d (cm)', GR.x0 + 8, Y(42.5), COR.texto, 16, p.LEFT, p.NORMAL);
		// curva: esbatida (toda) e a cheio até ao instante t
		p.noFill(); p.strokeWeight(2); p.stroke(...COR.curva, 70);
		p.beginShape(); for (let ti = 0; ti <= GR.tmax; ti += 0.004) p.vertex(GX(ti), Y(d(ti))); p.endShape();
		p.strokeWeight(3.5); p.stroke(...COR.curva);
		p.beginShape(); for (let ti = 0; ti < t; ti += 0.004) p.vertex(GX(ti), Y(d(ti))); p.vertex(GX(t), Y(d(t))); p.endShape();
		// os dois dados do enunciado
		for (const [ti, txt, acima] of [[0, '(0, 30)', true], [0.15, '(0,15; 20)', false]]) {
			p.noStroke(); p.fill(...COR.aux); p.circle(GX(ti), Y(d(ti)), 11);
			rot(txt, GX(ti) + 8, Y(d(ti)) + (acima ? -16 : 18), COR.aux, 15, p.LEFT);
		}
		if (cxRoda.checked()) {
			tracejado(GR.x0, Y(20), GR.x1, Y(20), COR.aux, 1.5);
			p.noStroke(); p.fill(...COR.aux, 35); p.rect(GX(0), Y(41), GX(0.15) - GX(0), Y(0) - Y(41));
			rot('T/4', GX(0.075), Y(38), COR.aux, 17);
			const y = Y(5);
			p.stroke(...COR.aux); p.strokeWeight(2); p.line(GX(0) + 2, y, GX(T) - 2, y);
			for (const x of [GX(0), GX(0.15), GX(0.3), GX(0.45), GX(T)]) p.line(x, y - 5, x, y + 5);
			rot('T = 4 × 0,15 = 0,6 s', GX(T / 2), y - 14, COR.aux, 15);
		}
		if (cxSol.checked()) {
			tracejado(GR.x0, Y(20), GR.x1, Y(20), COR.aux, 1.5);
			const y = Y(30) - 26;
			p.stroke(...COR.aux); p.strokeWeight(2); p.line(GX(0) + 2, y, GX(T) - 2, y);
			rot('T = 2π/b = 0,6 s', GX(T / 2), y - 13, COR.aux, 15);
		}
	}

	function ligacao() {
		const q = refletor(t), gx = GX(t), gy = Y(d(t));
		tracejado(q.x, q.y, gx, gy, COR.d, 1.2, [3, 5]);
		p.noStroke(); p.fill(...COR.d); p.circle(gx, gy, 11);
	}

	function textos() {
		const linha = (txt, y, cor = COR.texto, tam = 16, est = p.NORMAL) => {
			p.noStroke(); p.fill(...cor); p.textSize(tam); p.textStyle(est); p.textAlign(p.LEFT, p.CENTER); p.text(txt, 20, y);
		};
		linha(`t = ${UT.fmt(t, 3)} s      d(t) = ${UT.fmt(d(t), 1)} cm`, 18, COR.d, 20, p.BOLD);
		if (cxRoda.checked()) {
			const M = [
				'd(0) = 30 ⇔ a = 10: o eixo está a 20 cm do solo e o refletor a 10 cm do eixo; d = 30 é o ponto mais alto.',
				'd = 20: o refletor está à altura do eixo — do ponto mais alto até aí vai ¼ de volta (velocidade constante).',
				'T/4 = 0,15 ⇔ T = 0,6 s;  b = 2π/T = 2π/0,6 = 10π/3   (¾ de volta, 1¼ … dariam b > 12)'
			];
			M.forEach((txt, i) => linha(txt, 44 + 21 * i, i === M.length - 1 ? COR.aux : COR.texto, 15, i === M.length - 1 ? p.BOLD : p.NORMAL));
			return;
		}
		if (!cxSol.checked()) return;
		const L = [
			'd(0) = 30 ⇔ 20 + a cos 0 = 30 ⇔ a = 10',
			'd(0,15) = 20 ⇔ 10 cos(0,15b) = 0 ⇔ 0,15b = π/2 + kπ ⇔ b = 10π/3 + 20kπ/3, k ∈ ℤ',
			'Como b ∈ [0, 12], só serve k = 0:  a = 10  e  b = 10π/3'
		];
		L.forEach((txt, i) => linha(txt, 44 + 21 * i, i === L.length - 1 ? COR.aux : COR.texto, 16, i === L.length - 1 ? p.BOLD : p.NORMAL));
	}
};
