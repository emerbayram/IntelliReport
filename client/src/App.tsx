import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReportList from './pages/ReportList';
import ReportDefinitionPage from './pages/ReportDefinitionPage';
import ReportViewer from './pages/ReportViewer';
import DataSourcePage from './pages/DataSourcePage';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ReportList />} />
          <Route path="define" element={<ReportDefinitionPage />} />
          <Route path="report/:id" element={<ReportViewer />} />
          <Route path="datasources" element={<DataSourcePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
