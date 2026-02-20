import { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginExoplanetUser, clearAuthError } from '../store/authSlice';
import './AuthPages.css';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/instruments', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => () => { dispatch(clearAuthError()); }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginExoplanetUser({ login, password }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card card-cosmic">
        <h2 className="auth-title">Вход в систему</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Логин</Form.Label>
            <Form.Control className="auth-input" value={login} onChange={(e) => setLogin(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="auth-label">Пароль</Form.Label>
            <Form.Control className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Group>
          <Button className="btn-cosmic w-100" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : 'Войти'}
          </Button>
        </Form>
        <div className="auth-footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
