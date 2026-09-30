/* =====================================================================
   Problema 3 — Para que valores de k se verifica cada condição?
   Modelo comum "explorador de k":
     esquerda : círculo trigonométrico, arco do domínio e objeto controlado por k
     direita  : gráfico da expressão em k com a faixa de valores admissíveis
     em baixo : eixo de k pintado (verde = há solução, vermelho = não há)
   ===================================================================== */
function exploradorK(cfg) {
	return function (p, controlos) {
		const W = 940, H = 560;
		const O = { x: 215, y: 300 }, R = 150;
		const GR = { x0: 580, x1: 910, y0: 440, y1: 90, faixaK: 505 };

		const COR = {
			eixo: [100, 116, 139], circ: [30, 41, 59], ok: [22, 163, 74], nao: [220, 38, 38],
			obj: [29, 78, 216], curva: [29, 78, 216], faixa: [22, 163, 74], texto: [30, 41, 59],
			ang: [124, 58, 237]
		};

		let k = cfg.kInicial, aAnimar = false, sentido = 1, rasto = new Map();
		let sl, btPlay, cxSol;

		const X = x => O.x + x * R;
		const Y = y => O.y - y * R;
		const GX = v => p.map(v, cfg.kMin, cfg.kMax, GR.x0, GR.x1);
		const GY = v => p.map(v, cfg.yMin, cfg.yMax, GR.y0, GR.y1);

		/* ---------- utilitários partilhados com as funções de cada alínea ---------- */
		const ut = {
			p, X, Y, O, R, COR,
			rot(t, x, y, cor = COR.texto, tam = 20, ah = p.CENTER, estilo = p.BOLD) {
				p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
				p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
				p.textAlign(ah, p.CENTER); p.text(t, x, y);
			},
			tracejado(x1, y1, x2, y2) {
				p.drawingContext.setLineDash([6, 5]); p.line(x1, y1, x2, y2); p.drawingContext.setLineDash([]);
			},
			// extremo de intervalo: bola cheia (fechado) ou vazia (aberto)
			extremo(x, y, aberto, cor = COR.faixa) {
				p.strokeWeight(3); p.stroke(...cor);
				aberto ? p.fill(255) : p.fill(...cor);
				p.circle(x, y, 13);
			},
			// arco do domínio (graus, sentido positivo de a1 para a2)
			arco(a1, a2, ab1, ab2) {
				p.noFill(); p.stroke(...COR.faixa, 200); p.strokeWeight(9);
				p.arc(O.x, O.y, 2 * R, 2 * R, -p.radians(a2), -p.radians(a1));
				ut.extremo(X(Math.cos(p.radians(a1))), Y(Math.sin(p.radians(a1))), ab1);
				ut.extremo(X(Math.cos(p.radians(a2))), Y(Math.sin(p.radians(a2))), ab2);
			},
			// segmento sobre um eixo (projeção do arco = valores possíveis)
			segEixo(eixo, lo, hi, ab1, ab2) {
				p.stroke(...COR.faixa, 150); p.strokeWeight(7);
				if (eixo === 'x') {
					p.line(X(lo), O.y, X(hi), O.y);
					ut.extremo(X(lo), O.y, ab1); ut.extremo(X(hi), O.y, ab2);
				} else {
					p.line(O.x, Y(lo), O.x, Y(hi));
					ut.extremo(O.x, Y(lo), ab1); ut.extremo(O.x, Y(hi), ab2);
				}
			},
			ponto(x, y, cor, d = 14) { p.noStroke(); p.fill(...cor); p.circle(X(x), Y(y), d); }
		};

		p.setup = function () {
			p.createCanvas(W, H);
			p.textFont('Source Sans Pro');

			sl = UT.slider(p, controlos, 'k', cfg.kMin, cfg.kMax, k, cfg.kPasso);
			sl.input(() => { parar(); definir(sl.value()); });
			btPlay = UT.botao(p, controlos, '▶ Animar', () => {
				aAnimar = !aAnimar;
				btPlay.html(aAnimar ? '⏸ Pausa' : '▶ Animar');
			});
			UT.quebra(p, controlos);
			cfg.atalhos.forEach(([t, v]) => UT.botao(p, controlos, t, () => { parar(); definir(v); }, 'atalho'));
			UT.quebra(p, controlos);
			cxSol = UT.caixa(p, controlos, 'Mostrar solução');
			UT.botao(p, controlos, 'Limpar eixo de k', () => { rasto = new Map(); definir(k); }, 'atalho');
			definir(k);
		};

		function parar() { aAnimar = false; btPlay.html('▶ Animar'); }
		function definir(v) {
			k = p.constrain(v, cfg.kMin, cfg.kMax);
			sl.value(k);
			const chave = Math.round(k / cfg.kPasso) * cfg.kPasso;
			rasto.set(chave.toFixed(4), cfg.valido(k));
		}

		p.draw = function () {
			if (aAnimar) {
				let n = k + sentido * (cfg.kMax - cfg.kMin) / 8 * p.deltaTime / 1000;   // domínio em 8 s
				if (n >= cfg.kMax) { n = cfg.kMax; sentido = -1; }
				if (n <= cfg.kMin) { n = cfg.kMin; sentido = 1; }
				// ao animar, arredondar ao passo para acertar nos valores exatos
				definir(Math.round(n / cfg.kPasso) * cfg.kPasso);
			}
			const ok = cfg.valido(k);
			p.background(255);
			circuloBase();
			cfg.circulo(ut, k, ok, cxSol.checked());
			grafico(ok);
			eixoK();
			leitura(ok);
		};

		/* ---------------- círculo ---------------- */
		function circuloBase() {
			p.stroke(...COR.eixo); p.strokeWeight(1.5);
			p.line(X(-1.35), O.y, X(cfg.xMaxCirc || 1.35), O.y);
			p.line(O.x, Y(cfg.yMinCirc || -1.35), O.x, Y(1.35));
			ut.rot('x', X(cfg.xMaxCirc || 1.35), O.y + 18, COR.eixo, 18, p.CENTER, p.ITALIC);
			ut.rot('y', O.x - 14, Y(1.35), COR.eixo, 18, p.CENTER, p.ITALIC);
			ut.rot('1', X(1) + 10, O.y + 16, COR.eixo, 16, p.LEFT, p.NORMAL);
			ut.rot('−1', X(-1) - 10, O.y + 16, COR.eixo, 16, p.RIGHT, p.NORMAL);
			ut.rot('1', O.x - 8, Y(1) - 12, COR.eixo, 16, p.RIGHT, p.NORMAL);
			ut.rot('−1', O.x - 8, Y(-1) + 12, COR.eixo, 16, p.RIGHT, p.NORMAL);
			p.noFill(); p.stroke(...COR.circ, 120); p.strokeWeight(1.5);
			p.circle(O.x, O.y, 2 * R);
		}

		/* ---------------- gráfico da expressão em k ---------------- */
		function grafico(ok) {
			const f = cfg.faixa;
			// faixa de valores admissíveis
			const lo = Math.max(f.lo, cfg.yMin), hi = Math.min(f.hi, cfg.yMax);
			p.noStroke(); p.fill(...COR.faixa, 35);
			p.rect(GR.x0, GY(hi), GR.x1 - GR.x0, GY(lo) - GY(hi));
			p.stroke(...COR.faixa); p.strokeWeight(2);
			[[f.lo, f.loAberto], [f.hi, f.hiAberto]].forEach(([v, ab]) => {
				if (v < cfg.yMin || v > cfg.yMax) return;
				ab ? ut.tracejado(GR.x0, GY(v), GR.x1, GY(v)) : p.line(GR.x0, GY(v), GR.x1, GY(v));
			});

			// grelha
			p.textStyle(p.NORMAL); p.textSize(14);
			// marcas em múltiplos exatos do passo (evita -0,0 e marcas desalinhadas)
			const marcas = (a, b, d) => {
				const r = [];
				for (let i = Math.ceil(a / d - 1e-9); i * d <= b + 1e-9; i++) r.push(Math.abs(i * d) < 1e-9 ? 0 : i * d);
				return r;
			};
			for (const v of marcas(cfg.kMin, cfg.kMax, cfg.kTick)) {
				p.stroke(235); p.strokeWeight(1); p.line(GX(v), GR.y0, GX(v), GR.y1);
				p.noStroke(); p.fill(90); p.textAlign(p.CENTER, p.TOP);
				p.text(UT.fmt(v, cfg.kCasas), GX(v), GR.faixaK + 14);
			}
			for (const v of marcas(cfg.yMin, cfg.yMax, cfg.yPasso)) {
				p.stroke(235); p.line(GR.x0, GY(v), GR.x1, GY(v));
				p.noStroke(); p.fill(90); p.textAlign(p.RIGHT, p.CENTER);
				p.text(UT.fmt(v, cfg.yCasas), GR.x0 - 6, GY(v));
			}
			// eixo horizontal (y = 0) e vertical (k = 0), se visíveis
			p.stroke(80); p.strokeWeight(1.3);
			if (cfg.yMin <= 0 && cfg.yMax >= 0) p.line(GR.x0, GY(0), GR.x1, GY(0));
			if (cfg.kMin <= 0 && cfg.kMax >= 0) p.line(GX(0), GR.y0, GX(0), GR.y1);
			ut.rot(cfg.gNome, GR.x0 + 6, GR.y1 - 22, COR.curva, 18, p.LEFT);

			// curva
			p.noFill(); p.stroke(...COR.curva); p.strokeWeight(2.5);
			p.beginShape();
			const n = 300;
			for (let i = 0; i <= n; i++) {
				const v = cfg.kMin + (cfg.kMax - cfg.kMin) * i / n;
				p.vertex(GX(v), GY(p.constrain(cfg.g(v), cfg.yMin - 1, cfg.yMax + 1)));
			}
			p.endShape();

			// parte da curva dentro da faixa (solução)
			if (cxSol.checked()) {
				p.stroke(...COR.ok); p.strokeWeight(6);
				for (let i = 0; i < n; i++) {
					const a = cfg.kMin + (cfg.kMax - cfg.kMin) * i / n, b = a + (cfg.kMax - cfg.kMin) / n;
					if (cfg.valido(a) && cfg.valido(b)) p.line(GX(a), GY(cfg.g(a)), GX(b), GY(cfg.g(b)));
				}
			}

			// ponto atual
			const v = cfg.g(k), cor = ok ? COR.ok : COR.nao;
			if (v >= cfg.yMin && v <= cfg.yMax) {
				p.stroke(...cor); p.strokeWeight(1.2);
				ut.tracejado(GX(k), GY(v), GX(k), GR.faixaK);
				p.noStroke(); p.fill(...cor); p.circle(GX(k), GY(v), 14);
			}
		}

		/* ---------------- eixo de k (construído pelo aluno) ---------------- */
		function eixoK() {
			const y = GR.faixaK;
			p.stroke(80); p.strokeWeight(1.5);
			p.line(GR.x0 - 10, y, GR.x1 + 12, y);
			ut.rot('k', GR.x1 + 22, y, COR.texto, 20, p.CENTER, p.ITALIC);
			p.noStroke();
			rasto.forEach((val, chave) => {
				p.fill(...(val ? COR.ok : COR.nao), val ? 255 : 110);
				p.circle(GX(parseFloat(chave)), y, val ? 9 : 6);
			});
			if (cxSol.checked()) {
				cfg.solucao.forEach(([a, b, abA, abB]) => {
					p.stroke(...COR.ok); p.strokeWeight(7);
					p.line(GX(a), y, GX(b), y);
					ut.extremo(GX(a), y, abA, COR.ok);
					if (b !== a) ut.extremo(GX(b), y, abB, COR.ok);
				});
				ut.rot(cfg.solucaoTexto, (GR.x0 + GR.x1) / 2, y + 44, COR.ok, 20);
			}
			const cor = cfg.valido(k) ? COR.ok : COR.nao;
			p.noStroke(); p.fill(...cor);
			p.triangle(GX(k), y - 4, GX(k) - 7, y - 16, GX(k) + 7, y - 16);
		}

		/* ---------------- leitura ---------------- */
		function leitura(ok) {
			p.noStroke(); p.textSize(20); p.textAlign(p.LEFT, p.CENTER);
			p.textStyle(p.BOLD); p.fill(...COR.texto); p.text(`k = ${UT.fmt(k, 2)}`, 20, 22);
			p.textStyle(p.NORMAL); p.fill(...COR.obj); p.text(cfg.valorTexto(k), 130, 22);
			p.textStyle(p.BOLD); p.fill(...(ok ? COR.ok : COR.nao));
			p.text(ok ? '✔ ' + cfg.estado(k) : '✘ não há solução', 20, 52);
		}
	};
}

