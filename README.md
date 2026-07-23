# Comuni-red Frontend

Frontend React + Vite para Comuni-red.

## Desarrollo local

1. Levanta el backend offline desde `../Comunired-Back`:

```bash
npm start
```

El backend local escucha en `http://localhost:4000`.

2. Levanta el frontend:

```bash
npm run dev
```

En desarrollo, el frontend usa `/api` y Vite lo proxyea a `http://localhost:4000`. No necesitas apuntar a API Gateway para trabajar local.

## Variables de entorno

Copia `.env.example` a `.env.local` solo si necesitas cambiar el comportamiento por defecto.

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:4000
```

Para producción, define `VITE_API_BASE_URL` con la URL real del API Gateway antes de construir.

## Verificación

```bash
npm run build
```
