import { useContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelect from './pages/RoleSelect';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import Profile from './pages/Profile';
import Layout from './components/layout/Layout';
import { WorkplaceProvider } from './context/WorkplaceContext';

const Loading = () => <div className="app-loading">Loading workplace...</div>;
const queryClient = new QueryClient();

const AuthenticatedShell = ({ children, withLayout = true }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <WorkplaceProvider>
      {withLayout ? <Layout>{children}</Layout> : children}
    </WorkplaceProvider>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Loading />;
  if (user) return <Navigate to="/choose-role" replace />;
  return children;
};

const LandingRoute = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Loading />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Landing />;
};

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('workspace_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route path="/choose-role" element={<AuthenticatedShell withLayout={false}><RoleSelect /></AuthenticatedShell>} />
        <Route path="/dashboard" element={<AuthenticatedShell><Dashboard /></AuthenticatedShell>} />
        <Route path="/profile" element={<AuthenticatedShell><Profile /></AuthenticatedShell>} />
        <Route path="/task/:id" element={<AuthenticatedShell><Workspace /></AuthenticatedShell>} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
