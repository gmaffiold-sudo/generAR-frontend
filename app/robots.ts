import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/generate",
        "/revisar",
        "/settings",
        "/checkout",
        "/payment-result",
        "/confirm-deletion",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: "https://www.generar.co/sitemap.xml",
  };
}
