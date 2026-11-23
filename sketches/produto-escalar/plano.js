/* =====================================================================
   Utilitários comuns aos problemas do plano vindos da Itália (Problemas 9–14, 2026-11-23):
   canvas 920×600, referencial com origem O (px) e escala K (px por unidade),
   pontos que se arrastam (ponteiro convertido com o retângulo do canvas, que o Reveal escala),
   rótulos com contorno branco, setas, nomes de vetores com arpão (só a farpa de cima),
   ângulos retos e linhas de texto com pedaços coloridos.
   Uso: const T = PLANO(p, { O: {x, y}, K });  T.X(x), T.Y(y), T.arrastar(canvas, alvos) …
   ===================================================================== */
window.PLANO = function (p, cfg) {
	const W = cfg.W || 920, H = cfg.H || 600;
	const T = { W, H, O: cfg.O, K: cfg.K };
	T.COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], u: [21, 101, 192], v: [123, 31, 162], soma: [0, 131, 143],
		pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47], texto: [30, 41, 59], cinza: [100, 116, 139],
		reta: [230, 81, 0], fig: [234, 88, 12]
	};
	const C = T.COR;
	T.X = x => T.O.x + x * T.K;
	T.Y = y => T.O.y - y * T.K;
	T.S = q => [T.X(q[0]), T.Y(q[1])];
	T.mundo = (x, y) => [(x - T.O.x) / T.K, (T.O.y - y) / T.K];

	// alvos: [{ perto(x, y) → bool (coordenadas do canvas), mover(x, y) (coordenadas do mundo), cursor }]
	T.arrastar = function (cv, alvos) {
		const est = { ativo: null };
		cv.style.touchAction = 'none';
		const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		cv.addEventListener('pointerdown', e => {
			const [x, y] = pos(e);
			const a = alvos.find(a => a.perto(x, y));
			if (!a) return;
			est.ativo = a; if (a.inicio) a.inicio();
			cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.stopPropagation(); e.preventDefault();
		});
		cv.addEventListener('pointermove', e => {
			const [x, y] = pos(e);
			if (!est.ativo) { const a = alvos.find(a => a.perto(x, y)); cv.style.cursor = a ? (a.cursor || 'grab') : 'default'; return; }
			est.ativo.mover(...T.mundo(x, y));
		});
		const fim = () => { est.ativo = null; cv.style.cursor = 'default'; };
		cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
		['touchstart', 'touchmove'].forEach(t => cv.addEventListener(t, e => e.stopPropagation(), { passive: true }));
		return est;
	};
	// ponto do mundo q perto do ponteiro (x, y)?
	T.perto = (q, x, y, r = 26) => Math.hypot(T.X(q[0]) - x, T.Y(q[1]) - y) < r;

	T.rot = function (t, x, y, cor = C.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	};
	T.seg = function (a, b, cor = C.texto, peso = 2, trac = null, alfa = 255) {
		if (trac) p.drawingContext.setLineDash(trac);
		p.stroke(...cor, alfa); p.strokeWeight(peso); p.line(T.X(a[0]), T.Y(a[1]), T.X(b[0]), T.Y(b[1]));
		if (trac) p.drawingContext.setLineDash([]);
	};
	T.seta = function (a, b, cor, peso = 3.5, alfa = 255) {
		const x1 = T.X(a[0]), y1 = T.Y(a[1]), x2 = T.X(b[0]), y2 = T.Y(b[1]);
		if (Math.hypot(x2 - x1, y2 - y1) < 4) return;
		p.stroke(...cor, alfa); p.strokeWeight(peso); p.line(x1, y1, x2, y2);
		const ang = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(ang);
		p.noStroke(); p.fill(...cor, alfa); p.triangle(0, 0, -15, -6, -15, 6); p.pop();
	};
	// nome de vetor com arpão por cima (só a farpa de cima), centrado em (x, y) do canvas
	T.nomeVetor = function (l, x, y, cor, tam = 21, pre = '') {
		p.textSize(tam); p.textStyle(p.BOLD);
		const wp = pre ? p.textWidth(pre) : 0;
		p.textStyle(p.BOLDITALIC); const w = p.textWidth(l), x0 = x - (wp + w) / 2;
		if (pre) T.rot(pre, x0, y, cor, tam, p.LEFT, p.BOLD);
		T.rot(l, x0 + wp, y, cor, tam, p.LEFT, p.BOLDITALIC);
		const yy = y - tam * 0.66, a = x0 + wp, b = a + w;
		p.stroke(...cor); p.strokeWeight(2); p.line(a, yy, b, yy);
		p.noStroke(); p.fill(...cor); p.triangle(b + 3, yy, b - 5, yy - 5.5, b - 4, yy);
	};
	// ângulo reto no vértice q, entre as direções de q para a e de q para b (mundo)
	T.reto = function (q, a, b, cor = C.zero, lado = 14) {
		const Q = T.S(q), A = T.S(a), B = T.S(b);
		const ua = [A[0] - Q[0], A[1] - Q[1]], ub = [B[0] - Q[0], B[1] - Q[1]];
		const na = Math.hypot(...ua), nb = Math.hypot(...ub);
		if (na < 1 || nb < 1) return;
		const P1 = [Q[0] + lado * ua[0] / na, Q[1] + lado * ua[1] / na], P2 = [Q[0] + lado * ub[0] / nb, Q[1] + lado * ub[1] / nb];
		p.noFill(); p.stroke(...cor); p.strokeWeight(2);
		p.beginShape(); p.vertex(...P1); p.vertex(P1[0] + P2[0] - Q[0], P1[1] + P2[1] - Q[1]); p.vertex(...P2); p.endShape();
	};
	// arco de ângulo no vértice q, de a para b (mundo), raio em px
	T.arco = function (q, a, b, cor, r = 30, peso = 2.2) {
		const Q = T.S(q), A = T.S(a), B = T.S(b);
		let a1 = Math.atan2(A[1] - Q[1], A[0] - Q[0]), a2 = Math.atan2(B[1] - Q[1], B[0] - Q[0]);
		let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
		p.noFill(); p.stroke(...cor); p.strokeWeight(peso);
		if (d >= 0) p.arc(Q[0], Q[1], 2 * r, 2 * r, a1, a1 + d); else p.arc(Q[0], Q[1], 2 * r, 2 * r, a1 + d, a1);
	};
	// ponto com nome; dx, dy = deslocamento do nome; agarra = desenhar como ponto que se arrasta
	T.ponto = function (q, nome, dx = 12, dy = -16, cor = C.texto, agarra = false, tam = 24) {
		const x = T.X(q[0]), y = T.Y(q[1]);
		p.noStroke(); p.fill(...cor);
		if (agarra) { p.circle(x, y, 14); p.fill(255); p.circle(x, y, 5); } else p.circle(x, y, 9);
		if (nome) T.rot(nome, x + dx, y + dy, cor, tam, dx < -2 ? p.RIGHT : dx > 2 ? p.LEFT : p.CENTER, p.BOLDITALIC);
	};
	// linha de texto feita de pedaços [texto, cor, estilo, vetor?]; devolve o x final
	T.linha = function (pecas, x, y, tam = 21) {
		p.textSize(tam); p.textAlign(p.LEFT, p.CENTER); p.noStroke();
		for (const [t, cor, est, vec] of pecas) {
			const c = cor || C.texto;
			p.textStyle(est || p.NORMAL); p.fill(...c); p.text(t, x, y);
			const w = p.textWidth(t);
			if (vec) {
				const yy = y - tam * 0.62;
				p.stroke(...c); p.strokeWeight(1.6); p.line(x + 1, yy, x + w - 1, yy);
				p.noStroke(); p.fill(...c); p.triangle(x + w + 2, yy, x + w - 5, yy - 5, x + w - 4, yy);
			}
			x += w;
		}
		return x;
	};
	T.V = (t, cor) => [t, cor, p.BOLDITALIC, true];
	T.painel = function (x, y, w, h) {
		p.fill(255, 242); p.stroke(226, 232, 240); p.strokeWeight(1.5); p.rect(x, y, w, h, 10);
	};
	// grelha e eixos esbatidos, de xa a xb e de ya a yb (mundo)
	T.grelha = function (xa, xb, ya, yb, eixos = true, nomes = true) {
		p.stroke(...C.grelha); p.strokeWeight(1);
		for (let i = Math.ceil(xa); i <= xb; i++) p.line(T.X(i), T.Y(ya), T.X(i), T.Y(yb));
		for (let j = Math.ceil(ya); j <= yb; j++) p.line(T.X(xa), T.Y(j), T.X(xb), T.Y(j));
		if (!eixos) return;
		p.stroke(...C.eixo, 150); p.strokeWeight(1.4);
		p.line(T.X(xa), T.Y(0), T.X(xb), T.Y(0)); p.line(T.X(0), T.Y(ya), T.X(0), T.Y(yb));
		if (nomes) { T.rot('x', T.X(xb) - 4, T.Y(0) + 16, C.eixo, 18, p.RIGHT, p.ITALIC); T.rot('y', T.X(0) + 12, T.Y(yb) + 8, C.eixo, 18, p.LEFT, p.ITALIC); }
	};
	// aproximação suave de um estado numérico para um alvo (devolve o novo valor e se chegou)
	T.suave = (v, alvo, dt, tau = 150) => {
		const n = v + (alvo - v) * (1 - Math.exp(-dt / tau));
		return Math.abs(alvo - n) < 1e-3 ? [alvo, true] : [n, false];
	};
	return T;
};
