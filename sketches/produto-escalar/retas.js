/* =====================================================================
   Produto escalar · Resumo — Retas no plano
     duas retas r e s que passam em P(1, 2), com inclinações α_r e α_s;
     vetores diretores unitários r = (cos α_r, sin α_r), s = (cos α_s, sin α_s);
     declives, produto escalar, ângulo β dos vetores e ângulo θ das retas.
   ===================================================================== */
SKETCHES['pe-retas'] = function (p, controlos) {
	const W = 920, H = 600;
	const PAINEL = 300;                          // largura do painel de valores (à esquerda)
	const U = 56;                                // px por unidade
	const O = { x: PAINEL + 5.4 * U, y: 362 };   // origem do referencial (px)
	const P0 = { x: 1, y: 2 };                   // ponto comum às duas retas
	const COR = {
		r: [21, 101, 192], s: [123, 31, 162], theta: [46, 125, 50], beta: [211, 47, 47],
		perp: [239, 108, 0], eixo: [100, 116, 139], grelha: [226, 232, 240], texto: [30, 41, 59]
	};

	let aR = 30, aS = 120, slR, slS, cxInc, cxVet, cxBeta;

	const X = x => O.x + x * U;
	const Y = y => O.y - y * U;
	const rad = g => g * Math.PI / 180;

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');

		slR = UT.slider(p, controlos, 'α<sub>r</sub>', 0, 179, aR, 1);
		slR.input(() => { aR = +slR.value(); });
		slS = UT.slider(p, controlos, 'α<sub>s</sub>', 0, 179, aS, 1);
		slS.input(() => { aS = +slS.value(); });
		UT.quebra(p, controlos);
		const por = (r, s) => { aR = r; aS = s; slR.value(r); slS.value(s); };
		UT.botao(p, controlos, 'perpendiculares', () => por(aR, (aR + 90) % 180), 'atalho');
		UT.botao(p, controlos, 'θ = 45°', () => por(aR, (aR + 45) % 180), 'atalho');
		UT.botao(p, controlos, 'β obtuso', () => por(20, 140), 'atalho');
		UT.botao(p, controlos, '30° e 120°', () => por(30, 120), 'atalho');
		UT.botao(p, controlos, 'r vertical', () => por(90, 30), 'atalho');
		UT.quebra(p, controlos);
		cxInc = UT.caixa(p, controlos, 'Inclinação', true);
		cxVet = UT.caixa(p, controlos, 'Vetores diretores', true);
		cxBeta = UT.caixa(p, controlos, 'Ângulo dos vetores', true);
	};

	/* ---------- texto ---------- */
	function estilo(cor, tam, est) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(est);
	}
	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, est = p.BOLD) {
		estilo(cor, tam, est);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	// sequência de pedaços: texto normal, índice ('_') ou letra com seta de vetor ('v')
	// ex.: [['m'], ['r', '_'], [' ≈ 0,577']]
	function seq(partes, x, y, cor = COR.texto, tam = 22, ah = p.LEFT, est = p.NORMAL) {
		const larg = pt => { p.textSize(pt[1] === '_' ? tam * 0.7 : tam); p.textStyle(est); return p.textWidth(pt[0]); };
		let total = 0;
		partes.forEach(pt => total += larg(pt));
		let cx = ah === p.CENTER ? x - total / 2 : x;
		partes.forEach(pt => {
			const w = larg(pt), sub = pt[1] === '_';
			estilo(cor, sub ? tam * 0.7 : tam, est);
			p.textAlign(p.LEFT, p.CENTER);
			p.text(pt[0], cx, sub ? y + tam * 0.3 : y);
			if (pt[1] === 'v') setaVetor(cx + w / 2, y - tam * 0.62, Math.max(w, tam * 0.5), cor);
			cx += w;
		});
	}
	function setaVetor(cx, y, w, cor) {   // pequena seta sobre a letra de um vetor
		const x1 = cx - w / 2, x2 = cx + w / 2 + 1;
		p.stroke(...cor); p.strokeWeight(1.8);
		p.line(x1, y, x2, y);
		p.noStroke(); p.fill(...cor); p.triangle(x2 + 2, y, x2 - 5, y - 3.5, x2 - 5, y + 3.5);
	}

	/* ---------- números ---------- */
	function fm(x, n = 3) {
		if (Math.abs(x) < 0.5 * Math.pow(10, -n)) x = 0;
		return UT.fmt(x, n).replace('-', '−');
	}

	/* ---------- desenho ---------- */
	function seta(x1, y1, x2, y2, cor, peso = 3, ponta = 16) {
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.stroke(...cor); p.strokeWeight(peso);
		p.line(x1, y1, x2 - (ponta - 4) * Math.cos(a), y2 - (ponta - 4) * Math.sin(a));
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...cor); p.triangle(0, 0, -ponta, -ponta * 0.4, -ponta, ponta * 0.4);
		p.pop();
	}
	// setor de ângulo (graus, sentido matemático) de a1 a a2 com a1 < a2
	function setor(cx, cy, r, a1, a2, cor, alfa = 55) {
		p.noStroke(); p.fill(...cor, alfa);
		p.arc(cx, cy, 2 * r, 2 * r, -rad(a2), -rad(a1), p.PIE);
		p.noFill(); p.stroke(...cor); p.strokeWeight(2.5);
		p.arc(cx, cy, 2 * r, 2 * r, -rad(a2), -rad(a1));
	}
	// diferença d − a reduzida a ]−180, 180]
	function dif(d, a) {
		let x = ((d - a) % 360 + 360) % 360;
		return x > 180 ? x - 360 : x;
	}
	// ângulo entre as direções a e d (o menor), desenhado em P; devolve o ângulo médio
	function anguloEntre(a, d, r, cor, alfa) {
		const dd = dif(d, a), i0 = Math.min(a, a + dd), i1 = Math.max(a, a + dd);
		setor(X(P0.x), Y(P0.y), r, i0, i1, cor, alfa);
		return (i0 + i1) / 2;
	}

	// direção (graus) para o nome de P: bissetriz de uma abertura entre as retas
	// sem ângulos desenhados, de preferência virada para cima
	function lugarP(ar, as, comBeta) {
		const md = (a, b) => ((a + b) / 2 % 360 + 360) % 360;
		const usados = [];
		const beta = Math.abs(ar - as);
		usados.push(beta > 90 ? md(ar, ar + dif(as + 180, ar)) : md(ar, ar + dif(as, ar)));
		if (comBeta) usados.push(md(ar, ar + dif(as, ar)));
		const ds = [ar, ar + 180, as, as + 180].map(a => a % 360).sort((a, b) => a - b);
		let melhor = 270, val = -Infinity;
		for (let i = 0; i < 4; i++) {
			const a = ds[i], b = i < 3 ? ds[i + 1] : ds[0] + 360;
			if (b - a < 30) continue;
			const m = md(a, b);
			if (usados.some(u => Math.abs(dif(u, m)) < 1)) continue;
			const v = Math.sin(rad(m));
			if (v > val) { val = v; melhor = m; }
		}
		return melhor;
	}

	function grelha() {
		p.stroke(...COR.grelha); p.strokeWeight(1);
		for (let i = -6; i <= 6; i++) p.line(X(i), 0, X(i), H);
		for (let j = -5; j <= 7; j++) p.line(PAINEL, Y(j), W, Y(j));
		p.stroke(...COR.eixo); p.strokeWeight(1.8);
		p.line(PAINEL + 6, O.y, W - 4, O.y);
		p.line(O.x, H - 4, O.x, 4);
		p.noStroke(); p.fill(...COR.eixo);
		p.triangle(W - 2, O.y, W - 14, O.y - 5, W - 14, O.y + 5);
		p.triangle(O.x, 2, O.x - 5, 14, O.x + 5, 14);
		p.stroke(...COR.eixo); p.strokeWeight(1.8);
		for (let i = -5; i <= 5; i++) {
			if (i === 0) continue;
			p.line(X(i), O.y - 5, X(i), O.y + 5);
			rot(String(i).replace('-', '−'), X(i), O.y + 18, COR.eixo, 16, p.CENTER, p.NORMAL);
		}
		for (let j = -4; j <= 6; j++) {
			if (j === 0) continue;
			p.line(O.x - 5, Y(j), O.x + 5, Y(j));
			rot(String(j).replace('-', '−'), O.x - 10, Y(j), COR.eixo, 16, p.RIGHT, p.NORMAL);
		}
		rot('O', O.x - 12, O.y + 16, COR.eixo, 18);
		rot('x', W - 14, O.y - 18, COR.eixo, 20, p.CENTER, p.ITALIC);
		rot('y', O.x + 16, 14, COR.eixo, 20, p.CENTER, p.ITALIC);
	}

	function reta(a, cor) {
		const c = Math.cos(rad(a)), s = Math.sin(rad(a)), T = 20;
		p.stroke(...cor); p.strokeWeight(3);
		p.line(X(P0.x - T * c), Y(P0.y - T * s), X(P0.x + T * c), Y(P0.y + T * s));
	}
	function nomeReta(a, nome, cor, t) {
		const c = Math.cos(rad(a)), s = Math.sin(rad(a));
		// normal "à esquerda" do sentido do vetor (no ecrã)
		const px = X(P0.x + t * c) - 20 * s, py = Y(P0.y + t * s) - 20 * c;
		rot(nome, px, py, cor, 26, p.CENTER, p.BOLDITALIC);
	}

	// inclinação: setor onde a reta corta Ox
	function inclinacao(a, nome, cor, r) {
		if (a === 0) return;                         // paralela a Ox: α = 0°
		const s = Math.sin(rad(a)), c = Math.cos(rad(a));
		const x0 = P0.x - P0.y * c / s;              // abcissa do ponto de interseção com Ox
		const cx = X(x0);
		if (cx < PAINEL + 10 || cx > W - 10) return;
		setor(cx, O.y, r, 0, a, cor, 45);
		p.noStroke(); p.fill(...cor); p.circle(cx, O.y, 8);
		const m = rad(a / 2), d = r + 18;
		seq([['α'], [nome, '_']], cx + d * Math.cos(m), O.y - d * Math.sin(m), cor, 22, p.CENTER, p.BOLD);
	}

	function vetor(a, nome, cor, t = 1.7) {
		const c = Math.cos(rad(a)), s = Math.sin(rad(a));
		const x2 = X(P0.x + t * c), y2 = Y(P0.y + t * s);
		p.stroke(255); p.strokeWeight(9); p.line(X(P0.x), Y(P0.y), x2, y2);
		seta(X(P0.x), Y(P0.y), x2, y2, cor, 5, 20);
		// rótulo à direita do sentido do vetor (lado oposto ao nome da reta)
		seq([[nome, 'v']], x2 + 22 * s - 6, y2 + 22 * c + 4, cor, 26, p.CENTER, p.BOLDITALIC);
	}

	p.draw = function () {
		p.background(255);

		const ar = aR, as = aS;
		const cr = Math.cos(rad(ar)), sr = Math.sin(rad(ar));
		const cs = Math.cos(rad(as)), ss = Math.sin(rad(as));
		const beta = Math.abs(ar - as);               // ângulo dos vetores (0 ≤ β < 180)
		const theta = Math.min(beta, 180 - beta);     // ângulo das retas
		const pe = cr * cs + sr * ss;                 // produto escalar (vetores unitários)
		const perp = beta === 90;
		const obtuso = beta > 90;

		// referencial e retas (recortados à área do gráfico)
		p.drawingContext.save();
		p.drawingContext.beginPath();
		p.drawingContext.rect(PAINEL, 0, W - PAINEL, H);
		p.drawingContext.clip();
		grelha();
		reta(ar, COR.r); reta(as, COR.s);
		if (cxInc.checked()) {
			inclinacao(ar, 'r', COR.r, 38);
			inclinacao(as, 's', COR.s, 58);
		}

		// ângulos em P
		const PX = X(P0.x), PY = Y(P0.y);
		if (cxBeta.checked() && obtuso) {
			const m = anguloEntre(ar, as, 46, COR.beta, 40);
			rot('β', PX + 66 * Math.cos(rad(m)), PY - 66 * Math.sin(rad(m)), COR.beta, 26);
		}
		if (beta !== 0) {
			// θ: entre r e o sentido de ±s que faz ângulo agudo com r
			const d = obtuso ? as + 180 : as;
			if (perp) {
				const q = 22, ux = q * cr, uy = -q * sr, vx = q * cs, vy = -q * ss;
				p.noStroke(); p.fill(...COR.theta, 60);
				p.quad(PX, PY, PX + ux, PY + uy, PX + ux + vx, PY + uy + vy, PX + vx, PY + vy);
				p.noFill(); p.stroke(...COR.theta); p.strokeWeight(2.5);
				p.line(PX + ux, PY + uy, PX + ux + vx, PY + uy + vy);
				p.line(PX + vx, PY + vy, PX + ux + vx, PY + uy + vy);
				const m = rad(ar + 45);
				rot('θ', PX + 48 * Math.cos(m), PY - 48 * Math.sin(m), COR.theta, 26);
			} else {
				let m = anguloEntre(ar, d, 34, COR.theta, 70);
				let k = 0;
				if (theta < 25 && !obtuso) {
					// ângulo pequeno entre os dois vetores: estes tapariam o rótulo; usa-se
					// também o ângulo verticalmente oposto (igual), do lado sem vetores
					m = anguloEntre(ar + 180, d + 180, 34, COR.theta, 70);
					k = (25 - theta) * 1.5;
				} else if (theta < 25) {
					// ângulo pequeno entre r e −s: rótulo por fora, do lado de −s
					const dd = dif(d, ar);
					m = ar + dd + Math.sign(dd) * 20;
					k = -8;
				}
				rot('θ', PX + (54 + k) * Math.cos(rad(m)), PY - (54 + k) * Math.sin(rad(m)), COR.theta, 26);
			}
		}

		if (cxVet.checked()) {
			vetor(ar, 'r', COR.r);
			vetor(as, 's', COR.s);
		}
		nomeReta(ar, 'r', COR.r, 3.4);
		nomeReta(as, 's', COR.s, 3.4);

		// ponto P, com o nome numa abertura obtusa onde não há ângulos desenhados
		p.noStroke(); p.fill(30, 41, 59); p.circle(PX, PY, 11);
		const mP = rad(lugarP(ar, as, obtuso && cxBeta.checked()));
		rot('P', PX + 26 * Math.cos(mP), PY - 26 * Math.sin(mP), COR.texto, 22, p.CENTER, p.BOLDITALIC);
		p.drawingContext.restore();

		painel(ar, as, cr, sr, cs, ss, pe, beta, theta, perp, obtuso);
	};

	function painel(ar, as, cr, sr, cs, ss, pe, beta, theta, perp, obtuso) {
		p.noStroke(); p.fill(248, 250, 252); p.rect(0, 0, PAINEL, H);
		p.stroke(203, 213, 225); p.strokeWeight(1.5); p.line(PAINEL, 0, PAINEL, H);

		const x = 18;
		let y = 32;
		const L = (partes, cor, dy = 34, tam = 21, est = p.NORMAL) => { seq(partes, x, y, cor, tam, p.LEFT, est); y += dy; };

		const decl = (a, n, cor) => {
			if (a === 90) L([['m'], [n, '_'], [': não existe (vertical)']], cor);
			else L([['m'], [n, '_'], [` = tan ${a}° ≈ ${fm(Math.tan(rad(a)))}`]], cor);
		};

		L([['α'], ['r', '_'], [` = ${ar}°`]], COR.r, 32, 22, p.BOLD);
		decl(ar, 'r', COR.r);
		L([['r', 'v'], [` = (${fm(cr)}; ${fm(sr)})`]], COR.r, 46);

		L([['α'], ['s', '_'], [` = ${as}°`]], COR.s, 32, 22, p.BOLD);
		decl(as, 's', COR.s);
		L([['s', 'v'], [` = (${fm(cs)}; ${fm(ss)})`]], COR.s, 46);

		L([['‖'], ['r', 'v'], ['‖ = ‖'], ['s', 'v'], ['‖ = 1']], COR.texto, 36);
		L([['r', 'v'], [' · '], ['s', 'v'], [` ≈ ${fm(pe)}`]], perp ? COR.perp : COR.texto, 36, 22, perp ? p.BOLD : p.NORMAL);
		L([[`β = ${beta}°`], [obtuso ? '  (obtuso)' : '']], obtuso ? COR.beta : COR.texto, 36);
		L([[`cos θ = |`], ['r', 'v'], [' · '], ['s', 'v'], [`| ≈ ${fm(Math.abs(pe))}`]], COR.theta, 38);
		if (beta === 0) L([['θ = 0°  (coincidentes)']], COR.theta, 40, 24, p.BOLD);
		else if (obtuso) L([[`θ = 180° − β = ${theta}°`]], COR.theta, 40, 24, p.BOLD);
		else L([[`θ = ${theta}°`]], COR.theta, 40, 24, p.BOLD);

		if (perp) {
			y += 4;
			L([['r ⊥ s']], COR.perp, 34, 26, p.BOLD);
			if (ar !== 90 && as !== 90 && ar !== 0 && as !== 0)
				L([['m'], ['r', '_'], [' × m'], ['s', '_'], [' = −1']], COR.perp, 34, 24, p.BOLD);
			else
				L([['(uma é vertical: sem m'], ['r', '_'], [' × m'], ['s', '_'], [')']], COR.perp, 34, 18);
		} else if (ar !== 90 && as !== 90) {
			y += 4;
			L([['m'], ['r', '_'], [' × m'], ['s', '_'], [` ≈ ${fm(Math.tan(rad(ar)) * Math.tan(rad(as)))}`]], COR.texto, 34);
		}
	}
};
