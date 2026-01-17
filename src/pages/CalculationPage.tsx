import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { fetchOrderById, fetchCartIcon, removeFromOrder, formOrder, deleteOrder, isAuthenticated } from '../services/api';
import { Order, OrderService } from '../types';
import './CalculationPage.css';

const DEFAULT_IMAGE = '/placeholder-service.svg';

const CalculationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Форма для расчёта
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
      setError('Для просмотра заявки необходимо авторизоваться');
      setLoading(false);
      return;
    }
    
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    
    try {
      let orderId = id ? parseInt(id) : null;
      
      // Если ID не указан, получаем текущую корзину
      if (!orderId) {
        const cart = await fetchCartIcon();
        orderId = cart.order_id;
      }
      
      if (orderId && orderId > 0) {
        const data = await fetchOrderById(orderId);
        setOrder(data);
      } else {
        setError('Нет активной заявки');
      }
    } catch (err) {
      console.error('Ошибка загрузки заявки:', err);
      setError('Ошибка при загрузке заявки');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveService = async (serviceId: number) => {
    if (!order) return;
    
    try {
      await removeFromOrder(order.id, serviceId);
      setMessage({ text: 'Инструмент удалён из заявки', type: 'success' });
      loadOrder();
    } catch (err) {
      setMessage({ text: 'Ошибка при удалении инструмента', type: 'error' });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFormOrder = async () => {
    if (!order) return;
    
    try {
      await formOrder(order.id);
      setMessage({ text: 'Заявка сформирована!', type: 'success' });
      loadOrder();
    } catch (err) {
      setMessage({ text: 'Ошибка при формировании заявки', type: 'error' });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteOrder = async () => {
    if (!order) return;
    
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;
    
    try {
      await deleteOrder(order.id);
      setMessage({ text: 'Заявка удалена', type: 'success' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage({ text: 'Ошибка при удалении заявки', type: 'error' });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DEFAULT_IMAGE;
  };

  // Расчёт массы экзопланеты (упрощённая формула)
  const calculateMass = () => {
    const starMass = parseFloat(formData.star_mass) || 1.0;
    const orbitalPeriod = parseFloat(formData.orbital_period) || 365.0;
    const velocityAmplitude = parseFloat(formData.velocity_amplitude) || 10.0;
    const inclination = parseFloat(formData.inclination) || 90.0;
    
    // Упрощённая формула для расчёта минимальной массы (M * sin(i))
    // M_p * sin(i) = K * (P / 2π)^(1/3) * M_star^(2/3)
    const G = 6.674e-11; // гравитационная постоянная
    const M_sun = 1.989e30; // масса Солнца в кг
    const M_jupiter = 1.898e27; // масса Юпитера в кг
    
    // Преобразование единиц
    const P_seconds = orbitalPeriod * 24 * 3600; // дни в секунды
    const K = velocityAmplitude; // м/с
    const M_star = starMass * M_sun; // кг
    const i_rad = inclination * Math.PI / 180; // градусы в радианы
    
    // Расчёт массы (упрощённо)
    const term1 = K * Math.pow(P_seconds / (2 * Math.PI), 1/3);
    const term2 = Math.pow(M_star, 2/3);
    const M_p_sin_i = term1 * term2 / Math.pow(G, 1/3);
    
    // Корректировка на угол наклона
    const M_p = M_p_sin_i / Math.sin(i_rad);
    
    // Возвращаем в единицах массы Юпитера
    return M_p / M_jupiter;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-cosmic"></div>
        <p className="mt-3" style={{ color: '#aaa' }}>Загрузка заявки...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calculation-page">
        <Alert className="alert-danger-cosmic">
          {error}
        </Alert>
        <Link to="/">
          <Button className="btn-cosmic">← Вернуться к инструментам</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="calculation-page">
      {/* Уведомление */}
      {message && (
        <div className={`message-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      <h1 className="page-title">Расчёт массы экзопланеты</h1>

      {/* Результат расчёта (если есть) */}
      {order?.total_mass && (
        <div className="result-section section-cosmic">
          <h2 className="title-cosmic">Результат расчёта</h2>
          <div className="result-value">
            {order.total_mass.toFixed(6)} M<sub>J</sub>
          </div>
          <p className="result-note">Масса в единицах массы Юпитера</p>
        </div>
      )}

      {/* Форма расчёта */}
      <div className="form-section section-cosmic">
        <h2 className="title-cosmic">Параметры для расчёта</h2>
        
        <Form className="calculation-form">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="label-cosmic">Название экзопланеты</Form.Label>
                <Form.Control
                  type="text"
                  className="input-cosmic"
                  placeholder="Например: Proxima Centauri b"
                  value={formData.exoplanet_name}
                  onChange={(e) => setFormData({ ...formData, exoplanet_name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="label-cosmic">Масса звезды (M☉)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.001"
                  className="input-cosmic"
                  placeholder="1.0"
                  value={formData.star_mass}
                  onChange={(e) => setFormData({ ...formData, star_mass: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="label-cosmic">Орбитальный период (дни)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  className="input-cosmic"
                  placeholder="365.0"
                  value={formData.orbital_period}
                  onChange={(e) => setFormData({ ...formData, orbital_period: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="label-cosmic">Амплитуда скорости (м/с)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  className="input-cosmic"
                  placeholder="10.0"
                  value={formData.velocity_amplitude}
                  onChange={(e) => setFormData({ ...formData, velocity_amplitude: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="label-cosmic">Наклон орбиты (°)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  className="input-cosmic"
                  placeholder="90.0"
                  value={formData.inclination}
                  onChange={(e) => setFormData({ ...formData, inclination: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="label-cosmic">Эксцентриситет</Form.Label>
                <Form.Control
                  type="number"
                  step="0.001"
                  className="input-cosmic"
                  placeholder="0.0"
                  value={formData.eccentricity}
                  onChange={(e) => setFormData({ ...formData, eccentricity: e.target.value })}
                />
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

      {/* Выбранные инструменты */}
      <div className="instruments-section section-cosmic">
        <h2 className="title-cosmic">Выбранные инструменты</h2>
        
        {order?.services && order.services.length > 0 ? (
          <div className="selected-instruments">
            {order.services.map((orderService) => (
              <div key={orderService.service_id} className="selected-instrument-card">
                <div className="selected-image">
                  <img
                    src={orderService.service?.image_url || DEFAULT_IMAGE}
                    onError={handleImageError}
                    alt={orderService.service?.name || 'Инструмент'}
                  />
                </div>
                <div className="selected-info">
                  <div className="selected-name">{orderService.service?.name || `Инструмент #${orderService.service_id}`}</div>
                  {orderService.exoplanet_name && (
                    <div className="selected-exoplanet">Экзопланета: {orderService.exoplanet_name}</div>
                  )}
                </div>
                <Button 
                  className="btn-danger-cosmic remove-btn"
                  onClick={() => handleRemoveService(orderService.service_id)}
                >
                  Удалить
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Alert className="alert-cosmic">
            В заявке нет инструментов. <Link to="/">Добавьте инструменты</Link>
          </Alert>
        )}
      </div>

      {/* Действия с заявкой */}
      {order && order.status === 'черновик' && (
        <div className="order-actions">
          <Button className="btn-cosmic" onClick={handleFormOrder}>
            Сформировать заявку
          </Button>
          <Button className="btn-danger-cosmic" onClick={handleDeleteOrder}>
            Удалить заявку
          </Button>
        </div>
      )}

      {/* Статус заявки */}
      {order && order.status !== 'черновик' && (
        <div className="order-status section-cosmic">
          <h2 className="title-cosmic">Статус заявки</h2>
          <div className={`status-badge-large ${order.status}`}>
            {order.status}
          </div>
          {order.formation_date && (
            <p>Дата формирования: {new Date(order.formation_date).toLocaleString('ru-RU')}</p>
          )}
          {order.completion_date && (
            <p>Дата завершения: {new Date(order.completion_date).toLocaleString('ru-RU')}</p>
          )}
        </div>
      )}

      {/* Кнопка назад */}
      <div className="back-section">
        <Link to="/">
          <Button className="btn-cosmic">← Вернуться к инструментам</Button>
        </Link>
      </div>
    </div>
  );
};

export default CalculationPage;

