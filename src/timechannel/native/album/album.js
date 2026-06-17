import { texLoader, makeTexture } from '../core/assets.js';
import { events } from '../events.js';
import { loadUserAlbum, saveUserAlbum } from './store.js';

export let photoItems = [];

let cursor = 0;

export function nextPhotoIndex() {
  return (cursor++) % photoItems.length;
}

function placeholderCanvas(i) {
  const cv = document.createElement('canvas');
  cv.width = 480;
  cv.height = 340;
  const ctx = cv.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 480, 340);
  grad.addColorStop(0, '#050604');
  grad.addColorStop(0.55, '#1c2416');
  grad.addColorStop(1, '#b7ff25');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 480, 340);
  ctx.fillStyle = 'rgba(243,239,223,0.72)';
  ctx.font = '700 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Miao work ${i + 1}`, 240, 180);
  return cv;
}

function normalizeDate(value, index) {
  const date = new Date(value || Date.now() - index * 86400000);
  return Number.isNaN(date.getTime()) ? new Date(Date.now() - index * 86400000) : date;
}

export async function loadDefaultPhotos() {
  const response = await fetch('/timechannel-photos/manifest.json', { cache: 'no-store' });
  const manifest = await response.json();
  const photos = Array.isArray(manifest) ? manifest : [];
  const count = Math.max(photos.length, 1);

  return new Promise((resolve) => {
    let done = 0;
    const items = new Array(count);
    const finish = () => {
      if (++done !== count) return;
      photoItems = items
        .filter(Boolean)
        .sort((a, b) => b.date - a.date);
      cursor = 0;
      events.emit('album:changed', { count: photoItems.length });
      resolve();
    };

    if (!photos.length) {
      const cv = placeholderCanvas(0);
      items[0] = {
        texture: makeTexture(cv),
        src: cv.toDataURL(),
        date: new Date(),
        id: 'miao-empty',
        title: 'Miao works',
      };
      finish();
      return;
    }

    photos.forEach((photo, index) => {
      const item = {
        src: photo.src,
        date: normalizeDate(photo.date, index),
        id: photo.id || `miao-${index + 1}`,
        title: photo.title || `Miao work ${index + 1}`,
      };

      texLoader.load(
        photo.src,
        (tex) => {
          items[index] = { ...item, texture: makeTexture(tex) };
          finish();
        },
        undefined,
        () => {
          const cv = placeholderCanvas(index);
          items[index] = { ...item, texture: makeTexture(cv), src: cv.toDataURL() };
          finish();
        },
      );
    });
  });
}

export function attachDemoDates() {
  let d = Date.now();
  for (const item of photoItems) {
    item.date = new Date(d);
    d -= (28 + Math.random() * 42) * 86400000;
  }
}

let userAlbum = [];

export async function loadPersistedAlbum() {
  const items = await loadUserAlbum();
  if (!items.length) return false;
  userAlbum = items.sort((a, b) => b.date - a.date);
  photoItems = userAlbum;
  cursor = 0;
  events.emit('album:changed', { count: photoItems.length });
  return true;
}

function setUserAlbum(items, persist = false) {
  userAlbum = items;
  photoItems = userAlbum;
  cursor = 0;
  events.emit('album:changed', { count: userAlbum.length });
  if (persist) {
    saveUserAlbum(userAlbum).catch((err) => console.warn('album save failed:', err));
  }
}

export function addToUserAlbum(newItems) {
  userAlbum = userAlbum.concat(newItems);
  userAlbum.sort((a, b) => b.date - a.date);
  setUserAlbum(userAlbum, true);
}
