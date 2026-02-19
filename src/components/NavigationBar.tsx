import { useState } from 'react';
import { Navbar, Nav, Container, Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './NavigationBar.css';

const NavigationBar = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const location = useLocation();

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Navbar className="navbar-cosmic" sticky="top">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/" className="navbar-brand-cosmic">
          <span className="brand-icon">&#128301;</span>
          ExoMass Calculator
        </Navbar.Brand>

        <button
          className="navbar-toggler-cosmic"
          onClick={handleShow}
          aria-label="Toggle navigation"
        >
          <span className="toggler-bar"></span>
          <span className="toggler-bar"></span>
          <span className="toggler-bar"></span>
        </button>

        <Offcanvas
          show={showOffcanvas}
          onHide={handleClose}
          placement="end"
          className="offcanvas-cosmic"
        >
          <Offcanvas.Header className="offcanvas-header-cosmic">
            <Offcanvas.Title className="offcanvas-title-cosmic">
              <span className="brand-icon">&#128301;</span>
              Навигация
            </Offcanvas.Title>
            <button className="offcanvas-close-cosmic" onClick={handleClose}>
              &times;
            </button>
          </Offcanvas.Header>

          <Offcanvas.Body className="offcanvas-body-cosmic">
            <Nav className="nav-cosmic">
              <Nav.Link
                as={Link}
                to="/"
                className={`nav-link-cosmic ${isActive('/') ? 'active' : ''}`}
                onClick={handleClose}
              >
                <span className="nav-icon">&#127968;</span>
                Главная
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/instruments"
                className={`nav-link-cosmic ${isActive('/instruments') ? 'active' : ''}`}
                onClick={handleClose}
              >
                <span className="nav-icon">&#128301;</span>
                Инструменты
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/calculation"
                className={`nav-link-cosmic ${isActive('/calculation') || location.pathname.startsWith('/calculation/') ? 'active' : ''}`}
                onClick={handleClose}
              >
                <span className="nav-icon">&#128202;</span>
                Расчёт
              </Nav.Link>
            </Nav>

            <div className="offcanvas-footer-cosmic">
              <p className="footer-text">ExoMass Calculator v1.0</p>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
