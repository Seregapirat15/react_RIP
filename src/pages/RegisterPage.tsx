import { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setAuthLoading, setAuthError, clearAuthError } from '../store/authSlice';
import { registerUser } from '../services/userService';
import './AuthPages.css';

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ login: '', email: '', password: '', first_name: '', last_name: '' });

  useEffect(() => () => { dispatch(clearAuthError()); }, [dispatch]);

  const handleChange = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));
    try {
      await registerUser(form.login, form.password, form.first_name, form.last_name, form.email);
      navigate('/login');
    } catch (err) {
      dispatch(setAuthError((err as Error).message || 'Ошибка регистрации'));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card-cosmic">
        <h2 className="auth-title">Регистрация</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Логин</Form.Label>
            <Form.Control className="auth-input" value={form.login} onChange={(e) => handleChange('login', e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Email</Form.Label>
            <Form.Control className="auth-input" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Пароль</Form.Label>
            <Form.Control className="auth-input" type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Имя</Form.Label>
            <Form.Control className="auth-input" value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Фамилия</Form.Label>
            <Form.Control className="auth-input" value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} />
          </Form.Group>
          <Button className="btn-cosmic w-100" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : 'Зарегистрироваться'}
          </Button>
        </Form>
        <div className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