/* =====================================================================
   3.1   sin α = (k − 1)/2  ∧  cos α = k + 1
   Q(k + 1, (k − 1)/2) percorre a reta y = x/2 − 1; tem de estar na circunferência.
   ===================================================================== */
{
	const Q = k => [k + 1, (k - 1) / 2];
	const g = k => { const [x, y] = Q(k); return x * x + y * y; };
	SKETCHES['trig-p3a'] = exploradorK({
		kMin: -2, kMax: 1, kPasso: 0.01, kInicial: 0.5, kTick: 0.5, kCasas: 1,
		g, gNome: 'cos²α + sin²α = (k+1)² + ((k−1)/2)²',
		yMin: 0, yMax: 4, yPasso: 1, yCasas: 0,
		faixa: { lo: 1, hi: 1 },
		xMaxCirc: 2.1, yMinCirc: -1.6,
		valido: k => Math.abs(g(k) - 1) < 1e-4,
		solucao: [[-1, -1], [-0.2, -0.2]], solucaoTexto: 'k = −1  ou  k = −1/5',
		atalhos: [['k = −2', -2], ['k = −1', -1], ['k = −0,5', -0.5], ['k = −0,2', -0.2], ['k = 0', 0], ['k = 1', 1]],
		valorTexto: k => { const [x, y] = Q(k); return `cos α = ${UT.fmt(x)}   sin α = ${UT.fmt(y)}   cos²α + sin²α = ${UT.fmt(g(k), 3)}`; },
		estado: k => { const [x, y] = Q(k); return `(${UT.fmt(x)} ; ${UT.fmt(y)}) está na circunferência`; },
		circulo(ut, k, ok, sol) {
			const { p, X, Y, O, COR } = ut;
			// trajetória de Q
			p.stroke(...COR.obj, 110); p.strokeWeight(1.5);
			ut.tracejado(X(-1.3), Y(-1.3 / 2 - 1), X(2.1), Y(2.1 / 2 - 1));
			ut.rot('y = x/2 − 1', X(-1.35), Y(-1.35), COR.obj, 16, p.LEFT, p.NORMAL);
			if (sol) { ut.ponto(0, -1, COR.ok, 12); ut.ponto(0.8, -0.6, COR.ok, 12); }
			const [x, y] = Q(k), cor = ok ? COR.ok : COR.nao;
			// projeções
			p.stroke(...cor, 160); p.strokeWeight(1.2);
			ut.tracejado(X(x), Y(y), X(x), O.y); ut.tracejado(X(x), Y(y), O.x, Y(y));
			p.stroke(...COR.circ, 80); p.line(O.x, O.y, X(x), Y(y));
			ut.rot('k+1', X(x), O.y + (y < 0 ? -16 : 16), COR.obj, 16);
			ut.rot('(k−1)/2', O.x + (x >= 0 ? -8 : 8), Y(y), COR.obj, 16, x >= 0 ? p.RIGHT : p.LEFT);
			ut.ponto(x, y, cor, 16);
			ut.rot('Q', X(x) + 14, Y(y) - 16, cor, 22, p.LEFT);
		}
	});
}

