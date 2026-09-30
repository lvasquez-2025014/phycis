# ⚛️ Physics Whiteboard (Pizarra Digital Interactiva para Física y Matemáticas)

Una pizarra digital interactiva de alto rendimiento inspirada en Miro, diseñada específicamente para la enseñanza, resolución de problemas y diagramación de **Física (Movimiento Unidimensional / MRU)** y **Matemáticas**.

Incluye reconocimiento inteligente de trazos a mano alzada para todo el alfabeto griego ($\Sigma, \sigma, \theta, \alpha, \psi, \phi, \Delta, \omega, \beta, \mu, \pi$, etc.), resolución automática de ecuaciones y un catálogo completo de plantillas curriculares para el temario escolar de MRU.

---

## 🏗️ Arquitectura por Componentes

El proyecto sigue una arquitectura modular y desacoplada basada en componentes de React y servicios puros de JavaScript. Cada módulo tiene una responsabilidad única y bien delimitada para facilitar el mantenimiento y la extensibilidad por parte de cualquier desarrollador.

```
src/
├── components/
│   ├── canvas/                  # Motor de dibujo y elementos del lienzo
│   │   ├── CanvasBoard.jsx      # Componente principal del Canvas HTML5 infinito (zoom, pan, eventos pointer)
│   │   └── ContextualToolbar.jsx# Barra flotante contextual al seleccionar elementos
│   ├── controls/                # Controles de navegación y estado global
│   │   ├── TopBar.jsx           # Cabecera superior con estado de sesión y acciones
│   │   ├── ZoomControls.jsx     # Controles de zoom porcentual, zoom-in, zoom-out y toggle de minimapa
│   │   ├── Minimap.jsx          # Radar interactivo en miniatura del lienzo
│   │   └── ToastContainer.jsx   # Sistema de notificaciones flotantes
│   ├── modals/                  # Modales interactivos de la aplicación
│   │   ├── TemplatesModal.jsx   # Explorador de plantillas escolares del temario MRU
│   │   ├── ShareModal.jsx       # Modal para compartir enlace de colaboración pública
│   │   └── SaveBoardModal.jsx   # Modal de exportación y guardado persistente
│   └── toolbar/                 # Barra lateral izquierda con menús flyout desacoplados
│       ├── LeftToolbar.jsx      # Dock principal de herramientas
│       ├── PenFlyout.jsx        # Selector de lápices: Normal, Resaltador y Dibujo Mágico
│       ├── ShapesFlyout.jsx     # Selector de figuras geométricas, flechas y conectores
│       ├── StickyFlyout.jsx     # Notas adhesivas con paleta de colores
│       ├── GreekSymbolsFlyout.jsx# Buscador e inserción rápida de letras griegas y símbolos
│       └── TemplatesFlyout.jsx  # Acceso directo al temario de Movimiento Unidimensional
├── data/                        # Datasets estructurados
│   ├── greekSymbols.js          # Catálogo bilingüe de 73 letras griegas y operadores matemáticos
│   └── mruTemplates.js          # Temario completo de MRU con generadores de pizarras
├── services/                    # Motores y algoritmos desacoplados de la interfaz
│   ├── strokeRecognition.js    # Clasificador $1-recognizer, plantillas canónicas y geometría
│   ├── canvasRenderers.js      # Renderizadores 2D puros (cuadrícula Miro, trazos, figuras, texto)
│   └── mathSolver.js           # Solucionador de ecuaciones lineales y operaciones aritméticas
├── App.jsx                      # Orquestador principal de estado global (historial, herramientas)
├── App.css / index.css          # Estilos de diseño con tokens Miro y modo glassmorphism
└── main.jsx                     # Punto de entrada de la aplicación Vite
```

---

## 🚀 Instalación y Puesta en Marcha

