/**
 * ZERO · Inventario SISCO
 * Configura ENDPOINT_URL con la URL de tu Web App de Google Apps Script.
 * El backend incluido en backend_apps_script.gs almacena respuestas en Google Sheets.
 */

const CONFIG = {
  ENDPOINT_URL: "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT",
  SAVE_DRAFT: true
};

const SCALE_LABELS = ["Nunca", "Rara vez", "Algunas veces", "Casi siempre", "Siempre"];

const sections = {
  estresores: [
    [3, "La competencia con los compañeros del grupo."],
    [4, "Sobrecarga de tareas y trabajos escolares."],
    [5, "La personalidad y el carácter del profesor."],
    [6, "Las evaluaciones de los profesores (exámenes, ensayos, trabajos de investigación, etc.)."],
    [7, "El tipo de trabajo que te piden los profesores (consulta de temas, fichas de trabajo, ensayos, mapas conceptuales, etc.)."],
    [8, "No entender los temas que se abordan en la clase."],
    [9, "Participación en clase (responder a preguntas, exposiciones, etc.)."],
    [10, "Tiempo limitado para hacer el trabajo."]
  ],
  fisicas: [
    [11, "Trastornos en el sueño (insomnio o pesadillas)."],
    [12, "Fatiga crónica (cansancio permanente)."],
    [13, "Dolores de cabeza o migrañas."],
    [14, "Problemas de digestión, dolor abdominal o diarrea."],
    [15, "Rascarse, morderse las uñas, frotarse, etc."],
    [16, "Somnolencia o mayor necesidad de dormir."]
  ],
  psicologicas: [
    [17, "Inquietud (incapacidad de relajarse y estar tranquilo)."],
    [18, "Sentimientos de depresión y tristeza (decaído)."],
    [19, "Ansiedad, angustia o desesperación."],
    [20, "Problemas de concentración."],
    [21, "Sentimiento de agresividad o aumento de irritabilidad."]
  ],
  comportamentales: [
    [22, "Conflictos o tendencia a polemizar o discutir."],
    [23, "Aislamiento de los demás."],
    [24, "Desgano para realizar las labores escolares."],
    [25, "Aumento o reducción del consumo de alimentos."]
  ],
  afrontamiento: [
    [26, "Habilidad asertiva (defender nuestras preferencias, ideas o sentimientos sin dañar a otros)."],
    [27, "Elaboración de un plan y ejecución de sus tareas."],
    [28, "Elogios a sí mismo."],
    [29, "La religiosidad (oraciones o asistencia a misa)."],
    [30, "Búsqueda de información sobre la situación."],
    [31, "Ventilación y confidencias (verbalización de la situación que preocupa)."]
  ]
};

const form = document.getElementById("siscoForm");
const formCard = document.getElementById("formCard");
const successCard = document.getElementById("successCard");
const successText = document.getElementById("successText");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const submitBtn = document.getElementById("submitBtn");
const restartBtn = document.getElementById("restartBtn");
const errorBox = document.getElementById("formError");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const stepLabel = document.getElementById("stepLabel");
const p2Block = document.getElementById("p2Block");

let currentStep = 1;
const totalSteps = 7;

/* ---------- Render ---------- */

function buildScale(name, optional = false) {
  return SCALE_LABELS.map((label, index) => {
    const visual = index + 1;
    // Valor almacenado para P3-P31: 0–4, siguiendo la pauta de puntuación.
    // En pantalla se conserva la escala original 1–5.
    const stored = visual;
    return `
      <label class="scale-option" title="${visual} · ${label}">
        <input type="radio" name="${name}" value="${stored}" ${optional ? "" : "required"}>
        <span>${visual}</span>
      </label>`;
  }).join("");
}