/* =====================================================================
   3.2   sin β = 1 − k/2  ∧  −45° < β ≤ 180°
   sin β ∈ ]−√2/2, 1]
   ===================================================================== */
{
	const v = k => 1 - k / 2, r2 = Math.SQRT2 / 2;
	const solucoes = k => {
		const s = v(k);
		if (s < -1 || s > 1) return [];
		const a = Math.asin(s) * 180 / Math.PI;
		return [a, 180 - a].filter((b, i, arr) => b > -45 && b <= 180 && arr.indexOf(b) === i);
	};
	SKETCHES['trig-p3b'] = exploradorK({
		kMin: -1, kMax: 5, kPasso: 0.01, kInicial: 1, kTick: 1, kCasas: 0,
		g: v, gNome: 'sin β = 1 − k/2',
		yMin: -1.5, yMax: 1.5, yPasso: 0.5, yCasas: 1,
		faixa: { lo: -r2, hi: 1, loAberto: true, hiAberto: false },
		valido: k => v(k) > -r2 + 1e-9 && v(k) <= 1 + 1e-9,
		solucao: [[0, 2 + Math.SQRT2, false, true]], solucaoTexto: 'k ∈ [0, 2 + √2[',
		atalhos: [['k = −1', -1], ['k = 0', 0], ['k = 1', 1], ['k = 2', 2], ['k = 3', 3], ['k = 2 + √2', 2 + Math.SQRT2]],
		valorTexto: k => `sin β = 1 − k/2 = ${UT.fmt(v(k), 3)}`,
		estado: k => 'β ≈ ' + solucoes(k).map(b => UT.fmt(b, 1) + '°').join('  ou  β ≈ '),
		circulo(ut, k, ok, sol) {
			const { p, X, Y, O, COR } = ut;
			ut.arco(-45, 180, true, false);
			ut.segEixo('y', -r2, 1, true, false);
			ut.rot('−√2/2', O.x - 12, Y(-r2), COR.faixa, 16, p.RIGHT);
			ut.rot('−45°', X(Math.cos(-Math.PI / 4)) + 14, Y(-r2) + 12, COR.faixa, 16, p.LEFT, p.NORMAL);
			const s = v(k), cor = ok ? COR.ok : COR.nao;
			if (s > -1.4 && s < 1.4) {
				p.stroke(...cor); p.strokeWeight(3);
				p.line(X(-1.3), Y(s), X(1.3), Y(s));
				ut.rot('y = 1 − k/2', X(1.3), Y(s) - 16, cor, 16, p.RIGHT);
			} else {
				ut.rot(s > 0 ? '↑ y = 1 − k/2 acima da figura' : '↓ y = 1 − k/2 abaixo da figura',
					X(0.3), s > 0 ? 70 : 530, COR.nao, 16, p.LEFT);
			}
			solucoes(k).forEach(b => {
				const t = p.radians(b);
				p.stroke(...COR.circ); p.strokeWeight(2);
				p.line(O.x, O.y, X(Math.cos(t)), Y(Math.sin(t)));
				ut.ponto(Math.cos(t), Math.sin(t), COR.ok, 15);
			});
		}
	});
}

