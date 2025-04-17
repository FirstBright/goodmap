import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // Log to debug Prisma query
        console.log("Fetching markers...")
        const markers = await prisma.marker.findMany({
            select: { id: true, createdAt: true },
        })
        console.log(`Fetched ${markers.length} markers`)

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://overcome0.be/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${markers
      .map(
          (marker) => `
  <url>
    <loc>https://overcome0.be/markers/${marker.id}</loc>
    <lastmod>${new Date(marker.createdAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  `
      )
      .join("")}
</urlset>`

        res.setHeader("Content-Type", "text/xml")
        res.status(200).send(sitemap)
    } catch (error) {
        console.error("Error generating sitemap:", error)
        // Fallback response to avoid undefined res
        return res.status(500).json({ error: "Failed to generate sitemap" })
    }
}
