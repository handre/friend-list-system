import React, { useState, useEffect } from 'react';

interface Stats {
  totalUsers: number;
  averageFriends: number;
}

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8787/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Dashboard</h1>
        {stats ? (
          <div className="space-y-4">
            <div className="bg-blue-100 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Total Users</h2>
              <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-purple-100 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">Average Friends per User</h2>
              <p className="text-4xl font-bold text-purple-600">{stats.averageFriends.toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;