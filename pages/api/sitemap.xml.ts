import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const markers = await prisma.marker.findMany({
            select: { id: true, createdAt: true },
        })

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
        res.write(sitemap)
    } catch (error) {
        console.error("Error generating sitemap:", error)
        res.status(500).end()
    }
}
