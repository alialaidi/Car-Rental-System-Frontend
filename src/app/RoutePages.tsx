import { Link, useLocation } from 'react-router-dom';
import { PageHeader } from '../shared/ui';

export function RoutePlaceholderPage({ title }: { title: string }) {
  return <PageHeader title={title} description="This workspace is ready for its feature task." />;
}

export function ForbiddenPage() {
  return (
    <section>
      <PageHeader
        title="Access denied"
        description="Your account does not have permission to view this page."
      />
      <Link to="/">Return to your workspace</Link>
    </section>
  );
}

export function NotFoundPage() {
  const location = useLocation();
  return (
    <section>
      <PageHeader
        title="Page not found"
        description={'No page exists at ' + location.pathname + '.'}
      />
      <Link to="/">Return to your workspace</Link>
    </section>
  );
}
