import React, { useState } from 'react';
import { useSocket } from '../socket/socket';

const ProductList = () => {
  const { products, sendProductInquiry, productInquiries, users } = useSocket();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState('');

  const handleSendInquiry = (e) => {
    e.preventDefault();
    if (selectedProduct && message.trim()) {
      sendProductInquiry(selectedProduct.id, message);
      setMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Available Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const seller = Object.values(users).find(user => user.id === product.sellerId);
          return (
            <div key={product.id} className="border rounded-lg p-4 shadow-md">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-lg font-bold mt-2">${product.price}</p>
              <p className="text-sm text-gray-500">
                Seller: {seller?.username || 'No seller available'}
              </p>
              {seller && (
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Contact Seller
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Contact Seller about {selectedProduct.name}
            </h3>
            <form onSubmit={handleSendInquiry}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded p-2 mb-4"
                placeholder="Type your message here..."
                rows="4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Your Inquiries</h3>
        <div className="space-y-4">
          {productInquiries.map((inquiry) => (
            <div key={inquiry.id} className="border rounded p-4">
              <p className="font-semibold">
                {inquiry.sellerName ? `Response from ${inquiry.sellerName}` : `Your message`}
              </p>
              <p className="text-gray-600">{inquiry.message}</p>
              <p className="text-sm text-gray-500">
                {new Date(inquiry.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;