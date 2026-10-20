const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = (downloadService, db) => {
  const router = express.Router();

  // Get download info
  router.get('/info/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const order = await downloadService.getOrderByDownloadToken(token);
      const download = await downloadService.validateToken(token);

      res.json({
        order,
        download,
        expiresAt: download.expires_at,
        downloadCount: download.download_count
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Download file
  router.get('/file/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const order = await downloadService.getOrderByDownloadToken(token);
      const download = await downloadService.validateToken(token);

      // Record download
      await downloadService.recordDownload(
        download.id,
        req.ip,
        req.headers['user-agent']
      );

      // Get file path
      const filePath = downloadService.getProductFilePath(order.product_tier);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.download(filePath, path.basename(filePath));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Resend download link
  router.post('/resend/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const order = await downloadService.getOrderByDownloadToken(token);
      const download = await downloadService.validateToken(token);

      const EmailService = require('../services/email');
      const emailService = new EmailService();
      const downloadLink = `${process.env.BASE_URL}/download/${token}`;

      await emailService.sendOrderConfirmation(order, downloadLink);

      res.json({ message: 'Download link sent to email' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};
