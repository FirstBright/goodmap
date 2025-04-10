import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { NextApiRequest, NextApiResponse } from "next"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET as string

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined")
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { username, password } = req.body
        const admin = await prisma.admin.findUnique({ where: { username } })
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const token = jwt.sign({ id: admin.id }, JWT_SECRET, {
            expiresIn: "1h",
        })
        res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/`)
        return res.status(200).json({ message: "Logged in" })
    }
    res.status(405).json({ message: "Method not allowed" })
}
