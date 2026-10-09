# ZERO · Inventario SISCO para GitHub Pages

Sitio web estático y responsivo con la identidad visual de **ZERO**.

## Archivos

- `index.html` — formulario web.
- `styles.css` — diseño y paleta ZERO.
- `app.js` — lógica, validación, navegación, borrador local y envío.
- `backend_apps_script.gs` — backend opcional para almacenar respuestas en Google Sheets.
- `assets/zero-logo.png` — logotipo proporcionado.
- `README.md` — estas instrucciones.

## 1. Probar localmente

Puedes abrir `index.html` en el navegador.

Sin configurar el backend, el formulario funciona en **modo demostración**:
- valida las respuestas;
- aplica la lógica de filtro del ítem 1;
- guarda un borrador local;
- completa el flujo;
- no envía datos a internet.

## 2. Configurar Google Sheets como base de respuestas

1. Abre `https://script.google.com`.
2. Crea un proyecto nuevo.
3. Pega el contenido de `backend_apps_script.gs`.
4. Ejecuta `setupZeroBackend()` una sola vez.
5. Autoriza los permisos.
6. En **Registro de ejecución** aparecerá la URL de la hoja creada.
7. Ve a **Implementar > Nueva implementación > Aplicación web**.
8. Ejecutar como: **Yo**.
9. Acceso: **Cualquier persona**.
10. Implementa y copia la URL que termina en `/exec`.

Abre `app.js` y reemplaza:

```js
ENDPOINT_URL: "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT",
```

por:

```js
ENDPOINT_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
```

## 3. Publicar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube todos los archivos conservando la carpeta `assets`.
3. Ve a **Settings > Pages**.
4. Source: **Deploy from a branch**.
5. Branch: `main`, carpeta `/root`.
6. Guarda.
7. GitHub mostrará la URL pública del formulario.

## Escalas

### Ítem 1
Pregunta filtro:
- Sí → continúa.
- No → envía/finaliza.

### Ítem 2
Escala visual de 1 a 5:
- 1 = poco.
- 5 = mucho.

### Ítems 3–31
En pantalla:
1. Nunca
2. Rara vez
3. Algunas veces
4. Casi siempre
5. Siempre

En la hoja se conservan los valores visibles `p3...p31` (1–5) y se calculan también
`score_p3...score_p31` (0–4) para análisis estadístico.

## Importante sobre privacidad

GitHub Pages es público. No coloques claves, contraseñas, tokens o información privada
directamente en JavaScript. El backend de Apps Script incluido no expone credenciales.
