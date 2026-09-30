/* =====================================================================
   Resumo — círculo trigonométrico
     modo 'def' : P(cos α, sin α) e T(1, tan α)
     modo 'ff'  : triângulo retângulo e fórmula fundamental
   ===================================================================== */
function circuloTrig(modo) {
	return function (p, controlos) {
		const W = 920, H = 600;
		const O = { x: 290, y: 300 }, R = 220;          // centro e raio (px) do círculo
		const COR = {
			eixo: [100, 116, 139], circ: [30, 41, 59], cos: [29, 78, 216], sin: [220, 38, 38],
			tan: [5, 150, 105], ang: [124, 58, 237], P: [219, 39, 119], texto: [30, 41, 59]
		};

		let alfa = 35, aAnimar = false, sl, btPlay, cxT;

		// coordenadas: unidades do círculo -> ecrã
		const X = x => O.x + x * R;
		const Y = y => O.y - y * R;

		p.setup = function () {
			p.createCanvas(W, H);
			p.textFont('Source Sans Pro');

			sl = UT.slider(p, controlos, 'α', -180, 360, alfa, 0.5);
			sl.input(() => { parar(); alfa = sl.value(); });
			btPlay = UT.botao(p, controlos, '▶ Animar', () => {
				aAnimar = !aAnimar;
				btPlay.html(aAnimar ? '⏸ Pausa' : '▶ Animar');
			});
			UT.quebra(p, controlos);
			[-180, -90, -45, 0, 30, 45, 60, 90, 120, 180, 270, 360].forEach(v =>
				UT.botao(p, controlos, v + '°', () => { parar(); alfa = v; sl.value(v); }, 'atalho'));
			if (modo === 'def') {
				UT.quebra(p, controlos);
				cxT = UT.caixa(p, controlos, 'Mostrar reta x = 1 e o ponto T', true);
			}
		};

		function parar() { aAnimar = false; btPlay.html('▶ Animar'); }

		function rot(t, x, y, cor = COR.texto, tam = 22, ah = p.CENTER, estilo = p.BOLD) {
			p.stroke(255); p.strokeWeight(6); p.strokeJoin(p.ROUND);   // contorno branco para legibilidade
			p.fill(...cor); p.textSize(tam); p.textStyle(estilo);
			p.textAlign(ah, p.CENTER); p.text(t, x, y);
		}
		function seta(x1, y1, x2, y2) {
			p.line(x1, y1, x2, y2);
			const a = Math.atan2(y2 - y1, x2 - x1);
			p.push(); p.translate(x2, y2); p.rotate(a);
			p.noStroke(); p.fill(...COR.eixo); p.triangle(0, 0, -12, -5, -12, 5); p.pop();
		}
		const f = (x, n = 3) => UT.fmt(x, n);

		p.draw = function () {
			if (aAnimar) {   // percorre [−180°, 360°] e recomeça
				alfa += 20 * p.deltaTime / 1000;
				if (alfa > 360) alfa = -180;
				sl.value(alfa);
			}
			const a = p.radians(alfa), c = Math.cos(a), s = Math.sin(a);
			const semTan = Math.abs(c) < 1e-9;
			const t = s / c;

			p.background(255);

			// eixos e circunferência
			p.stroke(...COR.eixo); p.strokeWeight(1.5);
			seta(X(-1.3), O.y, X(1.45), O.y);
			seta(O.x, Y(-1.3), O.x, Y(1.3));
			rot('x', X(1.45), O.y + 20, COR.eixo, 20, p.CENTER, p.ITALIC);
			rot('y', O.x - 18, Y(1.3), COR.eixo, 20, p.CENTER, p.ITALIC);
			rot('O', O.x - 16, O.y + 18, COR.eixo, 20);
			rot('1', X(1) + 12, O.y + 18, COR.eixo, 18, p.LEFT, p.NORMAL);
			p.noFill(); p.stroke(...COR.circ); p.strokeWeight(2);
			p.circle(O.x, O.y, 2 * R);

			// reta x = 1, reta OP e ponto T
			const mostrarT = modo === 'def' && cxT.checked();
			if (mostrarT) {
				p.stroke(...COR.tan, 160); p.strokeWeight(2);
				p.line(X(1), 10, X(1), H - 10);
				rot('x = 1', X(1) + 10, 24, COR.tan, 20, p.LEFT);
				if (!semTan) {
					// reta OP prolongada até x = 1 (e para lá de O quando cos α < 0)
					p.stroke(150); p.strokeWeight(1.2);
					p.drawingContext.setLineDash([7, 6]);
					p.line(X(-1.3), Y(-1.3 * t), X(1.3), Y(1.3 * t));
					p.drawingContext.setLineDash([]);
					const TY = Y(t);
					if (TY > 0 && TY < H) {
						p.stroke(...COR.tan); p.strokeWeight(6);
						p.line(X(1), O.y, X(1), TY);
						p.noStroke(); p.fill(...COR.tan); p.circle(X(1), TY, 14);
						rot('T(1, tan α)', X(1) + 14, TY + (t >= 0 ? -18 : 18), COR.tan, 22, p.LEFT);
					} else {
						rot('T fora da figura', X(1) + 14, t > 0 ? 50 : H - 30, COR.tan, 18, p.LEFT, p.NORMAL);
					}
				}
			}

			// ângulo α
			// (no ecrã o y cresce para baixo: ângulo positivo = arco de −a a 0)
			if (Math.abs(alfa) > 0.1) {
				const i0 = Math.min(-a, 0), i1 = Math.max(-a, 0);
				p.noStroke(); p.fill(...COR.ang, 60);
				Math.abs(alfa) >= 359.9 ? p.circle(O.x, O.y, 110) : p.arc(O.x, O.y, 110, 110, i0, i1, p.PIE);
				p.noFill(); p.stroke(...COR.ang); p.strokeWeight(2);
				Math.abs(alfa) >= 359.9 ? p.circle(O.x, O.y, 110) : p.arc(O.x, O.y, 110, 110, i0, i1);
				// seta no fim do arco: sentido positivo (anti-horário) ou negativo (horário)
				const sg = Math.sign(alfa), ex = O.x + 55 * Math.cos(a), ey = O.y - 55 * Math.sin(a);
				p.push(); p.translate(ex, ey); p.rotate(-a - sg * p.HALF_PI);
				p.noStroke(); p.fill(...COR.ang); p.triangle(0, 0, -12, -5, -12, 5);
				p.pop();
			}
			rot('α', O.x + 78 * Math.cos(a / 2), O.y - 78 * Math.sin(a / 2), COR.ang, 24);

			// cos e sin
			if (modo === 'def') {
				p.strokeWeight(6);
				p.stroke(...COR.cos); p.line(O.x, O.y, X(c), O.y);
				p.stroke(...COR.sin); p.line(O.x, O.y, O.x, Y(s));
				p.stroke(120); p.strokeWeight(1.2);
				p.drawingContext.setLineDash([6, 5]);
				p.line(X(c), Y(s), X(c), O.y); p.line(X(c), Y(s), O.x, Y(s));
				p.drawingContext.setLineDash([]);
				rot('cos α', X(c / 2), O.y + (s >= 0 ? 22 : -22), COR.cos, 20);
				rot('sin α', O.x + (c >= 0 ? -12 : 12), Y(s / 2), COR.sin, 20, c >= 0 ? p.RIGHT : p.LEFT);
			} else {
				// triângulo retângulo [O, (cos α, 0), P]
				p.noStroke(); p.fill(250, 204, 21, 70);
				p.triangle(O.x, O.y, X(c), O.y, X(c), Y(s));
				p.strokeWeight(6);
				p.stroke(...COR.cos); p.line(O.x, O.y, X(c), O.y);
				p.stroke(...COR.sin); p.line(X(c), O.y, X(c), Y(s));
				// ângulo reto
				const q = 14, dx = c >= 0 ? -q : q, dy = s >= 0 ? -q : q;
				if (Math.abs(c) > 0.08 && Math.abs(s) > 0.08) {
					p.noFill(); p.stroke(80); p.strokeWeight(1.5);
					p.rect(Math.min(X(c), X(c) + dx), Math.min(O.y, O.y + dy), q, q);
				}
				rot('|cos α|', X(c / 2), O.y + (s >= 0 ? 22 : -22), COR.cos, 20);
				rot('|sin α|', X(c) + (c >= 0 ? 12 : -12), Y(s / 2), COR.sin, 20, c >= 0 ? p.LEFT : p.RIGHT);
				rot('1', X(c / 2) + (c * s >= 0 ? -14 : 14), Y(s / 2) - 14, COR.circ, 22);
			}

			// raio OP e ponto P
			p.stroke(...COR.circ); p.strokeWeight(3);
			p.line(O.x, O.y, X(c), Y(s));
			p.noStroke(); p.fill(...COR.P); p.circle(X(c), Y(s), 16);
			// rótulo de P do lado oposto à reta x = 1
			rot(modo === 'def' ? 'P(cos α, sin α)' : 'P', X(c) - 14, Y(s) + (s >= 0 ? -22 : 22), COR.P, 22, p.RIGHT);

			painel(c, s, t, semTan);
		};

		// valores numéricos à direita
		function painel(c, s, t, semTan) {
			const x = 700;
			let y = 120;
			const linha = (txt, cor, dy = 44, tam = 24, est = p.NORMAL) => {
				rot(txt, x, y, cor, tam, p.LEFT, est); y += dy;
			};
			linha(`α = ${UT.fmt(alfa, 1)}°`, COR.ang, 56, 28, p.BOLD);
			if (modo === 'def') {
				linha(`cos α ≈ ${f(c)}`, COR.cos);
				linha(`sin α ≈ ${f(s)}`, COR.sin);
				linha(semTan ? 'tan α não definida' : `tan α ≈ ${f(t)}`, COR.tan);
			} else {
				linha(`cos α ≈ ${f(c)}`, COR.cos, 40);
				linha(`sin α ≈ ${f(s)}`, COR.sin, 60);
				linha(`cos²α ≈ ${f(c * c)}`, COR.cos, 40);
				linha(`sin²α ≈ ${f(s * s)}`, COR.sin, 40);
				p.stroke(...COR.texto); p.strokeWeight(1.5); p.line(x, y - 20, x + 200, y - 20);
				linha(`soma = ${f(c * c + s * s)}`, COR.texto, 40, 26, p.BOLD);
			}
		}
	};
}

SKETCHES['trig-circulo'] = circuloTrig('def');
SKETCHES['trig-fundamental'] = circuloTrig('ff');
