'use strict';

let openTabs = [];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDateDisplay() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function getDomain(url) {
  try { return new URL(url).hostname || url; }
  catch { return url; }
}

function tabLabel(tab) {
  let label = (tab.title || '').replace(/^\(\d+\+?\)\s*/, '').replace(/\s*\([\d,]+\+?\)\s*/g, ' ');
  if (!label || label.length < 3) label = tab.url || '';
  if (label.length > 60) label = label.slice(0, 57) + '...';
  return label;
}

function domainLabel(hostname) {
  return hostname.replace(/^www\./, '');
}

async function fetchOpenTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    openTabs = tabs.map(t => ({
      id: t.id, url: t.url, title: t.title,
      favIconUrl: t.favIconUrl, windowId: t.windowId, active: t.active,
    }));
  } catch { openTabs = []; }
}

function buildDomainGroups() {
  const groups = {};
  const tabs = openTabs.filter(t => t.url && !t.url.startsWith('about:'));
  for (const t of tabs) {
    const domain = getDomain(t.url);
    if (!groups[domain]) groups[domain] = [];
    groups[domain].push(t);
  }
  return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
}

function renderTabRow(tab) {
  const title = escapeHtml(tabLabel(tab));
  const url = escapeHtml(tab.url);
  const favicon = tab.favIconUrl ? `<img class="tab-favicon" src="${tab.favIconUrl}" alt="" onerror="this.style.display='none'">` : '';
  return `
    <div class="tab-row" data-tab-id="${tab.id}" data-tab-url="${url}">
      <input type="checkbox" class="tab-checkbox" data-tab-id="${tab.id}">
      ${favicon}
      <span class="tab-title" title="${url}">${title}</span>
      <button class="tab-close" data-action="close-tab" data-tab-id="${tab.id}" title="Close">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
    </div>`;
}

function renderCard(domain, tabs) {
  const label = escapeHtml(domainLabel(domain));
  const rows = tabs.map(renderTabRow).join('');
  const cardId = 'card-' + domain.replace(/[^a-z0-9]/g, '-');
  return `
    <div class="card" data-domain="${escapeHtml(domain)}" id="${cardId}">
      <div class="card-header">
        <span class="card-name">${label}</span>
        <span class="card-badge">${tabs.length}</span>
        <button class="card-close-all" data-action="close-domain" data-domain="${escapeHtml(domain)}" title="Close all">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="tab-list">${rows}</div>
      <div class="card-footer">
        <button class="card-sel-all" data-card-id="${cardId}">All</button>
        <button class="card-sel-inv" data-card-id="${cardId}">Invert</button>
        <button class="card-close-checked" data-card-id="${cardId}">Close checked</button>
      </div>
    </div>`;
}

function renderAll() {
  const grid = document.getElementById('missionsGrid');
  const empty = document.getElementById('emptyState');
  const header = document.getElementById('sectionHeader');
  const count = document.getElementById('sectionCount');
  const statTabs = document.getElementById('statTabs');
  const greeting = document.getElementById('greeting');
  const dateDisplay = document.getElementById('dateDisplay');

  if (greeting) greeting.textContent = getGreeting();
  if (dateDisplay) dateDisplay.textContent = getDateDisplay();

  const groups = buildDomainGroups();
  const total = openTabs.filter(t => t.url && !t.url.startsWith('about:')).length;

  if (statTabs) statTabs.textContent = total;

  if (groups.length === 0) {
    if (header) header.style.display = 'none';
    if (grid) grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (count) count.textContent = '';
    return;
  }

  if (header) header.style.display = 'flex';
  if (empty) empty.style.display = 'none';
  if (count) count.textContent = `${groups.length} group${groups.length !== 1 ? 's' : ''} / ${total} tab${total !== 1 ? 's' : ''}`;
  if (grid) grid.innerHTML = groups.map(([d, t]) => renderCard(d, t)).join('');
}