function buildLikertItem(number, text) {
  return `
    <div class="likert-row">
      <div class="likert-text">
        <span class="item-no">${number}</span>
        <span>${text}</span>
      </div>
      <div class="likert-scale" aria-label="Escala para ítem ${number}">
        ${SCALE_LABELS.map((label, index) => `
          <label class="likert-choice" title="${index + 1} · ${label}">
            <input type="radio" name="p${number}" value="${index + 1}" required>
            <span>${index + 1}</span>
          </label>
        `).join("")}
      </div>
    </div>`;
}

function renderQuestions() {
  Object.entries(sections).forEach(([id, items]) => {
    document.getElementById(id).innerHTML = items.map(([n, t]) => buildLikertItem(n, t)).join("");
  });

  document.querySelectorAll(".mini-scale").forEach(el => {
    el.innerHTML = buildScale(el.dataset.name, el.dataset.optional === "true");
  });

  document.querySelector(".scale-five").innerHTML = buildScale("p2");
}

renderQuestions();

/* ---------- Navigation ---------- */

function updateStepUI() {
  document.querySelectorAll(".step").forEach(step => {
    step.classList.toggle("active", Number(step.dataset.step) === currentStep);
  });

  const percent = Math.round((currentStep / totalSteps) * 100);
  progressBar.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
  stepLabel.textContent = `Paso ${currentStep} de ${totalSteps}`;

  prevBtn.style.visibility = currentStep === 1 ? "hidden" : "visible";
  nextBtn.classList.toggle("hidden", currentStep === totalSteps);
  submitBtn.classList.toggle("hidden", currentStep !== totalSteps);
  errorBox.classList.remove("show");
  window.scrollTo({ top: Math.max(0, formCard.offsetTop - 18), behavior: "smooth" });

  const p1 = form.querySelector('input[name="p1"]:checked')?.value;
  if (currentStep === 2) p2Block.style.display = p1 === "No" ? "none" : "";
}

function visibleRequiredInputs() {
  const step = document.querySelector(`.step[data-step="${currentStep}"]`);
  return [...step.querySelectorAll("[required]")].filter(el => el.offsetParent !== null);
}

function validateCurrentStep() {
  errorBox.classList.remove("show");

  // Si P1 = No, P2 no se valida.
  if (currentStep === 2) {
    const p1 = form.querySelector('input[name="p1"]:checked');
    if (!p1) return showError("Selecciona Sí o No para continuar.");
    if (p1.value === "No") return true;
  }

  const required = visibleRequiredInputs();
  const radioNames = new Set();

  for (const el of required) {
    if (el.type === "radio") {
      radioNames.add(el.name);
    } else if (el.type === "checkbox") {
      if (!el.checked) return showError("Confirma la participación voluntaria para enviar.");
    } else if (!el.value.trim()) {
      el.focus();
      return showError("Completa todos los campos obligatorios antes de continuar.");
    }
  }

  for (const name of radioNames) {
    if (!form.querySelector(`input[name="${CSS.escape(name)}"]:checked`)) {
      return showError("Responde todos los ítems de esta sección antes de continuar.");
    }
  }

  return true;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("show");
  errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
  return false;
}

nextBtn.addEventListener("click", async () => {
  if (!validateCurrentStep()) return;

  const p1 = form.querySelector('input[name="p1"]:checked')?.value;
  if (currentStep === 2 && p1 === "No") {
    await submitEarlyExit();
    return;
  }

  if (currentStep < totalSteps) {
    currentStep++;
    updateStepUI();
    saveDraft();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep--;
    updateStepUI();
  }
});

form.addEventListener("change", e => {
  if (e.target.name === "p1") {
    p2Block.style.display = e.target.value === "No" ? "none" : "";
  }
  saveDraft();
});
form.addEventListener("input", saveDraft);

/* ---------- Data ---------- */

