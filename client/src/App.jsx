import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import Layout from './components/layout/Layout';
import { WorkplaceProvider } from './context/WorkplaceContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="app-loading">Loading workplace...</div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <WorkplaceProvider>
      <Layout>{children}</Layout>
    </WorkplaceProvider>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/task/:id" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
