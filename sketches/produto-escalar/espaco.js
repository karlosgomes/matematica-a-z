/* =====================================================================
   Produto escalar · Resumo — Planos e retas no espaço
   Plano α que passa em P = (1, 1, 1) com vetor normal n = (−1, 1, 3):
       α: −x + y + 3z − 3 = 0      (X ∈ α  ⇔  n · PX = 0)
   Reta r e plano α: interseta / paralela / contida / perpendicular.
   Segundo plano β (vetor normal m): β ⊥ α (n · m = 0) ou β ∥ α (m colinear com n).
   Figura 3D desenhada à mão (projeção ortogonal, como em trigonometria/p10.js):
   o que fica escondido atrás de um plano aparece a tracejado.
   A vista roda com os cursores ou arrastando com o rato (ou o dedo).
   ===================================================================== */
(function () {
	const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
	const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	const unit = a => mul(a, 1 / Math.hypot(...a));
	// combinação linear: soma(P, [u, 2], [v, -1]) = P + 2u − v
	const soma = (P, ...termos) => termos.reduce((s, [w, k]) => add(s, mul(w, k)), P);

	// dados: P, vetor normal (unitário) e dois vetores unitários do plano
	const P = [1, 1, 1];
	const N = unit([-1, 1, 3]);
	const U = unit([1, 1, 0]);
	const V = unit([-3, 3, -2]);          // V = N × U, a menos de escala
	const LN = 2.0;                       // comprimento com que se desenham os vetores

	SKETCHES['pe-espaco'] = function (p, controlos) {
		const W = 920, H = 600;
		const G = { cx: 470, cy: 350, k: 68 };
		const COR = {
			texto: [30, 41, 59], cinza: [100, 116, 139], eixo: [71, 85, 105], grelha: [203, 213, 225],
			azul: [21, 101, 192], laranja: [230, 81, 0], zero: [239, 108, 0], roxo: [123, 31, 162],
			preto: [15, 23, 42]
		};

		let az = 32, el = 30;
		let F_ = [1, 0, 0], R_ = [0, 1, 0], U_ = [0, 0, 1];
		let tX = 0.7, aAnimar = false;
		let modoR = 'interseta', modoB = 'perp';
		let slAz, slEl, cxX, cxB, btPlay;
		const botoesR = {}, botoesB = {};

		p.setup = function () {
			arrastar(p.createCanvas(W, H).elt);
			p.textFont('Source Sans Pro');

			cxX = UT.caixa(p, controlos, 'Ponto X do plano', true);
			btPlay = UT.botao(p, controlos, '▶ Mover X', () => {
				if (!cxX.checked()) cxX.checked(true);
				aAnimar ? parar() : (aAnimar = true, btPlay.html('⏸ Pausa'));
			});
			p.createSpan('&nbsp;&nbsp;&nbsp;').parent(controlos);
			cxB = UT.caixa(p, controlos, 'Plano β', false);
			[['perp', 'β ⊥ α'], ['par', 'β ∥ α']].forEach(([k, t]) => {
				botoesB[k] = UT.botao(p, controlos, t, () => { modoB = k; if (!cxB.checked()) cxB.checked(true); marcar(); });
			});
			UT.quebra(p, controlos);
			p.createSpan('Reta r:').parent(controlos);
			[['interseta', 'interseta'], ['paralela', 'paralela'], ['contida', 'contida'],
				['perpendicular', 'perpendicular'], ['nenhuma', 'nenhuma']].forEach(([k, t]) => {
				botoesR[k] = UT.botao(p, controlos, t, () => { modoR = k; marcar(); });
			});
			// a vista roda arrastando no canvas (sem cursores, pedido do utilizador)
			marcar();
		};

		// o botão escolhido fica azul; os outros ficam claros
		function marcar() {
			Object.entries(botoesR).forEach(([k, b]) => k === modoR ? b.removeClass('atalho') : b.addClass('atalho'));
			Object.entries(botoesB).forEach(([k, b]) => k === modoB ? b.removeClass('atalho') : b.addClass('atalho'));
		}
		function parar() { aAnimar = false; btPlay.html('▶ Mover X'); }

		// arrastar com o rato (ou o dedo) roda a vista (só os deslocamentos do ponteiro)
		function arrastar(cv) {
			let ultimo = null;
			cv.style.cursor = 'grab'; cv.style.touchAction = 'none';
			cv.addEventListener('pointerdown', e => {
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
			['touchstart', 'touchmove'].forEach(t => cv.addEventListener(t, e => e.stopPropagation(), { passive: true }));
		}

		/* ---------------- projeção ---------------- */
		function camara() {
			const a = az * Math.PI / 180, e = el * Math.PI / 180;
			F_ = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];   // para o observador
			R_ = [-Math.sin(a), Math.cos(a), 0];
			U_ = [-Math.sin(e) * Math.cos(a), -Math.sin(e) * Math.sin(a), Math.cos(e)];
		}
		// perspetiva (pedido do utilizador): observador à distância DIST da origem, na direção F_;
		// a escala na origem continua a ser G.k
		const DIST = 19;
		const olho = () => mul(F_, DIST);
		const pr = v => { const z = DIST - dot3(v, F_), s = G.k * DIST / Math.max(z, 0.5); return { x: G.cx + s * dot3(v, R_), y: G.cy - s * dot3(v, U_) }; };

		/* ---------------- planos (paralelogramos) ---------------- */
		// plano: centro C, vetores unitários e, f (lados), meias-medidas a, b, normal nn
		const plano = (C, e, f, a, b, cor, nome) => ({ C, e, f, a, b, nn: unit([
			e[1] * f[2] - e[2] * f[1], e[2] * f[0] - e[0] * f[2], e[0] * f[1] - e[1] * f[0]]), cor, nome });
		const cantos = pl => [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([s, t]) => soma(pl.C, [pl.e, s * pl.a], [pl.f, t * pl.b]));

		let planos = [];
		// o ponto X está escondido por algum plano? (segmento de X até ao olho do observador)
		function oculto(X) {
			const dir = sub(olho(), X);
			for (const pl of planos) {
				const den = dot3(pl.nn, dir);
				if (Math.abs(den) < 1e-9) continue;
				const t = -dot3(pl.nn, sub(X, pl.C)) / den;
				if (t <= 1e-3 || t >= 1) continue;
				const Y = sub(add(X, mul(dir, t)), pl.C);
				if (Math.abs(dot3(Y, pl.e)) <= pl.a && Math.abs(dot3(Y, pl.f)) <= pl.b) return true;
			}
			return false;
		}

		// segmento 3D: troços visíveis a cheio, escondidos a tracejado
		function seg(a, b, cor, peso, alfa = 255, tracoSempre = false) {
			const n = 60, pts = [], esc = [];
			for (let i = 0; i <= n; i++) pts.push(pr(add(a, mul(sub(b, a), i / n))));
			for (let i = 0; i < n; i++) esc.push(oculto(add(a, mul(sub(b, a), (i + 0.5) / n))));
			p.noFill(); p.strokeWeight(peso); p.strokeCap(p.ROUND);
			let i = 0;
			while (i < n) {
				let j = i;
				while (j < n && esc[j] === esc[i]) j++;
				const tr = esc[i] || tracoSempre;
				p.stroke(...cor, esc[i] ? alfa * 0.6 : alfa);
				if (tr) p.drawingContext.setLineDash([8, 7]);
				p.line(pts[i].x, pts[i].y, pts[j].x, pts[j].y);
				p.drawingContext.setLineDash([]);
				i = j;
			}
		}
		// vetor (seta) de a até b
		function seta(a, b, cor, peso = 3.5, tracoSempre = false, alfa = 255) {
			const A = pr(a), B = pr(b);
			const dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy);
			const h = 16, recuo = l > h ? h * 0.8 / l : 0;
			seg(a, add(a, mul(sub(b, a), 1 - recuo)), cor, peso, alfa, tracoSempre);
			if (l < 6) return;
			const ux = dx / l, uy = dy / l, esc = oculto(b);
			p.noStroke(); p.fill(...cor, esc ? alfa * 0.6 : alfa);
			p.triangle(B.x, B.y, B.x - h * ux - h * 0.42 * uy, B.y - h * uy + h * 0.42 * ux,
				B.x - h * ux + h * 0.42 * uy, B.y - h * uy - h * 0.42 * ux);
		}
		// marca de ângulo reto em Q entre as direções unitárias a e b
		function reto(Q, a, b, cor = COR.texto, q = 0.32) {
			seg(soma(Q, [a, q]), soma(Q, [a, q], [b, q]), cor, 2);
			seg(soma(Q, [b, q]), soma(Q, [a, q], [b, q]), cor, 2);
		}
		function rot(t, x, y, cor = COR.texto, tam = 22, alfa = 255, estilo = p.BOLD, ah = p.CENTER) {
			p.stroke(255, alfa); p.strokeWeight(6); p.strokeJoin(p.ROUND);
			p.fill(...cor, alfa); p.textSize(tam); p.textStyle(estilo);
			p.textAlign(ah, p.CENTER); p.text(t, x, y);
		}
		// seta por cima de um texto que ocupa [x, x + w], com a base do texto em y
		function setinha(x, w, y, cor, tam, contorno = true) {
			const yy = y - tam * 0.62, x1 = x + w + 2;
			if (contorno) { p.stroke(255); p.strokeWeight(5); p.line(x - 1, yy, x1, yy); }
			p.stroke(...cor); p.strokeWeight(Math.max(1.6, tam / 13)); p.line(x - 1, yy, x1, yy);
			p.noStroke(); p.fill(...cor);
			p.triangle(x1 + 3, yy, x1 - 4, yy - 3.5, x1 - 4, yy + 3.5);
		}
		// nome de vetor (letra com seta por cima) centrado em (x, y)
		function rotVet(t, x, y, cor, tam = 24) {
			rot(t, x, y, cor, tam, 255, p.BOLDITALIC);
			p.textSize(tam); p.textStyle(p.BOLDITALIC);
			const w = p.textWidth(t);
			setinha(x - w / 2, w, y + 2, cor, tam);
		}
		function ponto(X, nome, cor, dir = [1, -1], tam = 11) {
			const A = pr(X), esc = oculto(X);
			p.stroke(255); p.strokeWeight(2); p.fill(...cor, esc ? 120 : 255); p.circle(A.x, A.y, tam);
			if (nome) rot(nome, A.x + dir[0] * 18, A.y + dir[1] * 18, cor, 24, esc ? 140 : 255, p.BOLDITALIC);
		}
		function rotEm(X, t, cor, dx = 0, dy = 0, vet = false, tam = 24) {
			const A = pr(X);
			if (vet) rotVet(t, A.x + dx, A.y + dy, cor, tam);
			else rot(t, A.x + dx, A.y + dy, cor, tam, 255, p.BOLDITALIC);
		}
		// um vetor desenhado com o nome junto à ponta, afastado da reta do vetor
		function vetor(a, b, cor, nome, peso = 3.5, tracoSempre = false, alfa = 255) {
			seta(a, b, cor, peso, tracoSempre, alfa);
			if (!nome) return;
			const A = pr(a), B = pr(b);
			let dx = B.x - A.x, dy = B.y - A.y; const l = Math.hypot(dx, dy) || 1;
			dx /= l; dy /= l;
			const nx = -dy, ny = dx, s = nx > 0 ? 1 : -1;     // o nome fica à direita da seta
			rotVet(nome, B.x - dx * 14 + s * nx * 20, B.y - dy * 14 + s * ny * 20, cor);
		}

		/* ---------------- desenho ---------------- */
		p.draw = function () {
			if (aAnimar) tX += p.deltaTime / 1000 * 0.8;
			camara();
			p.background(255);

			const alfa = plano(P, U, V, 2.7, 2.3, COR.azul, 'α');
			let beta = null, Qb = null;
			if (cxB.checked()) {
				if (modoB === 'perp') {
					Qb = soma(P, [U, -1.9]);                                  // reta α ∩ β: Qb + s V
					beta = plano(soma(Qb, [N, 0.6]), V, N, 1.9, 1.8, COR.roxo, 'β');
				} else {
					beta = plano(soma(P, [N, 2.0], [U, 0.3]), U, V, 2.2, 1.8, COR.roxo, 'β');
				}
			}
			planos = beta ? [alfa, beta] : [alfa];

			grelha();
			planos.forEach(preencher);
			eixos();
			planos.forEach(contorno);

			// plano α: ponto P e vetor normal n
			vetor(P, soma(P, [N, LN]), COR.azul, 'n');

			// ponto X do plano e vetor PX
			if (cxX.checked()) {
				const X = soma(P, [U, 1.6 * Math.cos(tX)], [V, 1.2 * Math.sin(tX)]);
				const d = unit(sub(X, P));
				seta(P, X, COR.texto, 2.5, true);
				reto(P, N, d, COR.zero, 0.36);
				ponto(X, 'X', COR.texto, dirFora(X, P));
			}

			// plano β
			if (beta) desenharBeta(beta, Qb);

			// reta r
			desenharReta();

			ponto(P, 'P', COR.texto, [-1, 0.6]);
			painel();
		};

		// direção, no ecrã, que afasta o rótulo do ponto Y (a partir de X)
		function dirFora(X, Y) {
			const A = pr(X), B = pr(Y);
			const dx = A.x - B.x, dy = A.y - B.y, l = Math.hypot(dx, dy) || 1;
			return [dx / l, dy / l];
		}

		function grelha() {
			p.stroke(...COR.grelha, 150); p.strokeWeight(1);
			for (let i = -4; i <= 4; i++) {
				let A = pr([i, -4, 0]), B = pr([i, 4, 0]); p.line(A.x, A.y, B.x, B.y);
				A = pr([-4, i, 0]); B = pr([4, i, 0]); p.line(A.x, A.y, B.x, B.y);
			}
		}
		function eixos() {
			const L = 4.4, M = -2.0;
			[[[1, 0, 0], 'x'], [[0, 1, 0], 'y'], [[0, 0, 1], 'z']].forEach(([e, nome]) => {
				seta(mul(e, M), mul(e, L), COR.eixo, 2);
				const T = pr(mul(e, L + 0.45));
				rot(nome, T.x, T.y, COR.eixo, 22, 255, p.ITALIC);
			});
			const O = pr([0, 0, 0]);
			rot('O', O.x - 16, O.y + 16, COR.eixo, 20, 255, p.ITALIC);
		}
		function preencher(pl) {
			const c = cantos(pl).map(pr);
			p.noStroke(); p.fill(...pl.cor, 52);
			p.beginShape(); c.forEach(q => p.vertex(q.x, q.y)); p.endShape(p.CLOSE);
		}
		function contorno(pl) {
			const c = cantos(pl);
			for (let i = 0; i < 4; i++) seg(c[i], c[(i + 1) % 4], pl.cor, 2.5);
			// nome do plano junto a um canto
			const K = soma(pl.C, [pl.e, pl.a * 0.82], [pl.f, pl.b * 0.8]);
			rotEm(K, pl.nome, pl.cor, 0, 0, false, 28);
		}

		function desenharBeta(beta, Qb) {
			if (modoB === 'perp') {
				// reta de interseção α ∩ β (a preto)
				seg(soma(Qb, [V, -1.9]), soma(Qb, [V, 1.9]), COR.preto, 4);
				// vetor normal m de β, com uma cópia de n no mesmo ponto: ângulo reto
				const B = soma(Qb, [N, 1.3], [V, -1.0]);
				vetor(B, soma(B, [U, LN]), COR.roxo, 'm');
				seta(B, soma(B, [N, 1.3]), COR.azul, 2.5, true, 200);
				reto(B, U, N, COR.zero, 0.3);
			} else {
				const B = soma(beta.C, [U, 1.0], [V, 0.9]);
				vetor(B, soma(B, [N, LN]), COR.roxo, 'm');
			}
		}

		function desenharReta() {
			if (modoR === 'nenhuma') return;
			const cor = COR.laranja;
			const reta = (A, d, s0, s1) => {
				seg(soma(A, [d, s0]), soma(A, [d, s1]), cor, 3.5);
				rotEm(soma(A, [d, s1 + 0.35]), 'r', cor, 0, 0, false, 26);
			};
			if (modoR === 'interseta') {
				const I = soma(P, [U, -1.6], [V, -0.9]);
				const d = unit(soma([0, 0, 0], [N, 1], [U, -0.7]));
				reta(I, d, -2.2, 2.3);
				vetor(soma(I, [d, 0.5]), soma(I, [d, 0.5 + LN * 0.75]), cor, 'r');
				ponto(I, 'I', COR.preto, [1, 0.5], 13);
			} else if (modoR === 'paralela' || modoR === 'contida') {
				const d = V;
				const C = modoR === 'paralela' ? soma(P, [N, 1.2], [U, 1.7]) : soma(P, [U, 2.0]);
				reta(C, d, -2.9, 2.9);
				// em A: o vetor diretor r e uma cópia de n, perpendiculares
				const A = soma(C, [d, -1.9]);
				vetor(A, soma(A, [d, LN * 0.85]), cor, 'r');
				seta(A, soma(A, [N, 1.3]), COR.azul, 2.5, true, 200);
				reto(A, d, N, COR.zero, 0.3);
			} else if (modoR === 'perpendicular') {
				const J = soma(P, [U, -1.6], [V, -0.9]);
				reta(J, N, -2.4, 3.2);
				vetor(soma(J, [N, 0.9]), soma(J, [N, 0.9 + LN * 0.85]), cor, 'r');
				reto(J, N, U, COR.zero, 0.3);
				ponto(J, 'I', COR.preto, [1, 0.6], 13);
			}
		}

		/* ---------------- leitura no canto ---------------- */
		// partes: [texto, cor, vetor?]
		function frase(partes, x, y, tam = 26) {
			p.textSize(tam); p.textAlign(p.LEFT, p.BASELINE);
			partes.forEach(([t, cor, vet]) => {
				p.textStyle(vet ? p.BOLDITALIC : p.NORMAL);
				const w = p.textWidth(t);
				p.noStroke(); p.fill(...cor); p.text(t, x, y);
				if (vet) setinha(x, w, y, cor, tam, false);
				x += w;
			});
			return x;
		}
		function painel() {
			const T = COR.texto, Z = COR.zero, n = ['n', COR.azul, true], r = ['r', COR.laranja, true],
				m = ['m', COR.roxo, true], PX = ['PX', T, true], al = ['α', COR.azul], be = ['β', COR.roxo];
			const linhas = [];
			if (cxX.checked()) linhas.push([['X ∈ ', T], al, ['  ⇔  ', T], n, [' · ', T], PX, [' = 0', Z]]);
			if (modoR === 'interseta') linhas.push([r, [' · ', T], n, [' ≠ 0  ⇒  r interseta ', T], al, [' em I', T]]);
			if (modoR === 'paralela') linhas.push([r, [' · ', T], n, [' = 0', Z], ['  ⇒  r ∥ ', T], al]);
			if (modoR === 'contida') linhas.push([r, [' · ', T], n, [' = 0', Z], [', r ∩ ', T], al, [' ≠ ∅  ⇒  r ⊂ ', T], al]);
			if (modoR === 'perpendicular') linhas.push([r, ['  colinear com ', T], n, ['  ⇒  r ⊥ ', T], al]);
			if (cxB.checked()) {
				if (modoB === 'perp') linhas.push([n, [' · ', T], m, [' = 0', Z], ['  ⇒  ', T], al, [' ⊥ ', T], be]);
				else linhas.push([m, ['  colinear com ', T], n, ['  ⇒  ', T], al, [' ∥ ', T], be]);
			}
			if (!linhas.length) return;
			const x0 = 18, y0 = 16, dy = 40;
			let wmax = 0;
			linhas.forEach(l => { wmax = Math.max(wmax, medir(l)); });
			p.stroke(203, 213, 225); p.strokeWeight(1.5); p.fill(255, 235);
			p.rect(x0 - 8, y0 - 6, wmax + 28, linhas.length * dy + 14, 8);
			linhas.forEach((l, i) => frase(l, x0 + 6, y0 + 32 + i * dy));
		}
		function medir(partes, tam = 26) {
			p.textSize(tam);
			return partes.reduce((s, [t, , vet]) => { p.textStyle(vet ? p.BOLDITALIC : p.NORMAL); return s + p.textWidth(t); }, 0);
		}
	};
})();
