# FormFlow — Frontend

> Para contexto completo del proyecto ver: `E:\emprendimiento\KodeLabs\formflow\CLAUDE.md`

## Stack
- Angular 22 (standalone components, sin NgModules)
- Angular Material — design system
- CDK Drag Drop — constructor de formularios
- ApexCharts — gráficas de resultados
- Angular Signals — gestión de estado reactivo
- ngx-translate — internacionalización (`src/assets/i18n/es.json`)
- Playwright — tests E2E

## Estructura de carpetas
```
formflow-frontend/
└── src/
    ├── app/
    │   ├── core/              — guards, interceptors, servicios singleton
    │   │   ├── auth/
    │   │   ├── interceptors/
    │   │   └── services/
    │   ├── shared/            — componentes reutilizables entre features
    │   │   ├── components/
    │   │   │   ├── email-verification-banner/  ← banner hasta verificar email
    │   │   │   ├── plan-card/                  ← tarjeta de plan (en /plans y onboarding)
    │   │   │   ├── language-switcher/          ← oculto en MVP, listo para inglés
    │   │   │   └── legal-page/                 ← layout para /terms y /privacy
    │   │   ├── pipes/
    │   │   └── directives/
    │   └── features/          — módulos de funcionalidad
    │       ├── auth/          — login, registro, recuperar contraseña, verify email
    │       ├── forms/         — constructor drag & drop, lista de formularios
    │       ├── responses/     — formulario público (/r/{convId}/{token})
    │       ├── dashboard/     — resultados, gráficas, respuesta individual
    │       ├── convocatorias/ — lista, wizard, detalle con ranking
    │       ├── tenants/       — configuración del tenant, branding
    │       ├── users/         — gestión de usuarios y roles
    │       ├── billing/       — planes, checkout Stripe, portal facturas
    │       └── landing/       — landing page pública de marketing
    ├── environments/
    └── assets/
        └── i18n/
            ├── es.json        ← español (MVP)
            └── en.json        ← vacío, estructura lista
```

## Convenciones
- Standalone components (sin NgModules)
- Signals para estado reactivo (Angular 22)
- Idioma del código: inglés
- Commits en español referenciando issue: `feat: agregar pantalla de login (#10)`
- Branches: `feature/nombre`, `fix/nombre`
- Lazy loading en todas las rutas de features
- **Ningún string visible al usuario hardcodeado** — todo en `es.json` con `| translate`

## Autenticación
- JWT almacenado en memoria (no localStorage por seguridad)
- Refresh token en httpOnly cookie
- Interceptor HTTP agrega Bearer token automáticamente
- Guards protegen rutas privadas por rol
- Al hacer login, identificar al usuario en Crisp (nombre, email, plan del tenant)
- Al hacer logout, resetear sesión de Crisp: `window.$crisp.push(["do", "session:reset"])`

## Shared components importantes
| Componente | Cuándo usarlo |
|---|---|
| `EmailVerificationBannerComponent` | En el AppShell si `user.emailVerified === false` |
| `PlanCardComponent` | En `/plans` y en el onboarding |
| `LegalPageComponent` | Layout de `/terms` y `/privacy` |
| `LanguageSwitcherComponent` | Oculto en MVP — activar cuando haya inglés |

## Formulario público — reglas especiales
- Ruta: `/r/{convId}/{token}` — pública, sin guard de auth
- **Crisp NO debe aparecer** en esta ruta (candidatos externos)
- Mobile-first: todos los inputs con `font-size: 16px` mínimo (evita zoom en iOS)
- Touch targets mínimo 44×44px

## Billing — Stripe
- `BillingService.createCheckoutSession(plan)` → obtiene URL → `window.location.href = url`
- La página `/billing/success` NO actualiza el plan — solo muestra confirmación (el webhook ya lo hizo)
- `POST /billing/portal` → URL del Stripe Customer Portal para gestionar tarjeta y cancelar

## Comunicación con backend
- URL base desde `environment.ts`
- Todos los servicios HTTP en `features/[modulo]/services/`
- Manejo centralizado de errores en interceptor

## Issues por milestone
| Milestone | Issues |
|-----------|--------|
| M1 | #9 #10 #11 #18 #19 |
| M2 | #1 #2 #3 #4 |
| M3 | #12 #13 #14 #15 #16 #20 |
| M4 | #5 #6 |
| M5 | #7 #8 #21 #22 #23 |
| M6 | #17 |

## Links
- Issues: https://github.com/juancamilokremer/formflow-frontend/issues
- Proyecto: https://github.com/users/juancamilokremer/projects/2
- Mockups: `E:\emprendimiento\KodeLabs\formflow\mockups\index.html`
