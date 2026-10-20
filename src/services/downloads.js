const { v4: uuidv4 } = require('uuid');
const jwt = require('jwt-simple');
const path = require('path');
const fs = require('fs');

class DownloadService {
  constructor(db) {
    this.db = db;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  async createDownloadLink(orderId) {
    const token = uuidv4();
    const downloadId = uuidv4();
    const expiresAt = new Date(Date.now() + (process.env.DOWNLOAD_LINK_EXPIRATION || 14) * 24 * 60 * 60 * 1000);

    await this.db.run(
      'INSERT INTO downloads (id, order_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [downloadId, orderId, token, expiresAt.toISOString()]
    );

    return {
      id: downloadId,
      token,
      url: `${process.env.BASE_URL}/download/${token}`,
      expiresAt
    };
  }

  async validateToken(token) {
    const download = await this.db.get(
      'SELECT * FROM downloads WHERE token = ? AND expires_at > datetime("now")',
      [token]
    );

    if (!download) {
      throw new Error('Invalid or expired download link');
    }

    return download;
  }

  async getOrderByDownloadToken(token) {
    const download = await this.validateToken(token);
    const order = await this.db.get(
      'SELECT o.*, p.name as product_name, p.tier as product_tier FROM orders o JOIN products p ON o.product_id = p.id WHERE o.id = ?',
      [download.order_id]
    );

    return order;
  }

  async recordDownload(downloadId, ip, userAgent) {
    const logId = uuidv4();
    await this.db.run(
      'INSERT INTO access_logs (id, download_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [logId, downloadId, ip, userAgent]
    );

    await this.db.run(
      'UPDATE downloads SET download_count = download_count + 1 WHERE id = ?',
      [downloadId]
    );
  }

  getProductFilePath(tier) {
    const productsPath = process.env.PRODUCTS_PATH || '/home/ubuntu/pay/products';
    
    const fileMap = {
      'starter': 'guide.pdf',
      'professional': 'course.pdf',
      'enterprise': 'deployment-guide.pdf'
    };

    const fileName = fileMap[tier] || 'guide.pdf';
    return path.join(productsPath, fileName);
  }

  async getDownloadStats(downloadId) {
    const stats = await this.db.get(
      'SELECT download_count, expires_at FROM downloads WHERE id = ?',
      [downloadId]
    );

    return stats;
  }
}

module.exports = DownloadService;
