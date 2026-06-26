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
| `SuccessCardComponent` | Pantalla de confirmación tras una acción exitosa (registro, recuperar contraseña, verificar email). Inputs `title`/`message` + `<ng-content>` para la acción (ej. link a login) |

## Sistema de iconos
- `IconComponent` (`shared/icons/icon.component.ts`) — wrapper propio, sin depender de
  `@angular/material` para iconos. Uso: `<app-icon name="eye" [size]="18" />`.
- El dibujo de cada ícono vive en `shared/icons/icon.registry.ts` (`Record<IconName, string>`
  con el contenido interno del `<svg>`, sin el wrapper). Agregar un ícono = agregar una entrada
  al registro — nunca tocar `icon.component.ts`/`.html`.
- `@angular/material` SÍ está instalado (`package.json`) pero solo se usa para tokens de tema en
  `styles.scss` (`@use '@angular/material' as mat`) — ningún componente de Material se consume
  directamente en features, todo pasa por wrappers propios (`app-input`, `app-button`, `app-card`,
  `app-icon`).
- **Si en el futuro se necesita el catálogo de iconos de Material** (Material Icons/Symbols, miles
  de iconos ya dibujados) en vez de seguir dibujando SVGs a mano: NO consumir `<mat-icon>`
  directamente en ningún feature. Extender `IconComponent` para que, si `name()` no existe en
  `ICON_PATHS`, haga fallback interno a `<mat-icon>{{ name() }}</mat-icon>` (import de
  `MatIconModule` solo dentro de `icon.component.ts`). Requiere además cargar la fuente
  "Material Icons"/"Material Symbols" en `index.html` (Google Fonts o self-hosted) — hoy NO está
  cargada. Se decidió no implementar este fallback de entrada para no agregar complejidad sin un
  caso de uso real (#10).

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
| M1 ✅ | #9 ✅ #10 ✅ #11 ✅ #18 ✅ #19 ✅ |
| M2 🔄 | sub-issues: #32 ✅ #33 ✅ #34 ✅ #35 ✅ #36 ✅ #39 ✅ · originales: #2 ✅ #3 ⏳ #4 ⏳ · extras: #43 ✅ #46 ✅ #47 ✅ |
| M3 | #12 #13 #14 #15 #16 #20 |
| M4 | #5 #6 |
| M5 | #7 #8 #21 #22 #23 |
| M6 | #17 |

## Pendiente M2 (jun 2026)
1. **#3**  — UI de lógica condicional (drawer, reglas AND/OR, preview texto natural)
2. **#4**  — Preview en tiempo real (motor de condiciones + 8 answer components reutilizados en M3 #12)

## Patrones establecidos en M2

### QuestionTypeRegistry
Cada tipo registra 3 componentes + metadata en `question-types/question-type.registry.ts`.
Agregar un tipo nuevo = 1 entrada en `QUESTION_TYPE_REGISTRY` + 3 archivos (canvas, properties, public).
Los tipos se almacenan en **minúsculas** en BD y en el registry (`'text'`, `'single'`, etc.).

### Componentes de propiedades (properties)
Todos extienden `BasePropertiesComponent` (`question-types/base-properties.component.ts`, `@Directive()`).
- Inputs heredados: `question`, `changed`, `formType`
- Métodos heredados: `onTitleBlur`, `onRequiredChange`, `onDescriptionBlur`
- Estilos compartidos en `question-types/shared/_properties-shared.scss`: mixins `base()` (layout + inputs) y `options()` (filas de opciones).
- Cada properties SCSS hace `@use '../shared/properties-shared' as p; @include p.base();` — si se omite el `@use`, el build falla de inmediato.

### Tests (Vitest, NO Jasmine)
- Correr: `npx ng test --watch=false`
- Outputs: suscribir a `component.output` antes de llamar el método, verificar `emitted`
- Componentes con `input()`/`output()` requieren `TestBed.createComponent()` (injection context)

### CDK DragDrop
- Secciones: `cdkDrag` en `<app-section-card>` (sin handle — todo el header arrastra), `cursor: grab` en `.sc__header`
- Preguntas: `cdkDrag` en el div de la pregunta, `cdkDragHandle` en `.sc__q-grip` (mismo template ✅)
- Cross-section: `cdkDropListConnectedTo` con IDs de secciones; el move hace `addQuestion` + `deleteQuestion`
- El ID del drop list de preguntas = `section.id` (UUID de la sección)

## Links
- Issues: https://github.com/juancamilokremer/formflow-frontend/issues
- Proyecto: https://github.com/users/juancamilokremer/projects/2
- Mockups: `E:\emprendimiento\KodeLabs\formflow\mockups\index.html`
