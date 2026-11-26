/* =====================================================================
   Utilitários 3D dos Problemas 18 e 19 do Produto escalar (2026-11-26):
   perspetiva feita à mão (como p14.js), a vista roda arrastando o fundo, um plano que passa
   na origem desenhado como um paralelogramo translúcido, e as linhas atrás dele a tracejado.
   Uso: const E = ESPACO3D(p, { W, H, cx, cy, k, n, L, az, el });  E.pr(v), E.seg(a, b, cor, peso), …
   ===================================================================== */
window.ESPACO3D = function (p, cfg) {
	const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
	const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
	const unit = a => mul(a, 1 / Math.hypot(...a));
	const E = { add, sub, mul, dot, unit, az: cfg.az ?? -35, el: cfg.el ?? 18 };
	const W = cfg.W, H = cfg.H, DIST = 19, CEN = [0, 0, 0];
	let F = [1, 0, 0], R = [0, 1, 0], U = [0, 0, 1];
	// o plano (passa em O): normal n, base e1, e2 do plano, meia largura L
	E.plano = n => {
		E.n = unit(n);
		let e1 = cross(E.n, [0, 0, 1]); if (Math.hypot(...e1) < 1e-6) e1 = [1, 0, 0];
		E.e1 = unit(e1); E.e2 = unit(cross(E.n, E.e1));
	};
	E.plano(cfg.n); E.L = cfg.L;
	E.camara = () => {
		const a = E.az * Math.PI / 180, e = E.el * Math.PI / 180;
		F = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
		R = [-Math.sin(a), Math.cos(a), 0];
		U = [-Math.sin(e) * Math.cos(a), -Math.sin(e) * Math.sin(a), Math.cos(e)];
	};
	const olho = () => add(CEN, mul(F, DIST));
	E.pr = v => {
		const w = sub(v, CEN), z = DIST - dot(w, F), s = cfg.k * DIST / Math.max(z, 0.5);
		return { x: cfg.cx + s * dot(w, R), y: cfg.cy - s * dot(w, U) };
	};
	// X está escondido pelo plano? (o segmento de X até ao olho atravessa o paralelogramo desenhado)
	E.oculto = X => {
		const O = olho(), d = sub(O, X), den = dot(E.n, d);
		if (Math.abs(den) < 1e-9) return false;
		const t = -dot(E.n, X) / den;
		if (t <= 1e-3 || t >= 1) return false;
		const Pp = add(X, mul(d, t));
		return Math.abs(dot(Pp, E.e1)) <= E.L && Math.abs(dot(Pp, E.e2)) <= E.L;
	};
	E.seg = (a, b, cor, peso = 2, alfa = 255) => {
		const n = 60, pts = [], esc = [];
		for (let i = 0; i <= n; i++) pts.push(E.pr(add(a, mul(sub(b, a), i / n))));
		for (let i = 0; i < n; i++) esc.push(E.oculto(add(a, mul(sub(b, a), (i + 0.5) / n))));
		p.noFill(); p.strokeWeight(peso); p.strokeCap(p.ROUND);
		let i = 0;
		while (i < n) {
			let j = i; while (j < n && esc[j] === esc[i]) j++;
			p.stroke(...cor, esc[i] ? alfa * 0.6 : alfa);
			if (esc[i]) p.drawingContext.setLineDash([8, 7]);
			p.line(pts[i].x, pts[i].y, pts[j].x, pts[j].y);
			p.drawingContext.setLineDash([]);
			i = j;
		}
	};
	E.seta = (a, b, cor, peso = 3) => {
		const P1 = E.pr(a), P2 = E.pr(b), dx = P2.x - P1.x, dy = P2.y - P1.y, l = Math.hypot(dx, dy), h = 15;
		E.seg(a, add(a, mul(sub(b, a), l > h ? 1 - h * 0.8 / l : 1)), cor, peso);
		if (l < 6) return;
		const ux = dx / l, uy = dy / l;
		p.noStroke(); p.fill(...cor, E.oculto(b) ? 150 : 255);
		p.triangle(P2.x, P2.y, P2.x - h * ux - h * 0.42 * uy, P2.y - h * uy + h * 0.42 * ux, P2.x - h * ux + h * 0.42 * uy, P2.y - h * uy - h * 0.42 * ux);
	};
	E.desenharPlano = (cor, alfa = 55) => {
		const L = E.L, c = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([s, t]) => E.pr(add(mul(E.e1, s * L), mul(E.e2, t * L))));
		p.fill(...cor, alfa); p.stroke(...cor, 160); p.strokeWeight(1.5);
		p.beginShape(); c.forEach(q => p.vertex(q.x, q.y)); p.endShape(p.CLOSE);
	};
	E.eixos = (tam, cor) => {
		for (const [v, nome] of [[[1, 0, 0], 'x'], [[0, 1, 0], 'y'], [[0, 0, 1], 'z']]) {
			E.seg(mul(v, -tam * 0.55), mul(v, tam), cor, 1.6, 200);
			const q = E.pr(mul(v, tam + 0.45));
			E.rot(nome, q.x, q.y, cor, 20, p.CENTER, p.ITALIC);
		}
	};
	E.rot = (t, x, y, cor, tam = 20, ah = p.CENTER, estilo = p.BOLD) => {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo); p.textAlign(ah, p.CENTER); p.text(t, x, y);
	};
	// nome de vetor com arpão (só a farpa de cima), centrado em (x, y)
	E.nomeVetor = (l, x, y, cor, tam = 21) => {
		p.textSize(tam); p.textStyle(p.BOLDITALIC); const w = p.textWidth(l), x0 = x - w / 2;
		E.rot(l, x0, y, cor, tam, p.LEFT, p.BOLDITALIC);
		const yy = y - tam * 0.66;
		p.stroke(...cor); p.strokeWeight(2); p.line(x0, yy, x0 + w, yy);
		p.noStroke(); p.fill(...cor); p.triangle(x0 + w + 3, yy, x0 + w - 5, yy - 5.5, x0 + w - 4, yy);
	};
	// linha de texto feita de pedaços [texto, cor, estilo, vetor?]
	E.linha = (pecas, x, y, tam = 19) => {
		p.textSize(tam); p.textAlign(p.LEFT, p.CENTER); p.noStroke();
		for (const [t, cor, est, vec] of pecas) {
			const c = cor || [30, 41, 59];
			p.textStyle(est || p.NORMAL); p.fill(...c); p.text(t, x, y);
			const w = p.textWidth(t);
			if (vec) { const yy = y - tam * 0.62; p.stroke(...c); p.strokeWeight(1.6); p.line(x + 1, yy, x + w - 1, yy); p.noStroke(); p.fill(...c); p.triangle(x + w + 2, yy, x + w - 5, yy - 5, x + w - 4, yy); }
			x += w;
		}
	};
	// rodar a vista arrastando (deslocamentos do ponteiro, com a escala do Reveal)
	E.arrastar = cv => {
		let ultimo = null;
		cv.style.cursor = 'grab'; cv.style.touchAction = 'none';
		cv.addEventListener('pointerdown', e => { ultimo = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault(); });
		cv.addEventListener('pointermove', e => {
			if (!ultimo) return;
			const esc = (window.Reveal && Reveal.getScale && Reveal.getScale()) || 1;
			E.az -= (e.clientX - ultimo[0]) / esc * 0.4; E.el = Math.max(-60, Math.min(80, E.el + (e.clientY - ultimo[1]) / esc * 0.4));
			ultimo = [e.clientX, e.clientY];
		});
		const fim = () => { ultimo = null; cv.style.cursor = 'grab'; };
		cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
		['touchstart', 'touchmove', 'mousedown'].forEach(t => cv.addEventListener(t, e => e.stopPropagation(), { passive: true }));
	};
	// ângulo reto em O entre as direções a e b (lado q)
	E.reto = (a, b, cor, q = 0.45) => {
		const ua = mul(unit(a), q), ub = mul(unit(b), q);
		E.seg(ua, add(ua, ub), cor, 2); E.seg(add(ua, ub), ub, cor, 2);
	};
	return E;
};
