import express from 'express';
import { createOrder,verifyPayment } from '../controllers/payment.mjs';

const router = express.Router();
// Placeholder for payment-related routes
router.post("/create-order",createOrder);
router.post("/verify-payment",verifyPayment);

export default router;