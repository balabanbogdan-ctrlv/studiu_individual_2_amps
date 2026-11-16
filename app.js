
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };

  /* ---------- clase Tailwind (scrise întregi, ca CDN-ul să le găsească) ---------- */
  var GRID_COLS = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5'
  };
  var MOSAIC_COLS = {
    2: 'columns-2',
    3: 'columns-2 md:columns-3',
    4: 'columns-2 md:columns-4',
    5: 'columns-2 md:columns-5'
  };
  var TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
  var SEG_ON  = 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-white'.split(' ');
  var SEG_OFF = 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white'.split(' ');
  var TOOL_BTN = 'grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';
  var CAPTION = 'w-full bg-transparent px-2 py-2.5 text-center font-serif text-base italic text-zinc-800 placeholder:text-zinc-400 focus:bg-black/5 focus:outline-none dark:text-zinc-200 print:placeholder:text-transparent';

  /* ---------- stare ---------- */
  var state = { photos: [], layout: 'grid', cols: 3, theme: 'auto', cur: 0, timer: null };
  var gallery = $('#gallery');

  /* ---------- temă ---------- */
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function applyTheme() {
    var dark = state.theme === 'dark' || (state.theme === 'auto' && mq.matches);
    document.documentElement.classList.toggle('dark', dark);
  }
  if (mq.addEventListener) mq.addEventListener('change', applyTheme);
  $('#themeBtn').addEventListener('click', function () {
    var order = ['auto', 'light', 'dark'];
    var names = { auto: 'Auto', light: 'Luminos', dark: 'Întunecat' };
    state.theme = order[(order.indexOf(state.theme) + 1) % 3];
    $('#themeLbl').textContent = names[state.theme];
    applyTheme();
  });

  /* ---------- randare ---------- */
  function render() {
    var n = state.photos.length;
    $('#count').textContent = n ? n + (n === 1 ? ' fotografie' : ' fotografii') : '';
    $('#empty').classList.toggle('hidden', n > 0);
    $('#colsVal').textContent = state.cols;

    document.querySelectorAll('#layouts button').forEach(function (b) {
      var on = b.dataset.l === state.layout;
      SEG_ON.forEach(function (c) { b.classList.toggle(c, on); });
      SEG_OFF.forEach(function (c) { b.classList.toggle(c, !on); });
      b.setAttribute('aria-pressed', on);
    });

    var L = state.layout;
    gallery.className = L === 'mosaic'
      ? 'gap-4 ' + MOSAIC_COLS[state.cols]
      : 'grid ' + (L === 'pol' ? 'gap-8 ' : 'gap-4 ') + GRID_COLS[state.cols];
    gallery.innerHTML = '';

    state.photos.forEach(function (p, i) {
      var fig = document.createElement('figure');
      fig.className = 'group relative break-inside-avoid overflow-hidden transition duration-200 ' + (
        L === 'pol'
          ? 'rounded-sm bg-white p-3 pb-1 text-zinc-800 shadow-xl ring-1 ring-black/5 hover:z-10 hover:rotate-0 hover:scale-[1.02] ' + TILTS[i % TILTS.length]
          : 'rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 print:ring-zinc-300'
      ) + (L === 'mosaic' ? ' mb-4' : '');

      var img = document.createElement('img');
      img.src = p.src;
      img.alt = p.caption || p.name;
      img.tabIndex = 0;
      img.className = 'block w-full cursor-zoom-in ' +
        (L === 'grid' ? 'aspect-[4/3] object-cover' : L === 'pol' ? 'aspect-square object-cover' : '');
      img.addEventListener('click', function () { openLb(i); });
      img.addEventListener('keydown', function (e) { if (e.key === 'Enter') openLb(i); });

      var badge = document.createElement('span');
      badge.className = 'absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur print:hidden' + (L === 'pol' ? ' left-5 top-5' : '');
      badge.textContent = i + 1;

      var tools = document.createElement('div');
      tools.className = 'absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 print:hidden' + (L === 'pol' ? ' right-5 top-5' : '');
      [
        ['‹', 'Mută înainte', function () { move(i, -1); }, ''],
        ['›', 'Mută înapoi', function () { move(i, 1); }, ''],
        ['×', 'Șterge', function () { remove(i); }, ' hover:!bg-rose-600']
      ].forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = TOOL_BTN + t[3];
        b.textContent = t[0];
        b.title = t[1];
        b.setAttribute('aria-label', t[1]);
        b.addEventListener('click', t[2]);
        tools.appendChild(b);
      });

      var cap = document.createElement('input');
      cap.className = CAPTION;
      cap.value = p.caption;
      cap.placeholder = 'Adaugă un titlu…';
      cap.setAttribute('aria-label', 'Titlu fotografie');
      cap.addEventListener('input', function () { p.caption = cap.value; img.alt = cap.value || p.name; });

      fig.appendChild(img);
      fig.appendChild(badge);
      fig.appendChild(tools);
      fig.appendChild(cap);
      gallery.appendChild(fig);
    });
  }

  function move(i, d) {
    var j = i + d;
    if (j < 0 || j >= state.photos.length) return;
    var t = state.photos[i]; state.photos[i] = state.photos[j]; state.photos[j] = t;
    render();
  }
  function remove(i) {
    URL.revokeObjectURL(state.photos[i].src);
    state.photos.splice(i, 1);
    render();
  }

  /* ---------- încărcare ---------- */
  function addFiles(files) {
    Array.prototype.forEach.call(files, function (f) {
      if (!f.type || f.type.indexOf('image/') !== 0) return;
      state.photos.push({
        name: f.name,
        caption: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        src: URL.createObjectURL(f)
      });
    });
    render();
  }
  $('#file').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });

  // drag & drop pe toată pagina
  var overlay = $('#dropOverlay');
  function showOverlay(on) { overlay.classList.toggle('hidden', !on); overlay.classList.toggle('flex', on); }
  window.addEventListener('dragover', function (e) { e.preventDefault(); showOverlay(true); });
  window.addEventListener('dragleave', function (e) { if (!e.relatedTarget) showOverlay(false); });
  window.addEventListener('drop', function (e) {
    e.preventDefault();
    showOverlay(false);
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  });

  /* ---------- setări ---------- */
  $('#layouts').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    state.layout = b.dataset.l;
    render();
  });
  $('#colsMinus').addEventListener('click', function () { state.cols = Math.max(2, state.cols - 1); render(); });
  $('#colsPlus').addEventListener('click', function () { state.cols = Math.min(5, state.cols + 1); render(); });

  $('#printBtn').addEventListener('click', function () { window.print(); });
  var wasDark = false;
  window.addEventListener('beforeprint', function () {
    wasDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
  });
  window.addEventListener('afterprint', function () {
    document.documentElement.classList.toggle('dark', wasDark);
  });

  $('#clearBtn').addEventListener('click', function () {
    if (!state.photos.length || !confirm('Ștergi toate fotografiile din album?')) return;
    state.photos.forEach(function (p) { URL.revokeObjectURL(p.src); });
    state.photos = [];
    render();
  });

  /* ---------- vizualizare mare + prezentare ---------- */
  var lb = $('#lb');
  function showLb() {
    var p = state.photos[state.cur];
    if (!p) { closeLb(); return; }
    $('#lbImg').src = p.src;
    $('#lbImg').alt = p.caption;
    $('#lbCap').textContent = p.caption;
    $('#lbNum').textContent = (state.cur + 1) + ' / ' + state.photos.length;
  }
  function openLb(i) {
    state.cur = i;
    lb.classList.remove('hidden');
    lb.classList.add('flex');
    showLb();
  }
  function step(d) {
    if (!state.photos.length) return;
    state.cur = (state.cur + d + state.photos.length) % state.photos.length;
    showLb();
  }
  function closeLb() {
    lb.classList.add('hidden');
    lb.classList.remove('flex');
    clearInterval(state.timer);
    state.timer = null;
    $('#slideLbl').textContent = 'Prezentare';
  }
  $('#prev').addEventListener('click', function () { step(-1); });
  $('#next').addEventListener('click', function () { step(1); });
  $('#close').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  $('#slideBtn').addEventListener('click', function () {
    if (!state.photos.length) { alert('Adaugă mai întâi cel puțin o fotografie.'); return; }
    openLb(0);
    state.timer = setInterval(function () { step(1); }, 3000);
    $('#slideLbl').textContent = 'Prezentare pornită';
  });

  applyTheme();
  render();
})();