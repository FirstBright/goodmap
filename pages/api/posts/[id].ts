import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { NextApiRequest, NextApiResponse } from "next"

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query
    if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: "Invalid ID" })
    }

    if (req.method === "DELETE") {
        const { password } = req.body
        const post = await prisma.post.findUnique({ where: { id } })
        if (!post) return res.status(404).json({ message: "Post not found" })

        const isPasswordValid = await bcrypt.compare(password, post.password)
        if (!isPasswordValid)
            return res.status(401).json({ message: "Incorrect password" })

        await prisma.post.delete({ where: { id } })
        return res.status(200).json({ message: "Post deleted" })
    } else if (req.method === "PATCH") {
        const { title, content, markerName, password } = req.body
        const post = await prisma.post.findUnique({ where: { id } })
        if (!post) return res.status(404).json({ message: "Post not found" })

        const isPasswordValid = await bcrypt.compare(password, post.password)
        if (!isPasswordValid)
            return res.status(401).json({ message: "Incorrect password" })

        const updatedPost = await prisma.post.update({
            where: { id },
            data: { title, content, markerName },
        })
        return res.status(200).json(updatedPost)
    }
    res.status(405).json({ message: "Method not allowed" })
}
