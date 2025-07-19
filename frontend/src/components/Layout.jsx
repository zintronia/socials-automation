import { Link, Outlet } from 'react-router-dom';
import { FiHome, FiTwitter, FiLinkedin, FiUpload } from 'react-icons/fi';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold text-indigo-600">Social Media AI</h1>
        </div>
        <nav className="mt-8">
          <NavItem to="/" icon={<FiHome />} text="Dashboard" />
          <NavItem to="/twitter" icon={<FiTwitter />} text="Twitter" />
          <NavItem to="/linkedin" icon={<FiLinkedin />} text="LinkedIn" />
          <NavItem to="/documents" icon={<FiUpload />} text="Documents" />
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-6">
          <Outlet />
          {children}
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, text }) => (
  <Link
    to={to}
    className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
  >
    <span className="mr-3">{icon}</span>
    {text}
  </Link>
);

export default Layout;
