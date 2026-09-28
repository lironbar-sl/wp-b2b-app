export interface Courier {
  name: string;
  phone: string; // E.164 format: +972XXXXXXXXX
}

// עדכן את המספרים כאן לפי השליחים שלך
export const COURIERS: Courier[] = [
  { name: 'יוסי לוי',    phone: process.env.COURIER_1_PHONE ?? '+972501234501' },
  { name: 'מיכאל ברק',  phone: process.env.COURIER_2_PHONE ?? '+972501234502' },
  { name: 'דני כהן',    phone: process.env.COURIER_3_PHONE ?? '+972501234503' },
];

export const WAREHOUSE_ADDRESS = 'נחלת בנימין 65, תל אביב';
export const BASE_ETA_MINUTES = 28; // זמן בסיס מהמחסן עד אזור תל אביב
export const ETA_BUFFER_MINUTES = 12; // מקדם ביטחון שמוצג ללקוח
