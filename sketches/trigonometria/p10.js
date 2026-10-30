/* =====================================================================
   Problema 10 — Amarante: latitude, arco de meridiano e paralelo
   R = 6370 km, latitude φ = 41°
   10.1: arco NE = 41/360 · 2πR ≈ 4558 km   (corda [NE] = 2R sin 20,5° ≈ 4462 km)
   10.2: raio do paralelo r = R cos 41° ≈ 4808 km; num dia, 2πr ≈ 30 206 km
   Esfera em 3D desenhada à mão (projeção ortogonal), como na figura do manual:
   linhas da frente a cheio, linhas de trás a tracejado. A vista roda com cursores
   ou arrastando a Terra com o rato (ou o dedo): só se usam os deslocamentos do
   ponteiro, por isso a escala do Reveal não atrapalha.
   ===================================================================== */
(function () {
	const R_KM = 6370, LAT_G = 41, LAT = LAT_G * Math.PI / 180;

	// vetores 3D (Terra de raio 1; z = eixo de rotação, polo norte em cima)
	const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
	const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	const unit = a => mul(a, 1 / Math.hypot(...a));
	const sph = (lat, lon) => [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
	const km = x => Math.round(x).toLocaleString('pt-PT');

	function terra(alinea) {
		return function (p, controlos) {
			const W = 940, H = 560;
			const G = { cx: 238, cy: 285, k: 205 };          // centro da Terra no ecrã e raio (px)
			const PX = 478;                                   // painel das leituras
			const COR = {
				texto: [30, 41, 59], cinza: [100, 116, 139], grelha: [148, 163, 184], eixo: [71, 85, 105],
				arco: [234, 88, 12], corda: [124, 58, 237], paralelo: [219, 39, 119], raio: [5, 150, 105],
				equador: [29, 78, 216], ang: [124, 58, 237]
			};

			let az = -35, el = 18;                            // vista (graus)
			let s = 0, horas = 0, aAnimar = false;            // 10.1: viagem de N a E (0 a 1); 10.2: horas (0 a 24)
			let sl, slAz, slEl, btPlay, cxCorda, cxEq, cxCalc;
			let R_ = [0, 1, 0], U_ = [0, 0, 1], F_ = [1, 0, 0];

			p.setup = function () {
				arrastar(p.createCanvas(W, H).elt);
				p.textFont('Source Sans Pro');
				if (alinea === 1) {
					sl = UT.slider(p, controlos, 'Viagem N → E', 0, 1, s, 0.001);
					sl.input(() => { parar(); s = sl.value(); });
					btPlay = UT.botao(p, controlos, '▶ Viajar', () => {
						if (!aAnimar && s >= 1) definir(0);
						aAnimar ? parar() : (aAnimar = true, btPlay.html('⏸ Pausa'));
					});
				} else {
					sl = UT.slider(p, controlos, 'Horas', 0, 24, horas, 0.05);
					sl.input(() => { parar(); horas = sl.value(); });
					btPlay = UT.botao(p, controlos, '▶ Rodar a Terra', () => {
						if (!aAnimar && horas >= 24) definir(0);
						aAnimar ? parar() : (aAnimar = true, btPlay.html('⏸ Pausa'));
					});
					[['6 h', 6], ['12 h', 12], ['24 h', 24]].forEach(([t, v]) => UT.botao(p, controlos, t, () => { parar(); definir(v); }, 'atalho'));
				}
				UT.quebra(p, controlos);
				slAz = UT.slider(p, controlos, 'Rodar a vista', -180, 180, az, 1);
				slAz.input(() => { az = slAz.value(); });
				slEl = UT.slider(p, controlos, 'Inclinação', -60, 80, el, 1);
				slEl.input(() => { el = slEl.value(); });
				slAz.style('width', '220px'); slEl.style('width', '220px');
				UT.quebra(p, controlos);
				if (alinea === 1) cxCorda = UT.caixa(p, controlos, 'Corda [NE] (através da Terra)');
				else cxEq = UT.caixa(p, controlos, 'Equador');
				cxCalc = UT.caixa(p, controlos, 'Mostrar cálculos');
			};

			// arrastar com o rato (ou o dedo) roda a vista: a superfície acompanha o ponteiro
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
					slAz.value(az); slEl.value(el);
				});
				const fim = () => { ultimo = null; cv.style.cursor = 'grab'; };
				cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
				// no tablet, o deslize sobre a Terra não muda de slide
				['touchstart', 'touchmove'].forEach(t => cv.addEventListener(t, e => e.stopPropagation(), { passive: true }));
			}

			function parar() { aAnimar = false; btPlay.html(alinea === 1 ? '▶ Viajar' : '▶ Rodar a Terra'); }
			function definir(v) {
				if (alinea === 1) { s = p.constrain(v, 0, 1); sl.value(s); }
				else { horas = p.constrain(v, 0, 24); sl.value(horas); }
			}

			p.draw = function () {
				if (aAnimar) {
					const dt = p.deltaTime / 1000;
					if (alinea === 1) { definir(s + dt / 4); if (s >= 1) parar(); }       // 4 s de N a E
					else { definir(horas + 2 * dt); if (horas >= 24) parar(); }          // um dia em 12 s
				}
				camara();
				p.background(255);
				esfera();
				if (alinea === 1) viagem(); else rotacao();
				painel();
			};

			/* ---------------- projeção ---------------- */
			function camara() {
				const a = az * Math.PI / 180, e = el * Math.PI / 180;
				F_ = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];   // para o observador
				R_ = [-Math.sin(a), Math.cos(a), 0];
				U_ = [-Math.sin(e) * Math.cos(a), -Math.sin(e) * Math.sin(a), Math.cos(e)];
			}
			// ponto 3D → ecrã; d > 0: do lado do observador
			const pr = v => ({ x: G.cx + G.k * dot3(v, R_), y: G.cy - G.k * dot3(v, U_), d: dot3(v, F_) });

			// curva sobre a esfera: troços da frente a cheio, os de trás tracejados (ou omitidos)
			function curva(fn, t0, t1, n, cor, peso, tras = 'traco', alfa = 255) {
				const pts = [];
				for (let i = 0; i <= n; i++) pts.push(pr(fn(t0 + (t1 - t0) * i / n)));
				p.noFill(); p.strokeWeight(peso); p.strokeJoin(p.ROUND);
				let i = 0;
				while (i < n) {
					const frente = (pts[i].d + pts[i + 1].d) / 2 >= -1e-9;
					let j = i;
					while (j < n && ((pts[j].d + pts[j + 1].d) / 2 >= -1e-9) === frente) j++;
					if (frente || tras !== 'nada') {
						p.stroke(...cor, frente ? alfa : alfa * 0.55);
						if (!frente) p.drawingContext.setLineDash([7, 6]);
						p.beginShape();
						for (let k = i; k <= j; k++) p.vertex(pts[k].x, pts[k].y);
						p.endShape();
						p.drawingContext.setLineDash([]);
					}
					i = j;
				}
			}
			// segmento por dentro da Terra (pontilhado, como no manual) ou cheio
			function segmento(a, b, cor, peso, pontilhado = true) {
				const A = pr(a), B = pr(b);
				p.stroke(...cor); p.strokeWeight(peso);
				if (pontilhado) p.drawingContext.setLineDash([2, 5]);
				p.line(A.x, A.y, B.x, B.y);
				p.drawingContext.setLineDash([]);
			}
			function ponto(v, nome, cor = COR.texto, tam = 10, rotulo = true, fora = null) {
				const P = pr(v), oculto = Math.hypot(...v) > 0.99 && P.d < 0;
				p.noStroke(); p.fill(...cor, oculto ? 110 : 255); p.circle(P.x, P.y, tam);
				if (!rotulo) return;
				// etiqueta para fora do centro do ecrã (ou na direção dada)
				let dx = P.x - G.cx, dy = P.y - G.cy;
				if (fora) [dx, dy] = fora;
				const l = Math.hypot(dx, dy) || 1;
				rot(nome, P.x + dx / l * 20, P.y + dy / l * 20, cor, 24, oculto ? 110 : 255);
			}
			function rot(t, x, y, cor = COR.texto, tam = 22, alfa = 255, ah = p.CENTER, estilo = p.BOLD) {
				p.stroke(255, alfa); p.strokeWeight(6); p.strokeJoin(p.ROUND);
				p.fill(...cor, alfa); p.textSize(tam); p.textStyle(estilo);
				p.textAlign(ah, p.CENTER); p.text(t, x, y);
			}
			// arco de ângulo no ponto V, entre as direções a e b (vetores unitários), com raio r
			function angulo(V, a, b, r, cor, txt, rt = 1.6) {
				const pts = [];
				for (let i = 0; i <= 30; i++) pts.push(pr(add(V, mul(unit(add(mul(a, 1 - i / 30), mul(b, i / 30))), r))));
				p.noFill(); p.stroke(...cor); p.strokeWeight(2.5);
				p.beginShape(); pts.forEach(q => p.vertex(q.x, q.y)); p.endShape();
				const m = pr(add(V, mul(unit(add(a, b)), r * rt)));
				rot(txt, m.x, m.y, cor, 21);
			}

			/* ---------------- a Terra ---------------- */
			const giro = () => alinea === 2 ? 2 * Math.PI * horas / 24 : 0;
			function esfera() {
				// disco com sombreado (só chamadas diretas ao canvas, entre save/restore)
				const c = p.drawingContext;
				c.save();
				const g = c.createRadialGradient(G.cx - 0.35 * G.k, G.cy - 0.4 * G.k, 0.1 * G.k, G.cx, G.cy, G.k);
				g.addColorStop(0, '#f0f7ff'); g.addColorStop(1, '#bfd6ee');
				c.fillStyle = g; c.beginPath(); c.arc(G.cx, G.cy, G.k, 0, 2 * Math.PI); c.fill();
				c.restore();
				// meridianos e paralelos (de 30° em 30°, só a parte da frente); rodam com a Terra
				const w = giro();
				for (let j = 0; j < 12; j++) {
					const lon = j * Math.PI / 6 + w;
					curva(t => sph(t, lon), -Math.PI / 2, Math.PI / 2, 60, COR.grelha, 1, 'nada', 150);
				}
				for (const lt of [-60, -30, 30, 60])
					curva(t => sph(lt * Math.PI / 180, t), 0, 2 * Math.PI, 120, COR.grelha, 1, 'nada', 150);
				// equador
				const eq = alinea === 2 && cxEq.checked();
				curva(t => sph(0, t), 0, 2 * Math.PI, 160, eq ? COR.equador : COR.eixo, eq ? 3.5 : 2);
				// contorno
				p.noFill(); p.stroke(...COR.texto); p.strokeWeight(2); p.circle(G.cx, G.cy, 2 * G.k);
				// eixo de rotação (dentro da Terra, pontilhado)
				const Np = pr([0, 0, 1]), Sp = pr([0, 0, -1]), Nf = pr([0, 0, 1.2]), Sf = pr([0, 0, -1.2]);
				p.stroke(...COR.eixo); p.strokeWeight(2);
				if (Np.d >= 0) p.line(Np.x, Np.y, Nf.x, Nf.y);
				if (Sp.d >= 0) p.line(Sp.x, Sp.y, Sf.x, Sf.y);
				if (alinea === 2) {
					if (Np.d < 0) p.line(Np.x, Np.y, Nf.x, Nf.y);
					if (Sp.d < 0) p.line(Sp.x, Sp.y, Sf.x, Sf.y);
					segmento([0, 0, -1], [0, 0, 1], COR.eixo, 1.5);
					rot('eixo', Nf.x + 30, Nf.y + 4, COR.eixo, 18, 255, p.CENTER, p.NORMAL);
				}
			}

			/* ---------------- 10.1: de N até E, sobre a superfície ---------------- */
			function viagem() {
				const E = sph(LAT, 0), N = sph(0, 0), C = [0, 0, 0];
				// meridiano de Amarante
				curva(t => [Math.cos(t), 0, Math.sin(t)], 0, 2 * Math.PI, 160, COR.cinza, 1.5);
				// raios CN e CE e o ângulo ao centro
				segmento(C, N, COR.texto, 2); segmento(C, E, COR.texto, 2);
				angulo(C, N, E, 0.27, COR.ang, `${LAT_G}°`);
				// corda (através da Terra)
				if (cxCorda.checked()) {
					const A = pr(N), B = pr(E);
					p.stroke(...COR.corda); p.strokeWeight(3); p.drawingContext.setLineDash([10, 6]);
					p.line(A.x, A.y, B.x, B.y); p.drawingContext.setLineDash([]);
				}
				// o arco percorrido, de N até ao viajante
				const ang = s * LAT;
				if (ang > 1e-4) curva(t => sph(t, 0), 0, ang, 60, COR.arco, 6);
				ponto(C, 'C', COR.texto, 10, true, [-1, 0.3]);
				ponto(N, 'N', COR.texto, 11, true, [0, 1]);
				ponto(E, 'E', COR.texto, 11, true, [-0.4, -1]);
				if (s > 0 && s < 1) ponto(sph(ang, 0), '', COR.arco, 15, false);
			}

			/* ---------------- 10.2: a volta de Amarante num dia ---------------- */
			function rotacao() {
				const w = giro(), E = sph(LAT, w), O = [0, 0, Math.sin(LAT)], C = [0, 0, 0];
				const eh = [Math.cos(w), Math.sin(w), 0];
				// o paralelo de Amarante e o caminho já feito
				curva(t => sph(LAT, t), 0, 2 * Math.PI, 160, COR.paralelo, 2.5);
				if (w > 1e-4) curva(t => sph(LAT, t), 0, w, Math.max(8, Math.ceil(w * 40)), COR.arco, 6);
				// triângulo C, O, E: raio do paralelo r = OE, ângulo de 41° em E
				segmento(C, E, COR.texto, 2);
				segmento(O, E, COR.raio, 4, false);
				// ângulo reto em O
				const q = 0.07, a1 = add(O, [0, 0, -q]), a2 = add(add(O, [0, 0, -q]), mul(eh, q)), a3 = add(O, mul(eh, q));
				const A1 = pr(a1), A2 = pr(a2), A3 = pr(a3);
				p.noFill(); p.stroke(...COR.texto); p.strokeWeight(1.3);
				p.beginShape(); p.vertex(A1.x, A1.y); p.vertex(A2.x, A2.y); p.vertex(A3.x, A3.y); p.endShape();
				angulo(E, mul(E, -1), mul(eh, -1), 0.2, COR.ang, `${LAT_G}°`, 1.75);
				const M = pr(mul(add(O, E), 0.5));
				rot('r', M.x, M.y - 18, COR.raio, 24);
				ponto(C, 'C', COR.texto, 10, true, [1, 0.3]);
				ponto(O, 'O', COR.texto, 10, true, [-1, -0.2]);
				ponto(E, 'E', COR.texto, 13);
			}

			/* ---------------- leituras ---------------- */
			function painel() {
				let y = 40;
				const linha = (t, cor = COR.texto, tam = 22, est = p.NORMAL, dy = 34) => {
					p.noStroke(); p.fill(...cor); p.textSize(tam); p.textStyle(est); p.textAlign(p.LEFT, p.CENTER);
					p.text(t, PX, y); y += dy;
				};
				linha(`R = ${km(R_KM)} km     latitude = ${LAT_G}°`, COR.cinza, 20);
				y += 6;
				if (alinea === 1) {
					const ang = s * LAT_G;
					linha('Viagem de N até E, sobre a superfície', COR.texto, 22, p.BOLD);
					linha(`ângulo ao centro: ${UT.fmt(ang, 1)}° de ${LAT_G}°`, COR.arco);
					if (cxCalc.checked()) {
						y += 10;
						linha('O arco é proporcional ao ângulo ao centro:', COR.texto, 20);
						linha(`arco NE = ${LAT_G}/360 × 2π × ${km(R_KM)}`, COR.texto, 22);
						linha(`          ≈ ${km(LAT / (2 * Math.PI) * 2 * Math.PI * R_KM)} km`, COR.arco, 26, p.BOLD, 40);
						linha(`já percorrido ≈ ${km(s * LAT * R_KM)} km`, COR.arco, 21);
					}
					if (cxCorda.checked()) {
						y += 14;
						linha('Através da Terra (corda [NE]):', COR.corda, 21, p.BOLD);
						linha(cxCalc.checked() ? `2 × ${km(R_KM)} × sin ${UT.fmt(LAT_G / 2, 1)}° ≈ ${km(2 * R_KM * Math.sin(LAT / 2))} km`
							: 'mais curta do que o arco… mas não serve!', COR.corda, 21);
					}
				} else {
					const graus = horas / 24 * 360;
					linha(`Ao fim de ${UT.fmt(horas, 1)} h`, COR.texto, 22, p.BOLD);
					linha(`Amarante rodou ${UT.fmt(graus, 0)}° em torno do eixo`, COR.arco);
					linha('e descreveu um arco do seu paralelo', COR.paralelo, 21);
					if (cxCalc.checked()) {
						const r = R_KM * Math.cos(LAT);
						y += 10;
						linha('No triângulo [COE], retângulo em O:', COR.texto, 20);
						linha(`r = ${km(R_KM)} × cos ${LAT_G}° ≈ ${km(r)} km`, COR.raio, 22);
						linha(`num dia: 2πr ≈ ${km(2 * Math.PI * r)} km`, COR.arco, 26, p.BOLD, 40);
						linha(`até agora: ${UT.fmt(horas, 1)}/24 × 2πr ≈ ${km(horas / 24 * 2 * Math.PI * r)} km`, COR.arco, 21);
					}
					if (cxEq.checked()) {
						y += 14;
						linha(`Equador: 2πR ≈ ${km(2 * Math.PI * R_KM)} km`, COR.equador, 21, p.BOLD);
						if (cxCalc.checked()) linha('(cada paralelo é mais curto do que o equador)', COR.equador, 18);
					}
				}
			}
		};
	}

	SKETCHES['trig-p10a'] = terra(1);
	SKETCHES['trig-p10b'] = terra(2);
})();
