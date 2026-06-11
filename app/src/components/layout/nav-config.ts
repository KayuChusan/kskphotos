export interface NavItem {
  title: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { title: "Gallery", href: "/gallery" },
  { title: "Collections", href: "/collections" },
  { title: "Dashboard", href: "/dashboard" },
  { title: "Services", href: "/services" },
  { title: "Blog", href: "/blog" },
  { title: "About", href: "/about" },
];

export const secondaryNav: NavItem[] = [
  { title: "Booking", href: "/booking" },
  { title: "Contact", href: "/contact" },
];
