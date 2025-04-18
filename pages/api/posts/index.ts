import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"
import { getSession } from "next-auth/react"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req })

    if (!session || !session.user.isAdmin) {
        return res.status(403).json({ message: "어드민 권한이 필요합니다." })
    }

    if (req.method === "GET") {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const skip = (page - 1) * limit
        try {
            const posts = await prisma.post.findMany({
                skip,
                take: limit,
                select: { id: true, title: true, content: true },
            })
            const total = await prisma.post.count()
            return res.status(200).json({ posts, total })
        } catch (error) {
            console.error("Error fetching posts:", error)
            return res
                .status(500)
                .json({ message: "포스트 조회 중 오류가 발생했습니다." })
        }
    } else {
        return res
            .setHeader("Allow", ["GET"])
            .status(405)
            .json({ message: "허용되지 않은 메서드입니다." })
    }
}
