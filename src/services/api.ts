import {
  Category,
  Product,
  Transaction,
  StoreSettings,
  Customer,
  AppUser,
  ShiftSession,
  ShiftLog,
  VoucherPromo,
} from '../types';

export const api = {
  // Check health and Turso connection
  async checkTursoHealth(): Promise<{ connected: boolean; host?: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return { connected: false };
      const data = await res.json();
      return { connected: !!data.connected, host: data.host };
    } catch {
      return { connected: false };
    }
  },

  // Categories
  async getCategories(): Promise<Category[] | null> {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveCategory(category: Category, isNew: boolean): Promise<boolean> {
    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/categories' : `/api/categories/${encodeURIComponent(category.id)}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Products
  async getProducts(): Promise<Product[] | null> {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveProduct(product: Product, isNew: boolean): Promise<boolean> {
    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/products' : `/api/products/${encodeURIComponent(product.id)}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Transactions
  async getTransactions(): Promise<Transaction[] | null> {
    try {
      const res = await fetch('/api/transactions');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveTransaction(transaction: Transaction): Promise<boolean> {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async voidTransaction(id: string, voidReason: string, voidedBy: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/transactions/${encodeURIComponent(id)}/void`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voidReason, voidedBy }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Shift Sessions
  async getActiveShift(): Promise<ShiftSession | null> {
    try {
      const res = await fetch('/api/shift/active');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async addShiftLog(
    shiftId: string,
    type: 'masuk' | 'keluar',
    amount: number,
    reason: string
  ): Promise<{ log: ShiftLog; cashInLogs: ShiftLog[]; cashOutLogs: ShiftLog[] } | null> {
    try {
      const res = await fetch('/api/shift/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftId, type, amount, reason }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async closeShift(
    shiftId: string,
    actualCashEnd: number,
    expectedCashEnd: number,
    discrepancy: number,
    notes?: string
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/shift/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId,
          actualCashEnd,
          expectedCashEnd,
          discrepancy,
          notes,
          endTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          endDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Users & Auth
  async getUsers(): Promise<AppUser[] | null> {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveUser(user: AppUser): Promise<boolean> {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async updateUser(user: AppUser): Promise<boolean> {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(user.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async updateUserPassword(id: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(id)}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal mengubah password.' };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: 'Koneksi ke server gagal.' };
    }
  },

  async deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal menghapus akun.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Koneksi ke server gagal.' };
    }
  },

  async loginUser(username: string, password: string): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal login.' };
      }
      return { success: true, user: data.user };
    } catch (e: any) {
      return { success: false, error: 'Koneksi ke server terputus.' };
    }
  },

  // Settings
  async getSettings(): Promise<StoreSettings | null> {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveSettings(settings: StoreSettings): Promise<boolean> {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Customers & Vouchers
  async getCustomers(): Promise<Customer[] | null> {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveCustomer(customer: Customer, isNew: boolean): Promise<boolean> {
    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/customers' : `/api/customers/${encodeURIComponent(customer.id)}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getVouchers(): Promise<VoucherPromo[] | null> {
    try {
      const res = await fetch('/api/vouchers');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Member Portal & Auth (Synced with Turso)
  async memberSignUp(data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    favoriteCategory?: string;
  }): Promise<{ success: boolean; member?: Customer; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/members/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Gagal mendaftar member.' };
      }
      return { success: true, member: result.member, message: result.message };
    } catch (e: any) {
      return { success: false, error: 'Gagal terhubung ke server database Turso.' };
    }
  },

  async memberSignIn(
    identifier: string,
    password: string
  ): Promise<{
    success: boolean;
    member?: Customer;
    recentTransactions?: any[];
    message?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/members/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Gagal masuk member.' };
      }
      return {
        success: true,
        member: result.member,
        recentTransactions: result.recentTransactions || [],
        message: result.message,
      };
    } catch (e: any) {
      return { success: false, error: 'Gagal terhubung ke server database Turso.' };
    }
  },

  async getMemberTransactions(memberId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/members/${encodeURIComponent(memberId)}/transactions`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },
};
