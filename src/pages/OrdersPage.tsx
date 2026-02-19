import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { fetchOrders, fetchOrderById, isAuthenticated } from '../services/api';
import { Order } from '../types';
import './OrdersPage.css';

const DEFAULT_IMAGE = '/placeholder-service.svg';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const list = await fetchOrders();
      const detailed = await Promise.all(
        list.map((o) => fetchOrderById(o.id).catch(() => o))
      );
      setOrders(detailed);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DEFAULT_IMAGE;
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (dateFrom && o.formation_date) {
      if (new Date(o.formation_date) < new Date(dateFrom)) return false;
    }
    if (dateTo && o.formation_date) {
      if (new Date(o.formation_date) > new Date(dateTo + 'T23:59:59')) return false;
    }
    return true;
  });

  const handleReset = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      'черновик': 'Черновик',
      'сформирован': 'Сформирована',
      'завершён': 'Завершена',
      'отклонён': 'Отклонена',
    };
    return map[s] || s;
  };

  if (!isAuthenticated()) {
    return (
      <div className="orders-page">
        <h1 className="orders-title">Мои заявки</h1>
        <Alert className="alert-cosmic">
          Для просмотра заявок необходимо авторизоваться.
        </Alert>
        <div className="d-flex gap-3">
          <Link to="/login"><Button className="btn-cosmic">Войти</Button></Link>
          <Link to="/register"><Button variant="outline-info">Зарегистрироваться</Button></Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-cosmic"></div>
        <p className="mt-3" style={{ color: '#aaa' }}>Загрузка заявок...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 className="orders-title">Мои заявки</h1>

      {/* Фильтры */}
      <div className="orders-filters section-cosmic">
        <Row className="align-items-end g-3">
          <Col md={3}>
            <Form.Label className="label-cosmic">Статус</Form.Label>
            <Form.Select className="input-cosmic" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Все</option>
              <option value="сформирован">Сформирована</option>
              <option value="завершён">Завершена</option>
              <option value="отклонён">Отклонена</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label className="label-cosmic">Дата формирования от</Form.Label>
            <Form.Control type="date" className="input-cosmic" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </Col>
          <Col md={3}>
            <Form.Label className="label-cosmic">Дата формирования до</Form.Label>
            <Form.Control type="date" className="input-cosmic" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </Col>
          <Col md={3}>
            <Button variant="outline-secondary" className="w-100" onClick={handleReset}>Сбросить</Button>
          </Col>
        </Row>
      </div>

      {/* Список заявок */}
      {filteredOrders.length === 0 ? (
        <Alert className="alert-cosmic mt-4">
          Заявок не найдено.{' '}
          <Link to="/instruments">Перейти к каталогу инструментов</Link>
        </Alert>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-card section-cosmic">
              {/* Шапка карточки */}
              <div className="order-card-header">
                <h2 className="order-card-title">
                  <Link to={`/calculation/${order.id}`}>Расчёт №{order.id}</Link>
                </h2>
                <span className={`status-badge ${order.status}`}>{statusLabel(order.status)}</span>
              </div>

              {/* Мета-информация */}
              <div className="order-card-meta">
                <div className="meta-item">
                  <span className="meta-label">Дата создания</span>
                  <span className="meta-value">{new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                {order.formation_date && (
                  <div className="meta-item">
                    <span className="meta-label">Дата формирования</span>
                    <span className="meta-value">{new Date(order.formation_date).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
                {order.total_mass != null && order.total_mass > 0 && (
                  <div className="meta-item meta-highlight">
                    <span className="meta-label">Суммарная масса</span>
                    <span className="meta-value mass-value">{order.total_mass.toFixed(4)} M<sub>J</sub></span>
                  </div>
                )}
              </div>

              {/* Таблица м-м: инструменты с параметрами */}
              {order.services && order.services.length > 0 && (
                <div className="order-card-services">
                  <table className="mm-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Инструмент</th>
                        <th>Экзопланета</th>
                        <th>Масса звезды</th>
                        <th>Период (дни)</th>
                        <th>Амплитуда (м/с)</th>
                        <th>Наклон</th>
                        <th>Результат (M<sub>J</sub>)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.services.map((os) => (
                        <tr key={os.service_id}>
                          <td className="mm-image-cell">
                            <img
                              src={os.service?.image_url || DEFAULT_IMAGE}
                              onError={handleImageError}
                              alt={os.service?.name || ''}
                              className="mm-thumb"
                            />
                          </td>
                          <td className="mm-name">{os.service?.name || `#${os.service_id}`}</td>
                          <td>{os.exoplanet_name || '—'}</td>
                          <td>{os.star_mass} M&#9788;</td>
                          <td>{os.orbital_period}</td>
                          <td>{os.velocity_amplitude}</td>
                          <td>{os.inclination}°</td>
                          <td className="mm-result">
                            {os.calculated_mass != null
                              ? <span className="mass-calculated">{os.calculated_mass.toFixed(4)}</span>
                              : <span className="mass-pending">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
