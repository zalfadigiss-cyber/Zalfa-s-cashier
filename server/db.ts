import { createClient, Client } from '@libsql/client';
import * as dotenv from 'dotenv';
import {
  initialCategories,
  initialProducts,
  initialUsers,
  initialCustomers,
  initialVouchers,
  initialStoreSettings,
  initialActiveShift,
  initialTransactions,
} from '../src/data/initialData';

dotenv.config();

const dbUrl = process.env.TURSO_DATABASE_URL || 'libsql://kasirzadb-falza.aws-ap-northeast-1.turso.io';
const dbAuthToken =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODk5NTEyOTYsImlkIjoiMDFhMGMxNjYtZDgwMS03NTliLTgxNzMtN2M0NjY2MDBjNjFkIiwia2lkIjoiQUJwVjlaOGF1RUlxOXRLNmQ3QjRQdXliVEJtdmVOY0YwTU1DYWRabFE4YyIsInJpZCI6ImNiMWIzYjY4LTEyMzItNGI0Ni1iYWM3LWZhMTc0YjQ5ODMzYiJ9.8yk-C-F7NkRsMQ13-vvC8ZPWHSEj4AST9sXF6DYFvZFjzF9tmOxMYjS0QHCQ3t9VytxquLFkCTYRj6IlDUNEDQ';

export const turso: Client = createClient({
  url: dbUrl,
  authToken: dbAuthToken,
});

