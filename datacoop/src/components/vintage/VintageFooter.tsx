"using client";

import Link from "next/link";

export function VintageFooter() {
  const userLinks = [
    { href: "/register", label: "Sign Up" },
    { href: "/login", label: "Login" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#faq", label: "FAQ" },
  ];

  const brandLinks = [
    { href: "/register?type=brand", label: "Register Brand" },
    { href: "/login", label: "Brand Login" },
    { href: "#research", label: "Research Solutions" },
    { href: "#pricing", label: "Pricing" },
  ];

  const legalLinks = [
    { href: "#privacy", label: "Privacy Policy" },
    { href: "#terms", label: "Terms of Service" },
    { href: "#dpdp", label: "DPDP Compliance" },
    { href: "#cookies", label: "Cookie Policy" },
  ];

  const socialLinks = [
    { href: "#twitter", label: "Twitter" },
    { href: "#linkedin", label: "LinkedIn" },
    { href: "#email", label: "Email" },
  ];

  return (
    <footer className="border-t py-12 bg-muted/30 vintage-paper-textured relative">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & About */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md">
                <span className="text-primary-foreground font-bold text-lg transition-transform duration-300 group-hover:scale-110">
                  DC
                </span>
              </div>
              <span className="font-semibold text-xl transition-colors duration-300 group-hover:text-primary">
                DataCoop
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Turn your purchases into insights. Earn money by sharing verified
              purchase data with brands.
            </p>
          </div>

          {/* For Users */}
          <div>
            <h4 className="font-semibold mb-4 vintage-title-small group-hover:text-primary transition-colors duration-300">
              For Users
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {userLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-all duration-300 inline-flex items-center gap-1 hover:gap-2"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Brands */}
          <div>
            <h4 className="font-semibold mb-4 vintage-title-small group-hover:text-primary transition-colors duration-300">
              For Brands
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {brandLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-all duration-300 inline-flex items-center gap-1 hover:gap-2"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 vintage-title-small group-hover:text-primary transition-colors duration-300">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {legalLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-all duration-300 inline-flex items-center gap-1 hover:gap-2"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="vintage-divider" />

        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground script-accent">
            © 2024 DataCoop. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {socialLinks.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-all duration-300 hover:scale-110 inline-block"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}