/* =====================================================================
   3.3   cos x = k² − 3  ∧  0° ≤ x ≤ 90°
   cos x ∈ [0, 1]
   ===================================================================== */
{
	const v = k => k * k - 3;
	SKETCHES['trig-p3c'] = exploradorK({
		kMin: -2.5, kMax: 2.5, kPasso: 0.01, kInicial: 1, kTick: 0.5, kCasas: 1,
		g: v, gNome: 'cos x = k² − 3',
		yMin: -3.5, yMax: 3.5, yPasso: 1, yCasas: 0,
		faixa: { lo: 0, hi: 1, loAberto: false, hiAberto: false },
		valido: k => v(k) >= -1e-9 && v(k) <= 1 + 1e-9,
		solucao: [[-2, -Math.sqrt(3), false, false], [Math.sqrt(3), 2, false, false]],
		solucaoTexto: 'k ∈ [−2, −√3] ∪ [√3, 2]',
		atalhos: [['k = −2', -2], ['k = −√3', -Math.sqrt(3)], ['k = 0', 0], ['k = 1,8', 1.8], ['k = √3', Math.sqrt(3)], ['k = 2', 2]],
		valorTexto: k => `cos x = k² − 3 = ${UT.fmt(v(k), 3)}`,
		estado: k => `x ≈ ${UT.fmt(Math.acos(Math.min(1, Math.max(0, v(k)))) * 180 / Math.PI, 1)}°`,
		circulo(ut, k, ok, sol) {
			const { p, X, Y, O, COR } = ut;
			ut.arco(0, 90, false, false);
			ut.segEixo('x', 0, 1, false, false);
			const c = v(k), cor = ok ? COR.ok : COR.nao;
			if (c > -1.4 && c < 1.4) {
				p.stroke(...cor); p.strokeWeight(3);
				p.line(X(c), Y(-1.3), X(c), Y(1.3));
				ut.rot('x = k² − 3', X(c) + 8, Y(1.3) + 4, cor, 16, p.LEFT);
			} else {
				ut.rot(c > 0 ? 'x = k² − 3 à direita →' : '← x = k² − 3 à esquerda',
					c > 0 ? X(1.35) : X(-1.35), Y(1.2), COR.nao, 16, c > 0 ? p.RIGHT : p.LEFT);
			}
			if (ok) {
				const t = Math.acos(Math.min(1, Math.max(0, c)));
				p.stroke(...COR.circ); p.strokeWeight(2);
				p.line(O.x, O.y, X(Math.cos(t)), Y(Math.sin(t)));
				ut.ponto(Math.cos(t), Math.sin(t), COR.ok, 15);
			}
		}
	});
}

