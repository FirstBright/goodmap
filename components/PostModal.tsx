'use client'
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
    markerId: string;
    markerName: string;
}

export default function PostModal({ isOpen, onClose, markerId, markerName }: PostModalProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState({ title: "", content: "", password: "" });
    const [editPost, setEditPost] = useState<{ id: string; title: string; content: string; password: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && markerId) {
            fetchPosts();
        }
    }, [isOpen, markerId]);

    const fetchPosts = async () => {
        try {
            const response = await fetch(`/api/markers/${markerId}/posts`, { method: "GET" })
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
            alert("포스트를 불러오는 데 실패했습니다.");
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`/api/markers/${markerId}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPost),
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.message);
                return;
            }

            setNewPost({ title: "", content: "", password: "" });
            fetchPosts();
        } catch (error) {
            console.error("Error creating post:", error);
            alert("포스트 생성 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editPost) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/posts/${editPost.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editPost.title,
                    content: editPost.content,
                    password: editPost.password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.message);
                return;
            }

            setEditPost(null);
            fetchPosts();
        } catch (error) {
            console.error("Error editing post:", error);
            alert("포스트 수정 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePost = async (postId: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.message);
                return;
            }

            fetchPosts();
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("포스트 삭제 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLikePost = async (postId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/posts/${postId}/likes`, {
                method: "POST",
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.message);
                return;
            }

            fetchPosts();
        } catch (error) {
            console.error("Error liking post:", error);
            alert("포스트 좋아요 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="z-[1000] max-w-md sm:max-w-lg" aria-describedby="dialog-description">
                <DialogHeader>
                    <DialogTitle>{markerName}</DialogTitle>
                </DialogHeader>

                {/* 포스트 목록 */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {posts.map((post) => (
                        <div key={post.id} className="border p-4 rounded-lg">
                            {editPost?.id === post.id ? (
                                <form onSubmit={handleEditPost} className="space-y-2">
                                    <Input
                                        value={editPost.title}
                                        onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                                        placeholder="제목"
                                        required
                                    />
                                    <Textarea
                                        value={editPost.content}
                                        onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                                        placeholder="내용"
                                        required
                                    />
                                    <Input
                                        type="password"
                                        value={editPost.password}
                                        onChange={(e) => setEditPost({ ...editPost, password: e.target.value })}
                                        placeholder="비밀번호"
                                        required
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setEditPost(null)}
                                            disabled={isLoading}
                                        >
                                            취소
                                        </Button>
                                        <Button type="submit" disabled={isLoading}>
                                            저장
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <h3 className="font-bold">{post.title}</h3>
                                    <p>{post.content}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(post.createdAt).toLocaleString()}
                                    </p>
                                    <div className="flex justify-end space-x-2 mt-2">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleLikePost(post.id)
                                            }
                                        >
                                            좋아요
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setEditPost({
                                                    id: post.id,
                                                    title: post.title,
                                                    content: post.content,
                                                    password: "",
                                                })
                                            }
                                        >
                                            수정
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                const password = prompt("비밀번호를 입력하세요");
                                                if (password) handleDeletePost(post.id, password);
                                            }}
                                        >
                                            삭제
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* 새 포스트 작성 */}
                <form onSubmit={handleCreatePost} className="space-y-4 mt-4">
                    <Input
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        placeholder="제목"
                        required
                    />
                    <Textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="내용"
                        required
                    />
                    <Input
                        type="password"
                        value={newPost.password}
                        onChange={(e) => setNewPost({ ...newPost, password: e.target.value })}
                        placeholder="비밀번호"
                        required
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "작성 중..." : "포스트 작성"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}