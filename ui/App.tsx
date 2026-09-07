import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { educationModules } from './education/modules/registry';
import { EducationHome } from './education/EducationHome';
import { PaperTradingDashboard } from './trading/PaperTradingDashboard';
import './education/module.css';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/education" replace />} />
        <Route path="/education" element={<EducationHome />} />
        {educationModules.map((m) => (
          <Route key={m.id} path={m.path} element={<m.component />} />
        ))}
        <Route path="/trading" element={<PaperTradingDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