/* =====================================================================
   3.4   tan x = k − 2k²  ∧  180° ≤ x < 270°
   tan x ∈ [0, +∞[ ; T(1, tan x) na reta x = 1
   ===================================================================== */
{
	const v = k => k - 2 * k * k;
	SKETCHES['trig-p3d'] = exploradorK({
		kMin: -0.5, kMax: 1, kPasso: 0.005, kInicial: 0.75, kTick: 0.25, kCasas: 2,
		g: v, gNome: 'tan x = k − 2k²',
		yMin: -1.2, yMax: 0.4, yPasso: 0.2, yCasas: 1,
		faixa: { lo: 0, hi: Infinity, loAberto: false, hiAberto: true },
		valido: k => v(k) >= -1e-9,
		solucao: [[0, 0.5, false, false]], solucaoTexto: 'k ∈ [0, 1/2]',
		atalhos: [['k = −0,25', -0.25], ['k = 0', 0], ['k = 1/4', 0.25], ['k = 1/2', 0.5], ['k = 0,75', 0.75]],
		valorTexto: k => `tan x = k − 2k² = ${UT.fmt(v(k), 3)}`,
		estado: k => `x ≈ ${UT.fmt(180 + Math.atan(v(k)) * 180 / Math.PI, 1)}°`,
		circulo(ut, k, ok, sol) {
			const { p, X, Y, O, COR } = ut;
			ut.arco(180, 270, false, true);
			// reta x = 1 e tangentes do 3.º quadrante: [0, +∞[
			p.stroke(...COR.eixo, 150); p.strokeWeight(1.5);
			p.line(X(1), Y(-1.35), X(1), Y(1.35));
			ut.rot('x = 1', X(1) + 6, Y(-1.3), COR.eixo, 16, p.LEFT);
			p.stroke(...COR.faixa, 150); p.strokeWeight(7);
			p.line(X(1), O.y, X(1), Y(1.35));
			ut.extremo(X(1), O.y, false);
			const t = v(k), cor = ok ? COR.ok : COR.nao;
			const n = Math.sqrt(1 + t * t);
			// reta OT prolongada
			p.stroke(...COR.circ, 120); p.strokeWeight(1.3);
			ut.tracejado(X(-1.3), Y(-1.3 * t), X(1.3), Y(1.3 * t));
			// os dois pontos da circunferência na reta OT
			[[1 / n, t / n], [-1 / n, -t / n]].forEach(([x, y]) => {
				const no3Q = x < 0 && y <= 1e-9;
				ut.ponto(x, y, no3Q && ok ? COR.ok : [...COR.nao, 150], no3Q ? 16 : 11);
			});
			ut.ponto(1, t, cor, 15);
			ut.rot('T(1, k − 2k²)', X(1) + 12, Y(t) + (t >= 0 ? -16 : 16), cor, 17, p.LEFT);
			if (ok) {
				p.stroke(...COR.circ); p.strokeWeight(2);
				p.line(O.x, O.y, X(-1 / n), Y(-t / n));
			}
		}
	});
}
