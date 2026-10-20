const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { formatMoney } = require('../utils/money');

module.exports = (stripe, db, emailService, telegramBot) => {
  const router = express.Router();

  // Get products
  router.get('/products', async (req, res) => {
    try {
      const products = await db.all('SELECT id, name, tier, price, currency, description FROM products ORDER BY price');
      res.json(products.map(p => ({ ...p, display_price: formatMoney(p.price, p.currency) })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a Stripe Checkout Session. The amount and currency come from the
  // products table (seeded from src/catalog.js), so what the page shows is what gets charged.
  router.post('/create-checkout-session',
    body('productId').notEmpty(),
    body('customerName').notEmpty(),
    body('customerEmail').isEmail(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { productId, customerName, customerEmail } = req.body;
        const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        const metadata = { productId, customerName, customerEmail };
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [{
            price_data: {
              currency: product.currency,
              product: product.stripe_product_id,
              unit_amount: product.price
            },
            quantity: 1
          }],
          payment_method_types: ['card', 'wechat_pay', 'alipay'],
          payment_method_options: { wechat_pay: { client: 'web' } },
          customer_email: customerEmail,
          metadata,
          payment_intent_data: { metadata },
          success_url: `${baseUrl}/success`,
          cancel_url: baseUrl
        });

        res.json({ url: session.url });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  async function fulfillOrder(session) {
    const { productId, customerName, customerEmail } = session.metadata;

    // Stripe retries events until we answer 2xx, so a retry may find the order
    // already recorded; only skip it once delivery has finished.
    const existing = await db.get('SELECT id, status FROM orders WHERE stripe_payment_intent_id = ?', [session.payment_intent]);
    if (existing && existing.status === 'completed') return;

    const orderId = existing ? existing.id : uuidv4();
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);

    if (!existing) {
      await db.run(
        'INSERT INTO orders (id, product_id, customer_name, customer_email, amount, currency, stripe_payment_intent_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, productId, customerName, customerEmail, session.amount_total, session.currency, session.payment_intent, 'pending']
      );
    }

    // Create download link
    const DownloadService = require('../services/downloads');
    const downloadService = new DownloadService(db);
    const downloadLink = await downloadService.createDownloadLink(orderId);

    // Send emails
    const fullOrder = {
      id: orderId,
      product_id: productId,
      product_name: product.name,
      customer_name: customerName,
      customer_email: customerEmail,
      amount: session.amount_total,
      currency: session.currency,
      status: 'completed',
      created_at: new Date().toISOString()
    };

    await emailService.sendOrderConfirmation(fullOrder, downloadLink.url);
    await emailService.sendAdminNotification(fullOrder);

    // Send Telegram notification
    const message = `New Order!\n\nCustomer: ${customerName}\nProduct: ${product.name}\nAmount: ${formatMoney(session.amount_total, session.currency)}\nOrder ID: ${orderId}`;

    if (process.env.TELEGRAM_CHAT_ID) {
      await telegramBot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
    }

    await db.run('UPDATE orders SET status = ? WHERE id = ?', ['completed', orderId]);
  }

  // Webhook for Stripe
  router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      const session = event.data.object;
      if (
        (event.type === 'checkout.session.completed' && session.payment_status === 'paid') ||
        event.type === 'checkout.session.async_payment_succeeded'
      ) {
        await fulfillOrder(session);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  return router;
};
