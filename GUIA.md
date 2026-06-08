# Coca-Cola x Kuva — Terminal de subida de fotos 📸

Landing page donde la gente sube su foto (lámina estilo álbum del mundial) y llega
**directo a tu carpeta de Google Drive** para que el equipo logístico la imprima.

---

## 🧩 Cómo funciona (arquitectura)

```
  Celular del usuario              Google Apps Script              Tu Google Drive
 ┌──────────────────┐   POST foto  ┌──────────────────┐  guarda   ┌────────────────────┐
 │  index.html      │ ───────────► │  Code.gs (puente)│ ────────► │ "Coca Cola x Kuva" │
 │  (escanea QR)    │   base64     │  Web App URL     │   archivo │  (carpeta)         │
 └──────────────────┘              └──────────────────┘           └────────────────────┘
```

**No necesitas N8N.** Usamos **Google Apps Script** como puente porque:
- Es **gratis** y vive dentro de tu propia cuenta de Google.
- Guarda el archivo **directamente** en tu Drive, como dueño tú.
- No hay que pagar servidor ni base de datos.

> N8N también sirve (sería un webhook intermedio), pero añade un servicio más
> que mantener y normalmente de pago. Apps Script es más simple para este caso.
> Si algún día lo quieres con N8N, abajo te dejo la nota.

---

## ✅ Lo que ya está hecho

- [x] Carpeta creada en tu Drive: **Coca Cola x Kuva**
      (ID `17nyJ4aXUR1FIkBlciD8Vn2eCkMFA0wsa`)
- [x] Landing page lista y con estilo Coca-Cola (`index.html`)
- [x] Backend puente listo (`apps-script/Code.gs`)

## 🔧 Lo que falta (5 minutos)

### Paso 1 — Publicar el puente (Apps Script)
1. Entra a **https://script.google.com** con la cuenta `info@mekaniads.com`
   (la dueña de la carpeta).
2. **Nuevo proyecto**.
3. Borra el contenido y pega TODO el código de `apps-script/Code.gs`.
4. Arriba a la derecha: **Implementar → Nueva implementación**.
5. Engranaje ⚙️ → tipo **Aplicación web**.
6. Configura:
   - **Ejecutar como:** Yo (info@mekaniads.com)
   - **Quién tiene acceso:** **Cualquier usuario**
7. **Implementar** → autoriza los permisos (acepta).
8. Copia la **URL de la aplicación web** (termina en `/exec`).

### Paso 2 — Conectar la landing con el puente
1. Abre `index.html`.
2. Busca esta línea (arriba del `<script>`):
   ```js
   const UPLOAD_URL = "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT";
   ```
3. Reemplaza el texto por la URL que copiaste:
   ```js
   const UPLOAD_URL = "https://script.google.com/macros/s/AKfyc..../exec";
   ```
4. Guarda.

### Paso 3 — Publicar la landing en internet (para el QR)
Elige UNA opción gratis:

- **Netlify Drop** (lo más fácil): entra a https://app.netlify.com/drop
  y arrastra el archivo `index.html`. Te da una URL al instante.
- **Vercel:** sube la carpeta a https://vercel.com (importar proyecto).
- **GitHub Pages:** sube `index.html` a un repo y actívalo en Settings → Pages.

> Yo te puedo desplegar en Vercel desde aquí si quieres — solo dilo.

### Paso 4 — Generar el QR
Con la URL final (la de Netlify/Vercel), genera un QR en
https://www.qr-code-generator.com o similar. Imprímelo para el evento. 🎉

---

## 🧪 Cómo probar
1. Abre la URL de la landing en tu celular.
2. Sube una foto.
3. Revisa la carpeta **Coca Cola x Kuva** en Drive → debe aparecer el archivo
   con nombre `KUVA_2026-06-08_143022_ab12.jpg`.

---

## 🛠️ Detalles técnicos
- Las fotos se renombran automáticamente con fecha/hora para no repetirse.
- Límite de 20 MB por foto (configurable en `index.html`, variable `MAX_MB`).
- Se usa `Content-Type: text/plain` en el envío para evitar el bloqueo CORS
  típico de Apps Script (truco estándar y estable).

## 🔁 Alternativa con N8N (solo si la prefieres)
1. Crea un workflow con un nodo **Webhook** (POST).
2. Conéctalo a un nodo **Google Drive → Upload File**, apuntando a la carpeta.
3. En `index.html`, pon la URL del webhook de N8N en `UPLOAD_URL`
   (mismo formato de payload: `{ filename, mimeType, data(base64) }`).

El resto de la landing no cambia.
