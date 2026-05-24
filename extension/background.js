importScripts('shared.js');

function drawIcon(size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2;
  const radius = size * 0.42;
  const lw = Math.max(1.5, size * 0.08);

  ctx.beginPath();
  ctx.arc(cx, cy, radius - lw / 2, 0, Math.PI * 2);
  ctx.strokeStyle = '#d94444';
  ctx.lineWidth = lw;
  ctx.stroke();

  const fontSize = size * 0.5;
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔖', cx, cy);

  return ctx.getImageData(0, 0, size, size);
}

async function updateIcon() {
  try {
    const img16 = drawIcon(16), img48 = drawIcon(48), img128 = drawIcon(128);
    await chrome.action.setIcon({ imageData: { 16: img16, 48: img48, 128: img128 } });
  } catch {}
}

async function updateBadge() {
  try {
    const tabs = await chrome.tabs.query({});
    const count = tabs.filter(t => !t.url?.startsWith('about:')).length;
    await chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    if (count === 0) return;
    let color;
    if (count <= 10) color = '#3d7a4a';
    else if (count <= 20) color = '#b8892e';
    else color = '#b35a5a';
    await chrome.action.setBadgeBackgroundColor({ color });
  } catch {
    chrome.action.setBadgeText({ text: '' });
  }
}

async function init() {
  updateIcon(); updateBadge();
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
}

chrome.runtime.onInstalled.addListener(() => init());
chrome.runtime.onStartup.addListener(() => init());
chrome.tabs.onCreated.addListener(() => updateBadge());
chrome.tabs.onRemoved.addListener(() => updateBadge());
chrome.tabs.onUpdated.addListener(() => updateBadge());

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'open-dashboard') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }
  if (msg.type === 'open-sidepanel') {
    chrome.sidePanel.open({ windowId: sender.tab.windowId }).catch(() => {});
  }
});

updateBadge();
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
