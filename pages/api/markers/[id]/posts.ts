import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query

    if (req.method === "GET") {
        try {
            const posts = await prisma.post.findMany({
                where: { markerId: id as string },
                orderBy: { createdAt: "desc" },
            })
            res.setHeader(
                "Cache-Control",
                "s-maxage=60, stale-while-revalidate"
            )
            res.status(200).json(posts)
        } catch (error) {
            console.error("Error fetching posts:", error)
            res.status(500).json({ message: "Failed to fetch posts" })
        }
    } else if (req.method === "POST") {
        const { title, content, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        try {
            const post = await prisma.post.create({
                data: {
                    title,
                    content,
                    password: hashedPassword,
                    markerId: id as string,
                },
            })
            res.status(201).json(post)
        } catch (error) {
            console.error("Error creating post:", error)
            res.status(500).json({ message: "Failed to create post" })
        }
    } else {
        res.setHeader("Allow", ["GET", "POST"])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
