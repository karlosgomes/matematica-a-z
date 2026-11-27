/* =====================================================================
   Deduções animadas com Manim (piloto, 2026-11-27): <section data-manim="videos/pasta" data-passos="N">
   com um <video class="manim"> e N − 1 fragmentos vazios. Cada passo é um vídeo curto (passo0.mp4 …),
   feito com manim-slides (~/manim-slides/pe-deducao/deducao.py). Ao avançar (→, espaço, clique no botão)
   toca o passo seguinte; ao recuar mostra o fim do passo anterior; ao entrar no diapositivo de trás para a
   frente mostra o último passo já acabado.
   ===================================================================== */
(function () {
	function passoVisivel(sec) { return sec.querySelectorAll('.fragment.visible').length; }
	function mostrar(sec, i, tocar) {
		const v = sec.querySelector('video.manim');
		if (!v) return;
		const src = `${sec.dataset.manim}/passo${i}.mp4`;
		const fim = () => { v.pause(); if (isFinite(v.duration)) v.currentTime = Math.max(0, v.duration - 0.05); };
		if (!v.src.endsWith(src)) {
			v.src = src;
			v.onloadedmetadata = () => { v.onloadedmetadata = null; tocar ? v.play().catch(() => {}) : fim(); };
		} else if (tocar) { v.currentTime = 0; v.play().catch(() => {}); }
		else fim();
		const n = +sec.dataset.passos || 1, ind = sec.querySelector('.manim-passo');
		if (ind) ind.textContent = `passo ${i + 1} de ${n}`;
	}
	function entrar(ev) {
		const sec = ev.currentSlide;
		if (!sec || !sec.dataset.manim) return;
		const i = passoVisivel(sec);
		mostrar(sec, i, i === 0);   // de trás para a frente: o último passo já acabado
	}
	Reveal.on('ready', entrar);
	Reveal.on('slidechanged', entrar);
	Reveal.on('fragmentshown', ev => { const sec = ev.fragment.closest('section[data-manim]'); if (sec) mostrar(sec, passoVisivel(sec), true); });
	Reveal.on('fragmenthidden', ev => { const sec = ev.fragment.closest('section[data-manim]'); if (sec) mostrar(sec, passoVisivel(sec), false); });
	// tocar no vídeo = avançar (no projetor e no telemóvel)
	document.addEventListener('click', e => { if (e.target.matches && e.target.matches('video.manim')) Reveal.next(); });
})();
