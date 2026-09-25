# ⚡ Laboratorio de Física Fundamental & Simulador de Dinámica (D.C.L.)

Plataforma educativa interactiva para la enseñanza y experimentación de la **Segunda Ley de Newton**, equilibrio estático, fricción cinética y diagramas de cuerpo libre (D.C.L.) sincronizados en tiempo real.

---

## 🚀 Características Principales

- **Simulación Dinámica y Equilibrio:**
  - Resolución analítica de la Segunda Ley de Newton: $\Sigma F_x = m \cdot a$, $\Sigma F_y = 0$.
  - Transición fluida entre equilibrio estático ($a = 0$, $T = \Sigma F_x - f_s$) y movimiento acelerado ($T = 0$, $a = (\Sigma F_x - f_k) / m$).
- **Movimiento Físico de la Cuerda con la Masa:**
  - Al cortar la cuerda o iniciar la simulación, el segmento de tensión se secciona dejando un muñón en la pared y **trasladando el resto de la cuerda físicamente junto con el bloque** a lo largo del suelo horizontal.
- **Control y Ajuste Directo de la Aceleración ($a$):**
  - Ajuste continuo mediante control numérico y deslizador (*slider* de $0$ a $30\text{ m/s}^2$).
  - Sincronización bidireccional automática: ajustar la aceleración recalcula la fuerza requerida $F = m \cdot a + f_k$ en el bloque y en el plano cartesiano.
- **Límite de Tiempo de Animación Configurable:**
  - Selector con botones rápidos (**1s**, **2s**, **3s**, **5s**, **10s**, **∞**) e ingreso numérico personalizado.
  - Detención precisa en $t = t_{\text{limit}}$ con telemetría en vivo ($t$, $x$, $v$, $a$) y animación de celebración (*confetti*).
- **Diagrama de Cuerpo Libre (D.C.L.) Cartesiano:**
  - Ejes estándar verdes ($+x, -x, +y, -y$).
  - Vectores proyectados automáticamente: Normal ($N$), Peso ($W$), Tensión ($T$) o fricción cinética ($f_k$), y fuerzas aplicadas ($F$).

---

## 🏛️ Arquitectura de Software

El proyecto está diseñado bajo estándares modernos de ingeniería de software:

### 1. Frontend (Cliente)
- **Tecnologías:** React 19, TypeScript, Vite, Framer Motion, Lucide React, Canvas Confetti.
- **Patrón de Diseño:** **Arquitectura Basada en Funcionalidades (*Feature-Based Architecture*)**.
  - `features/simulation`: Bucle de integración a 60 FPS, telemetría y barra de controles flotante con física de resortes (*spring physics*).
  - `features/physics-engine`: Algoritmos de cálculo de Newton, cinemática y servicios de comunicación con el backend.
  - `features/whiteboard`: Pizarrón interactivo, capas SVG y renderizadores desacoplados.
  - `features/dcl`: Diagrama cartesiano de cuerpo libre sincronizado.
  - `features/inspector`: Inspector de propiedades, control de aceleración y desglose de ecuaciones teóricas.
  - `features/presets`: Plantillas de escenarios prediseñados.

### 2. Backend (Servidor)
- **Tecnologías:** Node.js, Express, TypeScript / ESM.
- **Patrón de Diseño:** **Arquitectura en Capas (*Layered Architecture*)**.
  - **Capa de Controladores (*Controllers*):** Validación y manejo de peticiones HTTP.
  - **Capa de Negocio / Servicios (*Services*):** Resolución de sistemas de fuerzas, proyecciones cinemáticas y gestión de plantillas.
  - **Capa de Acceso a Datos (*Repositories*):** Repositorio en memoria (*In-Memory Scenario Repository*) para escenarios sin requerir base de datos externa.
  - **Capa de Rutas y Middlewares:** Enrutamiento modular `/api/physics` y `/api/scenarios` con registro de peticiones y control de excepciones.

---

## 🛠️ Instalación y Uso

Este proyecto utiliza **pnpm** como gestor de paquetes en un monorepo workspace:

```bash
# 1. Clonar el repositorio
git clone https://github.com/lvasquez-2025014/EXpriamos67xd.git

# 2. Instalar dependencias con pnpm
pnpm install

# 3. Iniciar entorno de desarrollo (Frontend + Backend en paralelo)
pnpm dev

# O iniciar servicios de forma independiente:
pnpm dev:client  # Frontend en http://localhost:5173
pnpm dev:server  # Backend en http://localhost:3001/api
```

---

## ⌨️ Atajos de Teclado
- <kbd>Espacio</kbd>: Iniciar / Pausar Simulación
- <kbd>F</kbd>: Agregar nueva fuerza aplicada al bloque
- <kbd>C</kbd>: Cortar / Reconectar cuerda de tensión
- <kbd>R</kbd>: Reiniciar simulación a posiciones iniciales
