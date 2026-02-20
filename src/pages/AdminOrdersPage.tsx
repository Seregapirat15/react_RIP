/**
 * Lab8: Интерфейс модератора — short polling, кнопки смены статуса, фильтры, кнопка запуска async расчёта.
 */
import { useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchAdminOrdersThunk,
  completeOrderThunk,
  triggerAsyncCalcThunk,
  setAdminFilterStatus,
  setAdminFilterDateFrom,
  setAdminFilterDateTo,
  setAdminFilterCreatorId,
  resetAdminFilters,
} from '../store/adminOrdersSlice';
import './OrdersPage.css';

const POLL_INTERVAL_MS = 6000; // short polling каждые 6 сек

const AdminOrdersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const {
    items,
    loading,
    error,
    filterStatus,
    filterDateFrom,
    filterDateTo,
    filterCreatorId,
    actionLoading,
  } = useAppSelector((s) => s.adminOrders);

  const isModerator = user?.role === 'moderator' || user?.role === 'admin';
  const userLoading = isAuthenticated && !user;
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (user && !isModerator) {
      navigate('/orders', { replace: true });
      return;
    }
    if (isModerator) dispatch(fetchAdminOrdersThunk());
  }, [isAuthenticated, user, isModerator, navigate, dispatch]);

  // Short polling
  useEffect(() => {
    if (!isModerator || !isAuthenticated) return;
    pollRef.current = setInterval(() => {
      dispatch(fetchAdminOrdersThunk());
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isModerator, isAuthenticated, dispatch]);

  const uniqueCreators = useMemo(() => {
    const map = new Map<number, string>();
    items.forEach((o) => {
      if (o.creator_id && o.creator_login) map.set(o.creator_id, o.creator_login);
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const handleComplete = (orderId: number, action: 'complete' | 'reject') => {
    dispatch(completeOrderThunk({ orderId, action }));
  };

  const handleTriggerAsync = (orderId: number) => {
    dispatch(triggerAsyncCalcThunk(orderId));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchAdminOrdersThunk());
  };

  const statusLabel: Record<string, string> = {
    черновик: 'Черновик',
    draft: 'Черновик',
    сформирован: 'Сформирована',
    formed: 'Сформирована',
    завершён: 'Завершена',
    completed: 'Завершена',
    отклонён: 'Отклонена',
    rejected: 'Отклонена',
  };

  if (userLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Загрузка...</p>
      </div>
    );
  }
  if (!isModerator || !user) return null;

  return (
    <div className="orders-page admin-orders">
      <h2 className="page-heading">Панель модератора — заявки</h2>

      <Form onSubmit={handleSearch} className="mb-4">
        <Row className="align-items-end g-3">
          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label className="filter-label">Статус</Form.Label>
              <Form.Select
                value={filterStatus}
                onChange={(e) => dispatch(setAdminFilterStatus(e.target.value))}
              >
                <option value="">Все</option>
                <option value="сформирован">Сформирована</option>
                <option value="завершён">Завершена</option>
                <option value="отклонён">Отклонена</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label className="filter-label">Создатель</Form.Label>
              <Form.Select
                value={filterCreatorId}
                onChange={(e) => dispatch(setAdminFilterCreatorId(e.target.value))}
              >
                <option value="">Все</option>
                {uniqueCreators.map(([id, login]) => (
                  <option key={id} value={id}>
                    {login}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label className="filter-label">Дата от</Form.Label>
              <Form.Control
                type="date"
                value={filterDateFrom}
                onChange={(e) => dispatch(setAdminFilterDateFrom(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label className="filter-label">Дата до</Form.Label>
              <Form.Control
                type="date"
                value={filterDateTo}
                onChange={(e) => dispatch(setAdminFilterDateTo(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col md={4} sm={12}>
            <Button className="btn-cosmic" type="submit">
              Найти
            </Button>
            <Button
              variant="outline-secondary"
              type="button"
              className="ms-2"
              onClick={() => dispatch(resetAdminFilters())}
            >
              Сброс
            </Button>
          </Col>
        </Row>
      </Form>

      <p className="admin-poll-hint">
        Автообновление: каждые {POLL_INTERVAL_MS / 1000} сек
      </p>

      {loading && !items.length && (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2" style={{ color: '#aaa' }}>
            Загрузка заявок...
          </p>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && items.length === 0 && (
        <div className="orders-empty-state">
          <p className="orders-empty-text">Заявок по выбранным критериям не найдено.</p>
          <Button className="btn-cosmic mt-2" onClick={() => dispatch(resetAdminFilters())}>
            Сбросить фильтры
          </Button>
        </div>
      )}

      {items.length > 0 && (
        <Table variant="dark" striped bordered hover responsive>
          <thead>
            <tr>
              <th>№</th>
              <th>Статус</th>
              <th>Создатель</th>
              <th>Создана</th>
              <th>Сформирована</th>
              <th>Завершена</th>
              <th>Прогресс расчёта</th>
              <th>Итоговая масса</th>
              <th>Действия</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>
                  <span className={`order-status status-${o.status}`}>
                    {statusLabel[o.status] || o.status}
                  </span>
                </td>
                <td>{o.creator_login || '—'}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  {o.formation_date
                    ? new Date(o.formation_date).toLocaleDateString()
                    : '—'}
                </td>
                <td>
                  {o.completion_date
                    ? new Date(o.completion_date).toLocaleDateString()
                    : '—'}
                </td>
                <td>
                  <span className="progress-calc">
                    {o.calculated_count ?? 0} из {o.mm_total ?? 0}
                  </span>
                  {((o.mm_total ?? 0) > 0 && (o.calculated_count ?? 0) === (o.mm_total ?? 0)) && (
                    <span className="badge bg-success ms-1">готово</span>
                  )}
                </td>
                <td>
                  {(o.calculated_count ?? 0) > 0 && o.total_mass != null
                    ? `${o.total_mass.toFixed(3)} M_J`
                    : '—'}
                </td>
                <td>
                  {o.status === 'сформирован' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        className="me-1"
                        disabled={actionLoading === o.id}
                        onClick={() => handleComplete(o.id, 'complete')}
                      >
                        Завершить
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={actionLoading === o.id}
                        onClick={() => handleComplete(o.id, 'reject')}
                      >
                        Отклонить
                      </Button>
                      <Button
                        size="sm"
                        variant="info"
                        className="ms-1"
                        disabled={actionLoading === o.id}
                        onClick={() => handleTriggerAsync(o.id)}
                        title="Lab8: запуск async расчёта массы"
                      >
                        Расчёт
                      </Button>
                    </>
                  )}
                  {o.status !== 'сформирован' && '—'}
                </td>
                <td>
                  <Link to={`/calculation/${o.id}`}>
                    <Button size="sm" className="btn-cosmic">
                      Открыть
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default AdminOrdersPage;
