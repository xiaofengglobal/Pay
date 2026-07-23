const express = require('express');

module.exports = (db, emailService) => {
  const router = express.Router();

  // Get all orders
  router.get('/orders', async (req, res) => {
    try {
      const orders = await db.all(
        'SELECT o.*, p.name as product_name FROM orders o JOIN products p ON o.product_id = p.id ORDER BY o.created_at DESC'
      );
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get order details
  router.get('/orders/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await db.get(
        'SELECT o.*, p.name as product_name FROM orders o JOIN products p ON o.product_id = p.id WHERE o.id = ?',
        [orderId]
      );

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const downloads = await db.all(
        'SELECT * FROM downloads WHERE order_id = ?',
        [orderId]
      );

      res.json({ order, downloads });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get statistics
  router.get('/stats', async (req, res) => {
    try {
      const totalOrders = await db.get('SELECT COUNT(*) as count FROM orders');
      const totalRevenue = await db.get('SELECT SUM(amount) as total FROM orders');
      const ordersByProduct = await db.all(
        'SELECT p.name, COUNT(o.id) as count, SUM(o.amount) as total FROM orders o JOIN products p ON o.product_id = p.id GROUP BY p.id'
      );

      res.json({
        totalOrders: totalOrders.count,
        totalRevenue: totalRevenue.total || 0,
        ordersByProduct
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