Para clonar y ejecutar este proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone -b lvasquez-2025014 https://github.com/lvasquez-2025014/phycis.git
cd phycis
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:5173/`.

### 4. Compilar para producción
```bash
npm run build
```
Genera la compilación optimizada en la carpeta `dist/`.

---

## 🌟 Funcionalidades Principales

### 1. 🪄 Dibujo Mágico con Reconocimiento de Símbolos Griegos
- **Reconocimiento inteligente**: Transforma trazos a mano alzada en texto formateado o figuras geométricas.
- **Soporte exhaustivo del alfabeto griego**:
  - $\Sigma$ (Sigma mayúscula) y $\sigma$ (Sigma minúscula)
  - $\theta$ (Theta), $\alpha$ (Alfa), $\pi$ (Pi)
  - $\psi$ / $\Psi$ (Psi trident / horqueta) vs $\phi$ / $\Phi$ (Phi oval cruzado)
  - $\Delta$ / $\delta$ (Delta mayúscula y minúscula)
  - $\omega$ / $\Omega$ (Omega), $\beta$ (Beta), $\mu$ (Mu), etc.
- **Detección de variables y caracteres**: Reconocimiento de $y$, $x$, números del 0 al 9 y operadores ($+$, $-$, $\times$, $/$, $=$).
- **Auto-digitalización en tiempo real**: Transforma automáticamente los trazos 1.5 segundos tras finalizar el dibujo, o mediante el botón flotante *Digitalizar ya*.

### 2. 🧮 Solucionador Matemático Integrado
- Resuelve automáticamente ecuaciones lineales escritas a mano (ej. `2x + 3 = 5`, `2θ = 6`, `3α - 1 = 8`).
- Calcula operaciones aritméticas inmediatas (`12 * 4 =`, `50 / 2 =`, `15 + 35 =`).
- Muestra el resultado resaltado en color esmeralda dentro del bloque de texto.

### 3. 📚 Plantillas Curriculares de MRU (Movimiento Unidimensional)
Accede desde la barra lateral o el botón de plantillas para cargar inmediatamente pizarras con esquemas teóricos, fórmulas y ejercicios resueltos de:
1. **MRU - Fundamentos**: Fórmulas $v = d/t$, unidades SI y gráficas posición-tiempo.
2. **MRUV - Aceleración Constante**: Las 4 ecuaciones maestras del movimiento uniformemente variado.
3. **Caída Libre**: Ecuaciones bajo la gravedad terrestre ($g = 9.8\text{ m/s}^2$).
4. **Laboratorio PRACB1**: Guía de práctica experimental con tabla de mediciones y cálculo de errores.
5. **Tiro Vertical**: Fórmulas de altura máxima ($h_{\max}$) y tiempo de vuelo ($t_{\text{vuelo}}$).
6. **Evaluación Parcial PC1**: 4 ejercicios prácticos tipo examen.
7. **Evaluación Bimestral**: Repaso completo para el examen bimestral con problemas combinados.
8. **Plan Previsto (Cronograma)**: Calendario completo de semanas escolares, ponderaciones y entregas.

### 4. 🎨 Herramientas de Dibujo y Diagramación
- **Lápices**: Lápiz normal, Resaltador fluorescente y Dibujo Mágico con selector de grosores y colores.
- **Borradores**: Borrador de trazo completo y Borrador de pincel continuo.
- **Figuras geométricas**: Rectángulos, Círculos, Triángulos, Rombos, Flechas rectas, Flechas codo, Flechas de bloque y Líneas divisoras.
- **Notas adhesivas (Sticky Notes)**: Con 6 colores pastel y edición de texto en vivo.
- **Lazo de selección**: Selecciona múltiples elementos dibujando una curva alrededor de ellos.
- **Lienzo infinito**: Zoom suave centrado en el cursor (Ctrl + rueda del mouse), paneo con botón derecho/medio o herramienta de mano.
- **Deshacer / Rehacer**: Historial completo compatible con atajos de teclado (`Ctrl+Z`, `Ctrl+Y`).
- **Exportación**: Guarda tu pizarra como imagen PNG de alta resolución o archivo JSON de respaldo.

---

## 🛠️ Guía para Desarrolladores

### ¿Cómo agregar una nueva plantilla?
1. Abre [src/data/mruTemplates.js](file:///src/data/mruTemplates.js).
2. Añade la definición en el array `MRU_SUBTOPICS` con su id, título, descripción y badge.
3. Agrega su caso correspondiente dentro de la función `getMruTemplate(topicId)` retornando el array de elementos del lienzo (`sticky`, `rectangle`, `text`, `arrow`).

### ¿Cómo registrar nuevos símbolos matemáticos?
1. Abre [src/data/greekSymbols.js](file:///src/data/greekSymbols.js).
2. Agrega el símbolo al array `GREEK_SYMBOLS` especificando su `symbol`, `name`, `category` y `keywords` para habilitar su búsqueda.

### ¿Cómo extender los reconocedores de trazos?
1. Abre [src/services/strokeRecognition.js](file:///src/services/strokeRecognition.js).
2. Si es un trazo único, añade una plantilla normalizada en `CANONICAL_TEMPLATES` o crea una función geométrica como `isSingleStroke[Nombre]`.
3. Invoca tu validador dentro de `classifyCharacterCluster()`.

---

## 📄 Licencia

Proyecto desarrollado con fines educativos para el aprendizaje y visualización interactiva de conceptos de física y matemáticas.
