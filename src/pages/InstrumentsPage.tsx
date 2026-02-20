import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { fetchInstruments, fetchCartIcon, addToOrder, isAuthenticated } from '../services/api';
import { Instrument, CartIcon } from '../types';
import { MOCK_INSTRUMENTS } from '../data/mockData';
import { isTauri } from '../config/target';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { store } from '../store';
import {
  setSearch, setType, setMinAccuracy, setMaxAccuracy, setDateFrom, setDateTo,
  setFiltersExpanded, resetFilters,
} from '../store/filterSlice';
import './InstrumentsPage.css';

const DEFAULT_IMAGE = '/placeholder-service.svg';

const InstrumentsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    search: searchQuery,
    type: typeFilter,
    minAccuracy,
    maxAccuracy,
    dateFrom,
    dateTo,
    filtersExpanded,
  } = useAppSelector((state) => state.instrumentFilters);

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [apiFailedInTauri, setApiFailedInTauri] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [cart, setCart] = useState<CartIcon | null>(null);

  const loadInstruments = useCallback(async () => {
    const { search, type, minAccuracy: minA, maxAccuracy: maxA, dateFrom: df, dateTo: dt } =
      store.getState().instrumentFilters;
    setLoading(true);
    try {
      const data = await fetchInstruments({
        search: search || undefined,
        type: type || undefined,
        min_accuracy: minA ? Number(minA) : undefined,
        max_accuracy: maxA ? Number(maxA) : undefined,
        date_from: df || undefined,
        date_to: dt || undefined,
      });
      setInstruments(data);
      setUsingMock(false);
      setApiFailedInTauri(false);
    } catch {
      if (isTauri) {
        setInstruments([]);
        setUsingMock(false);
        setApiFailedInTauri(true);
      } else {
        setApiFailedInTauri(false);
        let mockData = [...MOCK_INSTRUMENTS];
        if (search) {
          mockData = mockData.filter(i =>
            i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.full_name.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (type) mockData = mockData.filter(i => i.type === type);
        if (minA) mockData = mockData.filter(i => i.accuracy >= Number(minA));
        if (maxA) mockData = mockData.filter(i => i.accuracy <= Number(maxA));
        setInstruments(mockData);
        setUsingMock(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstruments();
  }, [loadInstruments]);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const cartData = await fetchCartIcon();
      setCart(cartData);
    } catch {
      setCart(null);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadInstruments();
  };

  const handleReset = () => {
    dispatch(resetFilters());
    loadInstruments();
  };

  const handleAddToOrder = async (instrumentId: number) => {
    if (!isAuthenticated()) {
      setMessage({ text: 'Для добавления в заявку необходимо авторизоваться', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (usingMock) {
      setMessage({ text: 'Бэкенд недоступен — добавление невозможно', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    try {
      await addToOrder({
        service_id: instrumentId,
        exoplanet_name: 'Не указана',
        star_mass: 1.0,
        orbital_period: 365.0,
        velocity_amplitude: 10.0,
        inclination: 90.0,
        eccentricity: 0.0,
      });
      setMessage({ text: 'Инструмент добавлен в заявку!', type: 'success' });
      loadCart();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 401) {
        setMessage({ text: 'Требуется авторизация', type: 'error' });
      } else if (status === 409) {
        setMessage({ text: 'Этот инструмент уже в заявке', type: 'error' });
      } else {
        setMessage({ text: 'Ошибка при добавлении инструмента', type: 'error' });
      }
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const goToOrder = () => {
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
      {message && (
        <div className={`message-toast ${message.type}`}>{message.text}</div>
      )}

      {usingMock && !isTauri && (
        <Alert variant="warning" className="mock-alert">
          Бэкенд недоступен. Показаны демонстрационные данные (Mock).
        </Alert>
      )}
      {isTauri && apiFailedInTauri && (
        <Alert variant="warning" className="mock-alert">
          Запустите бэкенд (backend_RIP на порту 8081). Tauri показывает только данные с API.
        </Alert>
      )}

      <div className="page-header-row">
        <h2 className="page-heading">Каталог инструментов</h2>
        {isAuthenticated() && (
          <Button
            className="cart-btn"
            onClick={goToOrder}
            disabled={!cart || cart.services_count === 0}
          >
            Заявка: {cart?.services_count || 0}
          </Button>
        )}
      </div>

      {/* Фильтры — над карточками */}
      <div className="filters-block">
        <Form onSubmit={handleSearch}>
          <Row className="align-items-end g-3">
            <Col md={4} sm={6}>
              <Form.Group>
                <Form.Label className="filter-label">Поиск по названию</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Введите название..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearch(e.target.value))}
                  className="filter-input"
                />
              </Form.Group>
            </Col>
            <Col md={3} sm={6}>
              <Form.Group>
                <Form.Label className="filter-label">Тип инструмента</Form.Label>
                <Form.Select
                  value={typeFilter}
                  onChange={(e) => dispatch(setType(e.target.value))}
                  className="filter-input"
                >
                  <option value="">Все типы</option>
                  <option value="ground">Наземные</option>
                  <option value="space">Космические</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} sm={6}>
              <div className="d-flex gap-2">
                <Button className="btn-cosmic filter-btn" type="submit">Найти</Button>
                <Button variant="outline-secondary" className="filter-btn" onClick={handleReset}>Сброс</Button>
                <Button variant="outline-info" className="filter-btn" onClick={() => dispatch(setFiltersExpanded(!filtersExpanded))}>
                  {filtersExpanded ? 'Скрыть' : 'Ещё'}
                </Button>
              </div>
            </Col>
          </Row>
          {filtersExpanded && (
            <Row className="mt-3 g-3">
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label className="filter-label">Точность от (м/с)</Form.Label>
                  <InputGroup>
                    <Form.Control type="number" step="0.01" placeholder="мин" value={minAccuracy} onChange={(e) => dispatch(setMinAccuracy(e.target.value))} className="filter-input" />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label className="filter-label">Точность до (м/с)</Form.Label>
                  <InputGroup>
                    <Form.Control type="number" step="0.01" placeholder="макс" value={maxAccuracy} onChange={(e) => dispatch(setMaxAccuracy(e.target.value))} className="filter-input" />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label className="filter-label">Дата от</Form.Label>
                  <Form.Control type="date" value={dateFrom} onChange={(e) => dispatch(setDateFrom(e.target.value))} className="filter-input" />
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label className="filter-label">Дата до</Form.Label>
                  <Form.Control type="date" value={dateTo} onChange={(e) => dispatch(setDateTo(e.target.value))} className="filter-input" />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Form>
      </div>

      <div className="instruments-count">Найдено: {instruments.length}</div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-cosmic"></div>
          <p className="mt-3 loading-text">Загрузка инструментов...</p>
        </div>
      ) : instruments.length === 0 ? (
        <Alert className="alert-cosmic">
          Инструменты не найдены. Попробуйте изменить параметры поиска.
        </Alert>
      ) : (
        <div className="instruments-grid-2col">
          {instruments.map((instrument) => (
            <div key={instrument.id} className="instrument-card card-cosmic">
              <div className="instrument-image">
                <img
                  src={instrument.image_url || DEFAULT_IMAGE}
                  onError={handleImageError}
                  alt={instrument.name}
                />
                <span className={`card-type-badge ${instrument.type}`}>
                  {instrument.type === 'ground' ? 'Наземный' : 'Космический'}
                </span>
              </div>
              <div className="instrument-content">
                <div className="instrument-name">{instrument.name}</div>
                <div className="instrument-fullname">{instrument.full_name}</div>
                <div className="instrument-accuracy">
                  Точность: {instrument.accuracy} {instrument.accuracy_unit}
                </div>
                <div className="instrument-location">{instrument.location}</div>
                <div className="instrument-actions">
                  <Button
                    className="btn-cosmic action-btn"
                    onClick={() => handleAddToOrder(instrument.id)}
                  >
                    Добавить
                  </Button>
                  <Link to={`/instrument/${instrument.id}`}>
                    <Button className="btn-cosmic action-btn">Подробнее</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstrumentsPage;
