# Xiaofeng Global Payment System

A complete, enterprise-grade payment system for handling three product tiers with automatic digital product delivery.

## Features

✓ Three product tiers (Starter, Professional, Enterprise)
✓ Stripe payment integration
✓ Automated email notifications (SMTP)
✓ Telegram notifications for admin
✓ Secure download links with expiration
✓ Database tracking for orders and downloads
✓ Professional PDF product files
✓ Admin dashboard and statistics

## Products

### Starter Plan - $149
- Self-Guided Growth Kit
- Core strategy playbook
- Setup guide
- Email support

### Professional Plan - $329
- Everything in Starter
- 1-on-1 consultation
- Advanced documentation
- 30-day priority support

### Enterprise Plan - $1,299+
- Everything in Professional
- Global infrastructure deployment
- Dedicated account manager
- 24/7 support

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required configurations:**

- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `SMTP_PASSWORD` - Email password (already configured)
- `TELEGRAM_BOT_TOKEN` - Telegram bot token (already configured)
- `TELEGRAM_CHAT_ID` - Admin Telegram chat ID
- `JWT_SECRET` - Secret key for JWT tokens
- `BASE_URL` - Base URL for download links

## Installation

```bash
npm install
```

## Generate Product Files

```bash
node scripts/generate-products.js
```

This will create:
- `guide.pdf` (Starter kit)
- `course.pdf` (Professional course)
- `deployment-guide.pdf` (Enterprise guide)
- Professional and enterprise resource zips

## Running the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## API Endpoints

### Payment
- `GET /api/payment/products` - Get all products
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/webhook` - Stripe webhook

### Downloads
- `GET /api/download/info/:token` - Get download info
- `GET /api/download/file/:token` - Download file
- `POST /api/download/resend/:token` - Resend download link

### Admin
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:orderId` - Get order details
- `GET /api/admin/stats` - Get statistics

## Stripe Webhook Setup

1. Go to Stripe Dashboard
2. Developers → Webhooks
3. Add endpoint: `https://your-domain.com/api/payment/webhook`
4. Select events:
   - `payment_intent.succeeded`
5. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## Database

SQLite database is automatically created at `./database/pay.db`

Tables:
- `products` - Product information
- `orders` - Customer orders
- `downloads` - Download links and tracking
- `access_logs` - Download access logs

## File Storage

Product files are stored in `/home/ubuntu/pay/products/`

- `guide.pdf` - Starter kit
- `course.pdf` - Professional course
- `deployment-guide.pdf` - Enterprise guide
- `professional-resources.zip` - Professional resources
- `enterprise-resources.zip` - Enterprise resources

## Email Configuration

**SMTP Settings:**
- Host: `mail.privateemail.com`
- Port: `465` (SSL/TLS)
- User: `support@xiaofenghome.com`
- Password: Configured in .env

Emails sent:
1. Order confirmation to customer with download link
2. Admin notification with order details

## Telegram Notifications

Admin receives Telegram notifications for each new order with:
- Customer name
- Product purchased
- Amount paid
- Order ID

## Security Features

✓ Secure download tokens with expiration
✓ HTTPS enforcement
✓ Input validation
✓ Helmet.js for security headers
✓ CORS protection
✓ Stripe webhook signature verification
✓ JWT for token-based access
✓ Environment variable protection

## Deployment

### Prerequisites
- Node.js 14+
- npm or yarn
- Stripe account
- SMTP credentials
- Telegram bot token

### Steps

1. Clone repository
2. Install dependencies: `npm install`
3. Configure `.env` file
4. Generate product files: `node scripts/generate-products.js`
5. Start server: `npm start`
6. Configure Stripe webhook
7. Set up domain SSL certificate

## Support

Email: support@xiaofenghome.com

## License

MIT
