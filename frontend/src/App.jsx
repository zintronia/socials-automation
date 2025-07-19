import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DocumentsPage from './pages/DocumentsPage';
import TwitterPage from './pages/TwitterPage';
import LinkedInPage from './pages/LinkedInPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              borderRadius: '0.5rem',
              background: '#1F2937',
              color: '#fff',
            },
          }}
        />
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/twitter" element={<TwitterPage />} />
            <Route path="/linkedin" element={<LinkedInPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;