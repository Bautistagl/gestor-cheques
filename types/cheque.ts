export type TipoCheque = 'fisico' | 'electronico';

export interface Cheque {
  id: string;
  numero?: string;       // número de cheque (opcional)
  tipo?: TipoCheque;     // físico o electrónico (opcional por compatibilidad)
  fechaCreacion: string; // YYYY-MM-DD
  fechaCobro: string;    // YYYY-MM-DD
  empresa: string;
  monto: number;
  cobrado: boolean;
  creadoEn?: any;
}

export type ChequeFormData = Omit<Cheque, 'id' | 'cobrado' | 'creadoEn'>;