export async function initDatabase() {
  console.log('[Turso] Initializing tables on', dbUrl);

  try {
    // 1. Categories Table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon_name TEXT,
        bg_color TEXT,
        text_color TEXT
      );
    `);

    // 2. Products Table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        category_id TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        min_stock INTEGER NOT NULL DEFAULT 5,
        unit TEXT DEFAULT 'pcs',
        image_url TEXT,
        image_alt TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Transactions Table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        trx_number TEXT UNIQUE NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL,
        cash_amount_paid REAL,
        cash_change REAL,
        cashier_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'sukses',
        order_type TEXT,
        table_number TEXT,
        customer_name TEXT,
        customer_phone TEXT,
        voucher_code TEXT,
        points_earned INTEGER DEFAULT 0,
        points_used INTEGER DEFAULT 0,
        branch_name TEXT,
        shift_id TEXT,
        notes TEXT,
        void_reason TEXT,
        voided_at TEXT,
        voided_by TEXT,
        items_json TEXT NOT NULL
      );
    `);

    // 4. Users Table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        avatar_url TEXT,
        created_at TEXT
      );
    `);

    // 5. Customers Table (Member & Loyalty)
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        tier TEXT DEFAULT 'Reguler',
        points INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0,
        transactions_count INTEGER DEFAULT 0,
        password TEXT DEFAULT '123456',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist on legacy tables
    try {
      await turso.execute("ALTER TABLE customers ADD COLUMN password TEXT DEFAULT '123456';");
    } catch {
      // Column already exists
    }
    try {
      await turso.execute("ALTER TABLE customers ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;");
    } catch {
      // Column already exists
    }

    // 6. Vouchers Table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS vouchers (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        value REAL NOT NULL,
        min_purchase REAL DEFAULT 0
      );
    `);

    // 7. Store Settings Table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id TEXT PRIMARY KEY,
        settings_json TEXT NOT NULL
      );
    `);

    // 8. Shift Sessions Table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS shift_sessions (
        id TEXT PRIMARY KEY,
        shift_number INTEGER,
        cashier_name TEXT NOT NULL,
        branch_name TEXT NOT NULL,
        branch_id TEXT,
        start_time TEXT NOT NULL,
        start_date TEXT NOT NULL,
        starting_cash REAL NOT NULL,
        cash_in_logs TEXT,
        cash_out_logs TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        end_time TEXT,
        end_date TEXT,
        actual_cash_end REAL,
        expected_cash_end REAL,
        discrepancy REAL,
        notes TEXT
      );
    `);

    console.log('[Turso] Tables verified/created successfully.');

    // Seed Categories if empty
    const catCheck = await turso.execute('SELECT COUNT(*) as count FROM categories;');
    const catCount = Number(catCheck.rows[0]?.count || 0);
    if (catCount === 0) {
      console.log('[Turso] Seeding initial categories...');
      for (const cat of initialCategories) {
        await turso.execute({
          sql: 'INSERT INTO categories (id, name, description, icon_name, bg_color, text_color) VALUES (?, ?, ?, ?, ?, ?);',
          args: [cat.id, cat.name, cat.description, cat.iconName, cat.bgColor, cat.textColor],
        });
      }
    }

    // Seed Products if empty
    const prodCheck = await turso.execute('SELECT COUNT(*) as count FROM products;');
    const prodCount = Number(prodCheck.rows[0]?.count || 0);
    if (prodCount === 0) {
      console.log('[Turso] Seeding initial products...');
      for (const prod of initialProducts) {
        await turso.execute({
          sql: 'INSERT INTO products (id, name, sku, category_id, price, stock, min_stock, unit, image_url, image_alt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
          args: [
            prod.id,
            prod.name,
            prod.sku,
            prod.categoryId,
            prod.price,
            prod.stock,
            prod.minStock,
            prod.unit || 'pcs',
            prod.imageUrl,
            prod.imageAlt || prod.name,
          ],
        });
      }
    }

    // Seed Users if empty
    const userCheck = await turso.execute('SELECT COUNT(*) as count FROM users;');
    const userCount = Number(userCheck.rows[0]?.count || 0);
    if (userCount === 0) {
      console.log('[Turso] Seeding initial users...');
      for (const u of initialUsers) {
        await turso.execute({
          sql: 'INSERT INTO users (id, username, password, name, role, email, phone, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
          args: [u.id, u.username, u.password || '123', u.name, u.role, u.email || '', u.phone || '', u.avatarUrl || '', u.createdAt || ''],
        });
      }
    }

    // Seed Customers if empty
    const custCheck = await turso.execute('SELECT COUNT(*) as count FROM customers;');
    const custCount = Number(custCheck.rows[0]?.count || 0);
    if (custCount === 0) {
      console.log('[Turso] Seeding initial customers...');
      for (const c of initialCustomers) {
        await turso.execute({
          sql: 'INSERT INTO customers (id, name, phone, email, tier, points, total_spent, transactions_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
          args: [c.id, c.name, c.phone, c.email || '', c.tier, c.points, c.totalSpent, c.transactionsCount],
        });
      }
    }

    // Seed Vouchers if empty
    const vCheck = await turso.execute('SELECT COUNT(*) as count FROM vouchers;');
    const vCount = Number(vCheck.rows[0]?.count || 0);
    if (vCount === 0) {
      console.log('[Turso] Seeding initial vouchers...');
      for (const v of initialVouchers) {
        await turso.execute({
          sql: 'INSERT INTO vouchers (code, name, type, value, min_purchase) VALUES (?, ?, ?, ?, ?);',
          args: [v.code, v.name, v.type, v.value, v.minPurchase],
        });
      }
    }

    // Seed Settings if empty
    const setCheck = await turso.execute('SELECT COUNT(*) as count FROM store_settings;');
    const setCount = Number(setCheck.rows[0]?.count || 0);
    if (setCount === 0) {
      console.log('[Turso] Seeding initial store settings...');
      await turso.execute({
        sql: 'INSERT INTO store_settings (id, settings_json) VALUES (?, ?);',
        args: ['main', JSON.stringify(initialStoreSettings)],
      });
    }

    // Seed Shift if empty
    const shiftCheck = await turso.execute('SELECT COUNT(*) as count FROM shift_sessions;');
    const shiftCount = Number(shiftCheck.rows[0]?.count || 0);
    if (shiftCount === 0) {
      console.log('[Turso] Seeding initial shift...');
      await turso.execute({
        sql: `INSERT INTO shift_sessions (
          id, shift_number, cashier_name, branch_name, branch_id, start_time, start_date,
          starting_cash, cash_in_logs, cash_out_logs, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          initialActiveShift.id,
          1,
          initialActiveShift.cashierName,
          initialActiveShift.branchName,
          'branch-1',
          initialActiveShift.startTime,
          initialActiveShift.startDate,
          initialActiveShift.startingCash,
          JSON.stringify(initialActiveShift.cashInLogs),
          JSON.stringify(initialActiveShift.cashOutLogs),
          initialActiveShift.status,
        ],
      });
    }

    // Seed Transactions if empty
    const trxCheck = await turso.execute('SELECT COUNT(*) as count FROM transactions;');
    const trxCount = Number(trxCheck.rows[0]?.count || 0);
    if (trxCount === 0 && initialTransactions.length > 0) {
      console.log('[Turso] Seeding initial sample transactions...');
      for (const trx of initialTransactions) {
        await turso.execute({
          sql: `INSERT INTO transactions (
            id, trx_number, date, time, subtotal, discount, tax, total,
            payment_method, cash_amount_paid, cash_change, cashier_name, status,
            order_type, table_number, customer_name, customer_phone, voucher_code,
            points_earned, points_used, branch_name, shift_id, notes, items_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [
            trx.id,
            trx.trxNumber,
            trx.date,
            trx.time,
            trx.subtotal,
            trx.discount || 0,
            trx.tax || 0,
            trx.total,
            trx.paymentMethod,
            trx.cashAmountPaid || null,
            trx.cashChange || null,
            trx.cashierName,
            trx.status,
            trx.orderType || 'take_away',
            trx.tableNumber || '',
            trx.customerName || '',
            trx.customerPhone || '',
            trx.voucherCode || '',
            trx.pointsEarned || 0,
            trx.pointsUsed || 0,
            trx.branchName || 'Cabang Utama',
            trx.shiftId || '',
            trx.notes || '',
            JSON.stringify(trx.items || []),
          ],
        });
      }
    }

    console.log('[Turso] Database initialization and seed check completed successfully.');
  } catch (error) {
    console.error('[Turso] Error initializing database:', error);
  }
}
