import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { educationModules } from './education/modules/registry';
import { EducationHome } from './education/EducationHome';
import { TradingPlanWorksheetVerification } from './dev/TradingPlanWorksheetVerification';
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
        {/* Throwaway verification route — see ui/dev/TradingPlanWorksheetVerification.tsx. */}
        <Route
          path="/dev/trading-plan-worksheet-verification"
          element={<TradingPlanWorksheetVerification />}
        />
      </Routes>
    </BrowserRouter>
  );
}
