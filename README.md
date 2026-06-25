# Centinela 🛰️

[![CI](https://github.com/jsuarezp-ui/devops-ejercisios/actions/workflows/ci.yml/badge.svg)](https://github.com/jsuarezp-ui/devops-ejercisios/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue)

**Centinela** es un monitor de disponibilidad de servicios web hecho con Node.js.
Vigila una lista de servicios, mide si están **arriba** o **caídos** y su **latencia**,
guarda el historial y expone todo a través de una **API** y una **herramienta de línea de comandos**.

Es mi entrega del módulo **DevOps v3**: en lugar de hacer cuatro ejercicios sueltos,
armé un solo proyecto coherente que cubre **6 de las 8 actividades** propuestas.

---

## 🎯 Actividades de la tarea que cubre este proyecto

| Actividad | Dónde está en el proyecto |
|-----------|---------------------------|
| **Automatización de tareas** | Chequeos programados con `node-cron` (`src/scheduler.js`) y script de backup + limpieza de archivos viejos (`scripts/backup.js`) |
| **Interacción con APIs y servicios web** | El monitor hace peticiones HTTP a los servicios (`src/checker.js`) y además expone su propia API REST con Express (`src/server.js`) |
| **Herramientas de línea de comandos** | CLI `centinela` con los comandos `check`, `stats`, `serve` y `watch` (`bin/centinela.js`) |
| **Monitoreo y recopilación de datos** | El corazón del proyecto: recoge estado, código HTTP y latencia, y calcula uptime promedio (`src/store.js`) |
| **Despliegue de aplicaciones** | `Dockerfile` listo para producción (imagen `node:22-alpine`, capas cacheadas) |
| **Orquestación de contenedores** | `docker-compose.yml` con dos servicios (API + watcher) que comparten un volumen de datos |
| *(Gestión de paquetes y dependencias)* | `package.json` con scripts npm e instalación reproducible (`npm ci`) usada en Docker y en CI |

---

## 🧱 Cómo funciona

```
            ┌─────────────────┐
            │ config/targets  │   lista de servicios a vigilar
            └────────┬────────┘
                     │
   ┌────────────┐    │    ┌──────────────┐
   │  watcher   │────┴───▶│   checker    │  hace fetch a cada servicio
   │  (cron)    │         └──────┬───────┘  (estado, código, latencia)
   └────────────┘                │
                                 ▼
                          ┌─────────────┐
                          │    store    │  guarda historial en data/checks.json
                          └──────┬──────┘
                                 │
              ┌──────────────────┴──────────────────┐
              ▼                                      ▼
       ┌────────────┐                        ┌──────────────┐
       │  CLI       │                        │  API Express │
       │ centinela  │                        │  /health     │
       │ check/stats│                        │  /api/checks │
       └────────────┘                        │  /api/stats  │
                                             └──────────────┘
```

---

## 🚀 Uso rápido

Requiere **Node.js 18 o superior**.

```bash
# 1. Instalar dependencias
npm install

# 2. (opcional) copiar la configuración de ejemplo
cp .env.example .env

# 3. Chequear los servicios una vez
npm run check
```

Salida de ejemplo:

```
● ARRIBA  GitHub       200        180ms  https://api.github.com
● ARRIBA  Google       200        95ms   https://www.google.com
● CAÍDO   Ejemplo      timeout    5001ms https://example.com
```

### Comandos de la CLI

| Comando | Qué hace |
|---------|----------|
| `npm run check` | Chequea todos los servicios una vez y guarda el resultado |
| `npm run stats` | Muestra el uptime y la latencia promedio de cada servicio |
| `npm run watch` | Arranca los chequeos automáticos (cron) |
| `npm start` | Levanta la API de monitoreo |
| `npm run backup` | Crea un backup del historial y borra los viejos |

> También se puede instalar como comando global con `npm link` y usar `centinela check`, `centinela stats`, etc.

---

## 🌐 API

Con la API levantada (`npm start`, por defecto en `http://localhost:3000`):

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Salud del propio servicio de monitoreo |
| `GET` | `/api/checks?limit=50` | Últimos chequeos registrados |
| `GET` | `/api/stats` | Uptime y latencia promedio por servicio |

```bash
curl http://localhost:3000/api/stats
```

---

## 🐳 Docker

```bash
# Construir la imagen
docker build -t centinela .

# Levantar API + watcher juntos
docker compose up --build
```

El `docker-compose.yml` orquesta dos contenedores:

- **api**: expone la API en el puerto `3000`.
- **watcher**: corre los chequeos programados y escribe en el volumen compartido `./data`.

---

## ⚙️ Configuración

Todo se ajusta por variables de entorno (ver `.env.example`):

| Variable | Por defecto | Para qué |
|----------|-------------|----------|
| `PORT` | `3000` | Puerto de la API |
| `CRON` | `*/5 * * * *` | Frecuencia de los chequeos automáticos |
| `TIMEOUT_MS` | `5000` | Tiempo máximo de espera por petición |
| `RETENCION_DIAS` | `7` | Días que se conservan los backups |

Los servicios a vigilar se definen en [`config/targets.json`](config/targets.json).

---

## ✅ Pruebas

Tests con el runner nativo de Node (`node --test`), sin dependencias extra:

```bash
npm test
```

Cubren el chequeo HTTP (`checker`), el cálculo de estadísticas (`store`)
y las rutas de la API (`server`). Corren en cada push gracias a GitHub Actions
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)), que además construye la imagen Docker.

---

## 📂 Estructura

```
.
├── bin/centinela.js        # CLI
├── src/
│   ├── config.js           # configuración y carga de objetivos
│   ├── checker.js          # peticiones HTTP a los servicios
│   ├── store.js            # historial y estadísticas
│   ├── server.js           # API Express
│   └── scheduler.js        # chequeos programados (cron)
├── scripts/backup.js       # automatización: backup + limpieza
├── config/targets.json     # servicios a vigilar
├── test/                   # pruebas
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

Hecho por **Jonas Suárez** — Cincinnatus Institute of Craftsmanship · DevOps v3.
