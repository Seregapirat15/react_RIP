import { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCartIcon, isAuthenticated } from '../services/api';
import { CartIcon } from '../types';

const NavigationBar = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartIcon | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    if (!isAuthenticated()) return;

    try {
      const cartData = await fetchCartIcon();
      setCart(cartData);
    } catch (err) {
      console.error('Ошибка загрузки корзины:', err);
    }
  };

  const goToCalculation = () => {
    if (cart && cart.order_id > 0) {
      navigate(`/calculation/${cart.order_id}`);
    } else {
      navigate('/calculation');
    }
  };

  return (
    <Navbar
      expand="lg"
      className="navbar-cosmic"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 26, 0.95) 0%, rgba(26, 26, 58, 0.95) 100%)',
        borderBottom: '1px solid rgba(79, 172, 254, 0.2)',
        padding: '15px 0',
      }}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            color: '#4facfe',
            fontWeight: 700,
            fontSize: '1.4em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          🔭 ExoMass Calculator
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          style={{ borderColor: 'rgba(79, 172, 254, 0.5)' }}
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/instruments"
              style={{ color: '#e0e0e0', fontWeight: 500 }}
            >
              🌌 Инструменты
            </Nav.Link>
          </Nav>

          <Nav>
            <Button
              variant="outline-info"
              onClick={goToCalculation}
              disabled={!cart || cart.services_count === 0}
              style={{
                borderColor: '#4facfe',
                color: '#4facfe',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
              }}
            >
              📊 Расчёт
              <span
                style={{
                  background: 'rgba(79, 172, 254, 0.2)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85em',
                }}
              >
                {cart?.services_count || 0}
              </span>
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
