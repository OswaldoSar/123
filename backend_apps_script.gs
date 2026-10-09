/**
 * ZERO · Backend para formulario SISCO publicado en GitHub Pages
 *
 * 1) Crea un proyecto nuevo en https://script.google.com
 * 2) Pega este archivo completo.
 * 3) Ejecuta setupZeroBackend() una sola vez y autoriza.
 * 4) Implementar > Nueva implementación > Aplicación web.
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona
 * 5) Copia la URL terminada en /exec y pégala en CONFIG.ENDPOINT_URL de app.js.
 */

const SHEET_NAME = "Respuestas SISCO";

function setupZeroBackend() {
  const ss = SpreadsheetApp.create("ZERO - Respuestas Inventario SISCO");
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", ss.getId());

  const sh = ss.getActiveSheet();
  sh.setName(SHEET_NAME);

  const headers = buildHeaders_();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#0D1424")
    .setFontColor("#FFFFFF");
  sh.autoResizeColumns(1, headers.length);

  Logger.log("Hoja creada: " + ss.getUrl());
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: "ZERO SISCO" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const raw = e && e.parameter ? e.parameter.payload : "";
    if (!raw) throw new Error("No se recibió payload.");

    const data = JSON.parse(raw);
    const ssId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    if (!ssId) throw new Error("Primero ejecuta setupZeroBackend().");

    const ss = SpreadsheetApp.openById(ssId);
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) sh = ss.insertSheet(SHEET_NAME);

    const headers = buildHeaders_();

    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const row = headers.map(h => {
      if (h === "timestamp_servidor") return new Date();
      return data[h] !== undefined ? data[h] : "";
    });

    sh.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function buildHeaders_() {
  const headers = [
    "timestamp_servidor",
    "fecha_cliente",
    "marca",
    "instrumento",
    "estado",
    "edad",
    "sexo",
    "grado",
    "seccion",
    "p1",
    "p2"
  ];

  for (let i = 3; i <= 31; i++) headers.push("p" + i);
  for (let i = 3; i <= 31; i++) headers.push("score_p" + i);

  headers.push(
    "otra_estresor",
    "otra_estresor_frecuencia",
    "otra_reaccion",
    "otra_reaccion_frecuencia",
    "otra_estrategia",
    "otra_estrategia_frecuencia"
  );

  return headers;
}
