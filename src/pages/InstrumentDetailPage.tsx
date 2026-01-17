import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Alert } from 'react-bootstrap';
import { fetchInstrumentById } from '../services/api';
import { Instrument } from '../types';
import './InstrumentDetailPage.css';

const DEFAULT_IMAGE = '/placeholder-service.svg';

const InstrumentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadInstrument(parseInt(id));
    }
  }, [id]);

  const loadInstrument = async (instrumentId: number) => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchInstrumentById(instrumentId);
      setInstrument(data);
    } catch (err) {
      console.error('Ошибка загрузки инструмента:', err);
      setError('Инструмент не найден');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DEFAULT_IMAGE;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-cosmic"></div>
        <p className="mt-3" style={{ color: '#aaa' }}>Загрузка информации...</p>
      </div>
    );
  }

  if (error || !instrument) {
    return (
      <div className="instrument-detail-page">
        <Alert className="alert-danger-cosmic">
          {error || 'Инструмент не найден'}
        </Alert>
        <Link to="/">
          <Button className="btn-cosmic">← Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="instrument-detail-page">
      <div className="detail-container section-cosmic">
        {/* Изображение */}
        <div className="detail-image">
          <img
            src={instrument.image_url || DEFAULT_IMAGE}
            onError={handleImageError}
            alt={instrument.name}
          />
        </div>

        {/* Основная информация */}
        <div className="detail-info">
          <h1 className="detail-title">{instrument.full_name || instrument.name}</h1>

          <div className="detail-row">
            <span className="detail-label">Тип:</span>
            <span className="detail-value">
              {instrument.type === 'ground' ? '🌍 Наземный инструмент' : '🚀 Космический инструмент'}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Статус:</span>
            <span className={`detail-value status-${instrument.status?.toLowerCase() === 'активен' ? 'active' : 'inactive'}`}>
              {instrument.status}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Дата запуска:</span>
            <span className="detail-value">{instrument.launch_date}</span>
          </div>

          <div className="detail-description">
            <h3>Описание</h3>
            <p>{instrument.description}</p>
          </div>
        </div>
      </div>

      {/* Характеристики */}
      <div className="characteristics-section section-cosmic">
        <h2 className="title-cosmic">Характеристики</h2>

        <div className="characteristics-grid">
          <div className="char-item">
            <div className="char-label">Точность измерений</div>
            <div className="char-value">{instrument.accuracy} {instrument.accuracy_unit}</div>
          </div>

          <div className="char-item">
            <div className="char-label">Точность скорости</div>
            <div className="char-value">{instrument.velocity_precision} м/с</div>
          </div>

          <div className="char-item">
            <div className="char-label">Диапазон длин волн</div>
            <div className="char-value">{instrument.wavelength_range_min} - {instrument.wavelength_range_max} нм</div>
          </div>

          <div className="char-item">
            <div className="char-label">Разрешающая способность</div>
            <div className="char-value">{instrument.resolution_power?.toLocaleString()}</div>
          </div>

          <div className="char-item">
            <div className="char-label">Спектральное разрешение</div>
            <div className="char-value">{instrument.spectral_resolution}</div>
          </div>

          <div className="char-item">
            <div className="char-label">Диапазон измерений</div>
            <div className="char-value">{instrument.measurement_range}</div>
          </div>

          <div className="char-item">
            <div className="char-label">Разрешение</div>
            <div className="char-value">{instrument.resolution}</div>
          </div>

          <div className="char-item">
            <div className="char-label">Калибровка</div>
            <div className="char-value">{instrument.calibration}</div>
          </div>

          <div className="char-item">
            <div className="char-label">Стабильность</div>
            <div className="char-value">{instrument.stability}</div>
          </div>

          <div className="char-item">
            <div className="char-label">Тип прибора</div>
            <div className="char-value">{instrument.instrument_type}</div>
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="additional-section section-cosmic">
        <h2 className="title-cosmic">Дополнительная информация</h2>

        <div className="additional-grid">
          <div className="add-item">
            <div className="add-label">📍 Местоположение</div>
            <div className="add-value">{instrument.location}</div>
          </div>

          <div className="add-item">
            <div className="add-label">🚀 Дата запуска</div>
            <div className="add-value">{instrument.launch_date}</div>
          </div>
        </div>
      </div>

      {/* Кнопка назад */}
      <div className="back-section">
        <Link to="/">
          <Button className="btn-cosmic">← Вернуться к списку инструментов</Button>
        </Link>
      </div>
    </div>
  );
};

export default InstrumentDetailPage;

