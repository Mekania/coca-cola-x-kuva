/**
 * ============================================================
 *  Coca-Cola x Kuva — Puente de subida a Google Drive
 *  Google Apps Script (Web App)
 * ============================================================
 *
 *  Recibe una foto en base64 desde la landing page y la guarda
 *  en la carpeta de Drive "Coca Cola x Kuva".
 *
 *  CARPETA YA CREADA:
 *    Nombre : Coca Cola x Kuva
 *    ID     : 17nyJ4aXUR1FIkBlciD8Vn2eCkMFA0wsa
 *    URL    : https://drive.google.com/drive/folders/17nyJ4aXUR1FIkBlciD8Vn2eCkMFA0wsa
 *
 *  CÓMO PUBLICAR:
 *    1. Ve a https://script.google.com  ->  Nuevo proyecto
 *    2. Pega este código (reemplaza todo el contenido)
 *    3. Implementar -> Nueva implementación -> tipo "Aplicación web"
 *         - Ejecutar como: Yo (info@mekaniads.com)
 *         - Quién tiene acceso: Cualquier usuario
 *    4. Copia la "URL de la aplicación web" y pégala en index.html
 *       en la variable UPLOAD_URL.
 * ============================================================
 */

/**
 * Recibe la foto (POST) y la guarda en Drive.
 */
function doPost(e) {
  // ID de la carpeta destino en tu Drive (definido aquí para evitar errores de ámbito)
  var FOLDER_ID = "17nyJ4aXUR1FIkBlciD8Vn2eCkMFA0wsa";

  try {
    var body = JSON.parse(e.postData.contents);

    if (!body.data) {
      return json({ status: "error", message: "No se recibió ninguna imagen." });
    }

    var mimeType = body.mimeType || "image/jpeg";
    var filename = body.filename || ("KUVA_" + new Date().getTime() + ".jpg");

    // Decodifica el base64 a un archivo
    var bytes = Utilities.base64Decode(body.data);
    var blob = Utilities.newBlob(bytes, mimeType, filename);

    // Guarda en la carpeta
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var file = folder.createFile(blob);

    // La hace visible por enlace para poder mostrarla en el muro del evento
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) { /* si falla el compartir, igual queda guardada */ }

    return json({
      status: "ok",
      message: "Foto guardada correctamente.",
      fileId: file.getId(),
      fileUrl: file.getUrl()
    });

  } catch (err) {
    return json({ status: "error", message: String(err) });
  }
}

/**
 * GET:
 *   - ?action=list           -> devuelve las fotos de la carpeta (para el muro)
 *   - ?action=list&callback=fn -> lo mismo pero en formato JSONP (evita CORS)
 *   - (sin parámetros)       -> chequeo de salud
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  if (action === "list") {
    return listFiles(e);
  }
  return json({ status: "ok", version: "v3", message: "Coca-Cola x Kuva uploader activo." });
}

/**
 * Lista las imágenes de la carpeta, más recientes primero.
 */
function listFiles(e) {
  var FOLDER_ID = "17nyJ4aXUR1FIkBlciD8Vn2eCkMFA0wsa";
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var it = folder.getFiles();
  var arr = [];

  while (it.hasNext()) {
    var f = it.next();
    if (f.getMimeType().indexOf("image/") !== 0) continue; // solo imágenes
    var id = f.getId();
    arr.push({
      id: id,
      name: f.getName(),
      time: f.getDateCreated().getTime(),
      thumb: "https://drive.google.com/thumbnail?id=" + id + "&sz=w1000",
      full: "https://lh3.googleusercontent.com/d/" + id + "=w1600",
      view: "https://drive.google.com/file/d/" + id + "/view"
    });
  }

  arr.sort(function (a, b) { return b.time - a.time; }); // más nuevas primero

  var payload = { status: "ok", count: arr.length, files: arr };

  // JSONP si viene callback (lo usa el muro para evitar problemas de CORS)
  var cb = e && e.parameter && e.parameter.callback;
  if (cb) {
    return ContentService
      .createTextOutput(cb + "(" + JSON.stringify(payload) + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json(payload);
}

/** Helper: respuesta JSON */
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
