import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { register } from '../services/api';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/login', { replace: true });
      setError('');
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      setError(
        status === 400
          ? 'Проверьте поля (логин может быть занят)'
          : 'Ошибка регистрации. Проверьте, что бэкенд запущен.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Регистрация</h2>
        <p className="auth-subtitle">Создайте аккаунт для работы с заявками</p>

        {error && <Alert variant="danger" className="auth-alert">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Логин</Form.Label>
            <Form.Control
              type="text"
              className="input-cosmic"
              placeholder="Логин"
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              required
              autoComplete="username"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Email</Form.Label>
            <Form.Control
              type="email"
              className="input-cosmic"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Пароль</Form.Label>
            <Form.Control
              type="password"
              className="input-cosmic"
              placeholder="Пароль"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Имя</Form.Label>
            <Form.Control
              type="text"
              className="input-cosmic"
              placeholder="Имя"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              autoComplete="given-name"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="auth-label">Фамилия</Form.Label>
            <Form.Control
              type="text"
              className="input-cosmic"
              placeholder="Фамилия"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
              autoComplete="family-name"
            />
          </Form.Group>

          <Button type="submit" className="btn-cosmic w-100 auth-btn" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </Form>

        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
