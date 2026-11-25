/* =====================================================================
   Trigonometria · Problema 16 — os visitantes do lago
   Gráfico de dispersão com Observable Plot (a mesma biblioteca da app Estatística), integrado no enunciado
   (pedido do utilizador, 2026-11-26): etiqueta com o mês e o número de visitantes ao passar o rato por um ponto;
   o ponto e a linha da tabela acendem-se juntos (passar o rato no gráfico ou na tabela).
   ===================================================================== */
(function () {
	const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
	const Y = [6500, 6600, 15800, 26000, 38000, 36000, 31300, 23500, 12000, 4000, 900, 2100];
	const DADOS = Y.map((y, i) => ({ i, x: i + 1, y, mes: MESES[i] }));
	const AZUL = '#1d4ed8', REALCE = '#dc2626';
	const num = v => v >= 10000 ? v.toLocaleString('pt-PT').replace(/\s/g, ' ') : String(v);

	function construir() {
		const caixa = document.getElementById('lago-plot');
		if (!caixa || !window.Plot) return;
		const linhas = [...document.querySelectorAll('#trig-p16 table.lago tr[data-i]')];
		const grafico = Plot.plot({
			width: 640, height: 390, marginLeft: 62, marginBottom: 46, marginTop: 28,
			style: { fontFamily: 'Source Sans Pro, sans-serif', fontSize: '15px', background: 'transparent', color: '#1e293b' },
			x: { domain: [0.5, 12.5], ticks: 12, label: 'x (mês) →', labelAnchor: 'right', tickFormat: d => d },
			y: { domain: [0, 42000], grid: true, label: '↑ y (visitantes)', ticks: [0, 10000, 20000, 30000, 40000], tickFormat: num },
			marks: [
				Plot.ruleY([0], { stroke: '#1e293b' }),
				Plot.ruleX([0.5], { stroke: '#1e293b' }),
				Plot.dot(DADOS, { x: 'x', y: 'y', r: 6, fill: AZUL }),
				Plot.dot(DADOS, Plot.pointer({ x: 'x', y: 'y', r: 11, stroke: REALCE, strokeWidth: 2.5, fill: 'none' })),
				Plot.tip(DADOS, Plot.pointer({
					x: 'x', y: 'y', fontSize: 16, stroke: REALCE,
					title: d => `${d.mes} (x = ${d.x})\n${num(d.y)} visitantes`
				}))
			]
		});
		caixa.replaceChildren(grafico);
		const pontos = () => [...grafico.querySelectorAll('g[aria-label="dot"] circle')].slice(0, DADOS.length);
		const realcar = i => {
			linhas.forEach((tr, k) => tr.classList.toggle('realce', k === i));
			pontos().forEach((c, k) => { c.setAttribute('r', k === i ? 9 : 6); c.setAttribute('fill', k === i ? REALCE : AZUL); });
		};
		// gráfico → tabela
		grafico.addEventListener('input', () => realcar(grafico.value ? grafico.value.i : -1));
		// tabela → gráfico
		linhas.forEach((tr, k) => {
			tr.addEventListener('mouseenter', () => realcar(k));
			tr.addEventListener('mouseleave', () => realcar(-1));
		});
		// o Reveal não deve mudar de slide com o rato/dedo dentro do gráfico
		['pointerdown', 'touchstart'].forEach(t => caixa.addEventListener(t, e => e.stopPropagation(), { passive: true }));
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', construir); else construir();
})();
