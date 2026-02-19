import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const LABELS: Record<string, string> = {
  instruments: 'Инструменты',
  instrument: 'Детали инструмента',
  calculation: 'Заявка',
  orders: 'Мои заявки',
  login: 'Вход',
  register: 'Регистрация',
};

const Breadcrumbs = () => {
  const location = useLocation();

  if (location.pathname === '/') return null;

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Главная', path: '/' }];

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    if (!isNaN(Number(part))) continue;

    const path = '/' + pathParts.slice(0, i + 1).join('/');
    const label = LABELS[part] || part;
    breadcrumbs.push({ label, path });
  }

  const cleanLabel = (s: string) => String(s).replace(/^\/+/, '').trim() || s;

  return (
    <nav className="breadcrumbs-container" aria-label="breadcrumb">
      <ol className="breadcrumbs-list">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const label = cleanLabel(crumb.label);
          return (
            <li key={crumb.path} className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
              {isLast ? (
                <span>{label}</span>
              ) : (
                <>
                  <Link to={crumb.path}>{label}</Link>
                  <span className="breadcrumb-separator" aria-hidden="true">&rsaquo;</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
