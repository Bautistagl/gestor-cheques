// Carga manual de 15 cheques de prueba en Firestore.
// Distribución en distintas fechas posteriores al 19/05/2026.
// Uso: node scripts/seed-cheques.mjs

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Cargar variables de entorno desde .env.local manualmente
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
const envRaw = readFileSync(envPath, 'utf8');
for (const linea of envRaw.split('\n')) {
  const limpia = linea.trim();
  if (!limpia || limpia.startsWith('#')) continue;
  const eq = limpia.indexOf('=');
  if (eq === -1) continue;
  const clave = limpia.slice(0, eq).trim();
  const valor = limpia.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
  if (!(clave in process.env)) process.env[clave] = valor;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 15 cheques distribuidos en distintas fechas posteriores al 19/05/2026.
// Hoy: 18/05/2026 — todas las fechas son >= 20/05/2026.
const cheques = [
  // 20/05/2026 — 2 cheques
  {
    numero: '00010234',
    tipo: 'fisico',
    fechaCreacion: '2026-04-20',
    fechaCobro: '2026-05-20',
    empresa: 'Distribuidora López',
    monto: 450000,
  },
  {
    numero: '00010235',
    tipo: 'electronico',
    fechaCreacion: '2026-04-22',
    fechaCobro: '2026-05-20',
    empresa: 'Ferretería El Tornillo',
    monto: 120000,
  },

  // 22/05/2026 — 1 cheque
  {
    numero: '00018821',
    tipo: 'fisico',
    fechaCreacion: '2026-04-22',
    fechaCobro: '2026-05-22',
    empresa: 'Carnicería Don Pedro',
    monto: 85000,
  },

  // 25/05/2026 — 3 cheques (día feriado, para probar suma alta)
  {
    numero: '00022001',
    tipo: 'fisico',
    fechaCreacion: '2026-04-25',
    fechaCobro: '2026-05-25',
    empresa: 'Panadería La Esquina',
    monto: 65000,
  },
  {
    numero: '00022002',
    tipo: 'electronico',
    fechaCreacion: '2026-04-26',
    fechaCobro: '2026-05-25',
    empresa: 'Imprenta Gráfica Sur',
    monto: 230000,
  },
  {
    numero: '00022003',
    tipo: 'fisico',
    fechaCreacion: '2026-04-27',
    fechaCobro: '2026-05-25',
    empresa: 'Almacén Don Juan',
    monto: 340000,
  },

  // 28/05/2026 — 1 cheque grande
  {
    numero: '00030010',
    tipo: 'electronico',
    fechaCreacion: '2026-04-28',
    fechaCobro: '2026-05-28',
    empresa: 'Constructora Andina',
    monto: 1250000,
  },

  // 02/06/2026 — 2 cheques
  {
    numero: '00041122',
    tipo: 'fisico',
    fechaCreacion: '2026-05-02',
    fechaCobro: '2026-06-02',
    empresa: 'Verdulería La Huerta',
    monto: 95000,
  },
  {
    numero: '00041123',
    tipo: 'electronico',
    fechaCreacion: '2026-05-03',
    fechaCobro: '2026-06-02',
    empresa: 'Lácteos Tres Arroyos',
    monto: 410000,
  },

  // 05/06/2026 — 1 cheque
  {
    numero: '00052200',
    tipo: 'fisico',
    fechaCreacion: '2026-05-05',
    fechaCobro: '2026-06-05',
    empresa: 'Vidriería Cristal',
    monto: 580000,
  },

  // 10/06/2026 — 1 cheque
  {
    numero: '00063300',
    tipo: 'electronico',
    fechaCreacion: '2026-05-10',
    fechaCobro: '2026-06-10',
    empresa: 'Heladería Polo Norte',
    monto: 175000,
  },

  // 15/06/2026 — 2 cheques
  {
    numero: '00074410',
    tipo: 'fisico',
    fechaCreacion: '2026-05-12',
    fechaCobro: '2026-06-15',
    empresa: 'Pinturería Color Total',
    monto: 295000,
  },
  {
    numero: '00074411',
    tipo: 'electronico',
    fechaCreacion: '2026-05-14',
    fechaCobro: '2026-06-15',
    empresa: 'Forrajería El Campo',
    monto: 720000,
  },

  // 30/06/2026 — 1 cheque
  {
    numero: '00085500',
    tipo: 'fisico',
    fechaCreacion: '2026-05-15',
    fechaCobro: '2026-06-30',
    empresa: 'Repuestos Don Auto',
    monto: 890000,
  },

  // 15/07/2026 — 1 cheque grande
  {
    numero: '00099001',
    tipo: 'electronico',
    fechaCreacion: '2026-05-16',
    fechaCobro: '2026-07-15',
    empresa: 'Textil Hilados SA',
    monto: 1580000,
  },
];

async function cargar() {
  if (!firebaseConfig.projectId) {
    console.error('ERROR: No se encontraron credenciales de Firebase en .env.local');
    process.exit(1);
  }

  console.log(`Cargando ${cheques.length} cheques en proyecto "${firebaseConfig.projectId}"...`);
  let ok = 0;
  for (const c of cheques) {
    try {
      await addDoc(collection(db, 'cheques'), {
        ...c,
        cobrado: false,
        estado: 'pendiente',
        creadoEn: serverTimestamp(),
      });
      ok++;
      console.log(`  [${ok}/${cheques.length}] ${c.fechaCobro} · ${c.empresa} · $${c.monto.toLocaleString('es-AR')}`);
    } catch (err) {
      console.error(`  ✗ Falló: ${c.empresa} (${c.fechaCobro}):`, err?.message || err);
    }
  }
  console.log(`\nListo: ${ok}/${cheques.length} cheques cargados.`);
  process.exit(0);
}

cargar().catch((e) => {
  console.error('Error fatal:', e);
  process.exit(1);
});
