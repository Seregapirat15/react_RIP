import { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Offcanvas } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setAuthLoading, loginSuccess, logoutSuccess, resetAuthState } from '../store/authSlice';
import { resetFilters } from '../store/filterSlice';
import { resetInstrumentsState } from '../store/instrumentsSlice';
import { resetCartState } from '../store/cartSlice';
import { resetOrdersState } from '../store/ordersSlice';
import { clearOrderDetail } from '../store/orderDetailSlice';
import { fetchCurrentUser, logoutUser } from '../services/userService';
import './NavigationBar.css';

const NavigationBar = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const cart = useAppSelector((s) => s.cart.cart);

  useEffect(() => {
    if (isAuthenticated && !user) {
      (async () => {
        try {
          const u = await fetchCurrentUser();
          dispatch(loginSuccess(u));
        } catch {
          localStorage.removeItem('auth_token');
          dispatch(logoutSuccess());
        }
      })();
    }
  }, [isAuthenticated, user, dispatch]);

  const handleLogout = async () => {
    handleClose();
    try { await logoutUser(); } catch { /* ignore */ }
    localStorage.removeItem('auth_token');
    dispatch(logoutSuccess());
    dispatch(resetFilters());
    dispatch(resetInstrumentsState());
    dispatch(resetCartState());
    dispatch(resetOrdersState());
    dispatch(clearOrderDetail());
    navigate('/', { replace: true });
  };

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);
  const isActive = (path: string) => location.pathname === path;

  const displayName = user ? (user.first_name || user.login) : '';

  return (
    <Navbar className="navbar-cosmic" sticky="top">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/" className="navbar-brand-cosmic">
          <span className="brand-icon">&#128301;</span>
          ExoMass Calculator
        </Navbar.Brand>

        <button className="navbar-toggler-cosmic" onClick={handleShow} aria-label="Toggle navigation">
          <span className="toggler-bar"></span>
          <span className="toggler-bar"></span>
          <span className="toggler-bar"></span>
        </button>

        <Offcanvas show={showOffcanvas} onHide={handleClose} placement="end" className="offcanvas-cosmic">
          <Offcanvas.Header className="offcanvas-header-cosmic">
            <Offcanvas.Title className="offcanvas-title-cosmic">
              <span className="brand-icon">&#128301;</span>
              Навигация
            </Offcanvas.Title>
            <button className="offcanvas-close-cosmic" onClick={handleClose}>&times;</button>
          </Offcanvas.Header>

          <Offcanvas.Body className="offcanvas-body-cosmic">
            <Nav className="nav-cosmic">
              <Nav.Link as={Link} to="/" className={`nav-link-cosmic ${isActive('/') ? 'active' : ''}`} onClick={handleClose}>
                <span className="nav-icon">&#127968;</span> Главная
              </Nav.Link>

              <Nav.Link as={Link} to="/instruments" className={`nav-link-cosmic ${isActive('/instruments') ? 'active' : ''}`} onClick={handleClose}>
                <span className="nav-icon">&#128301;</span> Инструменты
              </Nav.Link>

              {isAuthenticated && (
                <Nav.Link
                  as={Link}
                  to={cart && cart.order_id > 0 ? `/calculation/${cart.order_id}` : '/calculation'}
                  className={`nav-link-cosmic ${location.pathname.startsWith('/calculation') ? 'active' : ''} ${!cart || cart.services_count === 0 ? 'nav-link-disabled' : ''}`}
                  onClick={handleClose}
                >
                  <span className="nav-icon">&#128202;</span>
                  Заявка {cart && cart.services_count > 0 ? `(${cart.services_count})` : ''}
                </Nav.Link>
              )}

              {isAuthenticated && (
                <Nav.Link as={Link} to="/orders" className={`nav-link-cosmic ${isActive('/orders') ? 'active' : ''}`} onClick={handleClose}>
                  <span className="nav-icon">&#128203;</span> Мои заявки
                </Nav.Link>
              )}

              {isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/profile" className={`nav-link-cosmic ${isActive('/profile') ? 'active' : ''}`} onClick={handleClose}>
                    <span className="nav-icon">&#128100;</span> {displayName}
                  </Nav.Link>
                  <Nav.Link as="button" className="nav-link-cosmic nav-link-logout" onClick={handleLogout}>
                    <span className="nav-icon">&#128682;</span> Выход
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className={`nav-link-cosmic ${isActive('/login') ? 'active' : ''}`} onClick={handleClose}>
                    <span className="nav-icon">&#128274;</span> Вход
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register" className={`nav-link-cosmic ${isActive('/register') ? 'active' : ''}`} onClick={handleClose}>
                    <span className="nav-icon">&#128100;</span> Регистрация
                  </Nav.Link>
                </>
              )}
            </Nav>
            <div className="offcanvas-footer-cosmic"><p className="footer-text">ExoMass Calculator v1.0</p></div>
          </Offcanvas.Body>
        </Offcanvas>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
