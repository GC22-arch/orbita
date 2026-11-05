# Orbita · CRM para negocios con turnos

CRM visual y adaptable para negocios chicos que trabajan con turnos: clubes, gimnasios, clínicas, talleres y centros de estética. Al elegir el rubro, el sistema adapta solo el vocabulario, los campos y los módulos. El inicio muestra de un vistazo los turnos de hoy, la caja y quién debe.

## Funciones

- **Onboarding por rubro**: paciente, socio, cliente o vehículo, cada uno con campos propios.
- **Clientes**: ficha con historial e importación.
- **Agenda**: turnos en un calendario simple, con recordatorio por WhatsApp de un toque.
- **Caja**: cobros, gastos, deudores y pendientes.
- **Planes y cuotas**: membresías mensuales y paquetes de sesiones, con aviso de vencimientos.
- **Órdenes de trabajo**: seguimiento por estado.
- **Inicio con widgets**: turnos de hoy, caja, deudores, vencimientos, trabajos en curso y resumen del mes.
- **Emails transaccionales** con Resend.
- Pensado para el celular: acciones de 1 o 2 toques, letras grandes y sin jerga técnica.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · Supabase (Auth, DB y RLS) · Zustand · Zod · Resend

## Desarrollo

```bash
cp .env.example .env.local   # completá tus claves de Supabase y Resend
npm install
npm run dev
```

La lógica de negocio completa está en [`BUSINESS_LOGIC.md`](BUSINESS_LOGIC.md).

---

by **GC**
