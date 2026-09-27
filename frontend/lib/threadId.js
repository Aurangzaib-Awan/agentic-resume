const STORAGE_KEY = "thread_id";
const STORAGE_TIMESTAMP_KEY = "thread_id_created_at";
const ONE_HOUR_MS = 60 * 60 * 1000;

export function getThreadId() {
  const storedId = window.localStorage.getItem(STORAGE_KEY);
  const storedTimestamp = window.localStorage.getItem(STORAGE_TIMESTAMP_KEY);
  const isValid =
    storedId && storedTimestamp && Date.now() - Number(storedTimestamp) < ONE_HOUR_MS;

  if (isValid) {
    return storedId;
  }

  const newId = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, newId);
  window.localStorage.setItem(STORAGE_TIMESTAMP_KEY, String(Date.now()));
  return newId;
}
