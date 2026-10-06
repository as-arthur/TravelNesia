/** Penyimpanan token login di browser + event saat sesi berakhir. */
const TOKEN_KEY = 'travelnesia_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage diblokir: sesi hanya berlaku sampai halaman ditutup */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* abaikan */
  }
}

export const sessionEvents = new EventTarget();
