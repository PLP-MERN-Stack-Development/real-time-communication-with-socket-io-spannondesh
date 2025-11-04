import React, { useState } from 'react';
import Login from './components/Login';
import ProductList from './components/ProductList';
import SellerDashboard from './components/SellerDashboard';
import { useSocket } from './socket/socket';

function App() {
  const [userRole, setUserRole] = useState(null);
  const { isConnected } = useSocket();

  const handleLogin = (role) => {
    setUserRole(role);
  };

  if (!isConnected) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {userRole === 'seller' ? 'Seller Dashboard' : 'Product Marketplace'}
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {userRole === 'seller' ? <SellerDashboard /> : <ProductList />}
        </div>
      </main>
    </div>
  );
}

export default App;