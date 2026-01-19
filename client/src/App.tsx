import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ReportList from './pages/ReportList';
import ReportDefinitionPage from './pages/ReportDefinitionPage';
import ReportViewer from './pages/ReportViewer';
import DataSourcePage from './pages/DataSourcePage';
import LoginPage from './pages/LoginPage';
import UserManagementPage from './pages/UserManagementPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                  <Route index element={<ReportList />} />
                  <Route path="report/:id" element={<ReportViewer />} />
                  
                  {/* Admin Only Routes */}
                  <Route element={<ProtectedRoute adminOnly={true} />}>
                      <Route path="define" element={<ReportDefinitionPage />} />
                      <Route path="datasources" element={<DataSourcePage />} />
                      <Route path="users" element={<UserManagementPage />} />
                  </Route>
              </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
