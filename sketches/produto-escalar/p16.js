/* =====================================================================
   Produto escalar · Problema 16 — Tabela de produtos escalares
   ‖a‖ = ‖b‖ = ‖c‖ = √2,  a·b = 1,  b·c = 0,  a·c = −√2
   Ângulos: (a, b) = 60°, (b, c) = 90°, (a, c) = 135°
   Coordenadas concretas que verificam a tabela:
       b = (√2, 0, 0),  c = (0, √2, 0),  a = (1/√2, −1, 1/√2)
   16.1 sem a lei dos cossenos (pedido do utilizador, 2026-11-22): ‖a‖ = ‖b‖ = ‖c‖, logo [OAB], [OBC], [OAC]
   são isósceles com os mesmos lados iguais; o lado oposto a O cresce com o ângulo em O:
   (a, b) agudo < (b, c) reto < (a, c) obtuso  ⇒  AB < BC < AC  → (D)
   (AB = √2, BC = 2, AC = √(4 + 2√2) ≈ 2,61 ficam na figura só como verificação)
   Botões 16.1–16.3 destacam a alínea no enunciado (div.item-al.atual / .outra).
   Figura 3D à mão em perspetiva (como espaco.js): a vista roda arrastando.
   ===================================================================== */
(function () {
	const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
	const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	const unit = a => mul(a, 1 / Math.hypot(...a));
	const r2 = Math.SQRT2;

	const VA = [1 / r2, -1, 1 / r2], VB = [r2, 0, 0], VC = [0, r2, 0];

	SKETCHES['pe-p16'] = function (p, controlos) {
		const W = 920, H = 600;
		const G = { cx: 330, cy: 320, k: 170 };
		const CEN = [0.5, 0.1, 0.2];
		const COR = {
			texto: [30, 41, 59], cinza: [100, 116, 139], eixo: [148, 163, 184], tri: [100, 116, 139],
			a: [21, 101, 192], b: [123, 31, 162], c: [0, 131, 143],
			pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47]
		};
		const VET = { a: VA, b: VB, c: VC };
		// pares: produto escalar (texto), sinal, ângulo
		const PARES = {
			ab: { u: 'a', v: 'b', txt: '1', s: 1, ang: '60°' },
			bc: { u: 'b', v: 'c', txt: '0', s: 0, ang: '90°' },
			ac: { u: 'a', v: 'c', txt: '−√2', s: -1, ang: '135°' }
		};

		let az = 120, el = 30;
		let alvo = null;                     // [az, el] para onde a vista roda ao escolher um par
		let F_ = [1, 0, 0], R_ = [0, 1, 0], U_ = [0, 0, 1];
		let al = 0, cxSol, itens = [];
		const botoes = {};
		const PAR_DE = { 2: 'bc', 3: 'ac' };
		const cor = k => PARES[k].s > 0 ? COR.pos : PARES[k].s < 0 ? COR.neg : COR.zero;   // cor do sinal do par
		const VISTA1 = [120, 30];            // 16.1: a vista inicial

		p.setup = function () {
			arrastar(p.createCanvas(W, H).elt);
			p.textFont('Source Sans Pro');
			p.createSpan('Arrasta para rodar a vista ·').parent(controlos).addClass('dica-arrastar');
			[1, 2, 3].forEach(a => {
				botoes[a] = UT.botao(p, controlos, `16.${a}`, () => escolher(al === a ? 0 : a));
			});
			UT.quebra(p, controlos);
			cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
			itens = [...controlos.closest('section').querySelectorAll('.item-al')];
			escolher(0);
		};
		// a alínea escolhida: botão azul (os outros claros) e destaque no enunciado
		function escolher(a) {
			al = a;
			Object.entries(botoes).forEach(([k, b]) => +k === al ? b.removeClass('atalho') : b.addClass('atalho'));
			itens.forEach((el, i) => { el.classList.toggle('atual', al === i + 1); el.classList.toggle('outra', al !== 0 && al !== i + 1); });
			if (PAR_DE[al]) alvo = vistaDe(PAR_DE[al]);
			else if (al === 1) alvo = VISTA1;
		}

		// vista perpendicular ao plano dos dois vetores do par (o ângulo aparece em verdadeira grandeza)
		function vistaDe(k) {
			const u = VET[PARES[k].u], w = VET[PARES[k].v];
			let n = unit([u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]);
			if (n[2] < 0) n = mul(n, -1);
			const e = Math.min(Math.asin(n[2]) * 180 / Math.PI, 72);
			const a = Math.hypot(n[0], n[1]) < 1e-6 ? az : Math.atan2(n[1], n[0]) * 180 / Math.PI;
			return [a, e];
		}

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

		function eixos() {
			[[[1, 0, 0], 'x'], [[0, 1, 0], 'y'], [[0, 0, 1], 'z']].forEach(([e, nome]) => {
				seta(mul(e, -1.1), mul(e, 2.3), COR.eixo, 1.6);
				const T = pr(mul(e, 2.5));
				rot(nome, T.x, T.y, COR.cinza, 22, 255, p.ITALIC);
			});
		}

		// ângulo entre os vetores u e w (a partir de O): arco, ou quadrado se reto
		function angulo(u, w, cor, rr = 0.42) {
			const eu = unit(u), ew0 = unit(w);
			const cs = dot3(eu, ew0), th = Math.acos(Math.max(-1, Math.min(1, cs)));
			const ep = unit(sub(ew0, mul(eu, cs)));          // perpendicular a u, no plano de u e w
			const P = s => add(mul(eu, rr * Math.cos(s)), mul(ep, rr * Math.sin(s)));
			if (Math.abs(cs) < 1e-9) {
				const q = rr * 0.7;
				const c1 = mul(eu, q), c2 = add(mul(eu, q), mul(ew0, q)), c3 = mul(ew0, q);
				const Q = [[0, 0, 0], c1, c2, c3].map(pr);
				p.noStroke(); p.fill(...cor, 50); p.beginShape(); Q.forEach(q => p.vertex(q.x, q.y)); p.endShape(p.CLOSE);
				seg(c1, c2, cor, 2.5); seg(c2, c3, cor, 2.5);
			} else {
				const n = 40, pts = [];
				for (let i = 0; i <= n; i++) pts.push(pr(P(th * i / n)));
				const O = pr([0, 0, 0]);
				p.noStroke(); p.fill(...cor, 50);
				p.beginShape(); p.vertex(O.x, O.y); pts.forEach(q => p.vertex(q.x, q.y)); p.endShape(p.CLOSE);
				p.noFill(); p.stroke(...cor); p.strokeWeight(2.5);
				p.beginShape(); pts.forEach(q => p.vertex(q.x, q.y)); p.endShape();
			}
			// ponto (no ecrã) na bissetriz, um pouco fora do arco, para o texto
			return pr(P(th / 2).map(x => x * 0.62));
		}

		// 16.1: os três triângulos isósceles [OAB], [OBC], [OAC] lado a lado, em verdadeira grandeza
		function leque() {
			const R = 78, y0 = H - 58;                       // comprimento dos lados iguais (√2); y do vértice O
			const T = [['ab', 'A', 'B', 'AB', 'agudo'], ['bc', 'B', 'C', 'BC', 'reto'], ['ac', 'A', 'C', 'AC', 'obtuso']];
			const larg = T.map(([k]) => 2 * R * Math.sin(Math.acos(dot3(unit(VET[PARES[k].u]), unit(VET[PARES[k].v]))) / 2));
			const gap = 34, total = larg.reduce((x, y) => x + y) + 2 * gap;
			p.stroke(203, 213, 225); p.strokeWeight(1.5); p.fill(255, 235);
			p.rect(W - 12 - total - 36, y0 - R - 40, total + 24, R + 40 + 46, 8);
			let x = W - 12 - total - 24;
			T.forEach(([k, X, Y, nome, tipo], i) => {
				const q = PARES[k], th = Math.acos(dot3(unit(VET[q.u]), unit(VET[q.v]))), cs = cor(k);
				const ox = x + larg[i] / 2, h = R * Math.cos(th / 2);
				const P1 = [ox - larg[i] / 2, y0 - h], P2 = [ox + larg[i] / 2, y0 - h];
				// ângulo em O
				p.noStroke(); p.fill(...cs, 60);
				p.arc(ox, y0, 52, 52, -Math.PI / 2 - th / 2, -Math.PI / 2 + th / 2, p.PIE);
				// lados iguais (cores dos vetores) e o lado oposto
				p.strokeWeight(3); p.stroke(...COR[q.u]); p.line(ox, y0, ...P1);
				p.stroke(...COR[q.v]); p.line(ox, y0, ...P2);
				p.stroke(...COR.texto); p.strokeWeight(4); p.line(...P1, ...P2);
				rot(nome, ox, y0 - h - 16, COR.texto, 18, 255, p.BOLD);
				rot(X, P1[0] - 9, P1[1] + 2, COR.texto, 16, 255, p.BOLDITALIC);
				rot(Y, P2[0] + 9, P2[1] + 2, COR.texto, 16, 255, p.BOLDITALIC);
				rot('O', ox, y0 + 13, COR.texto, 15, 255, p.ITALIC);
				rot(tipo, ox, y0 + 30, cs, 17, 255, p.BOLD);
				x += larg[i] + gap;
			});
		}

		/* ---------------- desenho ---------------- */
		p.draw = function () {
			if (alvo) {
				// rodar a vista suavemente até ao alvo (pelo caminho mais curto em az)
				let d = alvo[0] - az; d -= 360 * Math.round(d / 360);
				const f = Math.min(1, p.deltaTime / 1000 * 4);
				az += d * f; el += (alvo[1] - el) * f;
				if (Math.abs(d) < 0.1 && Math.abs(alvo[1] - el) < 0.1) alvo = null;
			}
			camara();
			p.background(255);
			const sol = cxSol.checked();
			const O = [0, 0, 0];
			const PT = { A: VA, B: VB, C: VC };
			const sel = PAR_DE[al] ? PARES[PAR_DE[al]] : null;
			const QG = pr(mul(add(add(VA, VB), VC), 1 / 3));     // centro do triângulo, no ecrã

			eixos();

			// triângulo [ABC]
			const T3 = [VA, VB, VC].map(pr);
			p.noStroke(); p.fill(...COR.tri, 28);
			p.beginShape(); T3.forEach(q => p.vertex(q.x, q.y)); p.endShape(p.CLOSE);
			[['A', 'B'], ['B', 'C'], ['A', 'C']].forEach(([X, Y]) => seg(PT[X], PT[Y], COR.tri, 2.5, 200));

			// vetores a partir de O (esbatidos os que não estão no par escolhido)
			const Q0 = pr(O);
			['a', 'b', 'c'].forEach(n => {
				const ativo = !sel || sel.u === n || sel.v === n, alfa = ativo ? 255 : 70;
				seta(O, VET[n], COR[n], ativo && sel ? 4.5 : 3.5, alfa);
				// nome do vetor a meio, afastado da seta
				const M = pr(mul(VET[n], 0.55)), E = pr(VET[n]);
				let dx = E.x - Q0.x, dy = E.y - Q0.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
				// do lado da seta oposto ao centro do triângulo
				const nx = -dy, ny = dx, s = (QG.x - M.x) * nx + (QG.y - M.y) * ny > 0 ? -1 : 1;
				rotVet(n, M.x + s * nx * 24, M.y + s * ny * 24, COR[n], 26, alfa);
			});

			// ângulo do par escolhido, com a célula da tabela
			if (sel) {
				const cs = sel.s > 0 ? COR.pos : sel.s < 0 ? COR.neg : COR.zero;
				const L = angulo(VET[sel.u], VET[sel.v], cs);
				if (sol) rot(sel.ang, L.x, L.y, cs, 20, 255, p.BOLD);
			}
			// 16.1: os três ângulos em O (raios diferentes para não se sobreporem)
			if (al === 1) {
				[['ab', 0.5], ['bc', 0.42], ['ac', 0.34]].forEach(([k, rr]) => {
					const L = angulo(VET[PARES[k].u], VET[PARES[k].v], cor(k), rr);
				});
			}

			// pontos A, B, C (nome para fora do triângulo)
			['A', 'B', 'C'].forEach(n => {
				const Q = pr(PT[n]);
				p.stroke(255); p.strokeWeight(2); p.fill(...COR.texto); p.circle(Q.x, Q.y, 11);
				let dx = Q.x - QG.x, dy = Q.y - QG.y; const l = Math.hypot(dx, dy) || 1;
				rot(n, Q.x + dx / l * 22, Q.y + dy / l * 22, COR.texto, 24, 255, p.BOLDITALIC);
			});
			rot('O', Q0.x - 4, Q0.y + 22, COR.texto, 22, 255, p.ITALIC);

			// comprimentos dos lados (com a solução da 16.1, só como verificação)
			if (sol && al === 1) {
				const lado = (X, Y, Z, t) => {
					// ponto do lado mais afastado (no ecrã) do terceiro vértice e de O
					const QZ = pr(PT[Z]);
					let M = null, md = -1;
					[0.5, 0.38, 0.62, 0.28, 0.72].forEach(f => {
						const q = pr(add(mul(PT[X], 1 - f), mul(PT[Y], f)));
						const d = Math.min(Math.hypot(q.x - QZ.x, q.y - QZ.y), Math.hypot(q.x - Q0.x, q.y - Q0.y));
						if (d > md + 25) { md = d; M = q; }
					});
					// texto sobre o lado, na direção do lado (sempre direito)
					const P1 = pr(PT[X]), P2 = pr(PT[Y]);
					let ang = Math.atan2(P2.y - P1.y, P2.x - P1.x);
					if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
					p.push(); p.translate(M.x, M.y); p.rotate(ang);
					p.textSize(18); p.textStyle(p.BOLD);
					const w = p.textWidth(t);
					p.noStroke(); p.fill(255, 235); p.rect(-w / 2 - 5, -12, w + 10, 24, 5);
					rot(t, 0, 0, COR.texto, 18, 255, p.BOLD);
					p.pop();
				};
				lado('A', 'B', 'C', 'AB = √2');
				lado('B', 'C', 'A', 'BC = 2');
				lado('A', 'C', 'B', 'AC ≈ 2,61');
			}

			// lembrete: a diagonal da tabela dá as normas
			const N = COR.texto;
			const topo = [[['‖', N], v('a', COR.a), ['‖ = ‖', N], v('b', COR.b), ['‖ = ‖', N], v('c', COR.c), ['‖ = √2', N]]];
			const linhaPar = k => {
				const q = PARES[k], cs = cor(k);
				return [v(q.u, COR[q.u]), [' · ', N], v(q.v, COR[q.v]), [' = ' + q.txt, cs, p.BOLD],
					[q.s > 0 ? '   (> 0: agudo)' : q.s < 0 ? '   (< 0: obtuso)' : '   (= 0: reto)', cs]];
			};
			if (al === 1) ['ab', 'bc', 'ac'].forEach(k => topo.push(linhaPar(k)));
			if (sel) {
				const cs = sel.s > 0 ? COR.pos : sel.s < 0 ? COR.neg : COR.zero;
				topo.push([v(sel.u, COR[sel.u]), [' · ', N], v(sel.v, COR[sel.v]), [' = ' + sel.txt, cs, p.BOLD],
					[sel.s > 0 ? '   (> 0: agudo)' : sel.s < 0 ? '   (< 0: obtuso)' : '   (= 0: reto)', cs]]);
			}
			caixa(topo, 12, 12, 34, 22);

			if (sol && al) {
				const V = COR.pos, a = v('a', COR.a), b = v('b', COR.b), c = v('c', COR.c);
				const L = {
					1: [[['‖', N], a, ['‖ = ‖', N], b, ['‖ = ‖', N], c, ['‖  ⇒  [OAB], [OBC], [OAC]', N]],
						[['isósceles com os mesmos lados iguais:', N]],
						[['maior ângulo em O  ⇒  maior lado oposto', N]],
						[['agudo (', N], a, [', ', N], b, [') < reto (', N], b, [', ', N], c, [') < obtuso (', N], a, [', ', N], c, [')', N]],
						[['⇒  AB < BC < AC   → (D)', V, p.BOLD]]],
					2: [[b, [' · ', N], c, [' = 0  ⇒  ', N], b, [' ⊥ ', N], c, ['  (ângulo reto)', N]]],
					3: [[['cos θ = ', N], a, [' · ', N], c, [' / (‖', N], a, ['‖ × ‖', N], c, ['‖)', N]],
						[['       = −√2 / (√2 × √2) = −√2/2', N]],
						[['⇒  θ = 135°', V, p.BOLD]]]
				}[al];
				caixa(L, W - 12, al === 1 ? 12 : H - 12 - L.length * 34 - 12, 34, 21, true);
				if (al === 1) leque();
			}
		};
	};
})();
