/* =====================================================================
   Produto escalar · Problema 12 — Um trapézio dentro do cilindro
   (Suneung 2026, opção Geometria, item 27; ~/MAT_A_26_27/geometria/coreia/coreia_exames.tex, n.º 45)
   Cilindro de bases C1, C2 com diâmetro 5; [AB] diâmetro de C1; C, D em C2 com CD = 3 e AD = BC;
   H pé da perpendicular de D para o plano de C1. Área [ABCD] = 4 × Área [ABH] ⇒ h = √21 → (D).
   Referencial: origem no centro de C1, base de baixo em xOy, eixo em Oz.
   A(−5/2, 0, 0), B(5/2, 0, 0), D(−3/2, 2, h), C(3/2, 2, h), H(−3/2, 2, 0).
   Área [ABH] = 5; [ABCD] trapézio de bases 5 e 3 e altura √(4 + h²) ⇒ 4√(4 + h²) = 20 ⇒ h = √21.
   Cilindro 3D à mão em perspetiva: a vista roda arrastando; arrastando C ou D muda-se a altura h
   (íman em √21). Partes escondidas a tracejado (lados no interior ou em faces viradas para trás).
   ===================================================================== */
(function () {
	const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
	const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	const R = 2.5, H21 = Math.sqrt(21), HMIN = 1.2, HMAX = 7;

	SKETCHES['pe-p12'] = function (p, controlos) {
		const W = 920, H = 600;
		const G = { cx: 300, cy: 330, k: 56 };
		const CEN = [0, 0, 2.6];
		const COR = {
			texto: [30, 41, 59], cinza: [100, 116, 139], eixo: [148, 163, 184], cil: [71, 85, 105],
			trap: [234, 88, 12], tri: [21, 101, 192], pos: [46, 125, 50]
		};
		let az = -90, el = 20, h = 3.2;
		let alvo = null, alvoH = null;
		let F_ = [1, 0, 0], R_ = [0, 1, 0], U_ = [0, 0, 1];
		let cxRef, cxSol, cxCheio;
		const pts = () => ({ A: [-R, 0, 0], B: [R, 0, 0], C: [1.5, 2, h], D: [-1.5, 2, h], H: [-1.5, 2, 0] });

		p.setup = function () {
			arrastar(p.createCanvas(W, H).elt);
			p.textFont('Source Sans Pro');
			p.createSpan('Arrasta para rodar · arrasta C ou D para mudar a altura ·').parent(controlos).addClass('dica-arrastar');
			UT.botao(p, controlos, 'Vista inicial', () => { alvo = [-90, 20]; }, 'atalho');
			UT.quebra(p, controlos);
			cxCheio = UT.caixa(p, controlos, 'Preencher as figuras', true);
			cxRef = UT.caixa(p, controlos, 'Referencial', false);
			cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
			cxSol.changed(() => { if (cxSol.checked()) { cxRef.checked(true); alvoH = H21; } });
		};

		// arrastar: perto de C ou de D muda a altura; noutro sítio roda a vista
		function arrastar(cv) {
			let ultimo = null, modo = null;
			cv.style.cursor = 'grab'; cv.style.touchAction = 'none';
			const noCanvas = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
			cv.addEventListener('pointerdown', e => {
				const [x, y] = noCanvas(e), P = pts();
				modo = ['C', 'D'].some(k => { const q = pr(P[k]); return Math.hypot(q.x - x, q.y - y) < 22; }) ? 'altura' : 'rodar';
				alvo = null; alvoH = null;
				ultimo = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing';
				e.stopPropagation();
			});
			cv.addEventListener('pointermove', e => {
				if (!ultimo) return;
				const esc = (window.Reveal && Reveal.getScale && Reveal.getScale()) || 1;
				const dx = (e.clientX - ultimo[0]) / esc, dy = (e.clientY - ultimo[1]) / esc;
				ultimo = [e.clientX, e.clientY];
				if (modo === 'altura') {
					// quanto sobe no ecrã uma unidade de z, junto de D
					const q0 = pr([-1.5, 2, h]), q1 = pr([-1.5, 2, h + 1]);
					const pz = Math.max(8, q0.y - q1.y);
					h = p.constrain(h - dy / pz, HMIN, HMAX);
					if (Math.abs(h - H21) < 0.08) h = H21;                       // íman em √21
				} else {
					az -= dx * 0.4; if (az > 180) az -= 360; if (az < -180) az += 360;
					el = p.constrain(el + dy * 0.4, -60, 80);
				}
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


		const tracejado = (a, b, cor, peso) => { p.drawingContext.setLineDash([8, 6]); seg(a, b, cor, peso); p.drawingContext.setLineDash([]); };

		p.draw = function () {
			if (alvo) {
				let d = alvo[0] - az; d -= 360 * Math.round(d / 360);
				const f = Math.min(1, p.deltaTime / 1000 * 4);
				az += d * f; el += (alvo[1] - el) * f;
				if (Math.abs(d) < 0.1 && Math.abs(alvo[1] - el) < 0.1) alvo = null;
			}
			if (alvoH !== null) {
				h += (alvoH - h) * Math.min(1, p.deltaTime / 1000 * 4);
				if (Math.abs(alvoH - h) < 0.005) { h = alvoH; alvoH = null; }
			}
			camara();
			p.background(255);
			const ref = cxRef.checked(), sol = cxSol.checked();
			const P = pts(), olho = add(CEN, mul(F_, 19));
			// visibilidade: base de baixo (normal −z), base de cima (+z), superfície lateral (normal radial)
			const baixoVe = olho[2] < 0, cimaVe = olho[2] > h;
			const latVe = phi => Math.cos(phi) * olho[0] + Math.sin(phi) * olho[1] - R > 0;
			// arco de circunferência (z fixo), cada pedaço a cheio se se vir pela base ou pela lateral
			const circ = (z, baseVe) => {
				const n = 96;
				for (let i = 0; i < n; i++) {
					const a0 = 2 * Math.PI * i / n, a1 = 2 * Math.PI * (i + 1) / n, am = (a0 + a1) / 2;
					const q0 = [R * Math.cos(a0), R * Math.sin(a0), z], q1 = [R * Math.cos(a1), R * Math.sin(a1), z];
					if (baseVe || latVe(am)) seg(q0, q1, COR.cil, 2);
					else tracejado(q0, q1, COR.cil, 1.3);
				}
			};
			// eixos (origem no centro de C1), desde a origem: a parte dentro do cilindro a tracejado, a de fora a cheio
			// (pedido do utilizador, 2026-11-24: as linhas do referencial têm de se ver)
			if (ref) [[[1, 0, 0], 'x', R, 4.8], [[0, 1, 0], 'y', R, 4.8], [[0, 0, 1], 'z', h, h + 1.6]].forEach(([e, nome, a, b]) => {
				tracejado([0, 0, 0], mul(e, a), COR.cinza, 1.6);
				seta(mul(e, a), mul(e, b), COR.cinza, 2);
				const T = pr(mul(e, b + 0.4));
				rot(nome, T.x, T.y, COR.cinza, 22, 255, p.ITALIC);
			});
			if (ref) { const O = pr([0, 0, 0]); p.noStroke(); p.fill(...COR.cinza); p.circle(O.x, O.y, 7); }
			circ(0, baixoVe);
			circ(h, cimaVe);
			// geratrizes do contorno (tangentes vistas do olho)
			const rho = Math.hypot(olho[0], olho[1]);
			if (rho > R) {
				const al = Math.atan2(olho[1], olho[0]), da = Math.acos(R / rho);
				[al - da, al + da].forEach(f => seg([R * Math.cos(f), R * Math.sin(f), 0], [R * Math.cos(f), R * Math.sin(f), h], COR.cil, 2));
			}
			// preenchimentos: trapézio [ABCD] e triângulo [ABH]
			const enche = (ks, cor, alfa) => { p.noStroke(); p.fill(...cor, alfa); p.beginShape(); ks.forEach(k => { const q = pr(P[k]); p.vertex(q.x, q.y); }); p.endShape(p.CLOSE); };
			if (cxCheio.checked()) { enche(['A', 'B', 'C', 'D'], COR.trap, 34); enche(['A', 'B', 'H'], COR.tri, 40); }
			// lados: «baixo»/«cima» = sobre uma base; «lat» = sobre a superfície lateral (ângulo); «int» = interior
			const phiD = Math.atan2(2, -1.5);
			const LADOS = [['A', 'B', 'baixo', COR.trap], ['B', 'C', 'int', COR.trap], ['C', 'D', 'cima', COR.trap], ['D', 'A', 'int', COR.trap],
				['A', 'H', 'baixo', COR.tri], ['H', 'B', 'baixo', COR.tri], ['D', 'H', 'lat', COR.cinza]];
			LADOS.forEach(([a, b, onde, cor]) => {
				const ve = onde === 'baixo' ? baixoVe : onde === 'cima' ? cimaVe : onde === 'lat' ? latVe(phiD) : false;
				if (ve) seg(P[a], P[b], cor, 3); else tracejado(P[a], P[b], cor, 2.2);
			});
			// ângulo reto em H
			{
				const u = [0, 0, 0.35], w = [0, -0.35, 0];
				const q = [P.H, add(P.H, u), add(add(P.H, u), w), add(P.H, w)].map(pr);
				p.noFill(); p.stroke(...COR.cinza); p.strokeWeight(1.5);
				p.line(q[1].x, q[1].y, q[2].x, q[2].y); p.line(q[2].x, q[2].y, q[3].x, q[3].y);
			}
			// pontos
			const QC = pr([0, 0, h / 2]);
			const COORD = { A: '(−5/2, 0, 0)', B: '(5/2, 0, 0)', C: '(3/2, 2, h)', D: '(−3/2, 2, h)', H: '(−3/2, 2, 0)' };
			Object.entries(P).forEach(([k, q]) => {
				const Q = pr(q);
				p.stroke(255); p.strokeWeight(2); p.fill(...COR.texto); p.circle(Q.x, Q.y, ['C', 'D'].includes(k) ? 12 : 9);
				let dx = Q.x - QC.x, dy = Q.y - QC.y; const l = Math.hypot(dx, dy) || 1;
				const lx = Q.x + dx / l * 22, ly = Q.y + dy / l * 22;
				rot(k, lx, ly, COR.texto, 22, 255, p.BOLDITALIC);
				if (ref) rot(COORD[k], lx, ly + 19, COR.cinza, 15, 255, p.NORMAL);
			});
			// C1 e C2
			const c1 = pr([-R * 0.8, -R * 0.75, 0]), c2 = pr([-R * 0.8, -R * 0.75, h]);
			rot('C₁', c1.x - 26, c1.y + 14, COR.cinza, 20, 255, p.ITALIC);
			rot('C₂', c2.x - 26, c2.y - 14, COR.cinza, 20, 255, p.ITALIC);

			// leitura em tempo real
			const aTrap = 4 * Math.sqrt(4 + h * h), certo = Math.abs(h - H21) < 1e-9;
			const N = COR.texto, cl = certo ? COR.pos : N;
			caixa([
				[['h ≈ ' + UT.fmt(h, 2), COR.cinza]],
				[['Área [ABCD] ≈ ' + UT.fmt(aTrap, 2), COR.trap]],
				[['4 × Área [ABH] = 4 × 5 = 20', COR.tri]],
				[[certo ? 'iguais ✓  ⇒  h = √21' : (aTrap < 20 ? 'ainda menor' : 'já maior'), cl, certo ? p.BOLD : p.NORMAL]]
			], 12, 12, 32, 19);

			if (sol) {
				const V = COR.pos;
				caixa([
					[['A(−5/2, 0, 0), B(5/2, 0, 0): [AB] é diâmetro de C₁', N]],
					[['AD = BC e CD = 3  ⇒  D(−3/2, 2, h), C(3/2, 2, h)', N]],
					[['(2 é a ordenada: (3/2)² + 2² = (5/2)²)', COR.cinza]],
					[['H(−3/2, 2, 0): Área [ABH] = 5 × 2 / 2 = 5', N]],
					[v('DC', COR.trap), [' = (3, 0, 0) colinear com ', N], v('AB', COR.trap), [': trapézio', N]],
					[['altura do trapézio = dist. de D ao eixo Ox = √(4 + h²)', N]],
					[['(5 + 3)/2 × √(4 + h²) = 4 × 5  ⇔  √(4 + h²) = 5', N]],
					[['⇔  h = √21   → (D)', V, p.BOLD]]
				], W - 12, 12, 31, 18, true);                  // em cima, à direita: o eixo x (à direita do cilindro) fica à vista
			}
		};
	};
})();
