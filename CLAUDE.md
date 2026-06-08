# FormFlow — Frontend

> Para contexto completo del proyecto ver: `E:\emprendimiento\KodeLabs\formflow\CLAUDE.md`

## Stack
- Angular 22 (standalone components)
- Angular Material — design system
- CDK Drag Drop — constructor de formularios
- ApexCharts — gráficas de resultados
- TypeScript estricto

## Estructura de carpetas
```
formflow-frontend/
└── src/
    ├── app/
    │   ├── core/              — guards, interceptors, servicios singleton
    │   │   ├── auth/
    │   │   ├── interceptors/
    │   │   └── services/
    │   ├── shared/            — componentes, pipes y directivas reutilizables
    │   │   ├── components/
    │   │   ├── pipes/
    │   │   └── directives/
    │   └── features/          — módulos de funcionalidad
    │       ├── auth/          — login, registro, recuperar contraseña
    │       ├── forms/         — constructor de formularios
    │       ├── responses/     — página pública de respuesta
    │       ├── dashboard/     — resultados y estadísticas
    │       ├── tenants/       — configuración del tenant
    │       └── landing/       — página pública de marketing
    ├── environments/
    └── assets/
```

## Convenciones
- Standalone components (sin NgModules)
- Signals para estado reactivo (Angular 22)
- Idioma del código: inglés
- Commits en español referenciando issue: `feat: agregar pantalla de login (#10)`
- Branches: `feature/nombre`, `fix/nombre`
- Lazy loading en todas las rutas de features

## Autenticación
- JWT almacenado en memoria (no localStorage por seguridad)
- Refresh token en httpOnly cookie
- Interceptor HTTP agrega Bearer token automáticamente
- Guards protegen rutas privadas por rol

## Comunicación con backend
- URL base desde `environment.ts`
- Todos los servicios HTTP en `features/[modulo]/services/`
- Manejo centralizado de errores en interceptor

## Issues activos (M1)
- [ ] #9  Inicializar proyecto Angular 22
- [ ] #10 Implementar autenticación y guards
- [ ] #11 Configurar CI/CD con GitHub Actions + Vercel

## Links
- Issues: https://github.com/juancamilokremer/formflow-frontend/issues
- Proyecto: https://github.com/users/juancamilokremer/projects/2
