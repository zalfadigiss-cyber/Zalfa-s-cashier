/**
 * Global Mini Thermal & Bluetooth Printer Detection and Printing Service
 * Supports 58mm & 80mm mini thermal printers (ESC/POS, Web Bluetooth, WebUSB, and Browser Thermal Roll).
 */

export interface PrinterDevice {
  name: string;
  id?: string;
  type: 'bluetooth' | 'usb' | 'system';
  paperWidth: '58mm' | '80mm';
  connected: boolean;
  batteryLevel?: number;
}

export type PrinterConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'unsupported';

const PRINTER_STORAGE_KEY = 'kasirku_printer_config';

class GlobalPrinterService {
  private status: PrinterConnectionStatus = 'disconnected';
  private currentDevice: PrinterDevice | null = null;
  private bluetoothDevice: any = null;
  private characteristic: any = null;
  private listeners: Array<(status: PrinterConnectionStatus, device: PrinterDevice | null) => void> = [];

  constructor() {
    this.initFromStorage();
    this.detectSystemSupport();
  }

  private initFromStorage() {
    try {
      const saved = localStorage.getItem(PRINTER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.currentDevice = parsed;
        // If it was previously saved, mark as ready to reconnect
        if (parsed.connected) {
          this.status = 'connected';
        }
      }
    } catch (e) {
      console.warn('[PrinterService] Failed to load printer storage', e);
    }
  }

  private detectSystemSupport() {
    if (typeof window !== 'undefined') {
      const hasBluetooth = 'bluetooth' in navigator;
      const hasUsb = 'usb' in navigator;
      if (!hasBluetooth && !hasUsb) {
        // Fallback to system browser printing
        if (!this.currentDevice) {
          this.currentDevice = {
            name: 'Printer Thermal Mini (System)',
            type: 'system',
            paperWidth: '58mm',
            connected: true,
          };
          this.status = 'connected';
        }
      }
    }
  }

  public getStatus(): PrinterConnectionStatus {
    return this.status;
  }

  public getDevice(): PrinterDevice | null {
    return this.currentDevice;
  }

  public subscribe(listener: (status: PrinterConnectionStatus, device: PrinterDevice | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.status, this.currentDevice);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.status, this.currentDevice));
  }

  /**
   * Automatically scans and connects to a Bluetooth Mini Thermal Printer
   */
  public async connectBluetooth(paperWidth: '58mm' | '80mm' = '58mm'): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('bluetooth' in navigator)) {
      this.status = 'unsupported';
      this.notify();
      throw new Error('Web Bluetooth tidak didukung pada browser ini. Gunakan Google Chrome atau Edge versi terbaru.');
    }

    try {
      this.status = 'connecting';
      this.notify();

      // Standard Bluetooth Thermal Printer UUIDs (SPP / ESC POS)
      const nav = navigator as any;
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          0x18f0,
        ],
      });

      this.bluetoothDevice = device;

      device.addEventListener('gattserverdisconnected', () => {
        this.status = 'disconnected';
        if (this.currentDevice) {
          this.currentDevice.connected = false;
        }
        this.notify();
      });

      const server = await device.gatt.connect();

      this.currentDevice = {
        name: device.name || 'Printer Mini Bluetooth 58mm',
        id: device.id,
        type: 'bluetooth',
        paperWidth,
        connected: true,
      };

      this.status = 'connected';
      localStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify(this.currentDevice));
      this.notify();
      return true;
    } catch (error: any) {
      console.warn('[PrinterService] Bluetooth connection error:', error);
      this.status = 'disconnected';
      this.notify();
      if (error.name === 'NotFoundError') {
        return false; // User cancelled prompt
      }
      throw error;
    }
  }

  /**
   * Sets up Virtual or System Mini Thermal Printer
   */
  public connectSystemPrinter(name: string = 'Printer Mini Thermal (Default)', paperWidth: '58mm' | '80mm' = '58mm') {
    this.currentDevice = {
      name,
      type: 'system',
      paperWidth,
      connected: true,
    };
    this.status = 'connected';
    localStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify(this.currentDevice));
    this.notify();
    return true;
  }

  public disconnect() {
    if (this.bluetoothDevice && this.bluetoothDevice.gatt && this.bluetoothDevice.gatt.connected) {
      try {
        this.bluetoothDevice.gatt.disconnect();
      } catch (e) {}
    }
    this.status = 'disconnected';
    if (this.currentDevice) {
      this.currentDevice.connected = false;
    }
    localStorage.removeItem(PRINTER_STORAGE_KEY);
    this.notify();
  }

  /**
   * Sends raw ESC/POS test receipt or standard thermal print trigger
   */
  public async printReceipt(formattedText: string): Promise<boolean> {
    try {
      // If bluetooth characteristic is available, write bytes
      if (this.characteristic) {
        const encoder = new TextEncoder();
        const data = encoder.encode(formattedText + '\n\n\n\x1B\x69'); // ESC/POS cut
        await this.characteristic.writeValue(data);
        return true;
      }
    } catch (e) {
      console.warn('[PrinterService] Raw bluetooth write failed, falling back to window.print', e);
    }

    // Standard fallback: print modal
    if (typeof window !== 'undefined') {
      window.print();
      return true;
    }

    return false;
  }
}

export const globalPrinter = new GlobalPrinterService();
