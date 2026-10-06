import type { MetadataRoute } from "next";

const BASE = "https://www.generar.co";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`,                     changeFrequency: "weekly",  priority: 1 },
    { url: `${BASE}/pricing`,              changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/guia-de-uso`,          changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/register`,             changeFrequency: "yearly",  priority: 0.6 },
    { url: `${BASE}/login`,                changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE}/terminos-de-servicio`, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/politica-de-datos`,    changeFrequency: "yearly",  priority: 0.3 },
  ];
}
