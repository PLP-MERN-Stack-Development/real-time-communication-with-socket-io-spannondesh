// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users, messages, and products
const users = {};
const messages = [];
const typingUsers = {};
const products = [];

// Sample products (in a real app, this would come from a database)
products.push(
  { id: 1, name: 'Laptop', price: 999.99, description: 'High-performance laptop', sellerId: null },
  { id: 2, name: 'Smartphone', price: 599.99, description: 'Latest smartphone', sellerId: null },
  { id: 3, name: 'Headphones', price: 99.99, description: 'Wireless headphones', sellerId: null }
);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', ({ username, role }) => {
    users[socket.id] = { username, id: socket.id, role };
    
    // If user is a seller, assign some products to them
    if (role === 'seller') {
      products.forEach(product => {
        if (!product.sellerId) {
          product.sellerId = socket.id;
        }
      });
    }
    
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id, role });
    io.emit('products_update', products);
    console.log(`${username} (${role}) joined the chat`);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(message);
    
    // Limit stored messages to prevent memory issues
    if (messages.length > 100) {
      messages.shift();
    }
    
    io.emit('receive_message', message);
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle product inquiries
  socket.on('product_inquiry', ({ productId, message }) => {
    const product = products.find(p => p.id === productId);
    if (product && product.sellerId) {
      const inquiryData = {
        id: Date.now(),
        productId,
        customerId: socket.id,
        customerName: users[socket.id]?.username || 'Anonymous',
        message,
        timestamp: new Date().toISOString(),
      };
      
      // Send to seller and back to customer
      socket.to(product.sellerId).emit('product_inquiry', inquiryData);
      socket.emit('product_inquiry', inquiryData);
    }
  });

  // Handle seller responses
  socket.on('seller_response', ({ customerId, productId, message }) => {
    const responseData = {
      id: Date.now(),
      productId,
      sellerId: socket.id,
      sellerName: users[socket.id]?.username || 'Anonymous',
      message,
      timestamp: new Date().toISOString(),
    };
    
    // Send to customer and back to seller
    socket.to(customerId).emit('seller_response', responseData);
    socket.emit('seller_response', responseData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username, role } = users[socket.id];
      
      // If a seller disconnects, remove their association with products
      if (role === 'seller') {
        products.forEach(product => {
          if (product.sellerId === socket.id) {
            product.sellerId = null;
          }
        });
        io.emit('products_update', products);
      }
      
      io.emit('user_left', { username, id: socket.id, role });
      console.log(`${username} (${role}) left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 