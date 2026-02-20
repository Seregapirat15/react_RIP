import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Alert } from 'react-bootstrap';
import { fetchInstrumentById } from '../services/api';
import { Instrument } from '../types';
import { MOCK_INSTRUMENTS } from '../data/mockData';
import { isTauri } from '../config/target';
import './InstrumentDetailPage.css';

const DEFAULT_IMAGE = '/placeholder-service.svg';
/** Видео по умолчанию для всех карточек (как у id 2) */
const DEFAULT_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

const InstrumentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

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
    } catch {
      if (isTauri) {
        setError('Инструмент не найден или бэкенд недоступен. Запустите backend_RIP на порту 8081.');
      } else {
        const mockInstrument = MOCK_INSTRUMENTS.find(i => i.id === instrumentId);
        if (mockInstrument) {
          setInstrument(mockInstrument);
        } else {
          setError('Инструмент не найден');
        }
      }
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
      <div className="vibes-page">
        <Alert className="alert-danger-cosmic">
          {error || 'Инструмент не найден'}
        </Alert>
        <Link to="/instruments">
          <Button className="btn-cosmic">&#8592; Вернуться к списку</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="vibes-page">
      <div className="vibes-container">
        {/* Видео секция — портрет в стиле Vibes/TikTok */}
        <div className="vibes-video-section">
          <video
            key={instrument.id}
            ref={videoRef}
            className="vibes-video"
            autoPlay
            loop
            muted
            playsInline
            poster={instrument.image_url || DEFAULT_IMAGE}
          >
            <source src={instrument.video_url || DEFAULT_VIDEO} type="video/mp4" />
            Ваш браузер не поддерживает видео
          </video>

          <div className="vibes-overlay">
            <div className="vibes-header">
              <span className={`vibes-badge ${instrument.type}`}>
                {instrument.type === 'ground' ? 'Наземный' : 'Космический'}
              </span>
              <span className="vibes-status">{instrument.status}</span>
            </div>

            <div className="vibes-content">
              <h1 className="vibes-title">{instrument.name}</h1>
              <p className="vibes-subtitle">{instrument.full_name}</p>

              <div className="vibes-stats">
                <div className="vibes-stat">
                  <span className="stat-value">{instrument.accuracy}</span>
                  <span className="stat-label">{instrument.accuracy_unit}</span>
                </div>
                <div className="vibes-stat">
                  <span className="stat-value">{instrument.velocity_precision}</span>
                  <span className="stat-label">м/с точность</span>
                </div>
                <div className="vibes-stat">
                  <span className="stat-value">{instrument.resolution_power?.toLocaleString()}</span>
                  <span className="stat-label">разрешение</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Описание */}
        <div className="vibes-description">
          <p>{instrument.description}</p>

          <div className="vibes-meta">
            <div className="meta-item">
              <span className="meta-icon">&#128205;</span>
              <span>{instrument.location}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">&#128197;</span>
              <span>Запуск: {instrument.launch_date}</span>
            </div>
          </div>
        </div>

        {/* Характеристики */}
        <div className="vibes-specs">
          <h3>Характеристики</h3>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Диапазон волн</span>
              <span className="spec-value">{instrument.wavelength_range_min} — {instrument.wavelength_range_max} нм</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Спектральное разрешение</span>
              <span className="spec-value">{instrument.spectral_resolution?.toLocaleString()}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Калибровка</span>
              <span className="spec-value">{instrument.calibration}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Стабильность</span>
              <span className="spec-value">{instrument.stability}</span>
            </div>
          </div>
        </div>

        <div className="vibes-actions">
          <Link to="/instruments">
            <Button className="btn-vibes-back">&#8592; Назад к каталогу</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstrumentDetailPage;
