/**
 * draftFiles.js
 *
 * IndexedDB helpers for persisting local File objects as part of an inventory
 * form draft. localStorage cannot store binary data, so we keep the blob in
 * IndexedDB and write a lightweight metadata stub { __draft__, draftId, ... }
 * into the localStorage JSON instead.
 *
 * Lifecycle:
 *  - serializeFiles(values)   → call before JSON.stringify / localStorage.setItem
 *  - deserializeFiles(values) → call after JSON.parse / localStorage.getItem
 *  - deleteDraftFiles(ids)    → call on discard or after successful submit
 *  - getDraftIds(values)      → collect all draftIds from a serialized value tree
 */

const DB_NAME = 'sinabe_draft';
const STORE_NAME = 'draft_files';
const DB_VERSION = 1;

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: 'draftId' });
    };
    req.onsuccess = (e) => {
      _db = e.target.result;
      resolve(_db);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

function saveDraftFile(draftId, file) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put({
          draftId,
          blob: file,
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
        });
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      }),
  );
}

function loadDraftFile(draftId) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(draftId);
        req.onsuccess = (e) => {
          const record = e.target.result;
          if (!record) return resolve(null);
          resolve(
            new File([record.blob], record.name, {
              type: record.type,
              lastModified: record.lastModified,
            }),
          );
        };
        req.onerror = (e) => reject(e.target.error);
      }),
  );
}

/** Remove a list of draftIds from IndexedDB (call on discard / submit). */
export function deleteDraftFiles(draftIds) {
  if (!draftIds?.length) return Promise.resolve();
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        draftIds.forEach((id) => store.delete(id));
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      }),
  );
}

/** Collect all __draft__ draftIds nested in images / files arrays. */
export function getDraftIds(values) {
  const ids = [];
  const collect = (arr) =>
    (arr || []).forEach((item) => {
      if (item?.__draft__ && item.draftId) ids.push(item.draftId);
    });
  collect(values?.images);
  collect(values?.files);
  return ids;
}

/**
 * Replace every File instance in values.images / values.files with a
 * metadata stub and persist the raw blob to IndexedDB.
 * Returns a new values object safe for JSON.stringify.
 */
export async function serializeFiles(values) {
  const toSave = [];

  const mapField = (arr) =>
    (arr || []).map((item) => {
      if (item instanceof File) {
        const draftId = `draft_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        toSave.push({ draftId, file: item });
        return {
          __draft__: true,
          draftId,
          name: item.name,
          type: item.type,
          size: item.size,
        };
      }
      // Server-side objects { url, thumbnail } pass through unchanged
      return item;
    });

  const images = mapField(values.images);
  const files = mapField(values.files);

  await Promise.all(
    toSave.map(({ draftId, file }) => saveDraftFile(draftId, file)),
  );

  return { ...values, images, files };
}

/**
 * Restore File objects from IndexedDB for every __draft__ stub found in
 * values.images / values.files.
 * Stubs whose blob is no longer in IDB (e.g. cleared by browser) are dropped.
 */
export async function deserializeFiles(values) {
  const restore = (arr) =>
    Promise.all(
      (arr || []).map((item) => {
        if (item?.__draft__) return loadDraftFile(item.draftId);
        return Promise.resolve(item);
      }),
    ).then((res) => res.filter(Boolean));

  const [images, files] = await Promise.all([
    restore(values.images),
    restore(values.files),
  ]);

  return { ...values, images, files };
}
