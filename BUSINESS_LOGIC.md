# BUSINESS_LOGIC.md - Orbita


## 1. Problema de Negocio
**Dolor:** Los negocios chicos de atención con turnos (clubes, gimnasios, pequeñas clínicas, talleres mecánicos, centros de estética) manejan clientes, turnos, cobros y cuotas en cuadernos, Excel y chats de WhatsApp sueltos. Los CRM del mercado son genéricos, en inglés o demasiado complejos para alguien que no es "de tecnología".
**Costo actual:** Turnos olvidados (ausentismo), cuotas que vencen sin cobrarse, deudas que nadie sigue y horas por semana armando mensajes y cuentas a mano.

## 2. Solución
**Propuesta de valor:** Un CRM visual y adaptable que se configura solo según el rubro y deja ver de un vistazo, en widgets flotantes, los turnos de hoy, la caja y quién debe, para dueños y recepcionistas sin conocimientos técnicos.

**Flujo principal (Happy Path):**
1. El dueño elige su rubro y escribe el nombre del negocio (el sistema adapta vocabulario, campos, servicios y módulos).
2. Carga o importa sus clientes (paciente / socio / cliente / vehículo, según rubro).
3. Agenda turnos en un calendario simple y manda el recordatorio por WhatsApp con un toque.
4. Registra cobros, cuotas y trabajos; el inicio le muestra qué hacer hoy y quién le debe.

## 3. Usuario Objetivo
**Rol:** Dueño/a o recepcionista de un negocio de 1 a 15 personas, que usa el celular todo el día pero no es técnico.
**Contexto:** Atiende al público mientras usa el sistema: necesita acciones de 1-2 toques, letras grandes, cero jerga y nada que se rompa.

## 4. Arquitectura de Datos
**Input:** Datos del negocio y rubro, clientes (con campos propios del rubro), servicios, planes/membresías, turnos, cobros y gastos, órdenes de trabajo.

**Output:** Inicio con widgets (turnos de hoy, caja, deudores, vencimientos, trabajos en curso, resumen del mes), mensajes de WhatsApp prearmados, historial por cliente.

**Storage (Supabase tables sugeridas, fase 2):**
- `businesses`: negocio, rubro, moneda, preferencias (tema, color, widgets)
- `members`: usuarios del negocio y su rol
- `clients`: clientes con `custom_fields jsonb`
- `services`: servicios con precio y duración
- `appointments`: turnos con estado
- `payments`: ingresos y gastos, pagado/pendiente
- `plans` / `memberships`: cuotas mensuales y paquetes de sesiones
- `work_orders`: órdenes de trabajo con estado
Todas con `business_id` y RLS por miembro del negocio.

## 5. KPI de Exito
**Metrica principal:** Una persona no técnica configura su negocio, carga un cliente y agenda un turno con recordatorio de WhatsApp en menos de 3 minutos, sin ayuda.

## 6. Especificacion Tecnica (Para el Agente)

### Features a Implementar (Feature-First)
```
src/features/
├── onboarding/   # Asistente de bienvenida: rubro, nombre, moneda, datos demo
├── dashboard/    # Inicio con widgets flotantes reordenables y ocultables
├── clients/      # Fichas, búsqueda, historial, campos por rubro
├── agenda/       # Calendario semanal/diario, estados, recordatorio WhatsApp
├── cash/         # Cobros, gastos, deudas, caja del día y del mes
├── plans/        # Servicios, planes, membresías y sesiones
├── workorders/   # Órdenes de trabajo en tablero (taller y afines)
└── settings/     # Negocio, tema claro/oscuro, color, mensajes de WhatsApp
```

### Stack Confirmado
- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 3.4
- **Datos (fase 1):** Zustand persistido en el navegador (demo navegable)
- **Backend (fase 2):** Supabase (Auth + Database + RLS)
- **Validacion:** Zod
- **Mercado:** Latinoamérica, español neutro, moneda configurable

### Proximos Pasos
1. [x] Setup proyecto base
2. [x] Demo navegable con todos los módulos
3. [x] Supabase: esquema + RLS por negocio (supabase/migrations) y store sincronizado
4. [x] Auth Email/Password (alta confirmada desde el servidor)
5. [x] Emails propios (Resend): bienvenida y recuperar contraseña. Falta verificar un dominio para enviarle a cualquier destinatario.
6. [ ] Invitar empleados al negocio (business_members ya existe)
7. [ ] Testing E2E automatizado
8. [x] Deploy Vercel (https://orbita-crm-latam.vercel.app)
