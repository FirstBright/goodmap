import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query
    if (req.method === "PATCH") {
        const { tags } = req.body;
        if (!Array.isArray(tags)) {
            return res.status(400).json({ message:"태그는 배열이어야 합니다." });
        }

        try {
            const marker = await prisma.marker.update({
                where: { id: String(id) },
                data: { tags },
                select: {
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                    tags: true,
                    posts: { select: { id: true } },
                },
            });
            res.status(200).json(marker);
        } catch (error) {
            console.error("Error updating marker tags:", error);
            res.status(500).json({ message: "errorUpdatingTags" });
        }
    } else if (req.method === "DELETE") {
        try {
            // Check if the marker exists
            const marker = await prisma.marker.findUnique({
                where: { id: String(id) },
                include: { posts: { select: { id: true } } }, // Include posts to check if any exist
            })

            if (!marker) {
                return res
                    .status(404)
                    .json({ message: "마커를 찾을 수 없습니다." })
            }

            // Check if the marker has associated posts
            if (marker.posts.length > 0) {
                return res.status(400).json({
                    message:
                        "이 마커에 연결된 글이 있어 삭제할 수 없습니다. 먼저 글을 삭제하세요.",
                })
            }

            // Proceed with deletion if no posts are found
            await prisma.marker.delete({
                where: { id: String(id) },
            })

            console.log(`Deleted marker: ${id}`)
            return res.status(204).end()
        } catch (error) {
            console.error("Error deleting marker:", error)
            return res
                .status(500)
                .json({ message: "마커 삭제 중 오류가 발생했습니다." })
        }
    } else {
        return res
            .setHeader("Allow", ["DELETE"])
            .status(405)
            .json({ message: "허용되지 않은 메서드입니다." })
    }
}
