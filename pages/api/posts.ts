import { PrismaClient } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { title, content, markerName, lat, lng, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const post = await prisma.post.create({
            data: {
                title,
                content,
                markerName,
                latitude: lat,
                longitude: lng,
                password: hashedPassword,
            },
        })
        return res.status(201).json(post)
    } else if (req.method === "GET") {
        const posts = await prisma.post.findMany({ orderBy: { likes: "desc" } })
        return res.status(200).json(posts)
    }
    res.status(405).json({ message: "Method not allowed" })
}
