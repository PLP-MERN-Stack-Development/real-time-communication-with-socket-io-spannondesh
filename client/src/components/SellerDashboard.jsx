import React, { useState } from 'react';
import { useSocket } from '../socket/socket';

const SellerDashboard = () => {
  const { products, productInquiries, sendSellerResponse, users } = useSocket();
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [response, setResponse] = useState('');

  const handleSendResponse = (e) => {
    e.preventDefault();
    if (selectedInquiry && response.trim()) {
      sendSellerResponse(
        selectedInquiry.customerId,
        selectedInquiry.productId,
        response
      );
      setResponse('');
      setSelectedInquiry(null);
    }
  };

  // Filter products for the current seller
  const myProducts = products.filter(
    (product) => product.sellerId === users[socket.id]?.id
  );

  // Filter inquiries for the seller's products
  const myInquiries = productInquiries.filter((inquiry) =>
    myProducts.some((product) => product.id === inquiry.productId)
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Seller Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Products</h3>
          <div className="space-y-4">
            {myProducts.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 shadow-md">
                <h4 className="text-lg font-semibold">{product.name}</h4>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-lg font-bold mt-2">${product.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Customer Inquiries</h3>
          <div className="space-y-4">
            {myInquiries.map((inquiry) => {
              const product = products.find((p) => p.id === inquiry.productId);
              return (
                <div key={inquiry.id} className="border rounded-lg p-4 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        Product: {product?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        From: {inquiry.customerName}
                      </p>
                      <p className="mt-2">{inquiry.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(inquiry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!inquiry.sellerName && (
                      <button
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Reply to {selectedInquiry.customerName}
            </h3>
            <form onSubmit={handleSendResponse}>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full border rounded p-2 mb-4"
                placeholder="Type your response here..."
                rows="4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Send Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;