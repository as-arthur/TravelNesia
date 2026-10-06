import { auth } from '../auth.js';
import { navigate } from '../router.js';
import { showToast } from '../toast.js';

/** Hanya izinkan redirect ke halaman di dalam aplikasi (cegah open redirect). */
function safeNext(next) {
  if (typeof next === 'string' && /^#?\/[A-Za-z0-9_\-/?=&%.]*$/.test(next) && !next.startsWith('//')) {
    return next.replace(/^#/, '');
  }
  return '/';
}

function formShell({ title, subtitle, body, footer }) {
  return `
    <section class="auth-page">
      <div class="auth-card">
        <h1>${title}</h1>
        <p class="auth-sub">${subtitle}</p>
        ${body}
        <p class="auth-footer">${footer}</p>
      </div>
    </section>`;
}

function setFieldError(form, name, message) {
  const input = form.elements[name];
  const hint = form.querySelector(`[data-error-for="${name}"]`);

  input?.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (hint) {
    hint.textContent = message || '';
    hint.hidden = !message;
  }
}

function resetErrors(form) {
  form.querySelectorAll('[data-error-for]').forEach((hint) => {
    hint.textContent = '';
    hint.hidden = true;
  });
  form.querySelectorAll('[aria-invalid]').forEach((input) => input.setAttribute('aria-invalid', 'false'));

  const box = form.querySelector('.form-error');
  box.textContent = '';
  box.hidden = true;
}

function showFormError(form, error) {
  const box = form.querySelector('.form-error');
  box.textContent = error.message;
  box.hidden = false;

  // Error per-field dari server (validasi 400)
  (error.errors || []).forEach((item) => setFieldError(form, item.field, item.message));
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginView({ query }) {
  const next = safeNext(query.next);

  return {
    title: 'Masuk',
    html: formShell({
      title: 'Masuk ke TravelNesia',
      subtitle: 'Simpan destinasi favorit, tulis ulasan, dan dapatkan rekomendasi.',
      body: `
        <form id="login-form" novalidate>
          <div class="field">
            <label for="login-email">Email</label>
            <input id="login-email" name="email" type="email" autocomplete="email" required />
            <p class="field-error" data-error-for="email" hidden></p>
          </div>
          <div class="field">
            <label for="login-password">Password</label>
            <input id="login-password" name="password" type="password" autocomplete="current-password" required />
            <p class="field-error" data-error-for="password" hidden></p>
          </div>
          <p class="form-error" role="alert" hidden></p>
          <button class="btn btn-primary btn-block" type="submit">Masuk</button>
        </form>`,
      footer: `Belum punya akun? <a href="#/daftar${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}">Daftar sekarang</a>`
    }),
    mount(root) {
      const form = root.querySelector('#login-form');

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        resetErrors(form);

        const email = form.elements.email.value.trim();
        const password = form.elements.password.value;
        let valid = true;

        if (!EMAIL_PATTERN.test(email)) {
          setFieldError(form, 'email', 'Masukkan email yang valid.');
          valid = false;
        }
        if (!password) {
          setFieldError(form, 'password', 'Password tidak boleh kosong.');
          valid = false;
        }
        if (!valid) return;

        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        submit.textContent = 'Memproses…';

        try {
          await auth.login(email, password);
          showToast(`Selamat datang kembali, ${auth.user.name}!`, 'success');
          navigate(next, { replace: true });
        } catch (error) {
          showFormError(form, error);
          submit.disabled = false;
          submit.textContent = 'Masuk';
        }
      });
    }
  };
}

export async function registerView({ query }) {
  const next = safeNext(query.next);

  return {
    title: 'Daftar',
    html: formShell({
      title: 'Buat akun TravelNesia',
      subtitle: 'Gratis dan hanya butuh beberapa detik.',
      body: `
        <form id="register-form" novalidate>
          <div class="field">
            <label for="reg-name">Nama</label>
            <input id="reg-name" name="name" type="text" autocomplete="name" maxlength="50" required />
            <p class="field-error" data-error-for="name" hidden></p>
          </div>
          <div class="field">
            <label for="reg-email">Email</label>
            <input id="reg-email" name="email" type="email" autocomplete="email" required />
            <p class="field-error" data-error-for="email" hidden></p>
          </div>
          <div class="field">
            <label for="reg-password">Password</label>
            <input id="reg-password" name="password" type="password" autocomplete="new-password" minlength="6" required />
            <p class="field-hint">Minimal 6 karakter.</p>
            <p class="field-error" data-error-for="password" hidden></p>
          </div>
          <div class="field">
            <label for="reg-confirm">Ulangi password</label>
            <input id="reg-confirm" name="confirm" type="password" autocomplete="new-password" required />
            <p class="field-error" data-error-for="confirm" hidden></p>
          </div>
          <p class="form-error" role="alert" hidden></p>
          <button class="btn btn-primary btn-block" type="submit">Daftar</button>
        </form>`,
      footer: `Sudah punya akun? <a href="#/masuk${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}">Masuk</a>`
    }),
    mount(root) {
      const form = root.querySelector('#register-form');

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        resetErrors(form);

        const name = form.elements.name.value.trim();
        const email = form.elements.email.value.trim();
        const password = form.elements.password.value;
        const confirm = form.elements.confirm.value;
        let valid = true;

        if (name.length < 2) {
          setFieldError(form, 'name', 'Nama minimal 2 karakter.');
          valid = false;
        }
        if (!EMAIL_PATTERN.test(email)) {
          setFieldError(form, 'email', 'Masukkan email yang valid.');
          valid = false;
        }
        if (password.length < 6) {
          setFieldError(form, 'password', 'Password minimal 6 karakter.');
          valid = false;
        }
        if (confirm !== password) {
          setFieldError(form, 'confirm', 'Konfirmasi password tidak sama.');
          valid = false;
        }
        if (!valid) return;

        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        submit.textContent = 'Memproses…';

        try {
          await auth.register(name, email, password);
          showToast(`Akun dibuat. Selamat datang, ${auth.user.name}!`, 'success');
          navigate(next, { replace: true });
        } catch (error) {
          showFormError(form, error);
          submit.disabled = false;
          submit.textContent = 'Daftar';
        }
      });
    }
  };
}
