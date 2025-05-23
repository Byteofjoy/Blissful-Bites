require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blissfulbites', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Order Schema
const orderSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    item: String,
    quantity: Number,
    location: String,
    orderDate: String,
    orderTime: String,
    paymentMethod: String,
    total: Number,
    initialPayment: Number,
    balancePayment: Number,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    pickupTime: {
        type: Date,
        default: null
    },
    delayFee: {
        type: Number,
        default: 0
    }
});

const Order = mongoose.model('Order', orderSchema);

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();

        // Send email notification to admin
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Order Placed',
            text: `New order received:\n\n${JSON.stringify(req.body, null, 2)}`
        };

        await transporter.sendMail(mailOptions);
        
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Dashboard
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/../public/admin.html');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
