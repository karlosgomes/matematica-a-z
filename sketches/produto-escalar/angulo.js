/* =====================================================================
   Produto escalar · Resumo 2 — ângulo de dois vetores
   u fixo; v roda (ângulo e norma em cursores). u·v = ‖u‖‖v‖cos θ, o sinal
   (agudo / reto / obtuso) e a projeção ortogonal H de v na reta de u.
   ===================================================================== */
SKETCHES['pe-angulo'] = function (p, controlos) {
	const W = 920, H = 600;
	const O = { x: 430, y: 330 }, K = 52;
	const COR = {
		eixo: [100, 116, 139], grelha: [226, 232, 240], u: [21, 101, 192], v: [123, 31, 162],
		pos: [46, 125, 50], zero: [239, 108, 0], neg: [211, 47, 47], texto: [30, 41, 59], cinza: [71, 85, 105]
	};
	const ANG_U = 20, NU = 4;                          // u = 4 (cos 20°, sin 20°)
	let slA, slN, btPlay, cxProj, animar = false;

	const X = x => O.x + x * K, Y = y => O.y - y * K;

	p.setup = function () {
		p.createCanvas(W, H);
		p.textFont('Source Sans Pro');
		slA = UT.slider(p, controlos, 'direção de v', 0, 360, 75, 1);
		slA.input(() => parar());
		slN = UT.slider(p, controlos, '‖v‖', 1, 5, 3, 0.5);
		btPlay = UT.botao(p, controlos, '▶ Rodar v', () => { animar = !animar; btPlay.html(animar ? '⏸ Pausa' : '▶ Rodar v'); });
		UT.quebra(p, controlos);
		UT.botao(p, controlos, 'Agudo', () => { parar(); slA.value(ANG_U + 50); }, 'atalho');
		UT.botao(p, controlos, 'Reto', () => { parar(); slA.value(ANG_U + 90); }, 'atalho');
		UT.botao(p, controlos, 'Obtuso', () => { parar(); slA.value(ANG_U + 135); }, 'atalho');
		UT.botao(p, controlos, 'Mesmo sentido', () => { parar(); slA.value(ANG_U); }, 'atalho');
		UT.botao(p, controlos, 'Sentidos opostos', () => { parar(); slA.value(ANG_U + 180); }, 'atalho');
		UT.quebra(p, controlos);
		cxProj = UT.caixa(p, controlos, 'Mostrar a projeção de v sobre u', true);
	};
	function parar() { animar = false; btPlay.html('▶ Rodar v'); }

	function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
		p.textAlign(ah, p.CENTER); p.text(t, x, y);
	}
	function nomeVetor(l, x, y, cor, tam = 26) {
		rot(l, x, y, cor, tam, p.CENTER, p.BOLDITALIC);
		const w = p.textWidth(l), yy = y - tam * 0.62;
		p.stroke(...cor); p.strokeWeight(2); p.line(x - w * 0.55, yy, x + w * 0.55, yy);
		p.noStroke(); p.fill(...cor); p.triangle(x + w * 0.55 + 4, yy, x + w * 0.55 - 3, yy - 4, x + w * 0.55 - 3, yy + 4);
	}
	function seta(x1, y1, x2, y2, cor, peso = 4) {
		p.stroke(...cor); p.strokeWeight(peso); p.line(x1, y1, x2, y2);
		const a = Math.atan2(y2 - y1, x2 - x1);
		p.push(); p.translate(x2, y2); p.rotate(a);
		p.noStroke(); p.fill(...cor); p.triangle(0, 0, -18, -7, -18, 7); p.pop();
	}
	function linha(pecas, x, y, tam = 23) {
		p.textSize(tam); p.textAlign(p.LEFT, p.CENTER); p.noStroke();
		for (const [t, cor, est] of pecas) { p.textStyle(est || p.NORMAL); p.fill(...(cor || COR.texto)); p.text(t, x, y); x += p.textWidth(t); }
		return x;
	}
	const f = (x, n = 2) => UT.fmt(Math.abs(x) < 0.005 ? 0 : x, n);

	p.draw = function () {
		if (animar) { let a = slA.value() + 25 * p.deltaTime / 1000; if (a > 360) a -= 360; slA.value(a); }
		const aV = slA.value(), nv = slN.value();
		const au = p.radians(ANG_U), av = p.radians(aV);
		const u = [NU * Math.cos(au), NU * Math.sin(au)], v = [nv * Math.cos(av), nv * Math.sin(av)];
		let th = Math.abs(aV - ANG_U) % 360; if (th > 180) th = 360 - th;      // ângulo dos vetores, em graus
		const c = Math.cos(p.radians(th)), d = NU * nv * c, dR = Math.round(d * 100) / 100;
		const cs = Math.abs(dR) < 1e-9 ? COR.zero : dR > 0 ? COR.pos : COR.neg;
		p.background(255);

		// quadrícula e eixos
		p.strokeWeight(1); p.stroke(...COR.grelha);
		for (let i = -8; i <= 9; i++) p.line(X(i), Y(-5.6), X(i), Y(5.6));
		for (let j = -5; j <= 5; j++) p.line(X(-8.5), Y(j), X(9.2), Y(j));
		p.stroke(...COR.eixo); p.strokeWeight(1.6);
		p.line(X(-8.5), O.y, X(9.2), O.y); p.line(O.x, Y(-5.6), O.x, Y(5.6));
		rot('O', O.x - 14, O.y + 16, COR.eixo, 18);

		// projeção H de v na reta de u
		const e = [Math.cos(au), Math.sin(au)], t = v[0] * e[0] + v[1] * e[1], Hp = [t * e[0], t * e[1]];
		if (cxProj.checked()) {
			p.drawingContext.setLineDash([7, 7]); p.stroke(...COR.u, 110); p.strokeWeight(1.6);
			p.line(X(-9 * e[0]), Y(-9 * e[1]), X(9 * e[0]), Y(9 * e[1]));       // reta suporte de u
			p.stroke(...COR.cinza); p.strokeWeight(2);
			p.line(X(v[0]), Y(v[1]), X(Hp[0]), Y(Hp[1]));
			p.drawingContext.setLineDash([]);
			if (Math.abs(t) > 0.05) { p.stroke(...cs, 200); p.strokeWeight(9); p.line(O.x, O.y, X(Hp[0]), Y(Hp[1])); }
			// ângulo reto em H
			if (Math.abs(t * t - nv * nv) > 0.05 && Math.abs(t) > 0.2) {
				const q = 12 / K, w = [v[0] - Hp[0], v[1] - Hp[1]], nw = Math.hypot(...w), a1 = [w[0] / nw * q, w[1] / nw * q], a2 = [-Math.sign(t) * e[0] * q, -Math.sign(t) * e[1] * q];
				p.noFill(); p.stroke(...COR.cinza); p.strokeWeight(1.5);
				p.beginShape(); p.vertex(X(Hp[0] + a1[0]), Y(Hp[1] + a1[1])); p.vertex(X(Hp[0] + a1[0] + a2[0]), Y(Hp[1] + a1[1] + a2[1])); p.vertex(X(Hp[0] + a2[0]), Y(Hp[1] + a2[1])); p.endShape();
			}
			p.noStroke(); p.fill(...COR.cinza); p.circle(X(Hp[0]), Y(Hp[1]), 10);
			rot('H', X(Hp[0]) + 10 * (-e[1]) * (t >= 0 ? 1 : -1) * -1, Y(Hp[1]) + 22, COR.cinza, 22);
		}

		// setor do ângulo θ (na cor do sinal; quadrado se reto)
		const r = 52;
		if (Math.abs(th - 90) < 0.5) {
			const q = 26, a1 = au, a2 = av;
			const P1 = [O.x + q * Math.cos(a1), O.y - q * Math.sin(a1)], P2 = [O.x + q * Math.cos(a2), O.y - q * Math.sin(a2)];
			p.noFill(); p.stroke(...cs); p.strokeWeight(2.5);
			p.beginShape(); p.vertex(...P1); p.vertex(P1[0] + P2[0] - O.x, P1[1] + P2[1] - O.y); p.vertex(...P2); p.endShape();
		} else if (th > 0.5) {
			let a0 = ANG_U, da = ((aV - ANG_U) % 360 + 360) % 360; if (da > 180) { a0 = aV; da = 360 - da; }
			p.fill(...cs, 50); p.stroke(...cs); p.strokeWeight(2.5);
			p.arc(O.x, O.y, 2 * r, 2 * r, -p.radians(a0 + da), -p.radians(a0), p.PIE);
		}
		{ let a0 = ANG_U, da = ((aV - ANG_U) % 360 + 360) % 360; if (da > 180) { a0 = aV; da = 360 - da; }
			const am = p.radians(a0 + da / 2); rot('θ', O.x + (r + 20) * Math.cos(am), O.y - (r + 20) * Math.sin(am), cs, 24, p.CENTER, p.BOLDITALIC); }

		// vetores
		seta(O.x, O.y, X(u[0]), Y(u[1]), COR.u);
		nomeVetor('u', X(u[0]) + e[0] * 24, Y(u[1]) - e[1] * 24 + 4, COR.u);
		seta(O.x, O.y, X(v[0]), Y(v[1]), COR.v);
		nomeVetor('v', X(v[0]) + Math.cos(av) * 24, Y(v[1]) - Math.sin(av) * 24 + 4, COR.v);

		// leitura
		p.noStroke(); p.fill(255, 235); p.rect(14, 12, 420, cxProj.checked() ? 168 : 128, 10);
		linha([['‖', null], ['u', COR.u, p.BOLDITALIC], ['‖ = ' + f(NU, 0) + '      ‖', null], ['v', COR.v, p.BOLDITALIC], ['‖ = ' + f(nv, 1) + '      θ = ' + f(th, 0) + '°', null]], 28, 36);
		linha([['cos θ ≈ ' + f(c), null]], 28, 74);
		linha([['u', COR.u, p.BOLDITALIC], [' · ', null], ['v', COR.v, p.BOLDITALIC], [' = ' + f(NU, 0) + ' × ' + f(nv, 1) + ' × cos θ ≈ ', null], [f(d), cs, p.BOLD]], 28, 112);
		if (cxProj.checked()) {
			const oh = Math.abs(t);
			linha([['u', COR.u, p.BOLDITALIC], [' · ', null], ['v', COR.v, p.BOLDITALIC], [' = ' + (dR < 0 ? '− ' : '') + '‖', null], ['u', COR.u, p.BOLDITALIC], ['‖ × OH ≈ ' + (dR < 0 ? '− ' : '') + f(NU, 0) + ' × ' + f(oh), null]], 28, 150);
		}
		const txt = Math.abs(dR) < 1e-9 ? 'u · v = 0  ⇔  u ⊥ v (ângulo reto)' : dR > 0 ? 'u · v > 0  ⇔  θ agudo' + (th < 0.5 ? ' (nulo)' : '') : 'u · v < 0  ⇔  θ obtuso' + (th > 179.5 ? ' (raso)' : '');
		rot(txt, W - 20, H - 24, cs, 23, p.RIGHT, p.BOLD);
	};
};
