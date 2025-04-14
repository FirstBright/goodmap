'use client'
import { useState, useEffect, useCallback } from "react";
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
    editId?: string;
}

export default function PostModal({ isOpen, onClose, markerId, markerName, editId }: PostModalProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState({ title: "", content: "", password: "" });
    const [editPost, setEditPost] = useState<{ id: string; title: string; content: string; password: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);



    const fetchPosts = useCallback(async () => {
        try {
            setIsLoading(true);
            setFetchError(null);
            console.log(`Fetching posts for markerId: ${markerId}`);
            const response = await fetch(`/api/markers/${markerId}/posts`, { method: "GET" });
            console.log(`GET /api/markers/${markerId}/posts status: ${response.status}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch posts: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched posts:", data);
            setPosts(data);

            // Prefill edit form if editId is provided
            if (editId) {
                const post = data.find((p: Post) => p.id === editId);
                if (post) {
                    console.log("Prefilling edit form for editId:", editId);
                    setEditPost({ id: post.id, title: post.title, content: post.content, password: "" });
                }
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            setFetchError("포스트를 불러오는 데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [markerId, editId]);
    useEffect(() => {
        if (isOpen && markerId) {
            fetchPosts();
        }
    }, [isOpen, markerId, fetchPosts]);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFetchError(null);

        try {
            const response = await fetch(`/api/markers/${markerId}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPost),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "포스트 생성 실패")
            }

            setNewPost({ title: "", content: "", password: "" });
            fetchPosts();
        } catch (error) {
            console.error("Error creating post:", error);
            setFetchError(error instanceof Error ? error.message : "포스트 생성 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editPost) return;

        setIsLoading(true);
        setFetchError(null);
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
                throw new Error(data.message || "포스트 수정 실패");
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
        setFetchError(null);
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "포스트 삭제 실패");
            }

            fetchPosts();
        } catch (error) {
            console.error("Error deleting post:", error);
            setFetchError(error instanceof Error ? error.message : "포스트 삭제 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLikePost = async (postId: string) => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const response = await fetch(`/api/posts/${postId}/likes`, {
                method: "POST",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "좋아요 실패");
            }

            fetchPosts();
        } catch (error) {
            console.error("Error liking post:", error);
            setFetchError(error instanceof Error ? error.message : "포스트 좋아요 중 오류가 발생했습니다.");
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

                {fetchError && (
                    <div className="text-red-500 mb-4">{fetchError}</div>
                )}

                {/* 포스트 목록 */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {isLoading && !posts.length ? (
                        <div className="text-center text-gray-500">로딩중...</div>
                    ) : posts.length > 0 ? (
                        posts.map((post) => (
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
                        ))
                    ) : (
                        <div className="text-center text-gray-500">포스트가 없습니다.</div>
                    )}
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