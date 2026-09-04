import { Link } from 'react-router-dom';
import { educationModules } from './modules/registry';

export function EducationHome() {
  const sorted = [...educationModules].sort((a, b) => a.order - b.order);
  return (
    <article className="module">
      <p className="module-eyebrow">Education</p>
      <h1>Lessons</h1>
      <ul className="module-list">
        {sorted.map((m) => (
          <li key={m.id}>
            <Link to={m.path}>{m.title}</Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