function formDataToObject() {
  const fd = new FormData(form);
  const obj = {};
  for (const [key, value] of fd.entries()) obj[key] = value;

  obj.marca = "Zero";
  obj.instrumento = "Inventario SISCO del Estrés Académico (31 ítems)";
  obj.fecha_cliente = new Date().toISOString();
  obj.estado = obj.p1 === "No" ? "Finalizado por filtro P1" : "Completo";

  // Puntajes 0–4 para P3–P31, además de conservar respuestas visibles 1–5.
  for (let i = 3; i <= 31; i++) {
    if (obj[`p${i}`] !== undefined && obj[`p${i}`] !== "") {
      obj[`score_p${i}`] = String(Number(obj[`p${i}`]) - 1);
    }
  }

  return obj;
}

async function sendToBackend(payload) {
  if (!CONFIG.ENDPOINT_URL || CONFIG.ENDPOINT_URL.includes("PEGA_AQUI")) {
    // Modo demostración: permite probar la web antes de configurar Apps Script.
    console.table(payload);
    return { demo: true };
  }

  const body = new URLSearchParams();
  body.set("payload", JSON.stringify(payload));

  await fetch(CONFIG.ENDPOINT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body
  });

  return { demo: false };
}

async function submitEarlyExit() {
  nextBtn.disabled = true;
  nextBtn.textContent = "Enviando…";
  try {
    const payload = formDataToObject();
    const result = await sendToBackend(payload);
    finish(result.demo
      ? "La respuesta quedó en modo demostración. Configura la URL de Apps Script en app.js para guardarla en Google Sheets."
      : "Tu respuesta fue registrada. Como marcaste “No” en la pregunta filtro, el cuestionario ha finalizado.");
  } catch (err) {
    console.error(err);
    showError("No se pudo enviar la respuesta. Verifica la conexión e inténtalo nuevamente.");
  } finally {
    nextBtn.disabled = false;
    nextBtn.textContent = "Continuar →";
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  if (!validateCurrentStep()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando…";

  try {
    const payload = formDataToObject();
    const result = await sendToBackend(payload);
    finish(result.demo
      ? "Formulario completado en modo demostración. Configura la URL de Apps Script en app.js para almacenar las respuestas."
      : "Tus respuestas fueron registradas correctamente. Gracias por tu participación.");
  } catch (err) {
    console.error(err);
    showError("No se pudo enviar la respuesta. Verifica la conexión e inténtalo nuevamente.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar respuestas";
  }
});

function finish(message) {
  if (CONFIG.SAVE_DRAFT) localStorage.removeItem("zero_sisco_draft");
  successText.textContent = message;
  formCard.classList.add("hidden");
  successCard.classList.remove("hidden");
  successCard.scrollIntoView({ behavior: "smooth", block: "center" });
}

restartBtn.addEventListener("click", () => {
  form.reset();
  currentStep = 1;
  successCard.classList.add("hidden");
  formCard.classList.remove("hidden");
  p2Block.style.display = "";
  updateStepUI();
});

/* ---------- Draft ---------- */

function saveDraft() {
  if (!CONFIG.SAVE_DRAFT) return;
  const payload = formDataToObject();
  delete payload.confirmacion;
  localStorage.setItem("zero_sisco_draft", JSON.stringify({ step: currentStep, data: payload }));
}

function restoreDraft() {
  if (!CONFIG.SAVE_DRAFT) return;
  const raw = localStorage.getItem("zero_sisco_draft");
  if (!raw) return;

  try {
    const draft = JSON.parse(raw);
    Object.entries(draft.data || {}).forEach(([name, value]) => {
      const elements = [...form.querySelectorAll(`[name="${CSS.escape(name)}"]`)];
      if (!elements.length) return;

      elements.forEach(el => {
        if (el.type === "radio" || el.type === "checkbox") {
          el.checked = el.value === value;
        } else {
          el.value = value;
        }
      });
    });
    currentStep = Math.min(Math.max(Number(draft.step) || 1, 1), totalSteps);
  } catch (_) {}
}

restoreDraft();
updateStepUI();
