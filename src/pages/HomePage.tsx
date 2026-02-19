import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <Container className="mt-4">
            <div className="hero-section">
                <h1 className="hero-title">
                    Система расчёта массы экзопланет
                </h1>
                <p className="hero-subtitle">
                    Профессиональный инструмент для астрофизиков и исследователей космоса.
                </p>
                <hr className="hero-divider" />
                <p className="hero-description">
                    Мы предоставляем доступ к передовым астрономическим инструментам и алгоритмам
                    расчёта радиальной скорости для точного определения массы экзопланет.
                </p>
                <div className="d-flex justify-content-center gap-3 mt-4">
                    <Link to="/instruments">
                        <Button className="btn-cosmic btn-hero" size="lg">
                            Перейти к каталогу
                        </Button>
                    </Link>
                </div>
            </div>

            <Row className="mb-5 mt-5">
                <Col md={4} className="mb-3">
                    <Card className="feature-card h-100">
                        <Card.Body>
                            <div className="feature-icon">&#127756;</div>
                            <Card.Title className="feature-title">Точность</Card.Title>
                            <Card.Text className="feature-text">
                                Использование данных с инструментов HARPS, ESPRESSO и James Webb позволяет
                                достичь точности измерения скорости до 0.1 м/с.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="feature-card h-100">
                        <Card.Body>
                            <div className="feature-icon">&#128202;</div>
                            <Card.Title className="feature-title">Аналитика</Card.Title>
                            <Card.Text className="feature-text">
                                Автоматический расчёт массы по методу радиальных скоростей с учётом
                                угла наклона орбиты и периода обращения.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="feature-card h-100">
                        <Card.Body>
                            <div className="feature-icon">&#128640;</div>
                            <Card.Title className="feature-title">Доступность</Card.Title>
                            <Card.Text className="feature-text">
                                Единая платформа для работы с наземными и космическими телескопами
                                через удобный веб-интерфейс.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default HomePage;
