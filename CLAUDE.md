# FormFlow — Frontend

> Para contexto completo del proyecto ver: `E:\emprendimiento\KodeLabs\formflow\CLAUDE.md`

## Stack
- Angular 22 (standalone components, sin NgModules)
- Angular Material 22 — design system (Material 3 / CSS variables)
- CDK Drag Drop — constructor de formularios
- ApexCharts + ng-apexcharts — gráficas de resultados
- Angular Signals — gestión de estado reactivo
- ngx-translate v18 — internacionalización (`src/assets/i18n/es.json`)
- Playwright — tests E2E

## Estructura de carpetas
```
formflow-frontend/
└── src/
    ├── app/
    │   ├── core/
    │   │   ├── auth/              — guards, interceptor de auth
    │   │   ├── constants/
    │   │   │   ├── app.constants.ts     ← constantes globales de la app
    │   │   │   └── route.constants.ts   ← paths de rutas + publicFormPath()
    │   │   ├── interceptors/      — HTTP interceptors (auth, errors)
    │   │   ├── models/            — interfaces y enums de dominio
    │   │   │   ├── user.model.ts
    │   │   │   ├── tenant.model.ts
    │   │   │   └── api-response.model.ts
    │   │   ├── services/          — servicios singleton transversales
    │   │   └── storage/
    │   │       ├── storage.service.ts        ← wrapper localStorage/sessionStorage
    │   │       └── storage-keys.constants.ts ← claves tipadas de storage
    │   ├── shared/
    │   │   ├── components/
    │   │   │   ├── email-verification-banner/
    │   │   │   ├── plan-card/
    │   │   │   ├── language-switcher/
    │   │   │   └── legal-page/
    │   │   ├── pipes/
    │   │   └── directives/
    │   └── features/
    │       ├── auth/
    │       │   ├── auth.component.*       ← componente principal (layout shell)
    │       │   └── components/
    │       │       ├── login/
    │       │       ├── register/
    │       │       ├── forgot-password/
    │       │       ├── reset-password/
    │       │       └── verify-email/
    │       ├── forms/
    │       │   ├── forms.component.*      ← lista de formularios
    │       │   └── components/
    │       │       └── form-builder/
    │       ├── dashboard/
    │       ├── convocatorias/
    │       │   ├── convocatorias.component.*
    │       │   └── components/
    │       │       ├── convocatoria-wizard/
    │       │       └── convocatoria-detail/
    │       ├── responses/
    │       │   └── public-form/           ← /r/{convId}/{token}
    │       ├── tenants/
    │       │   └── tenant-settings/
    │       ├── users/
    │       ├── billing/
    │       └── landing/
    ├── environments/
    │   ├── environment.ts        ← dev (apiUrl: localhost:8080)
    │   └── environment.prod.ts   ← prod (apiUrl: api.formflow.app)
    └── assets/
        └── i18n/
            ├── es.json        ← español (MVP)
            └── en.json        ← vacío, estructura lista
```

## Convenciones de código

### Estructura de cada componente
Todo componente debe tener archivos separados — nunca `template` o `styles` inline:
```
[nombre]/
├── [nombre].component.ts
├── [nombre].component.html
├── [nombre].component.scss
└── [nombre].component.spec.ts
```

### Estructura de cada feature
Cada feature tiene un **componente principal** (`feature.component.*`) y sus subcomponentes
en `components/[nombre-subcomponente]/[nombre].component.*`:
```
feature/
├── feature.component.ts       ← vista principal o layout shell
├── feature.component.html
├── feature.component.scss
├── feature.component.spec.ts
└── components/
    └── sub-component/
        ├── sub-component.component.ts
        └── ...
```

### Modelos
Los modelos (interfaces, enums, types) viven en `core/models/` (globales) o en
`features/[feature]/models/` (específicos de la feature). **Nunca** definidos dentro
de un componente o servicio.

### Tests unitarios
- **Solo tests de funciones/métodos** — NO tests de DOM ni de template
- Para clases sin DI: instanciar directamente (`new ComponentClass()`)
- Para servicios/componentes con DI: usar `TestBed`
- No usar `fixture.nativeElement` ni `querySelector` en unit tests (eso es para E2E con Playwright)

### Storage
Usar siempre `StorageService` — nunca `localStorage`/`sessionStorage` directamente.
Las claves en `StorageKeys` (storage-keys.constants.ts). Solo para datos NO sensibles
(preferencias, idioma). JWT en memoria, refresh token en httpOnly cookie.

### Rutas
Usar siempre `RouteConstants` — nunca strings hardcodeados en `router.navigate()` o `[routerLink]`.
Para el link del formulario público usar `publicFormPath(convId, token)`.

### Strings visibles
Ningún string visible al usuario hardcodeado — todo en `es.json` con `| translate`.

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
- URL base desde `environment.ts` (`environment.apiUrl`)
- Todos los servicios HTTP en `features/[modulo]/services/`
- Manejo centralizado de errores en interceptor HTTP

## Issues por milestone
| Milestone | Issues |
|-----------|--------|
| M1 | #9 ✅ #10 #11 #18 #19 |
| M2 | #1 #2 #3 #4 |
| M3 | #12 #13 #14 #15 #16 #20 |
| M4 | #5 #6 |
| M5 | #7 #8 #21 #22 #23 |
| M6 | #17 |

## Links
- Issues: https://github.com/juancamilokremer/formflow-frontend/issues
- Proyecto: https://github.com/users/juancamilokremer/projects/2
- Mockups: `E:\emprendimiento\KodeLabs\formflow\mockups\index.html`
