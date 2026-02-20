import { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setAuthLoading, setAuthError, clearAuthError, setUser } from '../store/authSlice';
import { updateUserProfile } from '../services/userService';
import './AuthPages.css';

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login', { replace: true }); return; }
    if (user) setForm({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '', password: '' });
  }, [user, isAuthenticated, navigate]);

  useEffect(() => () => { dispatch(clearAuthError()); }, [dispatch]);

  const handleChange = (field: string, value: string) => { setForm((prev) => ({ ...prev, [field]: value })); setSuccess(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {};
    if (form.first_name !== user?.first_name) payload.first_name = form.first_name;
    if (form.last_name !== user?.last_name) payload.last_name = form.last_name;
    if (form.email !== user?.email) payload.email = form.email;
    if (form.password) payload.password = form.password;
    if (Object.keys(payload).length === 0) return;

    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));
    try {
      const updated = await updateUserProfile(payload);
      dispatch(setUser(updated));
      setSuccess('Профиль обновлён');
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      dispatch(setAuthError((err as Error).message || 'Ошибка обновления'));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  if (!user) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="auth-page">
      <div className="auth-card card-cosmic">
        <h2 className="auth-title">Личный кабинет</h2>
        <p className="text-center" style={{ color: '#aaa' }}>Логин: <strong>{user.login}</strong> | Роль: <strong>{user.role}</strong></p>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Имя</Form.Label>
            <Form.Control className="auth-input" value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Фамилия</Form.Label>
            <Form.Control className="auth-input" value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Email</Form.Label>
            <Form.Control className="auth-input" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Новый пароль</Form.Label>
            <Form.Control className="auth-input" type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Оставьте пустым, если не меняете" />
          </Form.Group>
          <Button className="btn-cosmic w-100" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : 'Сохранить'}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ProfilePage;
