import { Outlet, Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center text-xl font-bold text-indigo-600">
                <FileText className="w-6 h-6 mr-2"/> IntelliReport
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium transition-colors">Dashboard</Link>
                <Link to="/define" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium transition-colors">New Report</Link>
                <Link to="/datasources" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium transition-colors">Data Sources</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-full mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
