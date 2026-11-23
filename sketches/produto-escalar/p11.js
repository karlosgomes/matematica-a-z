/* =====================================================================
   Produto escalar · Problema 11 — Área de um triângulo num cubo
   (Suneung 2022, opção Geometria, item 27; ~/MAT_A_26_27/geometria/coreia/coreia_exames.tex, n.º 34)
   Cubo [ABCDEFGH] de aresta 4, M ponto médio de [AD]; área de [MEG].
   Referencial com origem em E: E(0,0,0), F(4,0,0), G(4,4,0), H(0,4,0), A(0,0,4), B(4,0,4), C(4,4,4), D(0,4,4), M(0,2,4).
   EM = (0,2,4), EG = (4,4,0), EM·EG = 8, ‖EM‖ = √20, ‖EG‖ = √32, cos θ = 1/√10, sen θ = 3/√10,
   Área = ½·√20·√32·3/√10 = 12  → (D).
   Figura 3D à mão em perspetiva (como p10.js): a vista roda arrastando; arestas escondidas a tracejado.
   ===================================================================== */
(function () {
	const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
	const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	const unit = a => mul(a, 1 / Math.hypot(...a));

	const P = { E: [0, 0, 0], F: [4, 0, 0], G: [4, 4, 0], H: [0, 4, 0], A: [0, 0, 4], B: [4, 0, 4], C: [4, 4, 4], D: [0, 4, 4], M: [0, 2, 4] };
	const ARESTAS = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E'], ['A', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'H']];
	// faces (vértices e normal exterior): uma aresta está escondida se as duas faces dela estiverem viradas para trás
	const FACES = [[['A', 'B', 'C', 'D'], [0, 0, 1]], [['E', 'F', 'G', 'H'], [0, 0, -1]], [['A', 'B', 'F', 'E'], [0, -1, 0]],
		[['D', 'C', 'G', 'H'], [0, 1, 0]], [['A', 'D', 'H', 'E'], [-1, 0, 0]], [['B', 'C', 'G', 'F'], [1, 0, 0]]];

	SKETCHES['pe-p11'] = function (p, controlos) {
		const W = 920, H = 600;
		const G = { cx: 330, cy: 330, k: 64 };
		const CEN = [2, 2, 2];
		const COR = {
			texto: [30, 41, 59], cinza: [100, 116, 139], eixo: [148, 163, 184], cubo: [71, 85, 105],
			em: [21, 101, 192], eg: [123, 31, 162], tri: [234, 88, 12], pos: [46, 125, 50]
		};
		let az = -76, el = 18;
		let alvo = null;
		let F_ = [1, 0, 0], R_ = [0, 1, 0], U_ = [0, 0, 1];
		let cxRef, cxVet, cxSol;

		// nome de vetor com o arpão por cima, em HTML (para a legenda da caixa), como em p1.js
		const vec = l => '<span style="display:inline-block;position:relative;font-style:italic">' + l +
			'<span style="position:absolute;left:-0.05em;right:-0.15em;top:-0.62em;font-size:0.7em;font-style:normal;text-align:center;transform:scaleX(' + (l.length > 1 ? 2.2 : 1) + ')">⇀</span></span>';

		p.setup = function () {
			arrastar(p.createCanvas(W, H).elt);
			p.textFont('Source Sans Pro');
			p.createSpan('Arrasta para rodar o cubo ·').parent(controlos).addClass('dica-arrastar');
			UT.botao(p, controlos, 'Vista inicial', () => { alvo = [-76, 18]; }, 'atalho');
			UT.quebra(p, controlos);
			cxRef = UT.caixa(p, controlos, 'Referencial', false);
			cxVet = UT.caixa(p, controlos, 'Vetores ' + vec('EM') + ' e ' + vec('EG'), false);
			cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
			cxSol.changed(() => { if (cxSol.checked()) { cxRef.checked(true); cxVet.checked(true); } });
		};

		function arrastar(cv) {
			let ultimo = null;
			cv.style.cursor = 'grab'; cv.style.touchAction = 'none';
			cv.addEventListener('pointerdown', e => {
				alvo = null;
				ultimo = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing';
				e.stopPropagation();
			});
			cv.addEventListener('pointermove', e => {
				if (!ultimo) return;
				const esc = (window.Reveal && Reveal.getScale && Reveal.getScale()) || 1;
				const dx = (e.clientX - ultimo[0]) / esc, dy = (e.clientY - ultimo[1]) / esc;
				ultimo = [e.clientX, e.clientY];
				az -= dx * 0.4; if (az > 180) az -= 360; if (az < -180) az += 360;
				el = p.constrain(el + dy * 0.4, -60, 80);
			});
			const fim = () => { ultimo = null; cv.style.cursor = 'grab'; };
			cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
			['touchstart', 'touchmove', 'mousedown'].forEach(t => cv.addEventListener(t, e => e.stopPropagation(), { passive: true }));
		}

		/* ---------------- projeção (perspetiva) ---------------- */
		function camara() {
			const a = az * Math.PI / 180, e = el * Math.PI / 180;
			F_ = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
			R_ = [-Math.sin(a), Math.cos(a), 0];
			U_ = [-Math.sin(e) * Math.cos(a), -Math.sin(e) * Math.sin(a), Math.cos(e)];
		}
		const DIST = 19;
		const pr = v => {
			const w = sub(v, CEN), z = DIST - dot3(w, F_), s = G.k * DIST / Math.max(z, 0.5);
			return { x: G.cx + s * dot3(w, R_), y: G.cy - s * dot3(w, U_) };
		};

		/* ---------------- desenho de base ---------------- */
		function seg(a, b, cor, peso, alfa = 255) {
			const A = pr(a), B = pr(b);
			p.stroke(...cor, alfa); p.strokeWeight(peso); p.strokeCap(p.ROUND); p.line(A.x, A.y, B.x, B.y);
		}
		function seta(a, b, cor, peso = 3.5, alfa = 255) {
			const A = pr(a), B = pr(b);
			const dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy);
			const h = 16, recuo = l > h ? h * 0.8 / l : 0;
			seg(a, add(a, mul(sub(b, a), 1 - recuo)), cor, peso, alfa);
			if (l < 6) return;
			const ux = dx / l, uy = dy / l;
			p.noStroke(); p.fill(...cor, alfa);
			p.triangle(B.x, B.y, B.x - h * ux - h * 0.42 * uy, B.y - h * uy + h * 0.42 * ux,
				B.x - h * ux + h * 0.42 * uy, B.y - h * uy - h * 0.42 * ux);
		}
		function rot(t, x, y, cor = COR.texto, tam = 22, alfa = 255, estilo = p.BOLD, ah = p.CENTER) {
			p.stroke(255, alfa); p.strokeWeight(6); p.strokeJoin(p.ROUND);
			p.fill(...cor, alfa); p.textSize(tam); p.textStyle(estilo);
			p.textAlign(ah, p.CENTER); p.text(t, x, y);
		}
		function setinha(x, w, y, cor, tam, alfa = 255) {
			const yy = y - tam * 0.86, x1 = x + w + 2;
			p.stroke(...cor, alfa); p.strokeWeight(Math.max(1.5, tam / 13)); p.line(x - 1, yy, x1, yy);
			p.noStroke(); p.fill(...cor, alfa);
			p.triangle(x1 + 3, yy, x1 - 4 - 1, yy - 5, x1 - 4, yy);
		}
		// nome de vetor (letra com seta por cima) centrado em (x, y)
		function rotVet(t, x, y, cor, tam = 26, alfa = 255) {
			rot(t, x, y, cor, tam, alfa, p.BOLDITALIC);
			p.textSize(tam); p.textStyle(p.BOLDITALIC);
			const w = p.textWidth(t);
			// base do texto ≈ y + 0.3·tam (texto centrado na vertical)
			setinha(x - w / 2, w, y + tam * 0.3, cor, tam, alfa);
		}
		// texto às peças: [texto, cor, estilo, vetor?]; devolve a largura
		function frase(partes, x, y, tam = 22, so = false, alfa = 255) {
			p.textSize(tam); p.textAlign(p.LEFT, p.BASELINE);
			const x0 = x;
			partes.forEach(([t, cor, est, vet]) => {
				p.textStyle(est || (vet ? p.BOLDITALIC : p.NORMAL));
				const w = p.textWidth(t);
				if (!so) {
					p.noStroke(); p.fill(...(cor || COR.texto), alfa); p.text(t, x, y);
					if (vet) setinha(x, w, y, cor || COR.texto, tam, alfa);
				}
				x += w;
			});
			return x - x0;
		}
		function caixa(linhas, x0, y0, dy = 34, tam = 22, alinhaDir = false) {
			const wmax = Math.max(...linhas.map(l => frase(l, 0, 0, tam, true)));
			const bx = alinhaDir ? x0 - wmax - 24 : x0;
			p.stroke(203, 213, 225); p.strokeWeight(1.5); p.fill(255, 235);
			p.rect(bx, y0, wmax + 24, linhas.length * dy + 12, 8);
			linhas.forEach((l, i) => frase(l, bx + 12, y0 + 6 + dy * 0.78 + i * dy, tam));
		}
		const v = (s, cor) => [s, cor, p.BOLDITALIC, true];


		// ângulo θ entre EM e EG (em E)
		function angulo(u, w, cor, rr = 1.1) {
			const eu = unit(u), ew0 = unit(w);
			const cs = dot3(eu, ew0), th = Math.acos(cs);
			const ep = unit(sub(ew0, mul(eu, cs)));
			const Pt = s => add(mul(eu, rr * Math.cos(s)), mul(ep, rr * Math.sin(s)));
			const n = 30, pts = [];
			for (let i = 0; i <= n; i++) pts.push(pr(Pt(th * i / n)));
			const O = pr([0, 0, 0]);
			p.noStroke(); p.fill(...cor, 55);
			p.beginShape(); p.vertex(O.x, O.y); pts.forEach(q => p.vertex(q.x, q.y)); p.endShape(p.CLOSE);
			p.noFill(); p.stroke(...cor); p.strokeWeight(2.5);
			p.beginShape(); pts.forEach(q => p.vertex(q.x, q.y)); p.endShape();
			return pr(Pt(th / 2).map(x => x * 1.35));
		}

		p.draw = function () {
			if (alvo) {
				let d = alvo[0] - az; d -= 360 * Math.round(d / 360);
				const f = Math.min(1, p.deltaTime / 1000 * 4);
				az += d * f; el += (alvo[1] - el) * f;
				if (Math.abs(d) < 0.1 && Math.abs(alvo[1] - el) < 0.1) alvo = null;
			}
			camara();
			p.background(255);
			const ref = cxRef.checked(), vet = cxVet.checked(), sol = cxSol.checked();
			const olho = add(CEN, mul(F_, 19));
			const visivel = FACES.map(([vs, n]) => {
				const c = mul(vs.reduce((s, k) => add(s, P[k]), [0, 0, 0]), 1 / 4);
				return dot3(n, sub(olho, c)) > 0;
			});
			const escondida = (a, b) => !FACES.some(([vs], i) => visivel[i] && vs.includes(a) && vs.includes(b));

			// eixos (com origem em E)
			if (ref) [[[1, 0, 0], 'x'], [[0, 1, 0], 'y'], [[0, 0, 1], 'z']].forEach(([e, nome]) => {
				seta(mul(e, 4), mul(e, 6.3), COR.eixo, 1.8);
				const T = pr(mul(e, 6.7));
				rot(nome, T.x, T.y, COR.cinza, 22, 255, p.ITALIC);
			});
			// triângulo [MEG]
			const T3 = ['M', 'E', 'G'].map(k => pr(P[k]));
			p.noStroke(); p.fill(...COR.tri, 45);
			p.beginShape(); T3.forEach(q => p.vertex(q.x, q.y)); p.endShape(p.CLOSE);
			// arestas: escondidas a tracejado, as outras a cheio
			ARESTAS.forEach(([a, b]) => {
				const A = pr(P[a]), B = pr(P[b]);
				p.stroke(...COR.cubo); p.strokeWeight(2);
				if (escondida(a, b)) { p.drawingContext.setLineDash([7, 6]); p.strokeWeight(1.5); }
				p.line(A.x, A.y, B.x, B.y); p.drawingContext.setLineDash([]);
			});
			// lados do triângulo
			[['M', 'E'], ['E', 'G'], ['G', 'M']].forEach(([a, b]) => {
				if (vet && (b === 'G' && a === 'E' || a === 'M' && b === 'E')) return;
				seg(P[a], P[b], COR.tri, 3);
			});
			// vetores EM e EG, com o ângulo θ
			if (vet) {
				const L = angulo(P.M, P.G, COR.pos);
				rot('θ', L.x, L.y, COR.pos, 22, 255, p.BOLDITALIC);
				seta(P.E, P.M, COR.em, 4);
				seta(P.E, P.G, COR.eg, 4);
				const m1 = pr(mul(P.M, 0.55)), m2 = pr(mul(P.G, 0.6));
				rotVet('EM', m1.x - 30, m1.y, COR.em);
				rotVet('EG', m2.x, m2.y + 26, COR.eg);
			}
			// vértices
			const QC = pr(CEN);
			Object.entries(P).forEach(([k, q]) => {
				const Q = pr(q);
				p.stroke(255); p.strokeWeight(2); p.fill(...(k === 'M' ? COR.tri : COR.texto)); p.circle(Q.x, Q.y, k === 'M' ? 11 : 9);
				let dx = Q.x - QC.x, dy = Q.y - QC.y; const l = Math.hypot(dx, dy) || 1;
				const lx = Q.x + dx / l * 22, ly = Q.y + dy / l * 22;
				rot(k, lx, ly, k === 'M' ? COR.tri : COR.texto, 22, 255, p.BOLDITALIC);
				if (ref && 'EMG'.includes(k)) rot(`(${q.join(', ')})`, lx, ly + 20, COR.cinza, 16, 255, p.NORMAL);
			});

			// solução
			if (sol) {
				const N = COR.texto, V = COR.pos, em = v('EM', COR.em), eg = v('EG', COR.eg);
				caixa([
					[['E(0, 0, 0),  M(0, 2, 4),  G(4, 4, 0)', N]],
					[em, [' = (0, 2, 4),   ', N], eg, [' = (4, 4, 0)', N]],
					[em, [' · ', N], eg, [' = 0 + 8 + 0 = 8', N]],
					[['‖', N], em, ['‖ = √20,   ‖', N], eg, ['‖ = √32', N]],
					[['cos θ = 8 / (√20 × √32) = 1/√10', N]],
					[['sen θ = √(1 − 1/10) = 3/√10', N]],
					[['Área = ½ × √20 × √32 × 3/√10 = 12', V, p.BOLD]],
					[['→ (D)', V, p.BOLD]]
				], W - 12, 12, 34, 20, true);
			}
		};
	};
})();
