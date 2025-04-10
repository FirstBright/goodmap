import { PrismaClient } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { name, latitude, longitude } = req.body

        // 해당 위치에 이미 마커가 있는지 확인
        const existingMarker = await prisma.marker.findFirst({
            where: {
                latitude,
                longitude,
            },
        })

        if (existingMarker) {
            return res
                .status(400)
                .json({ message: "이미 해당 위치에 마커가 있습니다." })
        }

        const marker = await prisma.marker.create({
            data: {
                name,
                latitude,
                longitude,
            },
        })

        return res.status(201).json(marker)
    } else if (req.method === "GET") {
        const markers = await prisma.marker.findMany({
            include: {
                posts: true,
            },
        })
        return res.status(200).json(markers)
    }
    res.status(405).json({ message: "Method not allowed" })
}
