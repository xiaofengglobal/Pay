const nodemailer = require('nodemailer');
const { formatMoney } = require('../utils/money');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendOrderConfirmation(order, downloadLink) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: order.customer_email,
      subject: `Order Confirmation - Xiaofeng Global ${order.product_name}`,
      html: this.getOrderConfirmationTemplate(order, downloadLink)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Order confirmation sent to ${order.customer_email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendAdminNotification(order) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order - ${order.product_name} - ${formatMoney(order.amount, order.currency)}`,
      html: this.getAdminNotificationTemplate(order)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Admin notification sent');
    } catch (error) {
      console.error('Error sending admin email:', error);
      throw error;
    }
  }

  getOrderConfirmationTemplate(order, downloadLink) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Purchase!</h1>
          </div>
          <div class="content">
            <p>Dear ${order.customer_name},</p>
            <p>Thank you for purchasing <strong>${order.product_name}</strong> from Xiaofeng Global.</p>
            <p><strong>Order Details:</strong></p>
            <ul>
              <li>Order ID: ${order.id}</li>
              <li>Product: ${order.product_name}</li>
              <li>Amount: ${formatMoney(order.amount, order.currency)}</li>
              <li>Date: ${new Date(order.created_at).toLocaleString()}</li>
            </ul>
            <p>Your download link is below. It will expire in 14 days.</p>
            <p style="text-align: center;">
              <a href="${downloadLink}" class="button">Download Your Product</a>
            </p>
            <p>If you have any questions, please reply to this email or contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Xiaofeng Global. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAdminNotificationTemplate(order) {
    return `
      <h2>New Order Received</h2>
      <p><strong>Customer:</strong> ${order.customer_name}</p>
      <p><strong>Email:</strong> ${order.customer_email}</p>
      <p><strong>Product:</strong> ${order.product_name}</p>
      <p><strong>Amount:</strong> ${formatMoney(order.amount, order.currency)}</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Status:</strong> ${order.status}</p>
    `;
  }
}

module.exports = EmailService;
