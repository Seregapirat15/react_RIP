import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Alert, Spinner, Form, Table } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchExoplanetCalculationById,
  updateExoplanetCalculation,
  formExoplanetCalculation,
  deleteExoplanetCalculation,
  removeInstrumentFromCalculation,
  updateCalculationInstrumentParams,
  clearOrderDetailMessages,
} from '../store/orderDetailSlice';
import { fetchExoplanetCart } from '../store/cartSlice';
import './CalculationPage.css';

const DEFAULT_IMAGE = '/placeholder-service.svg';

const CalculationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { order, loading, actionLoading, error, successMessage } = useAppSelector((s) => s.orderDetail);
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const cart = useAppSelector((s) => s.cart.cart);

  const [notes, setNotes] = useState('');
  const [editingService, setEditingService] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ exoplanet_name: '', star_mass: 1, orbital_period: 365, velocity_amplitude: 10, inclination: 90, eccentricity: 0 });

  const orderId = id ? parseInt(id) : cart?.order_id;

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login', { replace: true }); return; }
    if (orderId && orderId > 0) dispatch(fetchExoplanetCalculationById(orderId));
  }, [orderId, isAuthenticated, dispatch, navigate]);

  useEffect(() => {
    if (order) setNotes(order.notes || '');
  }, [order]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearOrderDetailMessages()), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch]);

  const isDraft = order?.status === 'черновик' || order?.status === 'draft';

  const handleUpdateOrder = () => {
    if (!order) return;
    dispatch(updateExoplanetCalculation({ orderId: order.id, fields: { notes } }));
  };

  const handleFormOrder = () => {
    if (!order) return;
    dispatch(formExoplanetCalculation(order.id)).then((res) => {
      if (formExoplanetCalculation.fulfilled.match(res)) dispatch(fetchExoplanetCart());
    });
  };

  const handleDeleteOrder = () => {
    if (!order) return;
    dispatch(deleteExoplanetCalculation(order.id)).then((res) => {
      if (deleteExoplanetCalculation.fulfilled.match(res)) {
        dispatch(fetchExoplanetCart());
        navigate('/orders');
      }
    });
  };

  const handleRemoveService = (serviceId: number) => {
    if (!order) return;
    dispatch(removeInstrumentFromCalculation({ orderId: order.id, serviceId })).then(() => dispatch(fetchExoplanetCart()));
  };

  const startEdit = (s: typeof order extends null ? never : NonNullable<typeof order>['services'] extends (infer U)[] | undefined ? U : never) => {
    setEditingService(s.service_id);
    setEditForm({
      exoplanet_name: s.exoplanet_name || '',
      star_mass: s.star_mass || 1,
      orbital_period: s.orbital_period || 365,
      velocity_amplitude: s.velocity_amplitude || 10,
      inclination: s.inclination || 90,
      eccentricity: s.eccentricity || 0,
    });
  };

  const handleSaveServiceParams = () => {
    if (!order || editingService === null) return;
    dispatch(updateCalculationInstrumentParams({ orderId: order.id, serviceId: editingService, params: editForm }))
      .then(() => { setEditingService(null); dispatch(fetchExoplanetCalculationById(order.id)); });
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3" style={{ color: '#aaa' }}>Загрузка заявки...</p>
    </div>
  );

  if (!orderId || orderId <= 0) return (
    <div className="calc-page">
      <Alert variant="info">У вас нет активной заявки-черновика. <Link to="/instruments">Добавьте инструменты</Link> для создания заявки.</Alert>
    </div>
  );

  if (error) return (
    <div className="calc-page">
      <Alert variant="danger">{error}</Alert>
      <Link to="/instruments"><Button className="btn-cosmic">К инструментам</Button></Link>
    </div>
  );

  if (!order) return null;

  const statusLabel: Record<string, string> = {
    'черновик': 'Черновик', 'draft': 'Черновик', 'сформирован': 'Сформирована', 'formed': 'Сформирована',
    'завершён': 'Завершена', 'completed': 'Завершена', 'отклонён': 'Отклонена', 'rejected': 'Отклонена',
    'удалён': 'Удалена', 'deleted': 'Удалена',
  };

  return (
    <div className="calc-page">
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {actionLoading && <div className="text-center mb-3"><Spinner animation="border" size="sm" /> Выполняется...</div>}

      <div className="calc-header">
        <h2>Заявка #{order.id}</h2>
        <span className={`calc-status status-${order.status}`}>{statusLabel[order.status] || order.status}</span>
      </div>

      <div className="calc-info">
        <p><strong>Дата создания:</strong> {new Date(order.created_at).toLocaleString()}</p>
        {order.formation_date && <p><strong>Дата формирования:</strong> {new Date(order.formation_date).toLocaleString()}</p>}
        {order.completion_date && <p><strong>Дата завершения:</strong> {new Date(order.completion_date).toLocaleString()}</p>}
        {order.total_mass != null && <p><strong>Итоговая масса:</strong> {order.total_mass} M_J</p>}
      </div>

      {isDraft && (
        <div className="calc-notes mb-3">
          <Form.Group>
            <Form.Label style={{ color: '#ccc' }}>Примечания к заявке</Form.Label>
            <Form.Control as="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="filter-input" />
          </Form.Group>
        </div>
      )}

      {/* 5 кнопок управления заявкой */}
      <div className="calc-actions mb-4">
        {isDraft && (
          <>
            <Button className="btn-cosmic" onClick={handleUpdateOrder} disabled={actionLoading}>Сохранить заявку</Button>
            <Button variant="success" onClick={handleFormOrder} disabled={actionLoading}>Сформировать</Button>
            <Button variant="danger" onClick={handleDeleteOrder} disabled={actionLoading}>Удалить заявку</Button>
          </>
        )}
        <Link to="/orders"><Button variant="outline-secondary">К списку заявок</Button></Link>
        <Link to="/instruments"><Button variant="outline-info">К инструментам</Button></Link>
      </div>

      <h4 style={{ color: '#ddd' }}>Инструменты в заявке ({order.services?.length || 0})</h4>

      {order.services && order.services.length > 0 ? (
        <Table variant="dark" striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Инструмент</th>
              <th>Экзопланета</th>
              <th>Масса звезды (M☉)</th>
              <th>Период (дн)</th>
              <th>Амплитуда (м/с)</th>
              <th>Наклон (°)</th>
              <th>Расч. масса</th>
              {isDraft && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {order.services.map((s) => (
              <tr key={s.service_id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img src={s.service?.image_url || DEFAULT_IMAGE} alt="" width={32} height={32} style={{ borderRadius: 4, objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }} />
                    {s.service?.name || `#${s.service_id}`}
                  </div>
                </td>
                {editingService === s.service_id ? (
                  <>
                    <td><Form.Control size="sm" value={editForm.exoplanet_name} onChange={(e) => setEditForm({ ...editForm, exoplanet_name: e.target.value })} /></td>
                    <td><Form.Control size="sm" type="number" step="0.01" value={editForm.star_mass} onChange={(e) => setEditForm({ ...editForm, star_mass: +e.target.value })} /></td>
                    <td><Form.Control size="sm" type="number" step="0.1" value={editForm.orbital_period} onChange={(e) => setEditForm({ ...editForm, orbital_period: +e.target.value })} /></td>
                    <td><Form.Control size="sm" type="number" step="0.1" value={editForm.velocity_amplitude} onChange={(e) => setEditForm({ ...editForm, velocity_amplitude: +e.target.value })} /></td>
                    <td><Form.Control size="sm" type="number" step="0.1" value={editForm.inclination} onChange={(e) => setEditForm({ ...editForm, inclination: +e.target.value })} /></td>
                    <td>—</td>
                    <td>
                      <Button size="sm" variant="success" onClick={handleSaveServiceParams} disabled={actionLoading}>OK</Button>{' '}
                      <Button size="sm" variant="secondary" onClick={() => setEditingService(null)}>Отмена</Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{s.exoplanet_name}</td>
                    <td>{s.star_mass}</td>
                    <td>{s.orbital_period}</td>
                    <td>{s.velocity_amplitude}</td>
                    <td>{s.inclination}</td>
                    <td>{s.calculated_mass != null ? `${s.calculated_mass} M_J` : '—'}</td>
                    {isDraft && (
                      <td>
                        <Button size="sm" variant="outline-warning" onClick={() => startEdit(s)} disabled={actionLoading}>Изменить</Button>{' '}
                        <Button size="sm" variant="outline-danger" onClick={() => handleRemoveService(s.service_id)} disabled={actionLoading}>Удалить</Button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info" className="mt-3">В заявке нет инструментов.</Alert>
      )}
    </div>
  );
};

export default CalculationPage;
