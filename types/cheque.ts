export interface Cheque {
  id: string;
  fechaCreacion: string; // YYYY-MM-DD
  fechaCobro: string;    // YYYY-MM-DD
  empresa: string;
  monto: number;
  cobrado: boolean;
  creadoEn?: any;
}

export type ChequeFormData = Omit<Cheque, 'id' | 'cobrado' | 'creadoEn'>;
