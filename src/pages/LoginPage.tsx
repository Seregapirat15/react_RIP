import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { login } from '../services/api';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ login: loginField, password });
      navigate('/', { replace: true });
      window.location.reload();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      setError(status === 401 ? 'Неверный логин или пароль' : 'Ошибка входа. Проверьте, что бэкенд запущен.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Вход</h2>
        <p className="auth-subtitle">Войдите, чтобы создавать и просматривать заявки</p>

        {error && <Alert variant="danger" className="auth-alert">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Логин</Form.Label>
            <Form.Control
              type="text"
              className="input-cosmic"
              placeholder="Введите логин"
              value={loginField}
              onChange={(e) => setLoginField(e.target.value)}
              required
              autoComplete="username"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="auth-label">Пароль</Form.Label>
            <Form.Control
              type="password"
              className="input-cosmic"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Form.Group>

          <Button type="submit" className="btn-cosmic w-100 auth-btn" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </Form>

        <p className="auth-footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
