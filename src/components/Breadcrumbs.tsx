import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const Breadcrumbs = () => {
  const location = useLocation();

  // Генерация хлебных крошек на основе текущего пути
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Главная', path: '/' }];

    pathParts.forEach((part, index) => {
      const path = '/' + pathParts.slice(0, index + 1).join('/');

      // Определяем название для каждого сегмента
      let label = part;

      if (part === 'instruments') {
        label = 'Инструменты';
      } else if (part === 'instrument') {
        label = 'Детали инструмента';
      } else if (part === 'calculation') {
        label = 'Расчёт массы';
      } else if (!isNaN(Number(part))) {
        // Пропускаем числовые ID в отображении, но сохраняем путь
        return;
      }

      breadcrumbs.push({ label, path });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Не показываем breadcrumbs на главной странице
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className="breadcrumbs-container" aria-label="breadcrumb">
      <ol className="breadcrumbs-list">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li
              key={crumb.path}
              className={`breadcrumb-item ${isLast ? 'active' : ''}`}
            >
              {isLast ? (
                <span>{crumb.label}</span>
              ) : (
                <>
                  <Link to={crumb.path}>{crumb.label}</Link>
                  <span className="breadcrumb-separator">›</span>
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
