import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Breadcrumbs from './components/Breadcrumbs';
import HomePage from './pages/HomePage';
import InstrumentsPage from './pages/InstrumentsPage';
import InstrumentDetailPage from './pages/InstrumentDetailPage';
import CalculationPage from './pages/CalculationPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <NavigationBar />
        <Container fluid className="main-container">
          <Breadcrumbs />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/instruments" element={<InstrumentsPage />} />
            <Route path="/instrument/:id" element={<InstrumentDetailPage />} />
            <Route path="/calculation" element={<CalculationPage />} />
            <Route path="/calculation/:id" element={<CalculationPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
