import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Row, Col, InputGroup, Accordion } from 'react-bootstrap';
import { fetchInstruments, fetchCartIcon, addToOrder, isAuthenticated } from '../services/api';
import { Instrument, CartIcon } from '../types';
import { MOCK_INSTRUMENTS } from '../data/mockData';
import './InstrumentsPage.css';

const DEFAULT_IMAGE = '/placeholder-service.svg';

const InstrumentsPage = () => {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  // Фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [minAccuracy, setMinAccuracy] = useState<string>('');
  const [maxAccuracy, setMaxAccuracy] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Корзина
  const [cart, setCart] = useState<CartIcon | null>(null);

  // Загрузка инструментов
  useEffect(() => {
    loadInstruments();
    loadCart();
  }, []);

  const loadInstruments = async () => {
    setLoading(true);

    try {
      const data = await fetchInstruments({
        search: searchQuery || undefined,
        type: typeFilter || undefined,
        min_accuracy: minAccuracy ? Number(minAccuracy) : undefined,
        max_accuracy: maxAccuracy ? Number(maxAccuracy) : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setInstruments(data);
      setUsingMock(false);
    } catch (err) {
      console.error('Ошибка загрузки инструментов, используем Mock:', err);
      // Fallback to Mock Data
      let mockData = [...MOCK_INSTRUMENTS];

      // Client-side filtering for Mock data
      if (searchQuery) {
        mockData = mockData.filter(i =>
          i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (typeFilter) {
        mockData = mockData.filter(i => i.type === typeFilter);
      }
      if (minAccuracy) mockData = mockData.filter(i => i.accuracy >= Number(minAccuracy));
      if (maxAccuracy) mockData = mockData.filter(i => i.accuracy <= Number(maxAccuracy));
      // Note: Date filtering for mock omitted for brevity but logic is similar

      setInstruments(mockData);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    if (!isAuthenticated()) return;

    try {
      const cartData = await fetchCartIcon();
      setCart(cartData);
    } catch (err) {
      console.error('Ошибка загрузки корзины:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadInstruments();
  };

  const handleReset = () => {
    setSearchQuery('');
    setTypeFilter('');
    setMinAccuracy('');
    setMaxAccuracy('');
    setDateFrom('');
    setDateTo('');
    // Need to trigger reload, tricky with closure stare. 
    // Ideally put logic in useEffect dependent on a trigger, but direct call works if state updates are batched or we wait.
    // For simplicity, we just reload next tick or use a separate effect.
    // Let's just manually clear and call with empty params.
    fetchInstruments({}).then(setInstruments).catch(() => setInstruments(MOCK_INSTRUMENTS));
  };

  const handleAddToOrder = async (instrumentId: number) => {
    if (!isAuthenticated()) {
      setMessage({ text: 'Для добавления в заявку необходимо авторизоваться', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (usingMock) {
      setMessage({ text: 'Нельзя добавить инструмента из Mock-данных (бэкенд недоступен)', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      await addToOrder({
        service_id: instrumentId,
        exoplanet_name: 'Новая экзопланета',
        star_mass: 1.0,
        orbital_period: 365.0,
        velocity_amplitude: 10.0,
        inclination: 90.0,
        eccentricity: 0.0,
      });

      setMessage({ text: 'Инструмент добавлен в заявку!', type: 'success' });
      loadCart();
    } catch (err: any) {
      if (err.status === 401) {
        setMessage({ text: 'Требуется авторизация', type: 'error' });
      } else if (err.status === 409) {
        setMessage({ text: 'Этот инструмент уже в заявке', type: 'error' });
      } else {
        setMessage({ text: 'Ошибка при добавлении инструмента', type: 'error' });
      }
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const goToCalculation = () => {
    if (cart && cart.order_id > 0) {
      navigate(`/calculation/${cart.order_id}`);
    } else {
      navigate('/calculation');
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DEFAULT_IMAGE;
  };

  return (
    <div className="instruments-page">
      {/* Уведомление */}
      {message && (
        <div className={`message-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      {usingMock && (
        <Alert variant="warning" className="mb-4">
          ⚠️ Бэкенд недоступен. Показаны демонстрационные данные (Mock). Функции заказа ограничены.
        </Alert>
      )}

      <h3>🔭 Каталог инструментов</h3>

      <Row>
        <Col md={3} className="filters-sidebar">
          <Accordion defaultActiveKey="0" className="mb-4">
            <Accordion.Item eventKey="0">
              <Accordion.Header>🔍 Фильтры</Accordion.Header>
              <Accordion.Body>
                <Form onSubmit={handleSearch}>
                  <Form.Group className="mb-3">
                    <Form.Label>Поиск</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Название..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Тип</Form.Label>
                    <Form.Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option value="">Все типы</option>
                      <option value="ground">Наземные</option>
                      <option value="space">Космические</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Точность (м/с)</Form.Label>
                    <InputGroup className="mb-2">
                      <InputGroup.Text>от</InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={minAccuracy}
                        onChange={(e) => setMinAccuracy(e.target.value)}
                      />
                    </InputGroup>
                    <InputGroup>
                      <InputGroup.Text>до</InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={maxAccuracy}
                        onChange={(e) => setMaxAccuracy(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Дата создания</Form.Label>
                    <Form.Control
                      type="date"
                      className="mb-2"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                    <Form.Control
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button variant="primary" type="submit">
                      Применить
                    </Button>
                    <Button variant="outline-secondary" onClick={handleReset}>
                      Сброс
                    </Button>
                  </div>
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>

        <Col md={9}>
          {/* Результаты */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-cosmic"></div>
              <p className="mt-3" style={{ color: '#aaa' }}>Загрузка инструментов...</p>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-white-50">Найдено: {instruments.length}</span>
                {!usingMock && (
                  <Button
                    className="cart-btn"
                    onClick={goToCalculation}
                    disabled={!cart || cart.services_count === 0}
                    size="sm"
                  >
                    В заявке: {cart?.services_count || 0}
                  </Button>
                )}
              </div>

              {instruments.length === 0 ? (
                <Alert className="alert-cosmic">
                  Инструменты не найдены. Попробуйте изменить параметры поиска.
                </Alert>
              ) : (
                <div className="instruments-grid">
                  {instruments.map((instrument) => (
                    <div key={instrument.id} className="instrument-card card-cosmic">
                      <div className="instrument-image">
                        <img
                          src={instrument.image_url || DEFAULT_IMAGE}
                          onError={handleImageError}
                          alt={instrument.name}
                        />
                      </div>
                      <div className="instrument-content">
                        <div className="instrument-name">{instrument.name}</div>
                        <div className="instrument-type">
                          {instrument.type === 'ground' ? '🌍 Наземный' : '🚀 Космический'}
                        </div>
                        <div className="instrument-accuracy">
                          Точность: {instrument.accuracy} {instrument.accuracy_unit}
                        </div>
                        <div className="instrument-actions">
                          <Button
                            className="btn-cosmic action-btn"
                            onClick={() => handleAddToOrder(instrument.id)}
                            disabled={usingMock}
                          >
                            Добавить
                          </Button>
                          <Link to={`/instrument/${instrument.id}`}>
                            <Button className="btn-cosmic action-btn">
                              Подробнее
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default InstrumentsPage;
