import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "next-auth/react";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  const { id } = req.query;

  if (req.method === "DELETE") {
    if (!session || !session.user.isAdmin) {
      // 어드민은 비밀번호 없이 삭제 가능
      const { password } = req.body;
      const post = await prisma.post.findUnique({ where: { id: String(id) } });

      if (!post) {
        return res.status(404).json({ message: "포스트를 찾을 수 없습니다." });
      }

      const isValid = await bcrypt.compare(password, post.password);
      if (!isValid) {
        return res.status(403).json({ message: "비밀번호가 틀렸습니다." });
      }
    }

    try {
      await prisma.post.delete({
        where: { id: String(id) },
      });
      console.log(`Deleted post: ${id}`);
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting post:", error);
      return res.status(500).json({ message: "포스트 삭제 중 오류가 발생했습니다." });
    }
  } else if (req.method === "PATCH") {
    // 기존 PATCH 로직 유지
    const { title, content, password } = req.body;
    try {
      const post = await prisma.post.findUnique({ where: { id: String(id) } });
      if (!post) {
        return res.status(404).json({ message: "포스트를 찾을 수 없습니다." });
      }
      const isValid = await bcrypt.compare(password, post.password);
      if (!isValid) {
        return res.status(403).json({ message: "비밀번호가 틀렸습니다." });
      }
      const updatedPost = await prisma.post.update({
        where: { id: String(id) },
        data: { title, content },
      });
      return res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      return res.status(500).json({ message: "포스트 수정 중 오류가 발생했습니다." });
    }
  } else {
    return res.setHeader("Allow", ["DELETE", "PATCH"]).status(405).json({ message: "허용되지 않은 메서드입니다." });
  }
}