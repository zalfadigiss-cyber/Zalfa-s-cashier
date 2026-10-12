/**
 * QRIS EMVCo Generator & Parser for Indonesian QRIS Standard (ASPI / Bank Indonesia)
 * Configured for:
 * Merchant: Anugerah Store
 * NMID: ID1025371471182
 * Terminal: A01
 * Acquirer: 93600915
 */

export interface QRISConfig {
  merchantName: string;
  nmid: string;
  terminalId: string;
  acquirerCode: string;
  mcc: string;
  currency: string;
  countryCode: string;
  city: string;
  postalCode?: string;
}

export const DEFAULT_QRIS_CONFIG: QRISConfig = {
  merchantName: 'Anugerah Store',
  nmid: 'ID1025371471182',
  terminalId: 'A01',
  acquirerCode: '93600915',
  mcc: '5411', // Grocery / Merchant Store
  currency: '360', // IDR (Indonesian Rupiah)
  countryCode: 'ID',
  city: 'INDONESIA',
  postalCode: '12340',
};

/**
 * Calculates 16-bit CRC checksum using polynomial 0x1021 with init 0xFFFF (CRC16-CCITT)
 * Standard EMVCo / ASPI QRIS specification.
 */
export function calculateCRC16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function padLength(str: string): string {
  return str.length.toString().padStart(2, '0');
}

function tlv(tag: string, value: string): string {
  return tag + padLength(value) + value;
}

/**
 * Generates an official ASPI / EMVCo compliant Dynamic QRIS string
 * Locked to the specified transaction amount and transaction number.
 */
export function generateDynamicQRIS(
  amount: number,
  trxNumber: string = '',
  customConfig?: Partial<QRISConfig>
): { qrisString: string; config: QRISConfig; isDynamic: boolean } {
  const config: QRISConfig = { ...DEFAULT_QRIS_CONFIG, ...customConfig };
  const isDynamic = amount > 0;

  let payload = '';

  // Tag 00: Payload Format Indicator (01)
  payload += tlv('00', '01');

  // Tag 01: Point of Initiation Method
  // '12' = Dynamic QR (nominal otomatis terkunci di aplikasi pembeli)
  // '11' = Static QR (nominal diisi manual oleh pembeli)
  payload += tlv('01', isDynamic ? '12' : '11');

  // Tag 26: Merchant Account Information - Domestic Acquirer
  const tag26 =
    tlv('00', 'ID.CO.QRIS.WWW') +
    tlv('01', config.nmid) +
    tlv('02', config.acquirerCode) +
    tlv('03', 'UME');
  payload += tlv('26', tag26);

  // Tag 51: Merchant Account Information - National QRIS
  const tag51 =
    tlv('00', 'IDS.CO.QRIS.WWW') +
    tlv('01', config.nmid) +
    tlv('02', '01') +
    tlv('03', config.terminalId);
  payload += tlv('51', tag51);

  // Tag 52: Merchant Category Code
  payload += tlv('52', config.mcc);

  // Tag 53: Transaction Currency (360 = IDR)
  payload += tlv('53', config.currency);

  // Tag 54: Transaction Amount (Dynamic Nominal)
  if (isDynamic) {
    payload += tlv('54', Math.round(amount).toString());
  }

  // Tag 58: Country Code
  payload += tlv('58', config.countryCode);

  // Tag 59: Merchant Name
  payload += tlv('59', config.merchantName);

  // Tag 60: Merchant City
  payload += tlv('60', config.city);

  // Tag 61: Postal Code (Optional)
  if (config.postalCode) {
    payload += tlv('61', config.postalCode);
  }

  // Tag 62: Additional Data Field (Bill number & Terminal label)
  let tag62 = tlv('07', config.terminalId);
  if (trxNumber) {
    tag62 += tlv('01', trxNumber);
  }
  payload += tlv('62', tag62);

  // Tag 63: CRC16 Checksum
  payload += '6304';
  const crc = calculateCRC16(payload);
  const qrisString = payload + crc;

  return {
    qrisString,
    config,
    isDynamic,
  };
}
