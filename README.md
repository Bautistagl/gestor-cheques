# Gestor de Cheques

App para registrar y hacer seguimiento de cheques emitidos.

## Funcionalidades

- Registrar cheques con empresa, monto, fecha de creación y fecha de cobro
- Ver cheques pendientes agrupados por fecha, con el total que sale del banco cada día
- Los cheques se marcan como cobrados automáticamente cuando llega la fecha de cobro
- Marcar cheques como cobrados manualmente
- Editar o eliminar cheques
- Ver historial de cheques cobrados con totales

---

## Configuración paso a paso

### 1. Crear proyecto en Firebase

1. Ir a [https://console.firebase.google.com](https://console.firebase.google.com)
2. Hacer clic en **"Agregar proyecto"**
3. Elegir un nombre (ej: `gestor-cheques`)
4. Desactivar Google Analytics (opcional) y crear el proyecto

### 2. Crear la base de datos (Firestore)

1. En el menú izquierdo, ir a **"Firestore Database"**
2. Hacer clic en **"Crear base de datos"**
3. Elegir **"Comenzar en modo de prueba"** (permite lectura/escritura sin autenticación)
4. Elegir la región `southamerica-east1` (São Paulo, la más cercana a Argentina)
5. Hacer clic en **"Listo"**

### 3. Obtener las credenciales de la app

1. En la página principal del proyecto, hacer clic en el ícono **`</>`** (Web)
2. Registrar la app con un nombre (ej: `gestor-cheques-web`)
3. **No** activar Firebase Hosting
4. Copiar el objeto `firebaseConfig` que aparece, que tiene este formato:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 4. Crear el archivo de configuración local

1. En la carpeta del proyecto, copiar el archivo `.env.local.example` y renombrarlo a `.env.local`
2. Rellenar cada línea con los valores del paso anterior:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Instalar y correr localmente

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Deploy en Vercel

### 1. Subir el proyecto a GitHub

1. Crear un repositorio en GitHub
2. Subir todos los archivos del proyecto

### 2. Conectar con Vercel

1. Ir a [https://vercel.com](https://vercel.com) y crear una cuenta (gratis)
2. Hacer clic en **"Add New Project"**
3. Importar el repositorio de GitHub
4. En la sección **"Environment Variables"**, agregar las mismas variables del `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Hacer clic en **"Deploy"**

Vercel genera automáticamente una URL pública (ej: `gestor-cheques.vercel.app`).

---

## Reglas de seguridad en Firestore (opcional)

Para que solo vos puedas acceder, podés agregar estas reglas en Firebase Console → Firestore → Reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Cambiar "tu@email.com" por tu email de Google
      allow read, write: if request.auth != null && request.auth.token.email == "tu@email.com";
    }
  }
}
```

Para esto necesitarías agregar autenticación con Google a la app. Sin autenticación, las reglas de "modo prueba" permiten acceso libre durante 30 días.
