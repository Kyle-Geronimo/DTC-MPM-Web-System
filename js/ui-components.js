/**
 * UI Components — Project Dashboard
 * Implements: form validation, confirmation modals, pagination,
 * table sorting, skeleton loaders, breadcrumbs, refresh timers,
 * search highlighting, collapsibles, tabs, step indicators,
 * tooltips, notification toggles, stat counters, and more.
 */

(function (w) {
  'use strict';

  /* ── helpers ─────────────────────────────────────────────── */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
  }

  /* ================================================================
     1. ALERT BANNERS
     ================================================================ */
  const Alert = {
    /**
     * @param {string} msg
     * @param {'success'|'error'|'warning'|'info'} type
     * @param {HTMLElement|string} target  — selector or element; default: prepend to .main-content
     * @param {number} autoDismiss ms, 0 = no auto-dismiss
     */
    show(msg, type = 'info', target = null, autoDismiss = 5000) {
      const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
      const titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };
      const el = document.createElement('div');
      el.className = `uic-alert uic-alert--${type}`;
      el.setAttribute('role', 'alert');
      el.innerHTML = `
        <span class="uic-alert__icon">${icons[type] || icons.info}</span>
        <span class="uic-alert__body">
          <strong class="uic-alert__title">${titles[type] || 'Notice'}</strong>
          ${esc(msg)}
        </span>
        <button class="uic-alert__close" aria-label="Dismiss">&times;</button>`;
      el.querySelector('.uic-alert__close').onclick = () => el.remove();
      const container = target
        ? (typeof target === 'string' ? qs(target) : target)
        : (qs('.main-content') || document.body);
      container.prepend(el);
      if (autoDismiss > 0) setTimeout(() => el.remove(), autoDismiss);
      return el;
    },
    success(m, t, d) { return this.show(m, 'success', t, d); },
    error  (m, t, d) { return this.show(m, 'error',   t, d); },
    warning(m, t, d) { return this.show(m, 'warning',  t, d); },
    info   (m, t, d) { return this.show(m, 'info',     t, d); }
  };

  /* ================================================================
     2 & 3. FORM VALIDATION + REQUIRED INDICATORS
     ================================================================ */
  const FormValidator = {
    rules: {
      required:  (v)      => v.trim() !== '',
      email:     (v)      => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      minLength: (v, min) => v.trim().length >= Number(min),
      maxLength: (v, max) => v.trim().length <= Number(max),
      min:       (v, min) => Number(v) >= Number(min),
      max:       (v, max) => Number(v) <= Number(max),
      pattern:   (v, p)   => new RegExp(p).test(v),
      match:     (v, id)  => { const el = document.getElementById(id); return el ? v === el.value : true; }
    },

    messages: {
      required:  ()      => 'This field is required.',
      email:     ()      => 'Please enter a valid email address.',
      minLength: (_, n)  => `Minimum ${n} characters required.`,
      maxLength: (_, n)  => `Maximum ${n} characters allowed.`,
      min:       (_, n)  => `Value must be at least ${n}.`,
      max:       (_, n)  => `Value must be no more than ${n}.`,
      pattern:   ()      => 'Invalid format.',
      match:     ()      => 'Fields do not match.'
    },

    /**
     * Attach real-time validation to a form.
     * @param {HTMLFormElement|string} form
     * @param {Object} fieldRules  e.g. { email: ['required','email'], pass: ['required',{minLength:8}] }
     */
    attach(form, fieldRules = {}) {
      if (typeof form === 'string') form = qs(form);
      if (!form) return;

      // Mark required fields
      Object.entries(fieldRules).forEach(([name, rules]) => {
        const field = form.querySelector(`[name="${name}"]`);
        if (!field) return;
        const grp = field.closest('.form-group');
        const label = grp ? grp.querySelector('label') : null;
        const isRequired = rules.some(r => r === 'required' || (typeof r === 'object' && r.required));
        if (isRequired && label && !label.querySelector('.uic-required')) {
          const star = document.createElement('span');
          star.className = 'uic-required'; star.textContent = ' *';
          label.appendChild(star);
        }
        // help text auto-inject
        if (grp) this._ensureHelpSlot(grp, name);

        field.addEventListener('blur', () => this._validateField(field, rules));
        field.addEventListener('input', () => {
          if (field.classList.contains('uic-invalid')) this._validateField(field, rules);
        });
        if (field.tagName === 'SELECT') {
          field.addEventListener('change', () => this._validateField(field, rules));
        }
      });

      form.addEventListener('submit', (e) => {
        let valid = true;
        Object.entries(fieldRules).forEach(([name, rules]) => {
          const field = form.querySelector(`[name="${name}"]`);
          if (field && !this._validateField(field, rules)) valid = false;
        });
        if (!valid) e.preventDefault();
      });
    },

    _ensureHelpSlot(grp, name) {
      if (!grp.querySelector('.uic-field-error, .uic-field-success')) {
        const slot = document.createElement('span');
        slot.className = 'uic-field-msg';
        slot.style.display = 'none';
        grp.appendChild(slot);
      }
    },

    _validateField(field, rules) {
      let valid = true;
      let errMsg = '';
      const v = field.value;
      for (const r of rules) {
        let rName, rArg;
        if (typeof r === 'string') { rName = r; rArg = undefined; }
        else { [rName, rArg] = Object.entries(r)[0]; }
        const fn = this.rules[rName];
        if (!fn) continue;
        const ok = rArg !== undefined ? fn(v, rArg) : fn(v);
        if (!ok) {
          valid = false;
          errMsg = (this.messages[rName] || (() => 'Invalid.'))(v, rArg);
          break;
        }
      }
      this._applyFieldState(field, valid, errMsg);
      return valid;
    },

    _applyFieldState(field, valid, errMsg) {
      field.classList.toggle('uic-valid', valid);
      field.classList.toggle('uic-invalid', !valid);
      const grp = field.closest('.form-group');
      if (!grp) return;
      let msg = grp.querySelector('.uic-field-msg');
      if (!msg) {
        msg = document.createElement('span');
        msg.className = 'uic-field-msg';
        grp.appendChild(msg);
      }
      if (!valid) {
        msg.textContent = errMsg;
        msg.className = 'uic-field-error';
        msg.style.display = '';
      } else {
        msg.textContent = '';
        msg.className = 'uic-field-msg';
        msg.style.display = 'none';
      }
    },

    /** Simple one-shot validate — returns true/false */
    validateNow(form, fieldRules) {
      if (typeof form === 'string') form = qs(form);
      if (!form) return false;
      let valid = true;
      Object.entries(fieldRules).forEach(([name, rules]) => {
        const field = form.querySelector(`[name="${name}"]`);
        if (field && !this._validateField(field, rules)) valid = false;
      });
      return valid;
    }
  };

  /* ================================================================
     5. CONFIRMATION MODAL
     ================================================================ */
  const ConfirmModal = {
    _overlay: null, _resolve: null,

    _build() {
      if (this._overlay) return;
      this._overlay = document.createElement('div');
      this._overlay.id = 'uic-confirm-overlay';
      this._overlay.innerHTML = `
        <div id="uic-confirm-box" role="dialog" aria-modal="true" aria-labelledby="uic-confirm-title">
          <span id="uic-confirm-icon"></span>
          <h2 id="uic-confirm-title"></h2>
          <p  id="uic-confirm-msg"></p>
          <div class="uic-confirm-actions">
            <button class="uic-btn-cancel" id="uic-confirm-cancel">Cancel</button>
            <button class="uic-btn-ok"     id="uic-confirm-ok">Confirm</button>
          </div>
        </div>`;
      document.body.appendChild(this._overlay);

      qs('#uic-confirm-cancel', this._overlay).onclick = () => this._close(false);
      qs('#uic-confirm-ok',     this._overlay).onclick = () => this._close(true);
      this._overlay.addEventListener('click', (e) => {
        if (e.target === this._overlay) this._close(false);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this._overlay.classList.contains('open')) this._close(false);
      });
    },

    _close(result) {
      this._overlay.classList.remove('open');
      if (this._resolve) { this._resolve(result); this._resolve = null; }
    },

    /**
     * Show a confirmation dialog.
     * @param {Object} opts { title, message, icon, okText, cancelText, danger }
     * @returns {Promise<boolean>}
     */
    show({ title = 'Confirm', message = 'Are you sure?', icon = '⚠️', okText = 'Confirm', cancelText = 'Cancel', danger = false } = {}) {
      this._build();
      qs('#uic-confirm-icon',  this._overlay).textContent = icon;
      qs('#uic-confirm-title', this._overlay).textContent = title;
      qs('#uic-confirm-msg',   this._overlay).textContent = message;
      const okBtn = qs('#uic-confirm-ok', this._overlay);
      okBtn.textContent = okText;
      okBtn.classList.toggle('danger', danger);
      qs('#uic-confirm-cancel', this._overlay).textContent = cancelText;
      this._overlay.classList.add('open');
      okBtn.focus();
      return new Promise(resolve => { this._resolve = resolve; });
    }
  };

  /* ================================================================
     6. PAGINATION ENGINE
     ================================================================ */
  const Paginator = {
    /**
     * Renders a paginated list.
     * @param {Object} opts
     *   items        — full array of items
     *   container    — HTMLElement where items are rendered
     *   pageSize     — items per page (default 10)
     *   renderItem   — fn(item, index) => HTMLElement
     *   emptyMessage — string
     *   pagerTarget  — HTMLElement to place the pager controls
     */
    create({ items = [], container, pageSize = 10, renderItem, emptyMessage = 'No items found.', pagerTarget = null }) {
      if (!container || !renderItem) return;
      let current = 1;

      const render = () => {
        container.innerHTML = '';
        const total = items.length;
        const pages = Math.max(1, Math.ceil(total / pageSize));
        if (current > pages) current = pages;
        if (current < 1)     current = 1;

        if (total === 0) {
          container.innerHTML = `<div class="uic-empty">
            <span class="uic-empty__icon">📭</span>
            <p class="uic-empty__title">Nothing here</p>
            <p class="uic-empty__msg">${esc(emptyMessage)}</p>
          </div>`;
        } else {
          const start = (current - 1) * pageSize;
          const slice = items.slice(start, start + pageSize);
          slice.forEach((item, i) => {
            const el = renderItem(item, start + i);
            if (el) container.appendChild(el);
          });
        }

        // Pager
        const pager = pagerTarget || _getOrCreatePager(container);
        this._renderPager(pager, { current, pages, total, pageSize,
          onChange: (p) => { current = p; render(); }
        });
      };

      function _getOrCreatePager(cont) {
        let p = cont.parentElement.querySelector('.uic-pagination');
        if (!p) {
          p = document.createElement('nav');
          p.className = 'uic-pagination';
          cont.parentElement.appendChild(p);
        }
        return p;
      }

      render();
      return { refresh: (newItems) => { if (newItems) items = newItems; current = 1; render(); } };
    },

    _renderPager(el, { current, pages, total, pageSize, onChange }) {
      if (!el) return;
      if (pages <= 1) { el.innerHTML = ''; return; }
      const start = Math.min((current - 1) * pageSize + 1, total);
      const end   = Math.min(current * pageSize, total);
      let html = `<button class="uic-pagination__btn" id="uic-pg-prev" ${current===1?'disabled':''}>&#8249;</button>`;
      // show up to 7 page buttons with ellipsis
      const range = this._pageRange(current, pages);
      range.forEach(p => {
        if (p === '…') html += `<span class="uic-pagination__info">…</span>`;
        else html += `<button class="uic-pagination__btn${p===current?' active':''}" data-pg="${p}">${p}</button>`;
      });
      html += `<button class="uic-pagination__btn" id="uic-pg-next" ${current===pages?'disabled':''}>&#8250;</button>`;
      html += `<span class="uic-pagination__info">${start}–${end} of ${total}</span>`;
      el.innerHTML = html;
      el.querySelector('#uic-pg-prev').onclick = () => onChange(current - 1);
      el.querySelector('#uic-pg-next').onclick = () => onChange(current + 1);
      el.querySelectorAll('[data-pg]').forEach(b => {
        b.onclick = () => onChange(Number(b.dataset.pg));
      });
    },

    _pageRange(cur, total) {
      if (total <= 7) return Array.from({length:total}, (_,i)=>i+1);
      if (cur <= 4)   return [1,2,3,4,5,'…',total];
      if (cur >= total-3) return [1,'…',total-4,total-3,total-2,total-1,total];
      return [1,'…',cur-1,cur,cur+1,'…',total];
    }
  };

  /* ================================================================
     7. TABLE SORTING
     ================================================================ */
  const TableSorter = {
    /**
     * Make a <table> sortable.
     * @param {HTMLTableElement|string} table
     * @param {Object} opts  { defaultCol, defaultDir }
     */
    attach(table, { defaultCol = 0, defaultDir = 'asc' } = {}) {
      if (typeof table === 'string') table = qs(table);
      if (!table) return;
      table.classList.add('uic-table');
      const ths = qsa('thead th', table);
      let sortCol = defaultCol, sortDir = defaultDir;

      ths.forEach((th, i) => {
        if (th.dataset.nosort !== undefined) return;
        th.classList.add('sortable');
        th.style.cursor = 'pointer';
        th.onclick = () => {
          sortDir = (sortCol === i && sortDir === 'asc') ? 'desc' : 'asc';
          sortCol = i;
          this._sort(table, sortCol, sortDir);
          ths.forEach((h, j) => {
            h.classList.remove('sort-asc','sort-desc');
            if (j === sortCol) h.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
          });
        };
      });

      if (ths.length > 0) {
        this._sort(table, sortCol, sortDir);
        if (ths[sortCol]) ths[sortCol].classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
      }
    },

    _sort(table, col, dir) {
      const tbody = table.querySelector('tbody');
      if (!tbody) return;
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.sort((a, b) => {
        const ac = a.cells[col] ? a.cells[col].textContent.trim() : '';
        const bc = b.cells[col] ? b.cells[col].textContent.trim() : '';
        const an = parseFloat(ac.replace(/[^0-9.\-]/g,'')), bn = parseFloat(bc.replace(/[^0-9.\-]/g,''));
        const cmp = (!isNaN(an) && !isNaN(bn)) ? an - bn : ac.localeCompare(bc);
        return dir === 'asc' ? cmp : -cmp;
      });
      rows.forEach(r => tbody.appendChild(r));
    }
  };

  /* ================================================================
     9. SKELETON LOADERS
     ================================================================ */
  const Skeleton = {
    /**
     * Replace container content with skeleton rows, restore when done.
     * @param {HTMLElement|string} container
     * @param {number} count  number of skeleton rows
     * @param {'card'|'row'|'text'} type
     * @returns {{ done: function }}
     */
    show(container, count = 4, type = 'card') {
      if (typeof container === 'string') container = qs(container);
      if (!container) return { done: () => {} };
      const original = container.innerHTML;
      container.innerHTML = '';
      for (let i = 0; i < count; i++) {
        if (type === 'card') {
          container.insertAdjacentHTML('beforeend', `
            <div class="uic-skeleton uic-skeleton--card" style="border-radius:12px;"></div>`);
        } else if (type === 'row') {
          container.insertAdjacentHTML('beforeend', `
            <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">
              <div class="uic-skeleton uic-skeleton--avatar"></div>
              <div style="flex:1;">
                <div class="uic-skeleton uic-skeleton--title" style="width:55%;"></div>
                <div class="uic-skeleton uic-skeleton--text" style="width:75%;"></div>
              </div>
            </div>`);
        } else {
          container.insertAdjacentHTML('beforeend', `
            <div class="uic-skeleton uic-skeleton--text" style="width:${60+Math.random()*35}%;"></div>`);
        }
      }
      return {
        done: (newContent = null) => {
          if (newContent !== null) container.innerHTML = newContent;
          else container.innerHTML = original;
        }
      };
    }
  };

  /* ================================================================
     10. BREADCRUMB NAVIGATION
     ================================================================ */
  const Breadcrumb = {
    /**
     * Render breadcrumbs.
     * @param {HTMLElement|string} target
     * @param {Array<{label, href?}>} crumbs
     */
    render(target, crumbs) {
      if (typeof target === 'string') target = qs(target);
      if (!target || !crumbs) return;
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', 'Breadcrumb');
      const ol = document.createElement('ol');
      ol.className = 'uic-breadcrumb';
      crumbs.forEach((c, i) => {
        const li = document.createElement('li');
        if (i < crumbs.length - 1 && c.href) {
          li.innerHTML = `<a href="${esc(c.href)}">${esc(c.label)}</a>`;
        } else {
          li.textContent = c.label;
        }
        ol.appendChild(li);
      });
      nav.appendChild(ol);
      target.prepend(nav);
    },

    /** Auto-build from sidebar active link */
    autoInject() {
      const mainContent = qs('.main-content');
      if (!mainContent) return;
      const path = window.location.pathname;
      const map = {
        'front_panel': 'Front Panel',
        'projects':    'Projects',
        'tasks':       'Tasks',
        'team':        'Team',
        'reports':     'Reports',
        'settings':    'Settings',
        'admin':       'Admin'
      };
      const key = Object.keys(map).find(k => path.includes(k));
      if (!key) return;
      const crumbs = [
        { label: 'Dashboard', href: '/ProjectDashboard/page/front_panel.html' },
        { label: map[key] }
      ];
      const shell = qs('.app-page-shell, .front-panel-shell');
      if (shell) {
        const header = shell.querySelector('header.header');
        if (header) Breadcrumb.render(header, crumbs);
        else this.render(shell, crumbs);
      }
    }
  };

  /* ================================================================
     11. DATA REFRESH TIMER
     ================================================================ */
  const RefreshTimer = {
    /**
     * Create a visible countdown refresh bar.
     * @param {HTMLElement|string} target — where to inject the bar
     * @param {number} intervalSec — seconds between refreshes
     * @param {function} onRefresh — called on each cycle
     * @returns {{ stop: fn, reset: fn }}
     */
    create(target, intervalSec = 30, onRefresh = null) {
      if (typeof target === 'string') target = qs(target);
      if (!target) return { stop: () => {}, reset: () => {} };

      let remaining = intervalSec;
      let paused = false;

      const bar = document.createElement('div');
      bar.className = 'uic-refresh-bar';
      bar.innerHTML = `
        <span class="uic-refresh-bar__dot"></span>
        <span>Auto-refresh in</span>
        <span class="uic-refresh-bar__timer">${intervalSec}s</span>
        <button class="uic-refresh-bar__btn" title="Pause/Resume">⏸</button>
        <button class="uic-refresh-bar__btn" title="Refresh now">🔄</button>`;
      target.appendChild(bar);

      const dotEl   = bar.querySelector('.uic-refresh-bar__dot');
      const timerEl = bar.querySelector('.uic-refresh-bar__timer');
      const pauseBtn = bar.querySelectorAll('.uic-refresh-bar__btn')[0];
      const nowBtn   = bar.querySelectorAll('.uic-refresh-bar__btn')[1];

      pauseBtn.onclick = () => {
        paused = !paused;
        pauseBtn.textContent = paused ? '▶' : '⏸';
        dotEl.classList.toggle('paused', paused);
      };
      nowBtn.onclick = () => { remaining = 0; };

      const tick = setInterval(() => {
        if (!paused) remaining--;
        if (remaining <= 0) {
          remaining = intervalSec;
          if (typeof onRefresh === 'function') onRefresh();
        }
        timerEl.textContent = remaining + 's';
      }, 1000);

      return {
        stop:  () => clearInterval(tick),
        reset: () => { remaining = intervalSec; }
      };
    }
  };

  /* ================================================================
     15. SEARCH RESULT HIGHLIGHTING
     ================================================================ */
  const SearchHighlight = {
    /**
     * Highlight all occurrences of `term` within `container` text nodes.
     */
    apply(container, term) {
      if (typeof container === 'string') container = qs(container);
      if (!container || !term || term.trim() === '') {
        if (container) this.clear(container);
        return;
      }
      this.clear(container);
      const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
      this._walk(container, re);
    },

    clear(container) {
      if (!container) return;
      qsa('.uic-highlight', container).forEach(h => {
        h.replaceWith(document.createTextNode(h.textContent));
      });
      container.normalize();
    },

    _walk(node, re) {
      if (node.nodeType === 3) {
        const text = node.textContent;
        if (!re.test(text)) return;
        re.lastIndex = 0;
        const frag = document.createDocumentFragment();
        let last = 0, m;
        while ((m = re.exec(text)) !== null) {
          frag.appendChild(document.createTextNode(text.slice(last, m.index)));
          const mark = document.createElement('mark');
          mark.className = 'uic-highlight';
          mark.textContent = m[1];
          frag.appendChild(mark);
          last = re.lastIndex;
        }
        frag.appendChild(document.createTextNode(text.slice(last)));
        node.replaceWith(frag);
      } else if (node.nodeType === 1 && !['SCRIPT','STYLE','INPUT','TEXTAREA'].includes(node.tagName)) {
        Array.from(node.childNodes).forEach(c => this._walk(c, re));
      }
    }
  };

  /* ================================================================
     16. NO RESULTS
     ================================================================ */
  const NoResults = {
    show(container, { msg = 'No results found.', icon = '🔍', hint = '' } = {}) {
      if (typeof container === 'string') container = qs(container);
      if (!container) return;
      container.innerHTML = `
        <div class="uic-no-results">
          <span class="uic-no-results__icon">${icon}</span>
          <p class="uic-no-results__title">${esc(msg)}</p>
          ${hint ? `<p class="uic-no-results__msg">${esc(hint)}</p>` : ''}
        </div>`;
    }
  };

  /* ================================================================
     19. COLLAPSIBLE SECTIONS
     ================================================================ */
  const Collapsible = {
    /**
     * Upgrade all .uic-collapsible elements in scope.
     * HTML structure: <div class="uic-collapsible">
     *   <div class="uic-collapsible__head">Title</div>
     *   <div class="uic-collapsible__body">Content</div>
     * </div>
     */
    initAll(scope = document) {
      qsa('.uic-collapsible', scope).forEach(el => this.init(el));
    },

    init(el) {
      const head = el.querySelector('.uic-collapsible__head');
      if (!head) return;
      // Ensure arrow icon
      if (!head.querySelector('.uic-collapsible__arrow')) {
        const arr = document.createElement('span');
        arr.className = 'uic-collapsible__arrow'; arr.textContent = '▼';
        head.appendChild(arr);
      }
      head.setAttribute('role', 'button');
      head.setAttribute('tabindex', '0');
      head.setAttribute('aria-expanded', el.classList.contains('open') ? 'true' : 'false');

      const toggle = () => {
        el.classList.toggle('open');
        head.setAttribute('aria-expanded', el.classList.contains('open') ? 'true' : 'false');
      };
      head.onclick = toggle;
      head.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
    },

    /**
     * Dynamically create a collapsible from title + content string.
     */
    create(title, contentHTML, startOpen = false) {
      const div = document.createElement('div');
      div.className = `uic-collapsible${startOpen ? ' open' : ''}`;
      div.innerHTML = `
        <div class="uic-collapsible__head">
          <span class="uic-collapsible__title">${esc(title)}</span>
          <span class="uic-collapsible__arrow">▼</span>
        </div>
        <div class="uic-collapsible__body">${contentHTML}</div>`;
      this.init(div);
      return div;
    }
  };

  /* ================================================================
     20. TAB NAVIGATION
     ================================================================ */
  const Tabs = {
    /**
     * Initialise tab components.
     * HTML: <div class="uic-tabs">
     *   <div class="uic-tab-bar">
     *     <button class="uic-tab-btn active" data-tab="one">One</button>
     *   </div>
     *   <div class="uic-tab-panel active" id="tab-one">…</div>
     * </div>
     */
    initAll(scope = document) {
      qsa('.uic-tabs', scope).forEach(el => this.init(el));
    },

    init(el) {
      const btns   = qsa('.uic-tab-btn', el);
      const panels = qsa('.uic-tab-panel', el);
      btns.forEach(btn => {
        btn.onclick = () => {
          const key = btn.dataset.tab;
          btns.forEach(b => b.classList.toggle('active', b === btn));
          panels.forEach(p => p.classList.toggle('active', p.id === `tab-${key}`));
        };
      });
    },

    /**
     * Switch to a specific tab by key.
     */
    activate(tabsEl, key) {
      if (typeof tabsEl === 'string') tabsEl = qs(tabsEl);
      const btn = tabsEl && tabsEl.querySelector(`[data-tab="${key}"]`);
      if (btn) btn.click();
    }
  };

  /* ================================================================
     21. STEP INDICATORS
     ================================================================ */
  const Steps = {
    /**
     * @param {HTMLElement|string} container
     * @param {string[]} labels
     * @param {number} current  1-based
     */
    render(container, labels, current = 1) {
      if (typeof container === 'string') container = qs(container);
      if (!container) return;
      container.innerHTML = '';
      container.className = 'uic-steps';
      labels.forEach((label, i) => {
        const step = document.createElement('div');
        const n = i + 1;
        step.className = `uic-step${n < current ? ' done' : n === current ? ' active' : ''}`;
        step.innerHTML = `
          <div class="uic-step__dot">${n < current ? '✓' : n}</div>
          <span class="uic-step__label">${esc(label)}</span>`;
        container.appendChild(step);
      });
    },

    advance(container, total) {
      const steps = qsa('.uic-step', container);
      const cur = steps.findIndex(s => s.classList.contains('active'));
      if (cur < 0 || cur >= total - 1) return;
      steps[cur].classList.remove('active'); steps[cur].classList.add('done');
      steps[cur + 1].classList.add('active');
      steps[cur + 1].querySelector('.uic-step__dot').textContent = cur + 2;
    }
  };

  /* ================================================================
     23. STAT COUNTER ANIMATION
     ================================================================ */
  const StatCounter = {
    /**
     * Animate number counting from 0 to target.
     * @param {HTMLElement|string} el
     * @param {number} target
     * @param {number} duration  ms
     */
    animate(el, target, duration = 800) {
      if (typeof el === 'string') el = qs(el);
      if (!el) return;
      const start = performance.now();
      const from  = parseFloat(el.textContent) || 0;
      const update = (t) => {
        const p = Math.min((t - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (target - from) * ease);
        if (p < 1) requestAnimationFrame(update);
        else el.textContent = target;
      };
      requestAnimationFrame(update);
    },

    /** Animate all [data-stat-target] elements in scope */
    initAll(scope = document) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const target = Number(e.target.dataset.statTarget);
            this.animate(e.target, target);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.3 });
      qsa('[data-stat-target]', scope).forEach(el => obs.observe(el));
    }
  };

  /* ================================================================
     24. NOTIFICATION TOGGLES
     ================================================================ */
  const NotifToggles = {
    STORAGE_KEY: 'uic_notif_prefs',

    defaults: {
      task_assigned:   true,
      project_updated: true,
      team_message:    true,
      deadline_alert:  true,
      system_alert:    false,
      email_digest:    true
    },

    load() {
      try { return Object.assign({}, this.defaults, JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}')); }
      catch { return Object.assign({}, this.defaults); }
    },

    save(prefs) {
      try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs)); } catch {}
    },

    /**
     * Render notification preference rows into `container`.
     */
    render(container, rows = null) {
      if (typeof container === 'string') container = qs(container);
      if (!container) return;
      const prefs = this.load();
      const defaultRows = [
        { key: 'task_assigned',   title: 'Task Assigned',    desc: 'Notify when a task is assigned to you.' },
        { key: 'project_updated', title: 'Project Updated',  desc: 'Notify when a project you follow is updated.' },
        { key: 'team_message',    title: 'Team Messages',    desc: 'Notify on new messages in your team chat.' },
        { key: 'deadline_alert',  title: 'Deadline Alerts',  desc: 'Remind you 48 h before a due date.' },
        { key: 'system_alert',    title: 'System Alerts',    desc: 'Server warnings and maintenance notices.' },
        { key: 'email_digest',    title: 'Email Digest',     desc: 'Receive a daily summary via email.' }
      ];
      const list = rows || defaultRows;
      const wrap = document.createElement('div');
      wrap.className = 'uic-notif-toggles';
      list.forEach(row => {
        const checked = prefs[row.key] !== undefined ? prefs[row.key] : true;
        const div = document.createElement('div');
        div.className = 'uic-notif-row';
        div.innerHTML = `
          <div class="uic-notif-row__info">
            <span class="uic-notif-row__title">${esc(row.title)}</span>
            <span class="uic-notif-row__desc">${esc(row.desc)}</span>
          </div>
          <label class="uic-toggle-wrap" aria-label="${esc(row.title)}">
            <input type="checkbox" data-notif-key="${esc(row.key)}" ${checked ? 'checked' : ''}>
            <span class="uic-toggle-slider"></span>
          </label>`;
        const input = div.querySelector('input');
        input.onchange = () => {
          const p = this.load();
          p[row.key] = input.checked;
          this.save(p);
          if (w.Toast) w.Toast.success(
            `${row.title} notifications ${input.checked ? 'enabled' : 'disabled'}.`
          );
        };
        wrap.appendChild(div);
      });
      container.appendChild(wrap);
    }
  };

  /* ================================================================
     ICON INDICATORS helper
     ================================================================ */
  const IconIndicator = {
    html(type, label = '') {
      const map = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️', pending:'⏳' };
      return `<span class="uic-icon-indicator uic-icon-indicator--${type}">${map[type]||'•'} ${esc(label)}</span>`;
    }
  };

  /* ================================================================
     STATUS BADGE helper
     ================================================================ */
  const StatusBadge = {
    html(status) {
      const key = (status||'').toLowerCase().replace(/\s+/g,'-');
      const labels = {
        active:'Active', completed:'Completed', 'on-hold':'On Hold',
        pending:'Pending', 'in-progress':'In Progress', cancelled:'Cancelled',
        high:'High', medium:'Medium', low:'Low', critical:'Critical'
      };
      return `<span class="uic-badge uic-badge--${key}">${esc(labels[key] || status)}</span>`;
    },
    /** Replace all .status-badge elements with proper uic-badge markup */
    upgradeAll(scope = document) {
      qsa('.status-badge', scope).forEach(el => {
        const txt = (el.dataset.status || el.textContent || '').trim();
        if (txt) el.outerHTML = this.html(txt);
      });
    }
  };

  /* ================================================================
     AUTO-INIT ON DOM READY
     ================================================================ */
  function init() {
    Collapsible.initAll();
    Tabs.initAll();
    StatCounter.initAll();
    Breadcrumb.autoInject();
    StatusBadge.upgradeAll();

    // Auto wire confirm dialogs on [data-confirm] buttons
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-confirm]');
      if (!btn) return;
      e.preventDefault();
      const msg    = btn.dataset.confirm    || 'Are you sure?';
      const title  = btn.dataset.confirmTitle || 'Confirm Action';
      const danger = btn.dataset.confirmDanger !== undefined;
      const ok     = await ConfirmModal.show({ title, message: msg, danger,
        okText: danger ? 'Delete' : 'Confirm', icon: danger ? '🗑️' : '⚠️' });
      if (ok) {
        // Re-fire original action if href or form submit
        if (btn.tagName === 'A' && btn.href) { window.location.href = btn.href; }
        else if (btn.form) { btn.form.submit(); }
        else if (btn.dataset.confirmAction) { eval(btn.dataset.confirmAction); }
        else btn.dispatchEvent(new CustomEvent('uic:confirmed', { bubbles: true }));
      }
    });

    // Auto wire search inputs with [data-search-target]
    document.addEventListener('input', (e) => {
      const inp = e.target.closest('[data-search-target]');
      if (!inp) return;
      const target = qs(inp.dataset.searchTarget);
      const term = inp.value.trim();
      if (target) {
        SearchHighlight.apply(target, term);
        // Show no-results if nothing matched
        const rows = qsa('[data-searchable]', target);
        if (rows.length > 0) {
          let anyVisible = false;
          rows.forEach(r => {
            const match = term === '' || r.textContent.toLowerCase().includes(term.toLowerCase());
            r.style.display = match ? '' : 'none';
            if (match) anyVisible = true;
          });
          let nrEl = target.querySelector('.uic-no-results');
          if (!anyVisible && term !== '') {
            if (!nrEl) {
              nrEl = document.createElement('div');
              target.appendChild(nrEl);
            }
            NoResults.show(nrEl, { msg: `No results for "${term}"`, hint: 'Try different keywords.' });
          } else if (nrEl) nrEl.remove();
        }
      }
    });

    // Add .uic-search-wrap to existing .search-input elements
    qsa('input.search-input').forEach(inp => {
      if (!inp.closest('.uic-search-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'uic-search-wrap';
        inp.parentNode.insertBefore(wrap, inp);
        wrap.appendChild(inp);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Expose public API ──────────────────────────────────────── */
  w.UIC = {
    Alert,
    FormValidator,
    ConfirmModal,
    Paginator,
    TableSorter,
    Skeleton,
    Breadcrumb,
    RefreshTimer,
    SearchHighlight,
    NoResults,
    Collapsible,
    Tabs,
    Steps,
    StatCounter,
    NotifToggles,
    StatusBadge,
    IconIndicator
  };

})(window);
