import express from 'express';
import {
  createOrder,
  createOrderFromCart,
  getAllOrders,
  getOrdersByUser,
  getOrderById
} from '../controllers/orderController.js';

const router = express.Router();

// Crear pedido manual
router.post('/', createOrder);

// Crear pedido desde carrito
router.post('/:userId/create-from-cart', createOrderFromCart);

// Obtener todos los pedidos
router.get('/', getAllOrders);

// Obtener pedidos por usuario
router.get('/user/:userId', getOrdersByUser);

// Compatibilidad con tu frontend actual
router.get('/:userId', getOrdersByUser);

// Obtener un pedido específico
router.get('/detail/:id', getOrderById);

export default router;