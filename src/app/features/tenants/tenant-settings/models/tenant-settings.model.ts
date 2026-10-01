/**
 * PUT /tenant overwrites name/logoUrl/primaryColor/secondaryColor unconditionally
 * (backend#5's UpdateTenantService — no partial-patch semantics), so every field here
 * must always carry the tenant's current value, not just the one field being edited from
 * the "Empresa" tab — otherwise saving the name would silently wipe the logo/colors.
 * slug is never sent as a real value (only used server-side to detect an attempted change).
 */
export interface UpdateTenantRequest {
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

export interface UpdateBrandingRequest {
  name: string;
  primaryColor: string | null;
  secondaryColor: string | null;
}
