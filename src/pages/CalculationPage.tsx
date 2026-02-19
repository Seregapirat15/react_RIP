import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { fetchOrderById, fetchCartIcon, removeFromOrder, formOrder, deleteOrder, isAuthenticated } from '../services/api';
import { Order } from '../types';
import './CalculationPage.css';

const DEFAULT_IMAGE = '/placeholder-service.svg';

const CalculationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    exoplanet_name: '',
    star_mass: '1.0',
    orbital_period: '365.0',
    velocity_amplitude: '10.0',
    inclination: '90.0',
    eccentricity: '0.0',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      setError('auth');
      setLoading(false);
      return;
    }
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    setError('');

    try {
      let orderId = id ? parseInt(id) : null;

      if (!orderId) {
        try {
          const cart = await fetchCartIcon();
          orderId = cart.order_id;
        } catch {
          setError('no_order');
          setLoading(false);
          return;
        }
      }

      if (orderId && orderId > 0) {
        const data = await fetchOrderById(orderId);
        setOrder(data);
      } else {
        setError('no_order');
      }
    } catch {
      setError('load_error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveService = async (serviceId: number) => {
    if (!order) return;
    try {
      await removeFromOrder(order.id, serviceId);
      showMsg('Инструмент удалён из заявки', 'success');
      loadOrder();
    } catch {
      showMsg('Ошибка при удалении инструмента', 'error');
    }
  };

  const handleFormOrder = async () => {
    if (!order) return;
    try {
      await formOrder(order.id);
      showMsg('Заявка сформирована!', 'success');
      loadOrder();
    } catch {
      showMsg('Ошибка при формировании заявки', 'error');
    }
  };

  const handleDeleteOrder = async () => {
    if (!order) return;
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;
    try {
      await deleteOrder(order.id);
      showMsg('Заявка удалена', 'success');
      setTimeout(() => navigate('/instruments'), 1500);
    } catch {
      showMsg('Ошибка при удалении заявки', 'error');
    }
  };

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DEFAULT_IMAGE;
  };

  const calculateMass = () => {
    const starMass = parseFloat(formData.star_mass) || 1.0;
    const orbitalPeriod = parseFloat(formData.orbital_period) || 365.0;
    const velocityAmplitude = parseFloat(formData.velocity_amplitude) || 10.0;
    const inclination = parseFloat(formData.inclination) || 90.0;

    const G = 6.674e-11;
    const M_sun = 1.989e30;
    const M_jupiter = 1.898e27;

    const P_seconds = orbitalPeriod * 24 * 3600;
    const K = velocityAmplitude;
    const M_star = starMass * M_sun;
    const i_rad = inclination * Math.PI / 180;

    const term1 = K * Math.pow(P_seconds / (2 * Math.PI), 1 / 3);
    const term2 = Math.pow(M_star, 2 / 3);
    const M_p_sin_i = term1 * term2 / Math.pow(G, 1 / 3);
    const M_p = M_p_sin_i / Math.sin(i_rad);

    return M_p / M_jupiter;
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-cosmic"></div>
        <p className="mt-3" style={{ color: '#aaa' }}>Загрузка заявки...</p>
      </div>
    );
  }

  // --- Not authenticated ---
  if (error === 'auth') {
    return (
      <div className="calculation-page">
        <Alert className="alert-cosmic">
          Для работы с заявками необходимо авторизоваться.
        </Alert>
        <div className="d-flex gap-3">
          <Link to="/login"><Button className="btn-cosmic">Войти</Button></Link>
          <Link to="/register"><Button variant="outline-info">Зарегистрироваться</Button></Link>
        </div>
      </div>
    );
  }

  // --- No draft order ---
  if (error === 'no_order') {
    return (
      <div className="calculation-page">
        <Alert className="alert-cosmic">
          У вас пока нет активной заявки. Перейдите в каталог инструментов и добавьте инструмент — заявка создастся автоматически.
        </Alert>
        <Link to="/instruments">
          <Button className="btn-cosmic">Перейти к каталогу</Button>
        </Link>
      </div>
    );
  }

  // --- Backend error ---
  if (error === 'load_error') {
    return (
      <div className="calculation-page">
        <Alert className="alert-danger-cosmic">
          Ошибка при загрузке заявки. Убедитесь, что бэкенд запущен.
        </Alert>
        <div className="d-flex gap-3">
          <Button className="btn-cosmic" onClick={() => loadOrder()}>Повторить</Button>
          <Link to="/instruments"><Button variant="outline-info">К инструментам</Button></Link>
        </div>
      </div>
    );
  }

  // --- Order loaded ---
  return (
    <div className="calculation-page">
      {message && (
        <div className={`message-toast ${message.type}`}>{message.text}</div>
      )}

      <h1 className="page-title">Заявка #{order?.id}</h1>

      {/* Статус */}
      {order && (
        <div className="order-status-bar">
          <span className={`status-badge-large ${order.status}`}>{order.status}</span>
          {order.formation_date && (
            <span className="status-date">Сформирована: {new Date(order.formation_date).toLocaleString('ru-RU')}</span>
          )}
          {order.completion_date && (
            <span className="status-date">Завершена: {new Date(order.completion_date).toLocaleString('ru-RU')}</span>
          )}
        </div>
      )}

      {/* Результат расчёта */}
      {order?.total_mass != null && order.total_mass > 0 && (
        <div className="result-section section-cosmic">
          <h2 className="title-cosmic">Результат расчёта</h2>
          <div className="result-value">
            {order.total_mass.toFixed(6)} M<sub>J</sub>
          </div>
          <p className="result-note">Масса в единицах массы Юпитера</p>
        </div>
      )}

      {/* Форма расчёта (только для черновика) */}
      {order?.status === 'черновик' && (
        <div className="form-section section-cosmic">
          <h2 className="title-cosmic">Параметры для расчёта</h2>
          <Form className="calculation-form">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="label-cosmic">Название экзопланеты</Form.Label>
                  <Form.Control type="text" className="input-cosmic" placeholder="Например: Proxima Centauri b"
                    value={formData.exoplanet_name} onChange={(e) => setFormData({ ...formData, exoplanet_name: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="label-cosmic">Масса звезды (M&#9788;)</Form.Label>
                  <Form.Control type="number" step="0.001" className="input-cosmic" placeholder="1.0"
                    value={formData.star_mass} onChange={(e) => setFormData({ ...formData, star_mass: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="label-cosmic">Орбитальный период (дни)</Form.Label>
                  <Form.Control type="number" step="0.01" className="input-cosmic" placeholder="365.0"
                    value={formData.orbital_period} onChange={(e) => setFormData({ ...formData, orbital_period: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="label-cosmic">Амплитуда скорости (м/с)</Form.Label>
                  <Form.Control type="number" step="0.1" className="input-cosmic" placeholder="10.0"
                    value={formData.velocity_amplitude} onChange={(e) => setFormData({ ...formData, velocity_amplitude: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="label-cosmic">Наклон орбиты (&#176;)</Form.Label>
                  <Form.Control type="number" step="0.1" className="input-cosmic" placeholder="90.0"
                    value={formData.inclination} onChange={(e) => setFormData({ ...formData, inclination: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="label-cosmic">Эксцентриситет</Form.Label>
                  <Form.Control type="number" step="0.001" className="input-cosmic" placeholder="0.0"
                    value={formData.eccentricity} onChange={(e) => setFormData({ ...formData, eccentricity: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <div className="form-actions">
              <Button className="btn-cosmic calculate-btn" onClick={() => {
                const mass = calculateMass();
                alert(`Расчётная масса: ${mass.toFixed(6)} M_J`);
              }}>
                Рассчитать массу
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* Инструменты в заявке */}
      <div className="instruments-section section-cosmic">
        <h2 className="title-cosmic">Инструменты в заявке</h2>
        {order?.services && order.services.length > 0 ? (
          <div className="selected-instruments">
            {order.services.map((os) => (
              <div key={os.service_id} className="selected-instrument-card">
                <div className="selected-image">
                  <img src={os.service?.image_url || DEFAULT_IMAGE} onError={handleImageError} alt={os.service?.name || 'Инструмент'} />
                </div>
                <div className="selected-info">
                  <div className="selected-name">{os.service?.name || `Инструмент #${os.service_id}`}</div>
                  {os.exoplanet_name && <div className="selected-exoplanet">Экзопланета: {os.exoplanet_name}</div>}
                  {os.calculated_mass != null && <div className="selected-mass">Масса: {os.calculated_mass.toFixed(6)} M<sub>J</sub></div>}
                </div>
                {order?.status === 'черновик' && (
                  <Button className="btn-danger-cosmic remove-btn" onClick={() => handleRemoveService(os.service_id)}>
                    Удалить
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Alert className="alert-cosmic">
            В заявке нет инструментов.{' '}
            <Link to="/instruments">Добавьте инструменты из каталога</Link>
          </Alert>
        )}
      </div>

      {/* Действия */}
      {order && order.status === 'черновик' && (
        <div className="order-actions">
          <Button className="btn-cosmic" onClick={handleFormOrder}>Сформировать заявку</Button>
          <Button className="btn-danger-cosmic" onClick={handleDeleteOrder}>Удалить заявку</Button>
          <Link to="/instruments"><Button variant="outline-info">Добавить ещё</Button></Link>
        </div>
      )}

    </div>
  );
};

export default CalculationPage;
