import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import menuRoutes from './routes/menu.routes.js';
import tableRoutes from './routes/table.routes.js';
import roomRoutes from './routes/room.routes.js';
import orderRoutes from './routes/order.routes.js';
import customerRoutes from './routes/customer.routes.js';
import staffRoutes from './routes/staff.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import kitchenRoutes from './routes/kitchen.routes.js';
import waiterNotificationRoutes from './routes/waiter-notifications.routes.js';
import waiterRoutes from './routes/waiter.routes.js';
import customerRequestRoutes from './routes/customer-request.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io globally accessible
global.io = io;

// Run Prisma migrations on startup
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Initialize database connection
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join room based on role
  socket.on('join-room', (room: string) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Join kitchen room with optional station
  socket.on('join-kitchen', ({ station }: { station?: string }) => {
    socket.join('kitchen');
    if (station) {
      socket.join(`kitchen-${station}`);
    }
    console.log(`Socket ${socket.id} joined kitchen room${station ? ` (station: ${station})` : ''}`);
  });

  // Leave kitchen room
  socket.on('leave-kitchen', () => {
    socket.leave('kitchen');
    console.log(`Socket ${socket.id} left kitchen room`);
  });

  // Leave room
  socket.on('leave-room', (room: string) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Digital Menu API Server' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/waiter/notifications', waiterNotificationRoutes);
app.use('/api/waiter', waiterRoutes);
app.use('/api/customer-requests', customerRequestRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});
