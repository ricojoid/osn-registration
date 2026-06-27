import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/shared/Toast';
import { authApi } from '../../api/axios';
import { getErrorMessage } from '../../utils/helpers';
import { Medal } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Pendaftar',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.password) {
      toast.warning('Harap isi semua field.');
      return;
    }

    if (form.password.length < 6) {
      toast.warning('Password minimal 6 karakter.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.warning('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      login(data);
      toast.success('Akun berhasil dibuat!');

      if (data.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/pendaftar');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <Medal className="text-primary" size={36} /> OSN Portal
            </h1>
            <p>Buat akun untuk mendaftar lomba OSN</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Nama Lengkap</label>
              <input
                id="register-name"
                className="form-input"
                type="text"
                name="fullName"
                placeholder="Masukkan nama lengkap"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email</label>
              <input
                id="register-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-role">Daftar Sebagai</label>
              <select
                id="register-role"
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="Pendaftar">Pendaftar Lomba</option>
                <option value="Admin">Admin Lomba</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password</label>
              <input
                id="register-password"
                className="form-input"
                type="password"
                name="password"
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm">Konfirmasi Password</label>
              <input
                id="register-confirm"
                className="form-input"
                type="password"
                name="confirmPassword"
                placeholder="Ulangi password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                  Memproses...
                </>
              ) : (
                'Buat Akun'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Sudah punya akun?{' '}
            <Link to="/login">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
