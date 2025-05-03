import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext'; // Assuming you have an AuthContext

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // const { login } = useAuth(); // Replace with your actual login function
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'; // Use env variable or fallback

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful according to backend
        console.log('Admin Logged In via API');
        // Still using localStorage flag for client-side route protection for now
        localStorage.setItem('isAdminAuthenticated', 'true'); 
        navigate('/admin');
      } else {
        // Login failed according to backend
        throw new Error(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
      console.error('Login failed:', err);
      localStorage.removeItem('isAdminAuthenticated'); // Ensure flag is clear on error
    }
  };

  return (
    <div className="container mx-auto px-4 py-36">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>
      <form onSubmit={handleLogin} className="max-w-sm mx-auto bg-white p-6 rounded shadow-md">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminLoginPage;
