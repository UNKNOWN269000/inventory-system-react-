export type MenuNode = {
  label: string;
  slug: string;
  href: string;
  description?: string;
  children?: MenuNode[];
};

export const menuStructure: MenuNode[] = [
  {
    label: "Home",
    slug: "home",
    href: "/home",
    description: "Main dashboard and module switcher.",
    children: [
      {
        label: "Extrusion",
        slug: "extrusion",
        href: "/home/extrusion",
        description:
          "Profile manufacturing workflow — income, aging, and production overview.",
        children: [
          {
            label: "Bucket Income",
            slug: "bucket-income",
            href: "/home/extrusion/bucket-income",
          },
          {
            label: "Profile Income",
            slug: "profile-income",
            href: "/home/extrusion/profile-income",
          },
          {
            label: "Aging Process",
            slug: "aging-process",
            href: "/home/extrusion/aging-process",
          },
          {
            label: "Overview",
            slug: "overview",
            href: "/home/extrusion/overview",
          },
        ],
      },
      {
        label: "Mill Finish",
        slug: "mill-finish",
        href: "/home/mill-finish",
        description:
          "Surface preparation and quality verification before downstream coating.",
        children: [
          {
            label: "Hardness Check",
            slug: "hardness-check",
            href: "/home/mill-finish/hardness-check",
          },
          {
            label: "Bucket Details",
            slug: "bucket-details",
            href: "/home/mill-finish/bucket-details",
          },
        ],
      },
      {
        label: "Powder Coat",
        slug: "powder-coat",
        href: "/home/powder-coat",
        description:
          "Finishing lines for coated and wood-finished profiles, from production to packing.",
        children: [
          {
            label: "Production",
            slug: "production",
            href: "/home/powder-coat/production",
            children: [
              {
                label: "Powder Coat",
                slug: "powder-coat-prod",
                href: "/home/powder-coat/production/powder-coat",
              },
              {
                label: "Wood Finish",
                slug: "wood-finish-prod",
                href: "/home/powder-coat/production/wood-finish",
              },
            ],
          },
          {
            label: "Packing",
            slug: "packing",
            href: "/home/powder-coat/packing",
            children: [
              {
                label: "Powder Coat",
                slug: "powder-coat-pack",
                href: "/home/powder-coat/packing/powder-coat",
              },
              {
                label: "Wood Finish",
                slug: "wood-finish-pack",
                href: "/home/powder-coat/packing/wood-finish",
              },
            ],
          },
          {
            label: "Overview",
            slug: "overview",
            href: "/home/powder-coat/overview",
          },
        ],
      },
      {
        label: "Anodizing",
        slug: "anodizing",
        href: "/home/anodizing",
        description:
          "Surface treatment, anodized production runs, and packing dispatch.",
        children: [
          {
            label: "Binding",
            slug: "binding",
            href: "/home/anodizing/binding",
          },
          {
            label: "Production",
            slug: "production",
            href: "/home/anodizing/production",
          },
          {
            label: "Packing",
            slug: "packing",
            href: "/home/anodizing/packing",
          },
        ],
      },
    ],
  },
];

// Flat lookup of every leaf + intermediate page
export function flattenMenu(): MenuNode[] {
  const out: MenuNode[] = [];
  const walk = (nodes: MenuNode[]) => {
    for (const n of nodes) {
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(menuStructure);
  return out;
}

export function findNodeByPath(path: string): MenuNode | undefined {
  const all = flattenMenu();
  return all.find((n) => n.href === path);
}

export function getBreadcrumbs(path: string): MenuNode[] {
  const segments = path.split("/").filter(Boolean);
  const crumbs: MenuNode[] = [];
  let acc: string[] = [];
  const all = flattenMenu();
  for (const seg of segments) {
    acc.push(seg);
    const href = "/" + acc.join("/");
    const node = all.find((n) => n.href === href);
    if (node) crumbs.push(node);
  }
  return crumbs;
}
