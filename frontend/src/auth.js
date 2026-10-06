/** State login sederhana: user saat ini + aksi login/register/logout. */
import { api } from './api.js';
import { getToken, setToken, clearToken } from './session.js';

const listeners = new Set();

export const auth = {
  user: null,

  get isLoggedIn() {
    return Boolean(this.user);
  },

  onChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  notify() {
    listeners.forEach((callback) => callback(this.user));
  },

  /** Dipanggil saat aplikasi dibuka: pulihkan sesi dari token yang tersimpan. */
  async init() {
    if (!getToken()) return;

    try {
      const { data } = await api.me();
      this.user = data;
    } catch (error) {
      // 401 sudah membersihkan token. Error jaringan: biarkan token, user dianggap tamu sementara.
      this.user = null;
    }

    this.notify();
  },

  async login(email, password) {
    const result = await api.login({ email, password });
    setToken(result.token);
    this.user = result.user;
    this.notify();
  },

  async register(name, email, password) {
    const result = await api.register({ name, email, password });
    setToken(result.token);
    this.user = result.user;
    this.notify();
  },

  logout() {
    clearToken();
    this.user = null;
    this.notify();
  },

  /** Sesi habis di server (401): bersihkan state tanpa memanggil API. */
  expire() {
    this.user = null;
    this.notify();
  }
};
