// Role-based module permissions
export const rolePermissions: { [key: string]: string[] } = {
  "Admin": [
    "/home",
  ],
  "Extrusion": [
    "/home/extrusion",
    "/home/extrusion/bucket-income",
    "/home/extrusion/profile-income",
    "/home/extrusion/aging-process",
    "/home/extrusion/overview",
  ],
  "Mill Finish": [
    "/home/mill-finish",
    "/home/mill-finish/hardness-check",
    "/home/mill-finish/bucket-details",
  ],
  "Powder Coat": [
    "/home/powder-coat",
    "/home/powder-coat/production",
    "/home/powder-coat/production/powder-coat",
    "/home/powder-coat/production/wood-finish",
    "/home/powder-coat/packing",
    "/home/powder-coat/packing/powder-coat",
    "/home/powder-coat/packing/wood-finish",
    "/home/powder-coat/overview",
  ],
  "Anodizing": [
    "/home/anodizing",
    "/home/anodizing/binding",
    "/home/anodizing/production",
    "/home/anodizing/packing",
  ],
};

// Check if user role has access to a path
export function hasAccess(role: string | null, path: string): boolean {
  if (!role) return false;
  
  const allowedPaths = rolePermissions[role] || [];
  return allowedPaths.some(allowedPath => {
    if (allowedPath === "/home") return path === "/home" || path.startsWith("/home/");
    return path.startsWith(allowedPath);
  });
}

// Get allowed modules for a role
export function getAllowedModules(role: string | null) {
  if (!role) return [];
  if (role === "Admin") return ["All Departments"];
  return [role];
}
