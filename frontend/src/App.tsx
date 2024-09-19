import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import UserManagement from './components/UserManagement';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-gray-800">Friends List System</span>
                </Link>
              </div>
              <div className="flex items-center">
                <Link to="/admin" className="text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md">
                  Admin Panel
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/user/:id" element={<UserManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
