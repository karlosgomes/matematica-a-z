/* =====================================================================
   Resumo — redução ao 1.º quadrante
   (baseado na app «Redução ao 1.º quadrante» de apps-matematica)
   α no 1.º quadrante; β = s·α + n·π/2 (s = ±1). O triângulo [OTP], com
   OT = cos α (azul) e TP = sin α (vermelho), é transformado por uma rotação,
   pela simetria central ou por uma reflexão: P' = R(nπ/2)·(x, s·y).
   ===================================================================== */
SKETCHES['trig-reducao'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 290, y: 300 }, R = 210;
	const COR = {
		eixo: [100, 116, 139], circ: [30, 41, 59], cos: [29, 78, 216], sin: [220, 38, 38],
		tan: [5, 150, 105], al: [124, 58, 237], be: [234, 88, 12], rot: [219, 39, 119],
		sim: [0, 131, 143], texto: [30, 41, 59], cinza: [100, 116, 139]
	};
	const X = x => O.x + x * R;
	const Y = y => O.y - y * R;

	// β = s·α + n·π/2
	const ESTADOS = [
		{ k: 'a', nome: 'π/2 − α', s: -1, n: 1, transf: 'reflexão na bissetriz y = x', cor: COR.sim },
		{ k: 'b', nome: 'π/2 + α', s: 1, n: 1, transf: 'rotação de centro O e ângulo π/2', cor: COR.rot },
		{ k: 'c', nome: 'π − α', s: -1, n: 2, transf: 'reflexão no eixo Oy', cor: COR.sim },
		{ k: 'd', nome: 'π + α', s: 1, n: 2, transf: 'simetria central de centro O', cor: COR.sim },
		{ k: 'e', nome: '−α', s: -1, n: 0, transf: 'reflexão no eixo Ox', cor: COR.sim }
	];
	const BASE = { k: 'o', nome: 'α', s: 1, n: 0 };

	let alfa = 30, est = BASE, anim = null, sl;
	let linhas = null;                         // linhas da tabela do resumo (destaque do estado atual)

	/* ---------- transformações (matrizes 2×2 [a, b, c, d]) ---------- */
	const mul = (A, B) => [A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3], A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]];
	const Rm = t => [Math.cos(t), -Math.sin(t), Math.sin(t), Math.cos(t)];
	const Mof = st => mul(Rm(st.n * Math.PI / 2), [1, 0, 0, st.s]);
	const flip = (psi, k) => mul(mul(Rm(psi), [1, 0, 0, k]), Rm(-psi));   // reflexão «a meio»: achata e vira
	const ease = t => t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
	const mesmo = (a, b) => a.s === b.s && ((a.n - b.n) % 4 + 4) % 4 === 0;

	// de um estado para outro: rotação de ±π/2, simetria central ou reflexão numa reta
	function ir(para) {
		if (mesmo(est, para)) para = BASE;                 // carregar outra vez volta a α
		if (mesmo(est, para)) return;
		const M0 = Mof(est);
		let tipo, th = 0, psi = 0;
		if (est.s === para.s) {
			const dn = ((para.n - est.n) % 4 + 4) % 4;
			if (dn === 2) tipo = 'cen'; else { tipo = 'rot'; th = (dn === 1 ? 1 : -1) * Math.PI / 2; }
		} else {
			const G = mul(Mof(para), [M0[0], M0[2], M0[1], M0[3]]);   // M(para)·M(est)⁻¹
			tipo = 'ref'; psi = Math.atan2(G[2], G[0]) / 2;
		}
		anim = { de: est, M0, tipo, th, psi, t: 0, dur: tipo === 'rot' ? 0.8 : 1 };
		est = para;
		destacar();
	}
	function Magora() {
		if (!anim) return Mof(est);
		const e = ease(anim.t);
		if (anim.tipo === 'rot') return mul(Rm(e * anim.th), anim.M0);
		if (anim.tipo === 'cen') return anim.M0.map(v => v * (1 - 2 * e));
		return mul(flip(anim.psi, 1 - 2 * e), anim.M0);
	}

	// (cos β, sin β) à custa de (cos α, sin α): pares [sinal, 0 = cos, 1 = sin]
	function imagens(st) {
		let c = [1, 0], s = [st.s, 1];
		for (let i = 0; i < ((st.n % 4) + 4) % 4; i++) [c, s] = [[-s[0], s[1]], c];
		return { c, s };
	}
	const txt = ([sg, k]) => (sg < 0 ? '−' : '') + (k ? 'sin α' : 'cos α');

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');

		sl = UT.slider(p, controlos, 'α', 5, 85, alfa, 5);
		sl.input(() => { alfa = sl.value(); });
		[15, 30, 45, 60, 75].forEach(v =>
			UT.botao(p, controlos, v + '°', () => { alfa = v; sl.value(v); }, 'atalho'));
		UT.quebra(p, controlos);
		ESTADOS.forEach(st => UT.botao(p, controlos, st.nome, () => ir(st)));
		UT.botao(p, controlos, '↺ α', () => ir(BASE), 'atalho');

		const sec = controlos.closest('section');
		linhas = sec ? sec.querySelectorAll('tr[data-k]') : [];
		destacar();
	};

	function destacar() {
		if (!linhas) return;
		linhas.forEach(tr => tr.classList.toggle('atual', tr.dataset.k === est.k));
	}

	/* ---------------- utilitários ---------------- */
	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	function seta(x1, y1, x2, y2) {
		p.line(x1, y1, x2, y2);
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...COR.eixo); p.triangle(0, 0, -12, -5, -12, 5); p.pop();
	}
	function tracejado(x1, y1, x2, y2, c = 10, d = 7) {
		p.drawingContext.setLineDash([c, d]); p.line(x1, y1, x2, y2); p.drawingContext.setLineDash([]);
	}
	// arco de ângulo (em radianos, sentido positivo = anti-horário) com seta no fim
	function arco(t0, t1, r, cor, peso = 2.5) {
		if (Math.abs(t1 - t0) < 0.03) return;
		p.noFill(); p.stroke(...cor); p.strokeWeight(peso);
		p.beginShape();
		const n = Math.max(8, Math.ceil(Math.abs(t1 - t0) / 0.04));
		for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; p.vertex(O.x + r * Math.cos(t), O.y - r * Math.sin(t)); }
		p.endShape();
		const sg = Math.sign(t1 - t0), ex = O.x + r * Math.cos(t1), ey = O.y - r * Math.sin(t1);
		p.push(); p.translate(ex, ey); p.rotate(-t1 - sg * p.HALF_PI);
		p.noStroke(); p.fill(...cor); p.triangle(0, 0, -13, -6, -13, 6); p.pop();
	}

	p.draw = function () {
		if (anim) { anim.t = Math.min(1, anim.t + p.deltaTime / 1000 / anim.dur); }
		p.background(255);

		const a = p.radians(alfa), ca = Math.cos(a), sa = Math.sin(a);
		const M = Magora();
		const st = est, movido = anim || !mesmo(est, BASE);
		const ap = (u, v, A = M) => [X(A[0] * u + A[1] * v), Y(A[2] * u + A[3] * v)];

		// eixo de simetria (reflexões), por baixo de tudo
		if (st.s < 0) {
			const ps = st.n * Math.PI / 4, e = 1.35;
			p.stroke(...COR.sim, anim && anim.tipo !== 'rot' ? 255 * ease(anim.t) : 255); p.strokeWeight(3);
			tracejado(X(-e * Math.cos(ps)), Y(-e * Math.sin(ps)), X(e * Math.cos(ps)), Y(e * Math.sin(ps)));
		}

		// eixos e circunferência
		p.stroke(...COR.eixo); p.strokeWeight(1.5);
		seta(X(-1.3), O.y, X(1.4), O.y);
		seta(O.x, Y(-1.3), O.x, Y(1.32));
		rot('x', X(1.4), O.y + 20, COR.eixo, 20, p.CENTER, p.ITALIC);
		rot('y', O.x - 18, Y(1.32), COR.eixo, 20, p.CENTER, p.ITALIC);
		rot('O', O.x - 16, O.y + 18, COR.eixo, 20);
		p.noFill(); p.stroke(...COR.circ); p.strokeWeight(2);
		p.circle(O.x, O.y, 2 * R);

		// triângulo [OTP] transformado pela matriz A
		function triangulo(A, op, linha) {
			const T = ap(ca, 0, A), P = ap(ca, sa, A);
			p.noStroke(); p.fill(...(linha ? COR.be : COR.al), 30 * op);
			p.triangle(O.x, O.y, ...T, ...P);
			p.strokeCap(p.ROUND);
			p.stroke(...COR.circ, 255 * op); p.strokeWeight(2.5); p.line(O.x, O.y, ...P);
			p.stroke(...COR.cos, 255 * op); p.strokeWeight(6); p.line(O.x, O.y, ...T);
			p.stroke(...COR.sin, 255 * op); p.line(...T, ...P);
			// ângulo reto em T
			const u = [(O.x - T[0]), (O.y - T[1])], v = [(P[0] - T[0]), (P[1] - T[1])];
			const lu = Math.hypot(...u) || 1, lv = Math.hypot(...v) || 1, q = Math.min(13, 0.3 * lu, 0.3 * lv);
			if (q > 3) {
				p.noFill(); p.stroke(60, 255 * op); p.strokeWeight(1.3);
				p.beginShape();
				p.vertex(T[0] + u[0] / lu * q, T[1] + u[1] / lu * q);
				p.vertex(T[0] + u[0] / lu * q + v[0] / lv * q, T[1] + u[1] / lu * q + v[1] / lv * q);
				p.vertex(T[0] + v[0] / lv * q, T[1] + v[1] / lv * q);
				p.endShape();
			}
			// ângulo α em O, entre OT e OP
			const tT = Math.atan2(-(T[1] - O.y), T[0] - O.x), tP = Math.atan2(-(P[1] - O.y), P[0] - O.x);
			const sw = Math.atan2(Math.sin(tP - tT), Math.cos(tP - tT));
			if (lu > 20 && Math.abs(sw) > 0.01) {
				p.noFill(); p.stroke(...COR.al, 255 * Math.max(op, 0.6)); p.strokeWeight(2.5);
				const i0 = -Math.max(tT, tT + sw), i1 = -Math.min(tT, tT + sw);
				p.arc(O.x, O.y, 70, 70, i0, i1);
				const tm = tT + sw / 2;
				if (op > 0.5) rot('α', O.x + 52 * Math.cos(tm), O.y - 52 * Math.sin(tm), COR.al, 20);
			}
			p.noStroke(); p.fill(...COR.circ, 255 * op); p.circle(...T, 9);
			p.stroke(255); p.strokeWeight(3); p.fill(...(linha ? COR.be : COR.al), 255 * Math.max(op, 0.5)); p.circle(...P, 17);
			return { T, P };
		}

		const op0 = movido ? 0.35 : 1;
		const orig = triangulo([1, 0, 0, 1], op0, false);
		rot('P', orig.P[0] + 16 * ca, orig.P[1] - 16 * sa - 6, COR.al, 22, p.LEFT);
		if (!movido) {
			rot('T', orig.T[0], O.y + 22, COR.circ, 20);
			rot('cos α', X(ca / 2), O.y + 22, COR.cos, 20);
			rot('sin α', orig.T[0] + 12, Y(sa / 2), COR.sin, 20, p.LEFT);
		}

		if (movido) {
			// ângulo β (laranja), desde o semieixo positivo Ox
			const b0 = anim ? anim.de.s * a + anim.de.n * Math.PI / 2 : 0;
			const b1 = st.s * a + st.n * Math.PI / 2;
			const bd = anim ? b0 + (b1 - b0) * ease(anim.t) : b1;
			arco(0, bd, 0.3 * R + 14, COR.be);
			if (Math.abs(bd) > 0.1) rot('β', O.x + (0.3 * R + 36) * Math.cos(bd / 2), O.y - (0.3 * R + 36) * Math.sin(bd / 2), COR.be, 22);

			// rotação de P até P' (por fora da circunferência) e simetria central
			if (st.s > 0 && st.n % 2 && (!anim || anim.tipo === 'rot')) {
				const c0 = anim ? anim.de.n * Math.PI / 2 : 0, c = anim ? c0 + (st.n * Math.PI / 2 - c0) * ease(anim.t) : st.n * Math.PI / 2;
				arco(a, a + c, 1.2 * R, COR.rot);
				if (!anim) rot('+π/2', O.x + 1.32 * R * Math.cos(a + c / 2), O.y - 1.32 * R * Math.sin(a + c / 2), COR.rot, 20);
			}
			const nov = triangulo(M, 1, true);
			if (st.s > 0 && st.n % 4 === 2 && !anim) { p.stroke(...COR.sim); p.strokeWeight(3); tracejado(...orig.P, ...nov.P); }
			if (!anim) {
				const tP = Math.atan2(-(nov.P[1] - O.y), nov.P[0] - O.x);
				rot("P'", nov.P[0] + 26 * Math.cos(tP), nov.P[1] - 26 * Math.sin(tP), COR.be, 22);
			}
		}
		if (anim && anim.t >= 1) anim = null;

		painel(a, ca, sa);
	};

	/* ---------------- painel à direita ---------------- */
	function painel(a, ca, sa) {
		const x = 620;
		let y = 70;
		const linha = (t, cor, dy = 40, tam = 23, e = p.NORMAL) => { rot(t, x, y, cor, tam, p.LEFT, e); y += dy; };
		linha(`α = ${alfa}°`, COR.al, 46, 26, p.BOLD);
		if (mesmo(est, BASE)) {
			linha('P(cos α, sin α)', COR.texto, 50, 23, p.BOLD);
			linha(`cos α ≈ ${UT.fmt(ca, 3)}`, COR.cos);
			linha(`sin α ≈ ${UT.fmt(sa, 3)}`, COR.sin, 60);
			p.noStroke(); p.fill(...COR.cinza); p.textSize(18); p.textStyle(p.NORMAL); p.textAlign(p.LEFT, p.TOP);
			p.text('Escolhe um ângulo β nos botões: o triângulo [OTP] é transformado e os catetos azul (cos α) e vermelho (sin α) mostram as coordenadas de P\'.', x, y, 280);
			return;
		}
		const im = imagens(est), b = est.s * a + est.n * Math.PI / 2;
		const e = ESTADOS.find(s => mesmo(s, est));
		linha(`β = ${e.nome}`, COR.be, 34, 26, p.BOLD);
		p.noStroke(); p.fill(...e.cor); p.textSize(17); p.textStyle(p.ITALIC); p.textAlign(p.LEFT, p.TOP);
		p.text(e.transf, x, y - 6, 290); y += 46;
		linha(`P'(${txt(im.c)}, ${txt(im.s)})`, COR.texto, 52, 23, p.BOLD);
		const cor = ([, k]) => k ? COR.sin : COR.cos;
		linha(`sin β = ${txt(im.s)}`, cor(im.s), 38, 24, p.BOLD);
		linha(`cos β = ${txt(im.c)}`, cor(im.c), 38, 24, p.BOLD);
		const sg = im.s[0] * im.c[0] < 0 ? '−' : '';
		linha(`tan β = ${im.s[1] === 1 ? sg + 'tan α' : sg + '1 / tan α'}`, COR.tan, 56, 24, p.BOLD);
		const n = v => UT.fmt(Math.abs(v) < 5e-4 ? 0 : v, 3).replace('-', '−');
		linha(`sin β ≈ ${n(Math.sin(b))}`, COR.cinza, 30, 19);
		linha(`cos β ≈ ${n(Math.cos(b))}`, COR.cinza, 30, 19);
		linha(`tan β ≈ ${n(Math.tan(b))}`, COR.cinza, 30, 19);
	}
};
