// =====================================================
// Generador de contraseñas
// Usa crypto.getRandomValues(), el generador aleatorio
// criptográfico del navegador, en lugar de Math.random(),
// que no es seguro para contraseñas.
// =====================================================

const CONJUNTOS = {
  mayusculas: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  minusculas: "abcdefghijklmnopqrstuvwxyz",
  numeros: "0123456789",
  simbolos: "!@#$%^&*()-_=+[]{};:,.<>?/",
};

// Caracteres que se confunden fácilmente al leerlos
const AMBIGUOS = "0O1lI|";

const salida = document.getElementById("contrasena");
const inputLongitud = document.getElementById("longitud");
const valorLongitud = document.getElementById("valor-longitud");
const checkSinAmbiguos = document.getElementById("sin-ambiguos");
const nivelFuerza = document.getElementById("nivel-fuerza");
const textoFuerza = document.getElementById("texto-fuerza");
const aviso = document.getElementById("aviso");

// ---------- Aleatoriedad ----------

// Entero aleatorio en [0, max) sin sesgo.
// Si se hiciera simplemente valor % max, los primeros números saldrían
// algo más a menudo; por eso se descartan los valores del final del rango.
function enteroAleatorio(max) {
  const limite = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limite);
  return buffer[0] % max;
}

function caracterAleatorio(cadena) {
  return cadena[enteroAleatorio(cadena.length)];
}

// Algoritmo de Fisher-Yates: mezcla un array de forma uniforme
function mezclar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = enteroAleatorio(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ---------- Generación ----------

function conjuntosElegidos() {
  const quitarAmbiguos = checkSinAmbiguos.checked;

  return Object.keys(CONJUNTOS)
    .filter((nombre) => document.getElementById(nombre).checked)
    .map((nombre) =>
      quitarAmbiguos
        ? [...CONJUNTOS[nombre]].filter((c) => !AMBIGUOS.includes(c)).join("")
        : CONJUNTOS[nombre]
    );
}

function generar(longitud, conjuntos) {
  const todos = conjuntos.join("");

  // Se garantiza al menos un carácter de cada tipo elegido...
  const caracteres = conjuntos.map(caracterAleatorio);

  // ...y el resto se rellena con caracteres de cualquier tipo
  while (caracteres.length < longitud) {
    caracteres.push(caracterAleatorio(todos));
  }

  // Se mezcla para que los obligatorios no queden siempre al principio
  return mezclar(caracteres).join("");
}

// ---------- Fuerza ----------

// Entropía en bits: longitud × log2(número de caracteres posibles).
// Indica cuántos intentos haría falta probar por fuerza bruta (2^bits).
function calcularFuerza(longitud, tamanoAlfabeto) {
  const bits = longitud * Math.log2(tamanoAlfabeto);

  if (bits < 40) return { porcentaje: 25, texto: "Débil", color: "var(--debil)", bits };
  if (bits < 60) return { porcentaje: 50, texto: "Media", color: "var(--media)", bits };
  if (bits < 80) return { porcentaje: 75, texto: "Fuerte", color: "var(--fuerte)", bits };
  return { porcentaje: 100, texto: "Muy fuerte", color: "var(--muy-fuerte)", bits };
}

// ---------- Interfaz ----------

function mostrarAviso(texto, esError = false) {
  aviso.textContent = texto;
  aviso.classList.toggle("error", esError);
}

function actualizar() {
  const longitud = parseInt(inputLongitud.value, 10);
  valorLongitud.textContent = longitud;

  const conjuntos = conjuntosElegidos();

  if (conjuntos.length === 0) {
    salida.textContent = "";
    nivelFuerza.style.width = "0";
    textoFuerza.textContent = "";
    mostrarAviso("Elige al menos un tipo de carácter.", true);
    return;
  }

  salida.textContent = generar(longitud, conjuntos);

  const fuerza = calcularFuerza(longitud, conjuntos.join("").length);
  nivelFuerza.style.width = `${fuerza.porcentaje}%`;
  nivelFuerza.style.background = fuerza.color;
  textoFuerza.textContent = `${fuerza.texto} (${Math.round(fuerza.bits)} bits)`;

  mostrarAviso("");
}

async function copiar() {
  const texto = salida.textContent;
  if (!texto) return;

  try {
    await navigator.clipboard.writeText(texto);
    mostrarAviso("✔ Copiada al portapapeles");
  } catch {
    // Si el navegador no permite el portapapeles, se selecciona el texto
    // para que el usuario pueda copiarlo con Ctrl+C
    const rango = document.createRange();
    rango.selectNodeContents(salida);
    const seleccion = window.getSelection();
    seleccion.removeAllRanges();
    seleccion.addRange(rango);
    mostrarAviso("No se pudo copiar automáticamente. Pulsa Ctrl+C.", true);
  }
}

// ---------- Eventos ----------

document.getElementById("opciones").addEventListener("input", actualizar);
document.getElementById("regenerar").addEventListener("click", actualizar);
document.getElementById("copiar").addEventListener("click", copiar);

actualizar();
