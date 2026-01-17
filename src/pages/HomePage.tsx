import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <Container className="mt-5">
            <div className="p-5 mb-4 bg-light rounded-3 text-center hero-section">
                <Container fluid>
                    <h1 className="display-4 fw-bold">Система расчёта массы экзопланет</h1>
                    <p className="lead fs-4">
                        Профессиональный инструмент для астрофизиков и исследователей космоса.
                    </p>
                    <hr className="my-4" />
                    <p>
                        Мы предоставляем доступ к передовым астрономическим инструментам и алгоритмам
                        расчёта радиальной скорости для точного определения массы экзопланет.
                    </p>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Link to="/instruments">
                            <Button variant="primary" size="lg">Перейти к услугам</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <Row className="mb-5">
                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body>
                            <Card.Title className="fw-bold text-primary">🪐 Точность</Card.Title>
                            <Card.Text>
                                Использование данных с инструментов HARPS, ESPRESSO и James Webb позволяет
                                достичь точности измерения скорости до 0.1 м/с.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body>
                            <Card.Title className="fw-bold text-success">📊 Аналитика</Card.Title>
                            <Card.Text>
                                Автоматический расчёт массы по методу радиальных скоростей с учётом
                                угла наклона орбиты и периода обращения.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body>
                            <Card.Title className="fw-bold text-info">🚀 Доступность</Card.Title>
                            <Card.Text>
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
