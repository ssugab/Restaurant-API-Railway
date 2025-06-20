const Payment = require('../models/payment');
const Order = require('../models/order');

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { id_order, total, metode, customer } = req.body;

    // Validation: check required fields
    if (!id_order || !total || !metode || !customer ) {
      return res.status(400).json({ error: 'All fields are required: id_order, total, metode, customer' });
    }

    const payment = await Payment.create({
      id_order,
      total,
      metode,
      customer
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    
    const oldStatus = payment.status;
    const newStatus = req.body.status;
    
    // Update payment status
    payment.status = newStatus;
    await payment.save();
    
    // If payment status changed to 'paid', update the order status to 'diproses'
    if (oldStatus !== 'paid' && newStatus === 'paid') {
      const order = await Order.findByPk(payment.id_order);
      if (order && order.status === 'pending') {
        order.status = 'diproses';
        order.updated_at = new Date();
        await order.save();
        console.log(`Order #${order.id_order} status updated to 'diproses' after payment`);
      }
    }
    
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 