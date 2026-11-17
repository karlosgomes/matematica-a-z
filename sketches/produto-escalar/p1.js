/* =====================================================================
   Produto escalar · Problema 1 — ângulo de duas retas
   r: (x, y) = (−1, 3) + k(2, 1) e s: y = 3x − 1 (vetor diretor (1, 3)).
   Os vetores diretores partem do ponto de interseção I(1,8 ; 4,4); as pontas
   arrastam-se ao longo da reta (outros vetores diretores), «−s» troca o sentido
   e «r, s → O» desliza-os para a origem. β = ângulo dos vetores, θ = das retas.
   Solução: cos θ = |r·s| / (‖r‖‖s‖) = 5 / (√5 √10) = √2/2 → (D), θ = 45°.
   ===================================================================== */
SKETCHES['pe-p1'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 320, y: 390 }, K = 46;
	const COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], u: [21, 101, 192], v: [123, 31, 162],
		pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47], texto: [30, 41, 59],
		r: [230, 81, 0], s: [123, 31, 162], cinza: [100, 116, 139]
	};
	const R0 = { x: -1, y: 3 }, DR = { x: 2, y: 1 }, DS = { x: 1, y: 3 };
	const I = { x: 1.8, y: 4.4 };                    // −1 + 2k = x, 3 + k = 3x − 1 ⇒ k = 1,4
	const XMIN = -6.8, XMAX = 12.9, YMIN = -4.4, YMAX = 8.4;
	const st = { mu: 1, lam: 1, e: 0, alvo: 0 };     // r⃗ = μ(2, 1), s⃗ = λ(1, 3); e: 0 em I, 1 em O
	let agarrado = null, cxSol, btO;

	const X = x => O.x + x * K, Y = y => O.y - y * K;
	const corSinal = d => Math.abs(d) < 1e-9 ? COR.zero : d > 0 ? COR.pos : COR.neg;
	const suave = t => t * t * (3 - 2 * t);
	const base = () => { const t = suave(st.e); return { x: I.x * (1 - t), y: I.y * (1 - t) }; };

	p.setup = function () {
		arrastar(p.createCanvas(W, H).elt);
		p.textFont('Source Sans Pro');
		p.createSpan('Arrasta as pontas dos vetores ·').parent(controlos).addClass('dica-arrastar');
		btO = UT.botao(p, controlos, vec('r') + ', ' + vec('s') + ' → O', () => { st.alvo = st.alvo ? 0 : 1; btO.html(vec('r') + ', ' + vec('s') + (st.alvo ? ' → I' : ' → O')); });
		UT.botao(p, controlos, '−' + vec('s'), () => { st.lam = -st.lam; }, 'atalho');
		UT.botao(p, controlos, 'Início', () => { st.mu = 1; st.lam = 1; st.alvo = 0; btO.html(vec('r') + ', ' + vec('s') + ' → O'); }, 'atalho');
		UT.quebra(p, controlos);
		cxSol = UT.caixa(p, controlos, 'Mostrar a solução', false);
	};

	// letra com seta por cima, em HTML (para os botões)
	function vec(l) {
		return '<span style="display:inline-block;position:relative;font-style:italic">' + l +
			'<span style="position:absolute;left:-0.1em;right:-0.2em;top:-0.62em;font-size:0.7em;font-style:normal;text-align:center">→</span></span>';
	}

	// arrastar a ponta de r⃗ ou de s⃗ ao longo da sua direção (múltiplos do vetor diretor, às décimas)
	function arrastar(cv) {
		cv.style.touchAction = 'none';
		const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		const ponta = id => { const B = base(), D = id === 'r' ? DR : DS, t = id === 'r' ? st.mu : st.lam; return [X(B.x + t * D.x), Y(B.y + t * D.y)]; };
		const perto = (x, y) => {
			let best = null, bd = 30;
			for (const id of ['s', 'r']) { const [px, py] = ponta(id), d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = id; } }
			return best;
		};
		cv.addEventListener('pointerdown', e => {
			const [x, y] = pos(e); agarrado = perto(x, y);
			if (agarrado) { cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault(); }
		});
		cv.addEventListener('pointermove', e => {
			const [x, y] = pos(e);
			if (!agarrado) { cv.style.cursor = perto(x, y) ? 'grab' : 'default'; return; }
			const B = base(), D = agarrado === 'r' ? DR : DS, max = agarrado === 'r' ? 2.5 : 1.1;
			const ux = (x - O.x) / K - B.x, uy = (O.y - y) / K - B.y;
			let t = (ux * D.x + uy * D.y) / (D.x * D.x + D.y * D.y);
			t = Math.abs(t - Math.round(t)) < 0.1 ? Math.round(t) : Math.round(t * 10) / 10;
			if (Math.abs(t) < 0.3) t = t < 0 ? -0.3 : 0.3;
			t = p.constrain(t, -max, max);
			if (agarrado === 'r') st.mu = t; else st.lam = t;
		});
		const fim = () => { agarrado = null; cv.style.cursor = 'default'; };
		cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
		['touchstart', 'touchmove', 'mousedown'].forEach(t => cv.addEventListener(t, e => { if (agarrado || t !== 'mousedown') e.stopPropagation(); }, { passive: true }));
	}

	/* ---------- desenho ---------- */
	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	function setaTopo(x0, x1, yy, cor) {
		p.stroke(...cor); p.strokeWeight(2); p.line(x0, yy, x1, yy);
		p.noStroke(); p.fill(...cor); p.triangle(x1 + 4, yy, x1 - 3, yy - 4, x1 - 3, yy + 4);
	}
	function nomeVetor(l, x, y, cor, tam = 26) {
		rot(l, x, y, cor, tam, p.CENTER, p.BOLDITALIC);
		const w = p.textWidth(l);
		setaTopo(x - w * 0.55, x + w * 0.55, y - tam * 0.62, cor);
	}
	function seta(x1, y1, x2, y2, cor, peso = 4) {
		p.stroke(...cor); p.strokeWeight(peso); p.line(x1, y1, x2, y2);
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...cor); p.triangle(0, 0, -18, -7, -18, 7); p.pop();
	}
	function linha(pecas, x, y, tam = 22) {
		p.textSize(tam); p.textAlign(p.LEFT, p.CENTER); p.noStroke();
		for (const [t, cor, est, vec] of pecas) {
			p.textStyle(est || p.NORMAL); p.fill(...(cor || COR.texto)); p.noStroke(); p.text(t, x, y);
			const w = p.textWidth(t);
			if (vec) setaTopo(x + 1, x + w - 2, y - tam * 0.62, cor || COR.texto);
			x += w;
		}
		return x;
	}
	const inteiro = v => Math.abs(v - Math.round(v)) < 1e-9;
	const num = v => (v < -1e-9 ? '−' : '') + UT.fmt(Math.abs(v), inteiro(v) ? 0 : inteiro(v * 10) ? 1 : 2);
	const par = v => v < -1e-9 ? '(' + num(v) + ')' : num(v);
	const vetor = (x, y) => '(' + num(x) + (inteiro(x) && inteiro(y) ? ', ' : ' ; ') + num(y) + ')';
	function bola(x, y, cor, d = 12) { p.stroke(255); p.strokeWeight(2); p.fill(...cor); p.circle(X(x), Y(y), d); }

	function grelha() {
		p.strokeWeight(1); p.stroke(...COR.grelha);
		for (let i = Math.ceil(XMIN); i <= XMAX; i++) p.line(X(i), Y(YMIN), X(i), Y(YMAX));
		for (let j = Math.ceil(YMIN); j <= YMAX; j++) p.line(X(XMIN), Y(j), X(XMAX), Y(j));
		p.stroke(...COR.eixo); p.strokeWeight(1.6);
		p.line(X(XMIN), O.y, X(XMAX), O.y); p.line(O.x, Y(YMIN), O.x, Y(YMAX));
		p.noStroke(); p.fill(...COR.eixo); p.textSize(14); p.textStyle(p.NORMAL); p.textAlign(p.CENTER, p.TOP);
		for (let i = Math.ceil(XMIN); i <= XMAX; i++) if (i) p.text(i, X(i), O.y + 5);
		p.textAlign(p.RIGHT, p.CENTER);
		for (let j = Math.ceil(YMIN); j <= YMAX; j++) if (j) p.text(j, O.x - 6, Y(j));
		rot('O', O.x - 14, O.y + 16, COR.eixo, 18);
		rot('x', X(XMAX) - 10, O.y - 16, COR.eixo, 18, p.CENTER, p.ITALIC);
		rot('y', O.x + 14, Y(YMAX) + 12, COR.eixo, 18, p.CENTER, p.ITALIC);
	}
	// reta pelo ponto P com direção D, cortada à janela
	function reta(P, D, cor, alfa) {
		const ts = [];
		if (D.x) ts.push((XMIN - P.x) / D.x, (XMAX - P.x) / D.x);
		if (D.y) ts.push((YMIN - P.y) / D.y, (YMAX - P.y) / D.y);
		ts.sort((a, b) => a - b);
		const a = ts[1], b = ts[2];                          // o troço dentro do retângulo
		p.stroke(...cor, alfa); p.strokeWeight(3);
		p.line(X(P.x + a * D.x), Y(P.y + a * D.y), X(P.x + b * D.x), Y(P.y + b * D.y));
	}
	// arco de ângulo no ponto C (px) entre as direções a0 e a1 (rad, sentido matemático)
	function arco(cx, cy, a0, a1, r, cor, alfa = 50) {
		let da = a1 - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
		const ini = da >= 0 ? a0 : a1;
		p.fill(...cor, alfa); p.stroke(...cor); p.strokeWeight(2);
		p.arc(cx, cy, 2 * r, 2 * r, -(ini + Math.abs(da)), -ini, p.PIE);
		return ini + Math.abs(da) / 2;                       // direção do meio
	}

	p.draw = function () {
		const sol = cxSol.checked();
		// animação do deslize
		const passo = p.deltaTime / 1000 / 1.2;
		if (st.e < st.alvo) st.e = Math.min(st.alvo, st.e + passo); else if (st.e > st.alvo) st.e = Math.max(st.alvo, st.e - passo);
		const B = base(), t = suave(st.e);
		const r = { x: st.mu * DR.x, y: st.mu * DR.y }, s = { x: st.lam * DS.x, y: st.lam * DS.y };
		const d = r.x * s.x + r.y * s.y, cs = corSinal(d);
		p.background(255);
		grelha();

		// as retas (esbatem-se quando os vetores vão para a origem)
		const alfa = 255 - 150 * t;
		reta(R0, DR, COR.r, alfa); reta(I, DS, COR.s, alfa * 0.75);
		rot('r', X(9.6), Y(R0.y + (9.6 - R0.x) / 2) + 24, COR.r, 26, p.CENTER, p.BOLDITALIC);
		rot('s', X(7.3 / 3) - 22, Y(6.3), COR.s, 26, p.CENTER, p.BOLDITALIC);
		bola(R0.x, R0.y, COR.cinza, 9);
		rot('(−1, 3)', X(R0.x) - 8, Y(R0.y) - 18, COR.cinza, 16, p.RIGHT, p.NORMAL);

		// solução: θ, o ângulo (agudo) das retas, em I
		if (sol) {
			const am = arco(X(I.x), Y(I.y), Math.atan2(DR.y, DR.x) + Math.PI, Math.atan2(DS.y, DS.x) + Math.PI, 46, COR.texto, 40);
			rot('θ = 45°', X(I.x) + 100 * Math.cos(am), Y(I.y) - 100 * Math.sin(am), COR.texto, 20, p.CENTER, p.BOLD);
		}

		// ponto de interseção
		bola(I.x, I.y, COR.texto, 11);
		rot('I', X(I.x) - 16, Y(I.y) - 6, COR.texto, 21, p.RIGHT, p.BOLDITALIC);
		rot('(1,8 ; 4,4)', X(I.x) - 30, Y(I.y) - 6, COR.texto, 16, p.RIGHT, p.NORMAL);

		// β: ângulo dos vetores, na base (cor do sinal)
		const bx = X(B.x), by = Y(B.y);
		const aR = Math.atan2(r.y, r.x), aS = Math.atan2(s.y, s.x);
		const am = arco(bx, by, aR, aS, 32, cs);
		rot('β', bx + 52 * Math.cos(am), by - 52 * Math.sin(am), cs, 22, p.CENTER, p.BOLDITALIC);

		// vetores diretores
		const vec = (v, cor, l, ox, oy) => {
			seta(bx, by, X(B.x + v.x), Y(B.y + v.y), cor);
			const n = Math.hypot(v.x, v.y), lx = X(B.x + v.x) + v.x / n * 22 + ox, ly = p.constrain(Y(B.y + v.y) - v.y / n * 22 + oy, 44, H - 16);
			nomeVetor(l, lx, ly, cor);
			rot(vetor(v.x, v.y), lx + 14, ly + 3, cor, 17, p.LEFT, p.NORMAL);
		};
		vec(r, COR.u, 'r', 0, 6); vec(s, COR.v, 's', 0, 4);
		for (const [v, cor] of [[r, COR.u], [s, COR.v]]) {   // pegas
			p.noFill(); p.stroke(...cor, 90); p.strokeWeight(2); p.circle(X(B.x + v.x), Y(B.y + v.y), 24);
		}

		// contas, em baixo à direita
		const x0 = 490, h = sol ? 214 : (d < 0 ? 122 : 86), y0 = H - 10 - h;
		p.noStroke(); p.fill(255, 225); p.rect(x0, y0, W - x0 - 10, h, 10);
		let y = y0 + 26;
		linha([['r', COR.u, p.BOLDITALIC, 'v'], [' = ' + vetor(r.x, r.y) + '     ', COR.u], ['s', COR.v, p.BOLDITALIC, 'v'], [' = ' + vetor(s.x, s.y), COR.v]], x0 + 14, y); y += 36;
		linha([['r', COR.u, p.BOLDITALIC, 'v'], [' · '], ['s', COR.v, p.BOLDITALIC, 'v'], [' = ' + par(r.x) + ' × ' + par(s.x) + ' + ' + par(r.y) + ' × ' + par(s.y) + ' = '],
			[num(d), cs, p.BOLD]], x0 + 14, y); y += 36;
		if (d < 0) { linha([['β obtuso  →  θ = 180° − β', COR.neg]], x0 + 14, y); y += 36; }
		if (sol) {
			const xa = linha([['cos θ = |'], ['r', COR.u, p.BOLDITALIC, 'v'], [' · '], ['s', COR.v, p.BOLDITALIC, 'v'], ['| / (‖'],
				['r', COR.u, p.BOLDITALIC, 'v'], ['‖ ‖'], ['s', COR.v, p.BOLDITALIC, 'v'], ['‖)']], x0 + 14, y); y += 36;
			linha([['= |2 + 3| / (√5 × √10) = 5 / √50']], x0 + 50, y); y += 36;
			linha([['= √2 / 2   → '], ['(D)', COR.texto, p.BOLD], ['     θ = 45°']], x0 + 50, y);
		}
	};
};
