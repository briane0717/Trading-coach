import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { educationModules } from './education/modules/registry';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/education" element={<div>Education home</div>} />
          {educationModules.map((m) => (
            <Route key={m.id} path={m.path} element={<div>{m.title} page</div>} />
          ))}
          <Route path="/trading" element={<div>Trading page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('Layout nav', () => {
  it('renders a link for every education module plus /education and /trading', () => {
    renderAt('/education');

    for (const m of educationModules) {
      expect(screen.getByRole('link', { name: m.title })).toHaveAttribute('href', m.path);
    }
    expect(screen.getByRole('link', { name: 'Education' })).toHaveAttribute('href', '/education');
    expect(screen.getByRole('link', { name: 'Paper Trading' })).toHaveAttribute('href', '/trading');
  });

  it('marks only the active module link with aria-current', () => {
    renderAt('/education/module-3');

    expect(screen.getByRole('link', { name: 'Charts & Candlesticks' })).toHaveAttribute(
      'aria-current',
      'page'
    );

    const otherLinkNames = [
      'Education',
      'Paper Trading',
      ...educationModules.filter((m) => m.path !== '/education/module-3').map((m) => m.title),
    ];
    for (const name of otherLinkNames) {
      expect(screen.getByRole('link', { name })).not.toHaveAttribute('aria-current');
    }
  });

  it('marks /education (not a module) as active at the education home route', () => {
    renderAt('/education');

    expect(screen.getByRole('link', { name: 'Education' })).toHaveAttribute('aria-current', 'page');
    for (const m of educationModules) {
      expect(screen.getByRole('link', { name: m.title })).not.toHaveAttribute('aria-current');
    }
  });

  it('marks /trading as active on the trading page', () => {
    renderAt('/trading');

    expect(screen.getByRole('link', { name: 'Paper Trading' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
