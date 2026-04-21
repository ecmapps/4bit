import express from 'express';
import { createOrder, getAllOrders, getOrdersByUser, getOrderById } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/user/:userId', getOrdersByUser);
router.get('/:id', getOrderById);

export default router;