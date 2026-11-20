/* =====================================================================
   Problema 13 — O teclado do telefone (tons DTMF)
   Cada tecla soma dois tons: s(t) = sin(2π·ℓ·t) + sin(2π·h·t), com ℓ a frequência da linha
   (697, 770, 852, 941 Hz) e h a da coluna (1209, 1336, 1477 Hz), como na figura da ficha
   (~/MAT_A_26_27/trigonometria/fichas/trig-osciladores-harmonicos.tex, problema 30).
   Em cima o teclado (carregar numa tecla toca o som enquanto se carrega; também com as teclas
   0–9, * e # do computador), por baixo o gráfico da soma dos tons numa janela de alguns
   milissegundos, com os dois tons a fino. «Comparar com s(t + Δ)» desenha s(t + 1/3) ou s(t + 1)
   a tracejado: coincide com s(t) quando Δ é período (alíneas 13.2 e 13.3).
   ===================================================================== */
SKETCHES['trig-p13'] = function (p, controlos) {
	const W = 940, H = 560;
	const LIN = [697, 770, 852, 941], COL = [1209, 1336, 1477];
	const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
	const KX = c => 62 + c * 82, KY = r => 46 + r * 54, KR = 22;      // centros e raio das teclas
	const GR = { x0: 70, x1: 905, y0: 318, y1: 538, A: 2.3 };         // gráfico: s ∈ [−A, A]
	const COR = {
		tecla: [241, 245, 249], borda: [100, 116, 139], ativa: [234, 88, 12], linha: [203, 213, 225],
		l: [21, 101, 192], h: [123, 31, 162], s: [194, 65, 12], delta: [5, 150, 105],
		texto: [30, 41, 59], cinza: [100, 116, 139], grelha: [226, 232, 240]
	};

	let tecla = 6, premida = -1, alinea = 0, delta = 0;     // tecla 7 ao início (o exemplo do enunciado)
	let slJan, cxTons, cxSom, cxCalc, btD3, btD1, itens = [];

	const lh = i => [LIN[Math.floor(i / 3)], COL[i % 3]];
	const s = (i, t) => { const [l, h] = lh(i); return Math.sin(2 * Math.PI * l * t) + Math.sin(2 * Math.PI * h * t); };

	p.setup = function () {
		const cv = p.createCanvas(W, H).elt;
		p.textFont('Source Sans Pro');
		ponteiro(cv);
		slJan = UT.slider(p, controlos, 'janela (ms)', 1, 20, 10, 0.5);
		cxTons = UT.caixa(p, controlos, 'Os dois tons', true);
		cxSom = UT.caixa(p, controlos, 'Som', true);
		UT.quebra(p, controlos);
		p.createSpan('Comparar com s(t + Δ):').parent(controlos);
		btD3 = UT.botao(p, controlos, 'Δ = 1/3 s', () => { delta = delta === 1 / 3 ? 0 : 1 / 3; }, 'atalho');
		btD1 = UT.botao(p, controlos, 'Δ = 1 s', () => { delta = delta === 1 ? 0 : 1; }, 'atalho');
		UT.quebra(p, controlos);
		[[1, 6, 0, 5], [2, 6, 1 / 3, 10], [3, 9, 1, 10]].forEach(([a, k, d, jan]) =>
			UT.botao(p, controlos, `13.${a}`, () => {
				escolher(alinea === a ? 0 : a);
				if (alinea) { tecla = k; delta = d; slJan.value(jan); if (a === 1) cxTons.checked(true); }
			}, 'atalho'));
		cxCalc = UT.caixa(p, controlos, 'Mostrar cálculos');
		itens = [...controlos.closest('section').querySelectorAll('ul.condicoes li')];

		// teclado do computador: 0–9, * e # tocam enquanto se carrega (só com este slide à vista)
		const minha = () => typeof Reveal !== 'undefined' && Reveal.getCurrentSlide() === controlos.closest('section');
		document.addEventListener('keydown', e => {
			const i = TECLAS.indexOf(e.key);
			if (i < 0 || !minha() || e.target.matches('input, textarea')) return;
			e.preventDefault(); e.stopPropagation();
			if (!e.repeat) premir(i);
		}, true);
		document.addEventListener('keyup', e => { if (TECLAS.includes(e.key)) largar(); }, true);
		if (typeof Reveal !== 'undefined') Reveal.on('slidechanged', largar);
	};

	function escolher(a) {
		alinea = a;
		itens.forEach((li, i) => { li.classList.toggle('atual', a === i + 1); li.classList.toggle('outra', a !== 0 && a !== i + 1); });
	}

	/* ---------------- som (Web Audio): dois osciladores sinusoidais ---------------- */
	let ctx = null, voz = null;
	function premir(i) {
		tecla = i; premida = i;
		if (!cxSom.checked()) return;
		ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
		if (ctx.state === 'suspended') ctx.resume();
		pararSom(0);
		const g = ctx.createGain(), agora = ctx.currentTime;
		g.gain.setValueAtTime(0, agora);
		g.gain.linearRampToValueAtTime(0.12, agora + 0.01);
		g.connect(ctx.destination);
		const osc = lh(i).map(f => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(g); o.start(agora); return o; });
		voz = { g, osc, inicio: agora };
	}
	function largar() { premida = -1; pararSom(0.18); }
	function pararSom(minimo) {                   // o som dura pelo menos `minimo` segundos
		if (!voz || !ctx) return;
		const v = voz; voz = null;
		const fim = Math.max(ctx.currentTime, v.inicio + minimo);
		v.g.gain.cancelScheduledValues(fim);
		v.g.gain.setValueAtTime(0.12, fim);
		v.g.gain.linearRampToValueAtTime(0, fim + 0.04);
		v.osc.forEach(o => o.stop(fim + 0.05));
	}

	/* ---------------- ponteiro: carregar nas teclas desenhadas no canvas ---------------- */
	function ponteiro(cv) {
		cv.style.touchAction = 'none';
		const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
		const qual = (x, y) => TECLAS.findIndex((_, i) => Math.hypot(x - KX(i % 3), y - KY(Math.floor(i / 3))) < KR + 6);
		cv.addEventListener('pointerdown', e => {
			const i = qual(...pos(e));
			if (i < 0) return;
			premir(i); e.stopPropagation(); e.preventDefault();
		});
		cv.addEventListener('pointermove', e => { cv.style.cursor = qual(...pos(e)) >= 0 ? 'pointer' : 'default'; });
		window.addEventListener('pointerup', () => { if (premida >= 0) largar(); });
		window.addEventListener('pointercancel', () => { if (premida >= 0) largar(); });
		['touchstart', 'touchmove'].forEach(t => cv.addEventListener(t, e => e.stopPropagation(), { passive: true }));
	}

	/* ---------------- desenho ---------------- */
	function rot(txt, x, y, cor = COR.texto, tam = 20, ah = p.CENTER, estilo = p.BOLD) {
		p.stroke(255); p.strokeWeight(5); p.strokeJoin(p.ROUND);
		p.fill(...cor); p.textSize(tam); p.textStyle(estilo); p.textAlign(ah, p.CENTER); p.text(txt, x, y);
	}
	function tracejado(x0, y0, x1, y1, cor, peso = 1.5, dd = [6, 5]) {
		p.stroke(...cor); p.strokeWeight(peso); p.drawingContext.setLineDash(dd);
		p.line(x0, y0, x1, y1); p.drawingContext.setLineDash([]);
	}

	function teclado() {
		const [l, h] = lh(tecla), lr = Math.floor(tecla / 3), lc = tecla % 3;
		// linhas até às frequências (a da tecla escolhida em destaque)
		for (let r = 0; r < 4; r++) {
			const on = r === lr;
			p.stroke(...(on ? COR.l : COR.linha)); p.strokeWeight(on ? 3 : 1.5);
			p.line(KX(0), KY(r), 292, KY(r));
			rot(String(LIN[r]), 300, KY(r), on ? COR.l : COR.cinza, on ? 20 : 17, p.LEFT, on ? p.BOLD : p.NORMAL);
		}
		for (let c = 0; c < 3; c++) {
			const on = c === lc;
			p.stroke(...(on ? COR.h : COR.linha)); p.strokeWeight(on ? 3 : 1.5);
			p.line(KX(c), KY(0), KX(c), 236);
			rot(String(COL[c]), KX(c), 252, on ? COR.h : COR.cinza, on ? 20 : 17, p.CENTER, on ? p.BOLD : p.NORMAL);
		}
		rot('Hz', 300, 252, COR.cinza, 15, p.LEFT, p.NORMAL);
		TECLAS.forEach((n, i) => {
			const x = KX(i % 3), y = KY(Math.floor(i / 3)), esc = i === tecla, prem = i === premida;
			p.stroke(...(esc ? COR.ativa : COR.borda)); p.strokeWeight(esc ? 3 : 1.8);
			p.fill(...(prem ? COR.ativa : esc ? [255, 237, 213] : COR.tecla));
			p.circle(x, y + (prem ? 2 : 0), 2 * KR);
			p.noStroke(); p.fill(...(prem ? [255, 255, 255] : COR.texto));
			p.textSize(22); p.textStyle(p.BOLD); p.textAlign(p.CENTER, p.CENTER);
			p.text(n, x, y + (prem ? 2 : 0) + (n === '*' ? 4 : 0));
		});
		return [l, h];
	}

	function painel(l, h) {
		const X0 = 370;
		let y = 36;
		const ln = (pecas, tam = 20) => {               // texto às cores: [[texto, cor, estilo], …]
			let x = X0; p.noStroke(); p.textSize(tam); p.textAlign(p.LEFT, p.CENTER);
			for (const [t, cor, est] of pecas) { p.textStyle(est || p.NORMAL); p.fill(...(cor || COR.texto)); p.text(t, x, y); x += p.textWidth(t); }
			y += tam * 1.7;
		};
		ln([['Tecla ' + TECLAS[tecla], COR.ativa, p.BOLD]], 26);
		ln([['ℓ = ' + l + ' Hz', COR.l, p.BOLD], ['     ', null], ['h = ' + h + ' Hz', COR.h, p.BOLD]]);
		ln([['s(t) = ', COR.s, p.BOLD], ['sin(2π·' + l + ' t)', COR.l], [' + ', null], ['sin(2π·' + h + ' t)', COR.h]]);
		if (cxCalc.checked() && alinea) {
			const C = {
				1: ['sin(2π·852 t): T = 2π / (2π·852) = 1/852 s ≈ 1,17 ms',
					'sin(2π·1209 t): T = 1/1209 s ≈ 0,83 ms',
					'(o período é o inverso da frequência)'],
				2: ['852 = 3 × 284   e   1209 = 3 × 403',
					'sin(2π·852 (t + 1/3)) = sin(2π·852 t + 284 × 2π)',
					'Em 1/3 s cabem 284 e 403 oscilações completas',
					'dos dois tons  ⇒  s(t + 1/3) = s(t)'],
				3: ['s*(t) = sin(1882πt) + sin(2418πt)',
					'Em 1 s cabem 941 e 1209 oscilações  ⇒  s*(t + 1) = s*(t)',
					'941 não é múltiplo de 3: com Δ = 1/3 s já não coincidem']
			};
			y += 4;
			C[alinea].forEach(t => ln([[t, COR.texto]], 17));
		} else {
			ln([['Períodos: 1/' + l + ' s ≈ ' + UT.fmt(1000 / l, 2) + ' ms  e  1/' + h + ' s ≈ ' + UT.fmt(1000 / h, 2) + ' ms', COR.cinza]], 17);
			ln([['Carrega numa tecla (ou nas teclas 0–9, * e # do computador)', COR.cinza]], 16);
			ln([['para ouvir o som.', COR.cinza]], 16);
		}
	}

	function grafico(l, h) {
		const jan = slJan.value() / 1000, { x0, x1, y0, y1, A } = GR;
		const GX = t => p.map(t, 0, jan, x0, x1), GY = v => p.map(v, -A, A, y1, y0), ym = GY(0);
		// grelha: de 1 em 1 ms (de 2 em 2 com janelas grandes)
		const passo = slJan.value() > 10 ? 2 : 1;
		p.stroke(...COR.grelha); p.strokeWeight(1);
		for (let ms = passo; ms <= slJan.value() + 1e-9; ms += passo) p.line(GX(ms / 1000), y0, GX(ms / 1000), y1);
		[-2, -1, 1, 2].forEach(v => p.line(x0, GY(v), x1, GY(v)));
		p.stroke(...COR.cinza); p.strokeWeight(1.4);
		p.line(x0, ym, x1 + 14, ym); p.line(x0, y0 - 6, x0, y1);
		rot('t (ms)', x1 + 16, y1 + 12, COR.cinza, 15, p.RIGHT, p.ITALIC);
		for (let ms = passo; ms < slJan.value() - 0.4; ms += passo) rot(String(ms), GX(ms / 1000), y1 + 12, COR.cinza, 14, p.CENTER, p.NORMAL);
		[-2, -1, 1, 2].forEach(v => rot(String(v).replace('-', '−'), x0 - 10, GY(v), COR.cinza, 14, p.RIGHT, p.NORMAL));

		const curva = (f, cor, peso, dd) => {
			p.noFill(); p.stroke(...cor); p.strokeWeight(peso); if (dd) p.drawingContext.setLineDash(dd);
			p.beginShape();
			for (let x = x0; x <= x1; x += 1) p.vertex(x, GY(f(p.map(x, x0, x1, 0, jan))));
			p.endShape(); p.drawingContext.setLineDash([]);
		};
		if (cxTons.checked()) {
			curva(t => Math.sin(2 * Math.PI * l * t), [...COR.l, 120], 1.5);
			curva(t => Math.sin(2 * Math.PI * h * t), [...COR.h, 120], 1.5);
		}
		curva(t => s(tecla, t), COR.s, 3);
		if (delta) curva(t => s(tecla, t + delta), COR.delta, 3, [9, 7]);

		// 13.1: um período de cada tom
		if (alinea === 1 && cxTons.checked()) {
			[[l, COR.l, GY(1) - 12], [h, COR.h, GY(-1) + 12]].forEach(([f, cor, yy]) => {
				const xa = GX(0), xb = GX(1 / f);
				p.stroke(...cor); p.strokeWeight(2); p.line(xa, yy, xb, yy);
				p.line(xa, yy - 6, xa, yy + 6); p.line(xb, yy - 6, xb, yy + 6);
				rot('T = 1/' + f + ' s', xb + 8, yy, cor, 16, p.LEFT, p.BOLD);
			});
		}

		// legenda
		let x = x0 + 6;
		const leg = (txt, cor) => { rot(txt, x, y0 - 14, cor, 16, p.LEFT, p.BOLD); p.textSize(16); x += p.textWidth(txt) + 22; };
		leg('s(t)', COR.s);
		if (cxTons.checked()) { leg('sin(2π·' + l + ' t)', COR.l); leg('sin(2π·' + h + ' t)', COR.h); }
		if (delta) leg('s(t + ' + (delta === 1 ? '1' : '1/3') + ')', COR.delta);
	}

	p.draw = function () {
		p.background(255);
		btD3.style('font-weight', delta === 1 / 3 ? '700' : '400');
		btD1.style('font-weight', delta === 1 ? '700' : '400');
		const [l, h] = teclado();
		painel(l, h);
		grafico(l, h);
	};
};