async function checkAllDupes() {
  const banner = document.getElementById('tabOutDupeBanner');
  const countEl = document.getElementById('tabOutDupeCount');
  if (!banner) return;

  const tabs = await chrome.tabs.query({});
  const map = {};
  for (const t of tabs) {
    if (!t.url) continue;
    if (!map[t.url]) map[t.url] = [];
    map[t.url].push(t);
  }
  const dupes = Object.entries(map).filter(([, v]) => v.length > 1);
  if (dupes.length > 0) {
    const totalExtras = dupes.reduce((s, [, v]) => s + v.length - 1, 0);
    if (countEl) countEl.textContent = totalExtras;
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

async function closeAllDupes() {
  const all = await chrome.tabs.query({});
  const map = {};
  for (const t of all) {
    if (!t.url) continue;
    if (!map[t.url]) map[t.url] = [];
    map[t.url].push(t);
  }
  const toClose = [];
  for (const [, tabs] of Object.entries(map)) {
    if (tabs.length <= 1) continue;
    const sorted = tabs.sort((a, b) => b.id - a.id);
    toClose.push(...sorted.slice(1).map(t => t.id));
  }
  if (toClose.length) await chrome.tabs.remove(toClose);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const text = document.getElementById('toastText');
  if (!toast || !text) return;
  text.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2000);
}

async function refresh() {
  await fetchOpenTabs();
  renderAll();
  checkAllDupes();
}

document.addEventListener('click', async (e) => {
  const act = e.target.closest('[data-action]');
  if (!act) {
    const cb = e.target.closest('.tab-checkbox');
    if (cb) {
      const card = cb.closest('.card');
      if (card) {
        const footer = card.querySelector('.card-footer');
        const anyChecked = card.querySelectorAll('.tab-checkbox:checked').length > 0;
        if (footer) footer.classList.toggle('show', anyChecked);
      }
    }
    return;
  }

  const action = act.dataset.action;

  if (action === 'close-tabout-dupes') {
    await closeAllDupes();
    showToast('Closed duplicate tabs');
    setTimeout(refresh, 350);
    return;
  }

  if (action === 'close-tab') {
    const id = parseInt(act.dataset.tabId);
    if (id) await chrome.tabs.remove(id);
    setTimeout(refresh, 200);
    return;
  }

  if (action === 'close-domain') {
    const domain = act.dataset.domain;
    const ids = openTabs.filter(t => getDomain(t.url) === domain).map(t => t.id);
    if (ids.length) await chrome.tabs.remove(ids);
    showToast(`Closed ${ids.length} tab${ids.length !== 1 ? 's' : ''}`);
    setTimeout(refresh, 200);
    return;
  }

  const card = act.closest('.card');
  if (!card) return;

  if (action === 'close-checked') {
    const checked = card.querySelectorAll('.tab-checkbox:checked');
    const ids = [...checked].map(c => parseInt(c.dataset.tabId)).filter(Boolean);
    if (ids.length) await chrome.tabs.remove(ids);
    showToast(`Closed ${ids.length} tab${ids.length !== 1 ? 's' : ''}`);
    setTimeout(refresh, 200);
    return;
  }

  const cardId = act.dataset.cardId;
  const boxes = card.querySelectorAll('.tab-checkbox');

  if (action === 'sel-all') {
    boxes.forEach(b => b.checked = true);
    card.querySelector('.card-footer').classList.add('show');
    return;
  }

  if (action === 'sel-inv') {
    boxes.forEach(b => b.checked = !b.checked);
    const anyChecked = card.querySelectorAll('.tab-checkbox:checked').length > 0;
    card.querySelector('.card-footer').classList.toggle('show', anyChecked);
    return;
  }
});

const spBtn = document.getElementById('openSidePanelBtn');
if (spBtn) {
  spBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'open-sidepanel' });
  });
}

document.getElementById('spClose')?.addEventListener('click', () => window.close());
document.getElementById('openPageView')?.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'open-dashboard' });
});

refresh();
