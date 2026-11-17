/* =====================================================================
   Produto escalar · Problema 8 — [AB] e o plano xOy
   A(−1, 1, −2), B(2, 4, 1);  AB = (3, 3, 3)
   X(t) = A + t·AB = (−1 + 3t, 1 + 3t, −2 + 3t),  t ∈ [0, 1]
   z = 0  ⇔  t = 2/3  ⇒  P = (1, 3, 0);   AP = (2/3)·‖AB‖ = (2/3)·3√3 = 2√3   → (B)
   Figura 3D à mão em perspetiva (como espaco.js): a vista roda arrastando o fundo;
   o ponto X arrasta-se ao longo de [AB] (t de 1/30 em 1/30).
   ===================================================================== */
(function () {
	const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
	const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

	const A = [-1, 1, -2], B = [2, 4, 1], AB = sub(B, A);
	const PSOL = [1, 3, 0];
	const N = 30;                        // t = k/30
	const mdc = (a, b) => b ? mdc(b, a % b) : a;
	// t = k/30 como fração irredutível
	const fracT = k => { if (k === 0) return '0'; if (k === N) return '1'; const d = mdc(k, N); return (k / d) + '/' + (N / d); };
	// coordenada com uma casa decimal (3t = k/10), sem «,0»
	const num = x => { const r = Math.round(x * 10) / 10; const s = Number.isInteger(r) ? '' + Math.abs(r) : UT.fmt(Math.abs(r), 1); return (r < 0 ? '−' : '') + s; };

	SKETCHES['pe-p8'] = function (p, controlos) {
		const W = 920, H = 600;
		const G = { cx: 565, cy: 365, k: 78 };
		const CEN = [0.6, 2.0, -0.4];       // centro da vista
		const COR = {
			texto: [30, 41, 59], cinza: [100, 116, 139], eixo: [71, 85, 105], grelha: [148, 163, 184],
			plano: [96, 125, 139], seg: [230, 81, 0], zero: [239, 108, 0], verde: [46, 125, 50], azul: [21, 101, 192]
		};

		let az = -38, el = 12;
		let F_ = [1, 0, 0], R_ = [0, 1, 0], U_ = [0, 0, 1];
		let k = 9;                           // X = A + (k/30)·AB
		let cxSol;
		let modo = null;                     // 'X' ou 'rodar'

		p.setup = function () {
			arrastar(p.createCanvas(W, H).elt);
			p.textFont('Source Sans Pro');
			p.createSpan('Arrasta X ao longo de [AB] · arrasta o fundo para rodar a vista ·').parent(controlos).addClass('dica-arrastar');
			UT.botao(p, controlos, 'X em A', () => { k = 0; }, 'atalho');
			UT.botao(p, controlos, 'X em B', () => { k = N; }, 'atalho');
			UT.quebra(p, controlos);
			cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
		};

		/* ---------------- projeção (perspetiva) ---------------- */
		function camara() {
			const a = az * Math.PI / 180, e = el * Math.PI / 180;
			F_ = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
			R_ = [-Math.sin(a), Math.cos(a), 0];
			U_ = [-Math.sin(e) * Math.cos(a), -Math.sin(e) * Math.sin(a), Math.cos(e)];
		}
		const DIST = 19;
		const olho = () => add(CEN, mul(F_, DIST));
		const pr = v => {
			const w = sub(v, CEN), z = DIST - dot3(w, F_), s = G.k * DIST / Math.max(z, 0.5);
			return { x: G.cx + s * dot3(w, R_), y: G.cy - s * dot3(w, U_) };
		};

		// região do plano xOy que se desenha
		const PX0 = -2, PX1 = 3.5, PY0 = -1, PY1 = 5;
		// X escondido pelo plano xOy? (segmento de X até ao olho atravessa a região desenhada)
		function oculto(X) {
			const E = olho(), dz = E[2] - X[2];
			if (Math.abs(dz) < 1e-9) return false;
			const t = -X[2] / dz;
			if (t <= 1e-3 || t >= 1) return false;
			const x = X[0] + (E[0] - X[0]) * t, y = X[1] + (E[1] - X[1]) * t;
			return x >= PX0 && x <= PX1 && y >= PY0 && y <= PY1;
		}

		/* ---------------- arrastar ---------------- */
		function arrastar(cv) {
			let ultimo = null;
			cv.style.cursor = 'grab'; cv.style.touchAction = 'none';
			const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
			const pertoX = (x, y) => { const q = pr(add(A, mul(AB, k / N))); return Math.hypot(q.x - x, q.y - y) < 28; };
			cv.addEventListener('pointerdown', e => {
				const [x, y] = pos(e);
				modo = pertoX(x, y) ? 'X' : 'rodar';
				ultimo = [e.clientX, e.clientY];
				cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing';
				e.stopPropagation(); e.preventDefault();
			});
			cv.addEventListener('pointermove', e => {
				const [x, y] = pos(e);
				if (!modo) { cv.style.cursor = 'grab'; return; }
				if (modo === 'X') {
					// o valor de k cujo ponto projetado fica mais perto do ponteiro
					let best = k, bd = Infinity;
					for (let i = 0; i <= N; i++) {
						const q = pr(add(A, mul(AB, i / N))), d = Math.hypot(q.x - x, q.y - y);
						if (d < bd) { bd = d; best = i; }
					}
					k = best;
					return;
				}
				const esc = (window.Reveal && Reveal.getScale && Reveal.getScale()) || 1;
				const dx = (e.clientX - ultimo[0]) / esc, dy = (e.clientY - ultimo[1]) / esc;
				ultimo = [e.clientX, e.clientY];
				az -= dx * 0.4; if (az > 180) az -= 360; if (az < -180) az += 360;
				el = p.constrain(el + dy * 0.4, -60, 80);
			});
			const fim = () => { modo = null; ultimo = null; cv.style.cursor = 'grab'; };
			cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
			['touchstart', 'touchmove', 'mousedown'].forEach(t => cv.addEventListener(t, e => e.stopPropagation(), { passive: true }));
		}

		/* ---------------- desenho de base ---------------- */
		// segmento 3D: troços visíveis a cheio, escondidos pelo plano a tracejado e esbatidos
		function seg(a, b, cor, peso, alfa = 255) {
			const n = 60, pts = [], esc = [];
			for (let i = 0; i <= n; i++) pts.push(pr(add(a, mul(sub(b, a), i / n))));
			for (let i = 0; i < n; i++) esc.push(oculto(add(a, mul(sub(b, a), (i + 0.5) / n))));
			p.noFill(); p.strokeWeight(peso); p.strokeCap(p.ROUND);
			let i = 0;
			while (i < n) {
				let j = i;
				while (j < n && esc[j] === esc[i]) j++;
				p.stroke(...cor, esc[i] ? alfa * 0.55 : alfa);
				if (esc[i]) p.drawingContext.setLineDash([8, 7]);
				p.line(pts[i].x, pts[i].y, pts[j].x, pts[j].y);
				p.drawingContext.setLineDash([]);
				i = j;
			}
		}
		function seta(a, b, cor, peso = 2) {
			const P1 = pr(a), P2 = pr(b);
			const dx = P2.x - P1.x, dy = P2.y - P1.y, l = Math.hypot(dx, dy);
			const h = 14, recuo = l > h ? h * 0.8 / l : 0;
			seg(a, add(a, mul(sub(b, a), 1 - recuo)), cor, peso);
			if (l < 6) return;
			const ux = dx / l, uy = dy / l, esc = oculto(b);
			p.noStroke(); p.fill(...cor, esc ? 140 : 255);
			p.triangle(P2.x, P2.y, P2.x - h * ux - h * 0.42 * uy, P2.y - h * uy + h * 0.42 * ux,
				P2.x - h * ux + h * 0.42 * uy, P2.y - h * uy - h * 0.42 * ux);
		}
		function rot(t, x, y, cor = COR.texto, tam = 22, alfa = 255, estilo = p.BOLD, ah = p.CENTER) {
			p.stroke(255, alfa); p.strokeWeight(6); p.strokeJoin(p.ROUND);
			p.fill(...cor, alfa); p.textSize(tam); p.textStyle(estilo);
			p.textAlign(ah, p.CENTER); p.text(t, x, y);
		}
		function setinha(x, w, y, cor, tam) {
			const yy = y - tam * 0.86, x1 = x + w + 2;
			p.stroke(...cor); p.strokeWeight(Math.max(1.6, tam / 13)); p.line(x - 1, yy, x1, yy);
			p.noStroke(); p.fill(...cor);
			p.triangle(x1 + 3, yy, x1 - 4, yy - 3.5, x1 - 4, yy + 3.5);
		}
		// ponto com nome e (opcional) coordenadas pequenas a seguir
		function ponto(X, nome, cor, coords, dir = [1, -1], tam = 12) {
			const Q = pr(X), esc = oculto(X), alfa = esc ? 150 : 255;
			p.stroke(255); p.strokeWeight(2); p.fill(...cor, alfa); p.circle(Q.x, Q.y, tam);
			if (!nome) return;
			const lx = Q.x + dir[0] * 20, ly = Q.y + dir[1] * 20;
			p.textSize(26); p.textStyle(p.BOLDITALIC);
			const w = p.textWidth(nome);
			if (dir[0] >= 0) {
				rot(nome, lx, ly, cor, 26, alfa, p.BOLDITALIC, p.LEFT);
				if (coords) rot(coords, lx + w + 3, ly + 2, cor, 18, alfa, p.NORMAL, p.LEFT);
			} else {
				p.textSize(18); p.textStyle(p.NORMAL);
				const wc = coords ? p.textWidth(coords) + 3 : 0;
				rot(nome, lx - wc, ly, cor, 26, alfa, p.BOLDITALIC, p.RIGHT);
				if (coords) rot(coords, lx, ly + 2, cor, 18, alfa, p.NORMAL, p.RIGHT);
			}
		}

		function planoXOy() {
			const c = [[PX0, PY0], [PX1, PY0], [PX1, PY1], [PX0, PY1]].map(([x, y]) => pr([x, y, 0]));
			p.noStroke(); p.fill(...COR.plano, 34);
			p.beginShape(); c.forEach(q => p.vertex(q.x, q.y)); p.endShape(p.CLOSE);
			p.stroke(...COR.grelha, 110); p.strokeWeight(1);
			for (let i = Math.ceil(PX0); i <= PX1; i++) { const a = pr([i, PY0, 0]), b = pr([i, PY1, 0]); p.line(a.x, a.y, b.x, b.y); }
			for (let j = Math.ceil(PY0); j <= PY1; j++) { const a = pr([PX0, j, 0]), b = pr([PX1, j, 0]); p.line(a.x, a.y, b.x, b.y); }
			p.stroke(...COR.plano, 150); p.strokeWeight(1.5); p.noFill();
			p.beginShape(); c.forEach(q => p.vertex(q.x, q.y)); p.endShape(p.CLOSE);
			const K = pr([PX1 - 0.3, PY1 - 1.2, 0]);
			rot('xOy', K.x, K.y, COR.plano, 22, 230, p.ITALIC);
		}
		function eixos() {
			[[[1, 0, 0], "x", -2.2, 4.0], [[0, 1, 0], "y", -1.2, 6.4], [[0, 0, 1], "z", -3.0, 2.4]].forEach(([e, nome, m, L]) => {
				seta(mul(e, m), mul(e, L), COR.eixo, 2);
				const T = pr(mul(e, L + 0.4));
				rot(nome, T.x, T.y, COR.eixo, 22, 255, p.ITALIC);
			});
			const O = pr([0, 0, 0]);
			rot('O', O.x - 14, O.y + 16, COR.eixo, 20, 255, p.ITALIC);
		}

		/* ---------------- painel de texto ---------------- */
		// partes: [texto, cor, estilo, vetor?]
		function frase(partes, x, y, tam = 24, so = false) {
			p.textSize(tam); p.textAlign(p.LEFT, p.BASELINE);
			partes.forEach(([t, cor, est, vet]) => {
				p.textStyle(est || p.NORMAL);
				const w = p.textWidth(t);
				if (!so) { p.noStroke(); p.fill(...(cor || COR.texto)); p.text(t, x, y); if (vet) setinha(x, w, y, cor || COR.texto, tam); }
				x += w;
			});
			return x;
		}
		function caixa(linhas, x0, y0, dy = 36, tam = 24, alinhaDir = false) {
			const wmax = Math.max(...linhas.map(l => frase(l, 0, 0, tam, true)));
			const bx = alinhaDir ? x0 - wmax - 24 : x0;
			p.stroke(203, 213, 225); p.strokeWeight(1.5); p.fill(255, 235);
			p.rect(bx, y0, wmax + 24, linhas.length * dy + 12, 8);
			linhas.forEach((l, i) => frase(l, bx + 12, y0 + 6 + dy * 0.78 + i * dy, tam));
		}

		/* ---------------- desenho ---------------- */
		p.draw = function () {
			camara();
			p.background(255);
			const sol = cxSol.checked();
			const t = k / N, X = add(A, mul(AB, t)), z = X[2];
			const zz = Math.abs(z) < 1e-9;

			planoXOy();
			eixos();

			// segmento [AB] (a parte escondida pelo plano a tracejado)
			seg(A, B, COR.seg, 4);
			// com a solução: [AP] realçado
			if (sol) {
				seg(A, PSOL, COR.verde, 7, 120);
				const M = pr(add(A, mul(AB, 1 / 3))), Q1 = pr(A), Q2 = pr(PSOL);
				const nx = -(Q2.y - Q1.y), ny = Q2.x - Q1.x, l = Math.hypot(nx, ny) || 1, s = nx / l > 0 ? 1 : -1;
				rot('AP = 2√3', M.x + s * nx / l * 52, M.y + s * ny / l * 52, COR.verde, 22, 255, p.BOLD);
			}

			ponto(A, 'A', COR.texto, '(−1, 1, −2)', [-1, 0.4]);
			ponto(B, 'B', COR.texto, '(2, 4, 1)', [1, -0.6]);
			if (sol) ponto(PSOL, 'P', COR.verde, '(1, 3, 0)', [1, 0.7], 14);

			// ponto X, na cor laranja quando está no plano (z = 0)
			const corX = zz ? COR.zero : COR.azul;
			const QX = pr(X);
			p.noFill(); p.stroke(...corX, 70); p.strokeWeight(8); p.circle(QX.x, QX.y, 26);
			ponto(X, 'X', corX, null, [-0.9, -0.9], 15);

			// painel com X(t) e a cota
			const T = COR.texto, cz = zz ? COR.zero : T;
			const v = (s, c = T) => [s, c, p.BOLDITALIC, true];
			const linhas = [
				[['X = A + t ', T], v('AB'), ['   (0 ≤ t ≤ 1)', COR.cinza]],
				[v('AB'), [' = B − A = (3, 3, 3)', T]],
				[['t = ' + fracT(k), corX, p.BOLD], ['     X = (' + num(X[0]) + ', ' + num(X[1]) + ', ' + num(X[2]) + ')', T]],
				[['z = −2 + 3t = ' + num(z), cz, zz ? p.BOLD : p.NORMAL], [zz ? '   ⇒  X ∈ xOy' : (z < 0 ? '   (abaixo de xOy)' : '   (acima de xOy)'), zz ? COR.zero : COR.cinza]]
			];
			caixa(linhas, 12, 12);

			if (sol) {
				const V = COR.verde;
				caixa([
					[['z = 0  ⇔  −2 + 3t = 0  ⇔  t = 2/3', T]],
					[['P = (1, 3, 0)', V, p.BOLD]],
					[['‖', T], v('AB'), ['‖ = √(9 + 9 + 9) = 3√3', T]],
					[['AP = (2/3) × 3√3 = ', T], ['2√3', V, p.BOLD], ['   → (B)', V, p.BOLD]]
				], W - 12, H - 12 - 4 * 34 - 12, 34, 22, true);
			}
		};
	};
})();
