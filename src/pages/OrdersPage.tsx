import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExoplanetCalculations, setOrdersFilterStatus, setOrdersFilterDateFrom, setOrdersFilterDateTo } from '../store/ordersSlice';
import './OrdersPage.css';

const OrdersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const { items, loading, error, filterStatus, filterDateFrom, filterDateTo } = useAppSelector((s) => s.orders);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login', { replace: true }); return; }
    dispatch(fetchExoplanetCalculations({ status: filterStatus || undefined, date_from: filterDateFrom || undefined, date_to: filterDateTo || undefined }));
  }, [isAuthenticated, navigate, dispatch, filterStatus, filterDateFrom, filterDateTo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchExoplanetCalculations({ status: filterStatus || undefined, date_from: filterDateFrom || undefined, date_to: filterDateTo || undefined }));
  };

  const statusLabel: Record<string, string> = {
    'черновик': 'Черновик', 'draft': 'Черновик', 'сформирован': 'Сформирована', 'formed': 'Сформирована',
    'завершён': 'Завершена', 'completed': 'Завершена', 'отклонён': 'Отклонена', 'rejected': 'Отклонена',
  };

  return (
    <div className="orders-page">
      <h2 className="page-heading">Мои заявки на расчёт</h2>

      <Form onSubmit={handleSearch} className="mb-4">
        <Row className="align-items-end g-3">
          <Col md={3} sm={6}>
            <Form.Group>
              <Form.Label className="filter-label">Статус</Form.Label>
              <Form.Select className="filter-input" value={filterStatus} onChange={(e) => dispatch(setOrdersFilterStatus(e.target.value))}>
                <option value="">Все</option>
                <option value="сформирован">Сформирована</option>
                <option value="завершён">Завершена</option>
                <option value="отклонён">Отклонена</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3} sm={6}>
            <Form.Group>
              <Form.Label className="filter-label">Дата формирования от</Form.Label>
              <Form.Control type="date" className="filter-input" value={filterDateFrom} onChange={(e) => dispatch(setOrdersFilterDateFrom(e.target.value))} />
            </Form.Group>
          </Col>
          <Col md={3} sm={6}>
            <Form.Group>
              <Form.Label className="filter-label">Дата формирования до</Form.Label>
              <Form.Control type="date" className="filter-input" value={filterDateTo} onChange={(e) => dispatch(setOrdersFilterDateTo(e.target.value))} />
            </Form.Group>
          </Col>
          <Col md={3} sm={6}>
            <Button className="btn-cosmic" type="submit">Найти</Button>
          </Col>
        </Row>
      </Form>

      {loading && <div className="text-center py-4"><Spinner animation="border" variant="primary" /><p className="mt-2" style={{ color: '#aaa' }}>Загрузка заявок...</p></div>}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && items.length === 0 && <Alert variant="info">Заявки не найдены.</Alert>}

      {!loading && items.length > 0 && (
        <Table variant="dark" striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Статус</th>
              <th>Создана</th>
              <th>Сформирована</th>
              <th>Завершена</th>
              <th>Инструменты</th>
              <th>Итог. масса</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td><span className={`order-status status-${o.status}`}>{statusLabel[o.status] || o.status}</span></td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>{o.formation_date ? new Date(o.formation_date).toLocaleDateString() : '—'}</td>
                <td>{o.completion_date ? new Date(o.completion_date).toLocaleDateString() : '—'}</td>
                <td>{o.services?.length ?? '—'}</td>
                <td>{o.total_mass != null ? `${o.total_mass} M_J` : '—'}</td>
                <td><Link to={`/calculation/${o.id}`}><Button size="sm" className="btn-cosmic">Открыть</Button></Link></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default OrdersPage;
