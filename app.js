(function () {
  const $ = s => document.querySelector(s);

  /* ---------- clase Tailwind reutilizabile (aplicate din JS) ---------- */
  const UI = {
    btn: 'rounded-[10px] border px-3.5 py-2 text-sm cursor-pointer bg-white text-[#1c2a2f] border-[#d5dcd8] hover:border-[#1f6f78] dark:bg-[#1a252a] dark:text-[#e8eeec] dark:border-[#2d3c42] dark:hover:border-[#5fb7c0]',
    field: 'w-full rounded-[10px] border bg-transparent px-3 py-2 border-[#d5dcd8] dark:border-[#2d3c42]',
    panel: 'rounded-2xl border bg-white border-[#d5dcd8] dark:bg-[#1a252a] dark:border-[#2d3c42]',
    segOff: 'px-3 py-2 text-sm border cursor-pointer bg-white text-[#1c2a2f] border-[#d5dcd8] dark:bg-[#1a252a] dark:text-[#e8eeec] dark:border-[#2d3c42]',
    segOn: 'px-3 py-2 text-sm border cursor-pointer bg-[#1f6f78] text-white border-[#1f6f78] dark:bg-[#5fb7c0] dark:text-[#0c1518] dark:border-[#5fb7c0]',
    segPos: ['rounded-l-[10px]', '', 'rounded-r-[10px]'],
    dropOver: ['border-[#1f6f78]', 'bg-[#1f6f78]/10', 'dark:border-[#5fb7c0]'],
    cap: 'w-full bg-transparent border-t border-dashed px-2.5 py-2 font-serif italic text-base border-[#d5dcd8] dark:border-[#2d3c42]',
    toolBtn: 'w-7 h-7 rounded-lg bg-[#0f191c]/80 text-white cursor-pointer'
  };

  // Clasele trebuie scrise întregi, ca Tailwind CDN să le găsească.
  const GRID_COLS = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5'
  };
  const MOSAIC_COLS = {
    2: 'columns-2',
    3: 'columns-2 md:columns-3',
    4: 'columns-2 md:columns-4',
    5: 'columns-2 md:columns-5'
  };
  const TILTS = ['-rotate-[1.6deg]', 'rotate-[1.2deg]', '-rotate-[0.5deg]'];

  document.querySelectorAll('[data-btn]').forEach(el => (el.className += ' ' + UI.btn));
  document.querySelectorAll('[data-field]').forEach(el => (el.className += ' ' + UI.field));
  document.querySelectorAll('[data-panel]').forEach(el => (el.className += ' ' + UI.panel));

  /* ---------- stare ---------- */
  const state = { photos: [], layout: 'grid', cols: 3, theme: 'auto', cur: 0, timer: null };
  const gallery = $('#gallery');

  /* ---------- temă (clasa „dark” pe <html>) ---------- */
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  function applyTheme() {
    const dark = state.theme === 'dark' || (state.theme === 'auto' && mq.matches);
    document.documentElement.classList.toggle('dark', dark);
  }
  mq.addEventListener('change', applyTheme);
  $('#themeBtn').addEventListener('click', e => {
    const order = ['auto', 'light', 'dark'];
    const names = { auto: 'automată', light: 'luminoasă', dark: 'întunecată' };
    state.theme = order[(order.indexOf(state.theme) + 1) % 3];
    e.target.textContent = 'Temă: ' + names[state.theme];
    applyTheme();
  });

  /* ---------- butoane de aspect ---------- */
  const layoutBtns = [...document.querySelectorAll('#layouts button')];
  function paintLayoutBtns() {
    layoutBtns.forEach((b, i) => {
      b.className = (b.dataset.l === state.layout ? UI.segOn : UI.segOff) + ' ' + UI.segPos[i];
      b.setAttribute('aria-pressed', b.dataset.l === state.layout);
    });
  }
  $('#layouts').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    state.layout = b.dataset.l;
    render();
  });

  /* ---------- randare album ---------- */
  function render() {
    $('#outTitle').textContent = $('#title').value || 'Album fără titlu';
    $('#outSub').textContent = $('#subtitle').value;
    $('#count').textContent = state.photos.length
      ? state.photos.length + (state.photos.length === 1 ? ' fotografie' : ' fotografii') : '';
    $('#empty').classList.toggle('hidden', state.photos.length > 0);
    $('#colsVal').textContent = state.cols;
    paintLayoutBtns();

    const L = state.layout;
    gallery.className = L === 'mosaic'
      ? 'gap-4 ' + MOSAIC_COLS[state.cols]
      : 'grid ' + (L === 'pol' ? 'gap-6 ' : 'gap-4 ') + GRID_COLS[state.cols];

    gallery.innerHTML = '';
    state.photos.forEach((p, i) => {
      const fig = document.createElement('figure');
      fig.className = 'group relative overflow-hidden border break-inside-avoid bg-white border-[#d5dcd8] dark:bg-[#1a252a] dark:border-[#2d3c42] print:border-gray-300 '
        + (L === 'pol' ? 'p-3 pb-1 rounded-sm shadow-lg ' + TILTS[i % 3] : 'rounded-md')
        + (L === 'mosaic' ? ' mb-4' : '');

      const img = document.createElement('img');
      img.src = p.src;
      img.alt = p.caption || p.name;
      img.loading = 'lazy';
      img.tabIndex = 0;
      img.className = 'block w-full cursor-zoom-in '
        + (L === 'grid' ? 'aspect-[4/3] object-cover' : L === 'pol' ? 'aspect-square object-cover' : '');
      img.addEventListener('click', () => openLb(i));
      img.addEventListener('keydown', e => { if (e.key === 'Enter') openLb(i); });

      const tools = document.createElement('div');
      tools.className = 'absolute top-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 print:hidden';
      [['←', 'Mută înainte', () => move(i, -1)],
       ['→', 'Mută înapoi', () => move(i, 1)],
       ['✕', 'Șterge', () => remove(i)]].forEach(([t, label, fn]) => {
        const b = document.createElement('button');
        b.className = UI.toolBtn;
        b.textContent = t;
        b.title = label;
        b.setAttribute('aria-label', label);
        b.addEventListener('click', fn);
        tools.appendChild(b);
      });

      const cap = document.createElement('input');
      cap.className = UI.cap;
      cap.value = p.caption;
      cap.placeholder = 'Adaugă un titlu…';
      cap.setAttribute('aria-label', 'Titlu fotografie');
      cap.addEventListener('input', () => { p.caption = cap.value; img.alt = cap.value || p.name; });

      fig.append(img, tools, cap);
      gallery.appendChild(fig);
    });
  }

  function move(i, d) {
    const j = i + d;
    if (j < 0 || j >= state.photos.length) return;
    [state.photos[i], state.photos[j]] = [state.photos[j], state.photos[i]];
    render();
  }
  function remove(i) {
    URL.revokeObjectURL(state.photos[i].src);
    state.photos.splice(i, 1);
    render();
  }

  /* ---------- încărcare fotografii ---------- */
  function addFiles(files) {
    [...files].filter(f => f.type.startsWith('image/')).forEach(f => {
      state.photos.push({
        name: f.name,
        caption: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        src: URL.createObjectURL(f)
      });
    });
    render();
  }
  const drop = $('#drop');
  $('#file').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach(ev =>
    drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add(...UI.dropOver); }));
  ['dragleave', 'drop'].forEach(ev =>
    drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove(...UI.dropOver); }));
  drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));

  /* ---------- setări ---------- */
  $('#title').addEventListener('input', render);
  $('#subtitle').addEventListener('input', render);
  $('#cols').addEventListener('input', e => { state.cols = +e.target.value; render(); });
  $('#printBtn').addEventListener('click', () => window.print());
  $('#clearBtn').addEventListener('click', () => {
    if (!state.photos.length || !confirm('Ștergi toate fotografiile din album?')) return;
    state.photos.forEach(p => URL.revokeObjectURL(p.src));
    state.photos = [];
    render();
  });

  /* ---------- vizualizare mare + prezentare ---------- */
  const lb = $('#lb');
  function showLb() {
    const p = state.photos[state.cur];
    if (!p) return closeLb();
    $('#lbImg').src = p.src;
    $('#lbImg').alt = p.caption;
    $('#lbCap').textContent = p.caption;
  }
  function openLb(i) {
    state.cur = i;
    lb.classList.remove('hidden');
    lb.classList.add('flex');
    showLb();
  }
  function step(d) {
    state.cur = (state.cur + d + state.photos.length) % state.photos.length;
    showLb();
  }
  function closeLb() {
    lb.classList.add('hidden');
    lb.classList.remove('flex');
    clearInterval(state.timer);
    state.timer = null;
    $('#slideBtn').textContent = 'Prezentare';
  }
  $('#prev').addEventListener('click', () => step(-1));
  $('#next').addEventListener('click', () => step(1));
  $('#close').addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  $('#slideBtn').addEventListener('click', e => {
    if (!state.photos.length) return;
    if (state.timer) return closeLb();
    openLb(0);
    state.timer = setInterval(() => step(1), 3000);
    e.target.textContent = 'Oprește prezentarea';
  });

  applyTheme();
  render();
})();