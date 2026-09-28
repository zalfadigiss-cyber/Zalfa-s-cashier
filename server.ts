import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as dotenv from 'dotenv';
import { turso, initDatabase } from './server/db';
import { Category, Product, Transaction, StoreSettings, Customer, AppUser, ShiftSession, ShiftLog } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize DB schema & seeds on boot
initDatabase().catch((err) => {
  console.error('[Server] Failed to initialize Turso database:', err);
});

// ==========================================
// 1. HEALTH CHECK & TURSO STATUS
// ==========================================
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const check = await turso.execute('SELECT 1 as alive;');
    res.json({
      status: 'ok',
      database: 'turso',
      connected: check.rows.length > 0,
      host: 'kasirzadb-falza.aws-ap-northeast-1.turso.io',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', database: 'turso', connected: false, message: err?.message });
  }
});

// ==========================================
// 2. CATEGORIES API
// ==========================================
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const rs = await turso.execute('SELECT * FROM categories ORDER BY name ASC;');
    const categories: Category[] = rs.rows.map((row: any) => ({
      id: String(row.id),
      name: String(row.name),
      description: String(row.description || ''),
      iconName: String(row.icon_name || 'package'),
      bgColor: String(row.bg_color || '#e9ded6'),
      textColor: String(row.text_color || '#69615b'),
    }));
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/categories', async (req: Request, res: Response) => {
  try {
    const { id, name, description, iconName, bgColor, textColor } = req.body;
    const catId = id || 'cat-' + Date.now();
    await turso.execute({
      sql: 'INSERT INTO categories (id, name, description, icon_name, bg_color, text_color) VALUES (?, ?, ?, ?, ?, ?);',
      args: [catId, name, description || '', iconName || 'package', bgColor || '#e9ded6', textColor || '#69615b'],
    });
    res.status(201).json({ success: true, id: catId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.put('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, iconName, bgColor, textColor } = req.body;
    await turso.execute({
      sql: 'UPDATE categories SET name = ?, description = ?, icon_name = ?, bg_color = ?, text_color = ? WHERE id = ?;',
      args: [name, description || '', iconName || 'package', bgColor || '#e9ded6', textColor || '#69615b', id],
    });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM categories WHERE id = ?;',
      args: [id],
    });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ==========================================
// 3. PRODUCTS API
// ==========================================
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const rs = await turso.execute('SELECT * FROM products ORDER BY name ASC;');
    const products: Product[] = rs.rows.map((row: any) => ({
      id: String(row.id),
      name: String(row.name),
      sku: String(row.sku),
      categoryId: String(row.category_id || ''),
      price: Number(row.price),
      stock: Number(row.stock),
      minStock: Number(row.min_stock || 5),
      unit: String(row.unit || 'pcs'),
      imageUrl: String(row.image_url || ''),
      imageAlt: String(row.image_alt || row.name),
    }));
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const { id, name, sku, categoryId, price, stock, minStock, unit, imageUrl, imageAlt } = req.body;
    const prodId = id || 'prod-' + Date.now();
    await turso.execute({
      sql: 'INSERT INTO products (id, name, sku, category_id, price, stock, min_stock, unit, image_url, image_alt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
      args: [
        prodId,
        name,
        sku,
        categoryId || '',
        Number(price) || 0,
        Number(stock) || 0,
        Number(minStock) || 5,
        unit || 'pcs',
        imageUrl || '',
        imageAlt || name,
      ],
    });
    res.status(201).json({ success: true, id: prodId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sku, categoryId, price, stock, minStock, unit, imageUrl, imageAlt } = req.body;
    await turso.execute({
      sql: 'UPDATE products SET name = ?, sku = ?, category_id = ?, price = ?, stock = ?, min_stock = ?, unit = ?, image_url = ?, image_alt = ? WHERE id = ?;',
      args: [
        name,
        sku,
        categoryId || '',
        Number(price) || 0,
        Number(stock) || 0,
        Number(minStock) || 5,
        unit || 'pcs',
        imageUrl || '',
        imageAlt || name,
        id,
      ],
    });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM products WHERE id = ?;',
      args: [id],
    });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ==========================================
// 4. TRANSACTIONS API
// ==========================================
app.get('/api/transactions', async (req: Request, res: Response) => {
  try {
    const rs = await turso.execute('SELECT * FROM transactions ORDER BY date DESC, time DESC;');
    const transactions: Transaction[] = rs.rows.map((row: any) => {
      let items = [];
      try {
        items = JSON.parse(String(row.items_json || '[]'));
      } catch {
        items = [];
      }
      return {
        id: String(row.id),
        trxNumber: String(row.trx_number),
        date: String(row.date),
        time: String(row.time),
        subtotal: Number(row.subtotal),
        discount: Number(row.discount || 0),
        tax: Number(row.tax || 0),
        total: Number(row.total),
        paymentMethod: row.payment_method as any,
        cashAmountPaid: row.cash_amount_paid ? Number(row.cash_amount_paid) : undefined,
        cashChange: row.cash_change ? Number(row.cash_change) : undefined,
        cashierName: String(row.cashier_name),
        status: row.status as any,
        orderType: row.order_type as any,
        tableNumber: row.table_number || undefined,
        customerName: row.customer_name || undefined,
        customerPhone: row.customer_phone || undefined,
        voucherCode: row.voucher_code || undefined,
        pointsEarned: Number(row.points_earned || 0),
        pointsUsed: Number(row.points_used || 0),
        branchName: String(row.branch_name || 'Cabang Utama'),
        shiftId: row.shift_id || undefined,
        notes: row.notes || undefined,
        voidReason: row.void_reason || undefined,
        voidedAt: row.voided_at || undefined,
        voidedBy: row.voided_by || undefined,
        items,
      };
    });
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/transactions', async (req: Request, res: Response) => {
  try {
    const trx: Transaction = req.body;
    const trxId = trx.id || 'trx-' + Date.now();

    // 1. Insert transaction into Turso
    await turso.execute({
      sql: `INSERT INTO transactions (
        id, trx_number, date, time, subtotal, discount, tax, total,
        payment_method, cash_amount_paid, cash_change, cashier_name, status,
        order_type, table_number, customer_name, customer_phone, voucher_code,
        points_earned, points_used, branch_name, shift_id, notes, items_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        trxId,
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
        trx.status || 'sukses',
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

    // 2. Decrement stock for purchased items
    if (trx.items && trx.items.length > 0) {
      for (const item of trx.items) {
        await turso.execute({
          sql: 'UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?;',
          args: [item.quantity, item.productId],
        });
      }
    }

    res.status(201).json({ success: true, id: trxId, trxNumber: trx.trxNumber });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.put('/api/transactions/:id/void', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { voidReason, voidedBy } = req.body;

    // Get current transaction to restore stock
    const trxRow = await turso.execute({
      sql: 'SELECT items_json, status FROM transactions WHERE id = ?;',
      args: [id],
    });

    if (trxRow.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const row = trxRow.rows[0];
    if (row.status === 'dibatalkan') {
      return res.status(400).json({ error: 'Transaction is already voided' });
    }

    // Mark as voided
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    await turso.execute({
      sql: 'UPDATE transactions SET status = ?, void_reason = ?, voided_by = ?, voided_at = ? WHERE id = ?;',
      args: ['dibatalkan', voidReason || 'Dibatalkan oleh kasir', voidedBy || 'Kasir', now, id],
    });

    // Restore stock
    try {
      const items = JSON.parse(String(row.items_json || '[]'));
      for (const it of items) {
        await turso.execute({
          sql: 'UPDATE products SET stock = stock + ? WHERE id = ?;',
          args: [it.quantity, it.productId],
        });
      }
    } catch (e) {
      console.error('[Void] Error restoring stock:', e);
    }

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ==========================================
// 5. SHIFT SESSIONS API
// ==========================================
app.get('/api/shift/active', async (req: Request, res: Response) => {
  try {
    const rs = await turso.execute("SELECT * FROM shift_sessions WHERE status = 'open' ORDER BY start_date DESC, start_time DESC LIMIT 1;");
    if (rs.rows.length === 0) {
      return res.json(null);
    }
    const row: any = rs.rows[0];
    let cashInLogs: ShiftLog[] = [];
    let cashOutLogs: ShiftLog[] = [];
    try {
      cashInLogs = JSON.parse(String(row.cash_in_logs || '[]'));
      cashOutLogs = JSON.parse(String(row.cash_out_logs || '[]'));
    } catch {
      // ignore
    }

    const shift: ShiftSession = {
      id: String(row.id),
      shiftNumber: Number(row.shift_number || 1),
      cashierName: String(row.cashier_name),
      branchName: String(row.branch_name),
      branchId: row.branch_id ? String(row.branch_id) : undefined,
      startTime: String(row.start_time),
      startDate: String(row.start_date),
      startingCash: Number(row.starting_cash),
      cashInLogs,
      cashOutLogs,
      status: row.status as any,
    };
    res.json(shift);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/shift/log', async (req: Request, res: Response) => {
  try {
    const { shiftId, type, amount, reason, time } = req.body;
    const rs = await turso.execute({
      sql: 'SELECT cash_in_logs, cash_out_logs FROM shift_sessions WHERE id = ?;',
      args: [shiftId],
    });

    if (rs.rows.length === 0) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const newLog: ShiftLog = {
      id: (type === 'masuk' ? 'cin-' : 'cout-') + Date.now(),
      time: time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      amount: Number(amount),
      reason: String(reason),
      type: type as 'masuk' | 'keluar',
    };

    let cashInLogs = [];
    let cashOutLogs = [];
    try {
      cashInLogs = JSON.parse(String(rs.rows[0].cash_in_logs || '[]'));
      cashOutLogs = JSON.parse(String(rs.rows[0].cash_out_logs || '[]'));
    } catch {}

    if (type === 'masuk') {
      cashInLogs.push(newLog);
    } else {
      cashOutLogs.push(newLog);
    }

    await turso.execute({
      sql: 'UPDATE shift_sessions SET cash_in_logs = ?, cash_out_logs = ? WHERE id = ?;',
      args: [JSON.stringify(cashInLogs), JSON.stringify(cashOutLogs), shiftId],
    });

    res.json({ success: true, log: newLog, cashInLogs, cashOutLogs });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/shift/close', async (req: Request, res: Response) => {
  try {
    const { shiftId, actualCashEnd, expectedCashEnd, discrepancy, notes, endTime, endDate } = req.body;
    await turso.execute({
      sql: `UPDATE shift_sessions SET 
        status = 'closed',
        actual_cash_end = ?,
        expected_cash_end = ?,
        discrepancy = ?,
        notes = ?,
        end_time = ?,
        end_date = ?
      WHERE id = ?;`,
      args: [actualCashEnd, expectedCashEnd, discrepancy, notes || '', endTime, endDate, shiftId],
    });
    res.json({ success: true, shiftId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ==========================================
// 6. USERS & AUTH API
// ==========================================
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const rs = await turso.execute('SELECT id, username, name, role, email, phone, avatar_url, created_at, password FROM users;');
    const users: AppUser[] = rs.rows.map((row: any) => ({
      id: String(row.id),
      username: String(row.username),
      name: String(row.name),
      role: row.role as any,
      email: row.email ? String(row.email) : undefined,
      phone: row.phone ? String(row.phone) : undefined,
      avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
      createdAt: row.created_at ? String(row.created_at) : undefined,
      password: String(row.password),
    }));
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { id, username, password, name, role, email, phone, avatarUrl } = req.body;
    const userId = id || 'user-' + Date.now();
    await turso.execute({
      sql: 'INSERT INTO users (id, username, password, name, role, email, phone, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
      args: [
        userId,
        username,
        password || '123',
        name,
        role || 'kasir',
        email || '',
        phone || '',
        avatarUrl || '',
        new Date().toISOString().split('T')[0],
      ],
    });
    res.status(201).json({ success: true, id: userId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.delete('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM users WHERE id = ?;',
      args: [id],
    });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const rs = await turso.execute({
      sql: 'SELECT * FROM users WHERE LOWER(username) = LOWER(?);',
      args: [String(username || '').trim()],
    });

    if (rs.rows.length === 0) {
      return res.status(401).json({ error: 'Username tidak ditemukan.' });
    }

    const userRow: any = rs.rows[0];
    if (userRow.password !== password) {
      return res.status(401).json({ error: 'Kata sandi salah.' });
    }

    const user: AppUser = {
      id: String(userRow.id),
      username: String(userRow.username),
      name: String(userRow.name),
      role: userRow.role,
      email: userRow.email,
      phone: userRow.phone,
      avatarUrl: userRow.avatar_url,
      createdAt: userRow.created_at,
    };

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ==========================================
// 7. STORE SETTINGS API
// ==========================================
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const rs = await turso.execute("SELECT settings_json FROM store_settings WHERE id = 'main';");
    if (rs.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    const settings = JSON.parse(String(rs.rows[0].settings_json));
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/settings', async (req: Request, res: Response) => {
  try {
    const settings: StoreSettings = req.body;
    await turso.execute({
      sql: "INSERT INTO store_settings (id, settings_json) VALUES ('main', ?) ON CONFLICT(id) DO UPDATE SET settings_json = excluded.settings_json;",
      args: [JSON.stringify(settings)],
    });
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ==========================================
// 8. CUSTOMERS & MEMBER LOYALTY API (TURSO SYNC)
// ==========================================
app.get('/api/customers', async (req: Request, res: Response) => {
  try {
    const rs = await turso.execute('SELECT * FROM customers ORDER BY name ASC;');
    const customers: Customer[] = rs.rows.map((row: any) => ({
      id: String(row.id),
      name: String(row.name),
      phone: String(row.phone || ''),
      email: row.email ? String(row.email) : undefined,
      tier: row.tier as any,
      points: Number(row.points || 0),
      totalSpent: Number(row.total_spent || 0),
      transactionsCount: Number(row.transactions_count || 0),
      createdAt: row.created_at ? String(row.created_at) : undefined,
    }));
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/customers', async (req: Request, res: Response) => {
  try {
    const { id, name, phone, email, tier, points, totalSpent, transactionsCount, password } = req.body;
    const custId = id || 'cust-' + Date.now();
    await turso.execute({
      sql: `INSERT INTO customers (id, name, phone, email, tier, points, total_spent, transactions_count, password, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        custId,
        name,
        phone || '',
        email || '',
        tier || 'Reguler',
        points || 0,
        totalSpent || 0,
        transactionsCount || 0,
        password || '123456',
        new Date().toISOString(),
      ],
    });
    res.status(201).json({ success: true, id: custId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.put('/api/customers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, tier, points, totalSpent, transactionsCount } = req.body;
    await turso.execute({
      sql: `UPDATE customers SET name = ?, phone = ?, email = ?, tier = ?, points = ?, total_spent = ?, transactions_count = ?
            WHERE id = ?;`,
      args: [name, phone || '', email || '', tier, points, totalSpent, transactionsCount, id],
    });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// Member Sign Up (Sinkronisasi ke Turso)
app.post('/api/members/signup', async (req: Request, res: Response) => {
  try {
    const { name, phone, email, password, favoriteCategory } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Nama, nomor telepon/WhatsApp, dan kata sandi wajib diisi.' });
    }

    const cleanPhone = String(phone).trim().replace(/[^0-9]/g, '');
    const cleanName = String(name).trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';

    // Check if phone already registered in Turso
    const existing = await turso.execute({
      sql: 'SELECT id, phone, email FROM customers WHERE phone = ? OR (email != "" AND email = ?);',
      args: [cleanPhone, cleanEmail],
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: 'Nomor telepon atau email ini sudah terdaftar sebagai member. Silakan masuk (Sign In).',
      });
    }

    const newId = 'cust-' + Date.now();
    const welcomePoints = 50; // Welcome gift points
    const defaultTier = 'Reguler';
    const createdAt = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO customers (id, name, phone, email, tier, points, total_spent, transactions_count, password, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        newId,
        cleanName,
        cleanPhone,
        cleanEmail,
        defaultTier,
        welcomePoints,
        0,
        0,
        password,
        createdAt,
      ],
    });

    const newMember: Customer = {
      id: newId,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail || undefined,
      tier: defaultTier,
      points: welcomePoints,
      totalSpent: 0,
      transactionsCount: 0,
      createdAt,
      favoriteCategory,
    };

    res.status(201).json({
      success: true,
      member: newMember,
      message: 'Pendaftaran member berhasil! Bonus 50 poin selamat datang telah ditambahkan ke akun Anda.',
    });
  } catch (err: any) {
    console.error('[Member SignUp Error]', err);
    res.status(500).json({ error: err?.message || 'Gagal mendaftarkan member ke database.' });
  }
});

// Member Sign In (Validasi ke Turso)
app.post('/api/members/signin', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Silakan masukkan nomor telepon/email dan PIN/kata sandi.' });
    }

    const cleanId = String(identifier).trim();
    const numericPhone = cleanId.replace(/[^0-9]/g, '');

    // Search by phone or email
    const rs = await turso.execute({
      sql: `SELECT * FROM customers 
            WHERE phone = ? OR phone = ? OR (email != "" AND LOWER(email) = LOWER(?))
            LIMIT 1;`,
      args: [cleanId, numericPhone, cleanId],
    });

    if (rs.rows.length === 0) {
      return res.status(401).json({
        error: 'Nomor telepon atau email belum terdaftar sebagai member. Silakan daftar terlebih dahulu.',
      });
    }

    const row: any = rs.rows[0];
    const savedPassword = String(row.password || '123456');

    if (savedPassword !== String(password).trim()) {
      return res.status(401).json({ error: 'PIN / Kata sandi yang Anda masukkan salah. Silakan coba lagi.' });
    }

    const member: Customer = {
      id: String(row.id),
      name: String(row.name),
      phone: String(row.phone || ''),
      email: row.email ? String(row.email) : undefined,
      tier: row.tier as any,
      points: Number(row.points || 0),
      totalSpent: Number(row.total_spent || 0),
      transactionsCount: Number(row.transactions_count || 0),
      createdAt: row.created_at ? String(row.created_at) : undefined,
    };

    // Get recent transactions for this member
    let recentTransactions: any[] = [];
    try {
      const trxRs = await turso.execute({
        sql: `SELECT id, trx_number, date, time, total, points_earned, points_used, payment_method, items_json
              FROM transactions 
              WHERE customer_phone = ? OR (customer_name != "" AND LOWER(customer_name) = LOWER(?))
              ORDER BY date DESC, time DESC LIMIT 10;`,
        args: [member.phone, member.name],
      });
      recentTransactions = trxRs.rows.map((t: any) => ({
        id: String(t.id),
        trxNumber: String(t.trx_number),
        date: String(t.date),
        time: String(t.time),
        total: Number(t.total),
        pointsEarned: Number(t.points_earned || 0),
        pointsUsed: Number(t.points_used || 0),
        paymentMethod: String(t.payment_method),
        items: JSON.parse(String(t.items_json || '[]')),
      }));
    } catch (e) {
      console.warn('[Member] Could not fetch recent member transactions:', e);
    }

    res.json({
      success: true,
      member,
      recentTransactions,
      message: `Selamat datang kembali, ${member.name}!`,
    });
  } catch (err: any) {
    console.error('[Member SignIn Error]', err);
    res.status(500).json({ error: err?.message || 'Terjadi kesalahan saat verifikasi member.' });
  }
});

// Member Transactions History
app.get('/api/members/:id/transactions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const custRs = await turso.execute({
      sql: 'SELECT name, phone FROM customers WHERE id = ?;',
      args: [id],
    });

    if (custRs.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const { name, phone } = custRs.rows[0];
    const trxRs = await turso.execute({
      sql: `SELECT id, trx_number, date, time, total, points_earned, points_used, payment_method, items_json
            FROM transactions 
            WHERE customer_phone = ? OR (customer_name != "" AND LOWER(customer_name) = LOWER(?))
            ORDER BY date DESC, time DESC LIMIT 20;`,
      args: [phone, name],
    });

    const history = trxRs.rows.map((t: any) => ({
      id: String(t.id),
      trxNumber: String(t.trx_number),
      date: String(t.date),
      time: String(t.time),
      total: Number(t.total),
      pointsEarned: Number(t.points_earned || 0),
      pointsUsed: Number(t.points_used || 0),
      paymentMethod: String(t.payment_method),
      items: JSON.parse(String(t.items_json || '[]')),
    }));

    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.get('/api/vouchers', async (req: Request, res: Response) => {
  try {
    const rs = await turso.execute('SELECT * FROM vouchers;');
    res.json(rs.rows);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// ==========================================
// 9. VITE & STATIC MIDDLEWARE SETUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] KASIRKU POS Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[Turso] Connected to cloud database: libsql://kasirzadb-falza.aws-ap-northeast-1.turso.io`);
  });
}

startServer();
