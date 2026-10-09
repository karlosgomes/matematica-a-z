/* =====================================================================
   Problema 7 — O holofote da torre de vigia
   Holofote L a 30 m do muro, roda no sentido positivo, 1 volta em 6 s.
   θ = πt/3 ;  d = 30 tan(πt/3)  (posição de M no muro, a partir de N)
   ===================================================================== */
SKETCHES['trig-p7'] = function (p, controlos) {
	const W = 940, H = 560;
	const DIST = 30, PER = 6;
	const theta = t => Math.PI * t / 3;
	const dist = t => DIST * Math.tan(theta(t));
	const temMancha = t => Math.cos(theta(t)) > 1e-9;       // o feixe aponta para o muro

	// figura vista de cima (1 m = FIG.s px)
	const FIG = { lx: 55, ny: 330, s: 6, x1: 300, y0: 40, y1: 545 };
	FIG.wx = FIG.lx + DIST * FIG.s;
	// gráfico d(t)
	const GR = { x0: 400, x1: 900, yc: 330, y0: 130, y1: 530, dmax: 120 };

	const COR = {
		muro: [71, 85, 105], feixe: [234, 179, 8], tan: [5, 150, 105], ang: [124, 58, 237],
		ponto: [219, 39, 119], ass: [29, 78, 216], texto: [30, 41, 59]
	};

	let t = 0.3, aAnimar = false, rasto = new Set();
	let sl, btPlay, cxTri, cxProl, cxCurva;

	const FX = x => FIG.lx + x * FIG.s;             // x em metros a partir de L
	const FY = y => FIG.ny - y * FIG.s;             // y em metros a partir de N
	const GX = v => p.map(v, 0, PER, GR.x0, GR.x1);
	const GY = v => GR.yc - v * (GR.yc - GR.y0) / GR.dmax;

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');

		sl = UT.slider(p, controlos, 't', 0, PER, t, 0.01);
		sl.input(() => { parar(); definir(sl.value()); });
		btPlay = UT.botao(p, controlos, '▶ Rodar', () => {
			if (!aAnimar && t >= PER - 1e-6) definir(0);
			aAnimar = !aAnimar;
			btPlay.html(aAnimar ? '⏸ Pausa' : '▶ Rodar');
		});
		UT.quebra(p, controlos);
		[['t = 0', 0], ['t = 0,30', 0.3], ['t = 0,75', 0.75], ['t = 1,49', 1.49], ['t = 5', 5]]
			.forEach(([txt, v]) => UT.botao(p, controlos, txt, () => { parar(); definir(v); }, 'atalho'));
		UT.quebra(p, controlos);
		cxTri = UT.caixa(p, controlos, 'Triângulo [LNM]', true);
		cxProl = UT.caixa(p, controlos, 'Prolongamento do feixe');
		cxCurva = UT.caixa(p, controlos, 'Curva completa');
		UT.botao(p, controlos, 'Limpar rasto', () => { rasto = new Set([arred(t)]); }, 'atalho');
		definir(t);
	};

	function parar() { aAnimar = false; btPlay.html('▶ Rodar'); }
	function arred(v) { return Math.round(v * 100) / 100; }
	function definir(v) {
		t = p.constrain(v, 0, PER);
		sl.value(t);
		rasto.add(arred(t));
	}

	p.draw = function () {
		if (aAnimar) {
			let n = t + 0.5 * p.deltaTime / 1000;   // meia velocidade real, para se ver bem
			if (n >= PER) { n = PER; parar(); }
			definir(n);
		}
		p.background(255);
		figura();
		grafico();
		leitura();
	};

	/* ---------------- utilitários ---------------- */
	function rot(txt, x, y, cor = COR.texto, tam = 20, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(txt, x, y);
	}
	function tracejado(x1, y1, x2, y2, a = 6, b = 5) {
		p.drawingContext.setLineDash([a, b]); p.line(x1, y1, x2, y2); p.drawingContext.setLineDash([]);
	}
	function recortar(x0, y0, x1, y1) {
		p.drawingContext.save(); p.drawingContext.beginPath();
		p.drawingContext.rect(x0, y0, x1 - x0, y1 - y0); p.drawingContext.clip();
	}
	function soltar() { p.drawingContext.restore(); }

	/* ---------------- figura (vista de cima) ---------------- */
	function figura() {
		const th = theta(t), c = Math.cos(th), s = Math.sin(th);
		const Lx = FX(0), Ly = FY(0), Nx = FIG.wx;
		const mancha = temMancha(t), d = dist(t);

		recortar(0, FIG.y0, FIG.x1, FIG.y1);

		// muro
		p.stroke(...COR.muro); p.strokeWeight(5); p.line(Nx, FIG.y0, Nx, FIG.y1);

		// feixe de luz (cone estreito) — vai até ao muro ou até sair da figura
		const comp = mancha ? Math.min(DIST / c, 400) : 400;
		const ab = p.radians(2.5);
		p.noStroke(); p.fill(...COR.feixe, 110);
		p.triangle(Lx, Ly,
			Lx + comp * FIG.s * Math.cos(th + ab), Ly - comp * FIG.s * Math.sin(th + ab),
			Lx + comp * FIG.s * Math.cos(th - ab), Ly - comp * FIG.s * Math.sin(th - ab));
		p.stroke(...COR.feixe); p.strokeWeight(2.5);
		p.line(Lx, Ly, Lx + comp * FIG.s * c, Ly - comp * FIG.s * s);

		// prolongamento do feixe para trás (quando o feixe não atinge o muro)
		if (cxProl.checked() && !mancha && Math.abs(c) > 1e-6) {
			const k = DIST / c;   // negativo: ponto "atrás" do holofote
			p.stroke(150); p.strokeWeight(1.5);
			tracejado(Lx, Ly, Lx + k * FIG.s * c, Ly - k * FIG.s * s);
			if (Math.abs(FY(d) - Ly) < 300) {
				p.noStroke(); p.fill(150); p.circle(Nx, FY(d), 11);
				rot("M'", Nx + 22, FY(d), [120, 120, 120], 18);
			}
		}

		// [LN] = 30 e triângulo
		p.stroke(...COR.texto); p.strokeWeight(1.5);
		tracejado(Lx, Ly, Nx, Ly, 2, 5);
		rot('30', (Lx + Nx) / 2, Ly + 18, COR.texto, 18, p.CENTER, p.NORMAL);
		if (mancha && cxTri.checked()) {
			p.stroke(...COR.tan); p.strokeWeight(5); p.line(Nx, Ly, Nx, FY(d));
			const q = 11, sg = d >= 0 ? -1 : 1;
			if (Math.abs(d) > 2) {
				p.noFill(); p.stroke(80); p.strokeWeight(1.3);
				p.line(Nx - q, Ly, Nx - q, Ly + sg * q); p.line(Nx - q, Ly + sg * q, Nx, Ly + sg * q);
			}
			if (Math.abs(FY(d) - Ly) > 26) {
				const yl = (Ly + p.constrain(FY(d), FIG.y0, FIG.y1)) / 2;   // meio da parte visível
				rot('d', Nx + 18, yl, COR.tan, 22, p.CENTER, p.ITALIC);
			}
		}

		// ângulo θ (positivo, sentido contrário ao dos ponteiros)
		if (th > 0.01) {
			p.stroke(...COR.ang); p.strokeWeight(2); p.fill(...COR.ang, 35);
			p.arc(Lx, Ly, 70, 70, -th, 0, p.PIE);
			const am = -th / 2;
			rot('θ', Lx + 50 * Math.cos(am), Ly + 50 * Math.sin(am), COR.ang, 20, p.CENTER, p.ITALIC);
		}

		// pontos
		p.noStroke(); p.fill(...COR.texto);
		p.circle(Lx, Ly, 11); p.circle(Nx, Ly, 9);
		rot('L', Lx - 2, Ly + 20, COR.texto, 20);
		rot('N', Nx + 16, Ly + 16, COR.texto, 20);
		if (mancha && FY(d) > FIG.y0 && FY(d) < FIG.y1) {
			p.fill(...COR.feixe); p.stroke(...COR.ponto); p.strokeWeight(3); p.circle(Nx, FY(d), 17);
			rot('M', Nx + 22, FY(d) + (d >= 0 ? -10 : 10), COR.ponto, 20);
		}
		soltar();

		// M fora da figura: seta no bordo
		if (mancha && (FY(d) <= FIG.y0 || FY(d) >= FIG.y1)) {
			const cima = d > 0, y = cima ? FIG.y0 + 4 : FIG.y1 - 4;
			p.noStroke(); p.fill(...COR.ponto);
			p.triangle(Nx, y + (cima ? -2 : 2), Nx - 8, y + (cima ? 14 : -14), Nx + 8, y + (cima ? 14 : -14));
			rot(`M ${cima ? '↑' : '↓'} fora da figura`, Nx + 12, y + (cima ? 24 : -24), COR.ponto, 16, p.LEFT, p.NORMAL);
		}
		if (!mancha) {
			rot('O feixe não atinge o muro', FIG.lx - 20, FIG.y1 - 2, [100, 116, 139], 17, p.LEFT, p.NORMAL);
		}
		rot('muro', Nx - 10, FIG.y0 + 8, COR.muro, 15, p.RIGHT, p.NORMAL);
	}

	/* ---------------- gráfico d(t) ---------------- */
	function grafico() {
		p.textStyle(p.NORMAL); p.textSize(14);
		for (let v = 0; v <= PER; v += 0.75) {
			p.stroke(235); p.strokeWeight(1); p.line(GX(v), GR.y0, GX(v), GR.y1);
		}
		[-100, -50, 50, 100].forEach(v => {
			p.stroke(235); p.line(GX(0), GY(v), GX(PER), GY(v));
			p.noStroke(); p.fill(90); p.textAlign(p.RIGHT, p.CENTER); p.text(v, GX(0) - 6, GY(v));
		});
		p.stroke(80); p.strokeWeight(1.5);
		p.line(GX(0), GR.yc, GX(PER) + 14, GR.yc);
		p.line(GX(0), GR.y1, GX(0), GR.y0 - 10);
		[[0.75, '0,75'], [1.5, '1,5'], [3, '3'], [4.5, '4,5'], [6, '6']].forEach(([v, txt]) => {
			p.stroke(80); p.line(GX(v), GR.yc - 4, GX(v), GR.yc + 4);
			p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP); p.text(txt, GX(v) + (v === 1.5 || v === 4.5 ? 14 : 0), GR.yc + 7);
		});
		rot('d', GX(0) + 12, GR.y0 - 10, COR.texto, 18, p.LEFT, p.ITALIC);
		rot('t', GX(PER) + 14, GR.yc - 16, COR.texto, 18, p.CENTER, p.ITALIC);

		// assíntotas
		p.stroke(...COR.ass); p.strokeWeight(1.5);
		[1.5, 4.5].forEach(v => tracejado(GX(v), GR.y0, GX(v), GR.y1, 7, 6));

		recortar(GR.x0 - 2, GR.y0, GR.x1 + 4, GR.y1);
		if (cxCurva.checked()) {
			p.noFill(); p.strokeWeight(3);
			[[0, 1.499, true], [1.501, 4.499, false], [4.501, PER, true]].forEach(([a, b, real]) => {
				p.stroke(...(real ? COR.tan : [170, 170, 170]));
				if (!real) p.drawingContext.setLineDash([6, 6]);
				p.beginShape();
				for (let v = a; v <= b; v += 0.004) p.vertex(GX(v), GY(dist(v)));
				p.endShape();
				p.drawingContext.setLineDash([]);
			});
		} else {
			p.noStroke();
			rasto.forEach(v => {
				p.fill(...(temMancha(v) ? COR.tan : [170, 170, 170]));
				p.circle(GX(v), GY(dist(v)), 5);
			});
		}
		const d = dist(t);
		p.stroke(...COR.ponto); p.strokeWeight(1.2);
		tracejado(GX(t), GR.yc, GX(t), GY(d));
		p.noStroke(); p.fill(...(temMancha(t) ? COR.ponto : [150, 150, 150])); p.circle(GX(t), GY(d), 13);
		soltar();
	}

	/* ---------------- leitura ---------------- */
	function leitura() {
		const th = theta(t), d = dist(t);
		const x = GR.x0 - 20;
		p.noStroke(); p.textSize(20); p.textAlign(p.LEFT, p.CENTER);
		p.textStyle(p.BOLD); p.fill(...COR.ponto); p.text(`t = ${UT.fmt(t, 2)} s`, x, 26);
		p.textStyle(p.NORMAL); p.fill(...COR.ang);
		p.text(`θ = πt/3 ≈ ${UT.fmt(p.degrees(th), 1)}°`, x + 150, 26);
		p.fill(...COR.tan); p.textStyle(p.BOLD);
		const dtxt = Math.abs(d) > 1e5 ? '±∞' : UT.fmt(d, 2).replace('-', '−');
		p.text(`d = 30 tan(πt/3) ≈ ${dtxt}`, x, 58);
		p.textStyle(p.NORMAL); p.textSize(17); p.fill(100, 116, 139);
		const nota = !temMancha(t) ? 'sem mancha no muro (o feixe aponta para longe do muro)'
			: d < -1e-6 ? `d < 0: M está do outro lado de N, a ${UT.fmt(-d, 2)} m de N`
				: `M está a ${UT.fmt(d, 2)} m de N`;
		p.text(nota, x, 90);
	}
};
