import Razorpay from "razorpay";
import crypto from "crypto";
import env from "dotenv";
env.config();


// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const createOrder = async (req, res) => {
    try {
        const {amount, currency } = req.body;

        const options = {
            amount: amount * 100, // Amount in paise
            currency: currency || "INR",
            receipt: `receipt_order_${Date.now()}`,
        }

        const order = await razorpay.orders.create(options);
        
        res.status(200).json(order);
    }catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const verifyPayment = (req, res) => {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        res.status(200).json({status: true, message: "Payment verified successfully"});
    } else {
        res.status(400).json({status: false, message: "Invalid signature sent!"});
    }
};

export { createOrder, verifyPayment };
