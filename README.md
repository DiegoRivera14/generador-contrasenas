# 🔐 Generador de contraseñas

Generador de contraseñas seguras hecho con **HTML, CSS y JavaScript**. Todo se calcula en el navegador: ninguna contraseña sale del equipo.

🔗 **Demo en vivo:** https://diegorivera14.github.io/generador-contrasenas/

## Funcionalidades

- Longitud configurable de 6 a 64 caracteres.
- Mayúsculas, minúsculas, números y símbolos a elegir.
- Opción para evitar caracteres que se confunden al leerlos (`0`/`O`, `1`/`l`/`I`).
- Garantiza al menos un carácter de cada tipo elegido.
- Indicador de fuerza basado en la entropía (bits).
- Botón para copiar al portapapeles.

## Cómo usarlo

Puedes probarlo directamente en la [demo](https://diegorivera14.github.io/generador-contrasenas/), o descargar el repositorio y abrir `index.html` en el navegador (no necesita instalación).

```bash
git clone https://github.com/DiegoRivera14/generador-contrasenas.git
cd generador-contrasenas
# abre index.html en tu navegador
```

## Estructura

```
generador-contrasenas/
├── index.html   # Resultado, indicador de fuerza y opciones
├── style.css    # Estilos
└── script.js    # Generación aleatoria, cálculo de fuerza y copiado
```

## Cómo funciona

### Aleatoriedad segura

`Math.random()` no está pensado para seguridad: su salida se puede llegar a predecir. Este generador usa `crypto.getRandomValues()`, la fuente aleatoria criptográfica del navegador.

`enteroAleatorio(max)` obtiene un entero de 32 bits y lo reduce con `% max`. Hacer solo eso introduce un pequeño sesgo, porque 2³² no suele ser múltiplo de `max` y los primeros valores salen algo más a menudo. Para evitarlo, se descartan los números que caen en el último tramo incompleto y se pide otro (*rejection sampling*).

### Generación

`generar(longitud, conjuntos)`:

1. Toma un carácter aleatorio de cada conjunto elegido (así hay al menos uno de cada tipo).
2. Rellena hasta la longitud pedida con caracteres de todos los conjuntos juntos.
3. Mezcla el resultado con el algoritmo de **Fisher-Yates**, para que los caracteres obligatorios no queden siempre al principio.

Si está marcada la opción de evitar caracteres parecidos, `conjuntosElegidos()` los quita de cada conjunto antes de generar.

### Fuerza

La fuerza se mide como entropía: `bits = longitud × log₂(tamaño del alfabeto)`. Una contraseña de *n* bits necesita, en el peor caso, 2ⁿ intentos para adivinarse por fuerza bruta.

| Bits | Nivel |
|---|---|
| < 40 | Débil |
| 40–59 | Media |
| 60–79 | Fuerte |
| ≥ 80 | Muy fuerte |

### Copiar

Se usa `navigator.clipboard.writeText()`. Si el navegador no lo permite, se selecciona el texto para que el usuario lo copie con `Ctrl+C`.

## Autor

Diego Rivera — [GitHub](https://github.com/DiegoRivera14)
