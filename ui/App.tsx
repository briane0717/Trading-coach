import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { educationModules } from './education/modules/registry';
import { EducationHome } from './education/EducationHome';
import { PaperTradingDashboard } from './trading/PaperTradingDashboard';
import './education/module.css';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/education" replace />} />
          <Route path="/education" element={<EducationHome />} />
          {educationModules.map((m) => (
            <Route key={m.id} path={m.path} element={<m.component />} />
          ))}
          <Route path="/trading" element={<PaperTradingDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
