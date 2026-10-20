const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const catalog = require('./catalog');

class Database {
  constructor() {
    const dbPath = process.env.DATABASE_PATH || './database/pay.db';
    const dir = path.dirname(dbPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    this.db = new sqlite3.Database(dbPath);
  }

  initialize() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Products table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            tier TEXT NOT NULL,
            price INTEGER NOT NULL,
            currency TEXT NOT NULL DEFAULT 'cny',
            stripe_product_id TEXT,
            description TEXT,
            file_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Orders table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            product_id TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            amount INTEGER NOT NULL,
            currency TEXT NOT NULL DEFAULT 'cny',
            stripe_payment_intent_id TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id)
          )
        `);

        // Downloads table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS downloads (
            id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            download_count INTEGER DEFAULT 0,
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id)
          )
        `);

        // Access logs table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS access_logs (
            id TEXT PRIMARY KEY,
            download_id TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (download_id) REFERENCES downloads(id)
          )
        `);

        // Databases created before prices were unified on CNY lack these columns;
        // "duplicate column" errors on newer databases are expected and ignored.
        this.db.run(`ALTER TABLE products ADD COLUMN currency TEXT NOT NULL DEFAULT 'cny'`, () => {});
        this.db.run(`ALTER TABLE products ADD COLUMN stripe_product_id TEXT`, () => {});
        this.db.run(`ALTER TABLE orders ADD COLUMN currency TEXT NOT NULL DEFAULT 'cny'`, () => {});

        // Sync the products table with src/catalog.js on every start
        const upsert = this.db.prepare(`
          INSERT INTO products (id, name, tier, price, currency, stripe_product_id, description)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name, tier = excluded.tier, price = excluded.price,
            currency = excluded.currency, stripe_product_id = excluded.stripe_product_id,
            description = excluded.description
        `);
        catalog.products.forEach(p => {
          upsert.run(p.id, p.name, p.tier, p.price, catalog.CURRENCY, p.stripeProductId, p.description);
        });
        upsert.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database;
