import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { fetchInstruments } from '../services/api';
import { Instrument } from '../types';
import { MOCK_INSTRUMENTS } from '../data/mockData';
import './InstrumentsPage.css';

const DEFAULT_IMAGE = '/placeholder-service.svg';

const InstrumentsPage = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [minAccuracy, setMinAccuracy] = useState<string>('');
  const [maxAccuracy, setMaxAccuracy] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [filtersExpanded, setFiltersExpanded] = useState(false);

  useEffect(() => {
    loadInstruments();
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
    } catch {
      let mockData = [...MOCK_INSTRUMENTS];

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

      setInstruments(mockData);
      setUsingMock(true);
    } finally {
      setLoading(false);
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
    fetchInstruments({}).then(setInstruments).catch(() => setInstruments(MOCK_INSTRUMENTS));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DEFAULT_IMAGE;
  };

  return (
    <div className="instruments-page">
      {usingMock && (
        <Alert variant="warning" className="mock-alert">
          Бэкенд недоступен. Показаны демонстрационные данные (Mock).
        </Alert>
      )}

      <h2 className="page-heading">Каталог инструментов</h2>

      {/* Блок фильтров - НАД карточками */}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="filter-input"
                />
              </Form.Group>
            </Col>
            <Col md={3} sm={6}>
              <Form.Group>
                <Form.Label className="filter-label">Тип инструмента</Form.Label>
                <Form.Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
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
                <Button className="btn-cosmic filter-btn" type="submit">
                  Найти
                </Button>
                <Button variant="outline-secondary" className="filter-btn" onClick={handleReset}>
                  Сброс
                </Button>
                <Button
                  variant="outline-info"
                  className="filter-btn"
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                >
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
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="мин"
                      value={minAccuracy}
                      onChange={(e) => setMinAccuracy(e.target.value)}
                      className="filter-input"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label className="filter-label">Точность до (м/с)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="макс"
                      value={maxAccuracy}
                      onChange={(e) => setMaxAccuracy(e.target.value)}
                      className="filter-input"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label className="filter-label">Дата от</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="filter-input"
                  />
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label className="filter-label">Дата до</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="filter-input"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Form>
      </div>

      <div className="instruments-count">
        Найдено: {instruments.length}
      </div>

      {/* Карточки инструментов */}
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
                  <Link to={`/instrument/${instrument.id}`} className="flex-grow-1">
                    <Button className="btn-cosmic action-btn w-100">
                      Подробнее
                    </Button>
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
