'use strict';

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function isSystemPage(url) {
  const u = url || '';
  return u.startsWith('chrome://') || u.startsWith('chrome-extension://') ||
         u.startsWith('edge://') || u.startsWith('brave://') || u.startsWith('about:');
}
