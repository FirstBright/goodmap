"use client"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import useSWR from "swr"
import { useRouter } from "next/router"
import { toast } from "react-toastify"
interface Post {
    id: string
    title: string
    content: string
    createdAt: string
}

interface PostModalProps {
    isOpen: boolean
    onClose: () => void
    markerId: string
    markerName: string
    initialPosts?: Post[]
    editId?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PostModal({
    isOpen,
    onClose,
    markerId,
    markerName,
    initialPosts = [],
    editId,
}: PostModalProps) {
    const router = useRouter()
    const [posts, setPosts] = useState<Post[]>(initialPosts)
    const [newPost, setNewPost] = useState({
        title: "",
        content: "",
        password: "",
    })
    const [editPost, setEditPost] = useState<{
        id: string
        title: string
        content: string
        password: string
    } | null>(null)
    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

    // Use SWR for client-side data fetching
    const { data, error, mutate } = useSWR(
        `/api/markers/${markerId}/posts`,
        fetcher,
        {
            fallbackData: initialPosts,
            revalidateOnFocus: false,
        }
    )
    useEffect(() => {
        if (data) {
            setPosts(data)
        }
        if (error) {
            setFetchError("글을 불러오는 데 실패했습니다.")
        }
    }, [data, error])
    useEffect(() => {
        if (isOpen && editId && posts.length) {
            const post = posts.find((p) => p.id === editId)
            if (post) {
                setEditPost({
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    password: "",
                })
            }
        }
    }, [isOpen, editId, posts])

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setFetchError(null)

        try {
            const response = await fetch(`/api/markers/${markerId}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPost),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || "글 생성 실패")
            }

            setNewPost({ title: "", content: "", password: "" })
            setIsCreateFormOpen(false)
            mutate() // Revalidate SWR cache
        } catch (error) {
            console.error("Error creating post:", error)
            setFetchError(
                error instanceof Error
                    ? error.message
                    : "글 생성 중 오류가 발생했습니다."
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditPost = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editPost) return

        setIsLoading(true)
        setFetchError(null)
        try {
            const response = await fetch(`/api/posts/${editPost.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editPost.title,
                    content: editPost.content,
                    password: editPost.password,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || "글 수정 실패")
            }

            setEditPost(null)
            mutate()
        } catch (error) {
            console.error("Error editing post:", error)
            alert("글 수정 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeletePost = async (postId: string, password: string) => {
        setIsLoading(true)
        setFetchError(null)
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || "글 삭제 실패")
            }

            mutate()
        } catch (error) {
            console.error("Error deleting post:", error)
            setFetchError(
                error instanceof Error
                    ? error.message
                    : "글 삭제 중 오류가 발생했습니다."
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleLikePost = async (postId: string) => {
        setIsLoading(true)
        setFetchError(null)
        try {
            const response = await fetch(`/api/posts/${postId}/likes`, {
                method: "POST",
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || "좋아요 실패")
            }

            mutate()
        } catch (error) {
            console.error("Error liking post:", error)
            setFetchError(
                error instanceof Error
                    ? error.message
                    : "글 좋아요 중 오류가 발생했습니다."
            )
        } finally {
            setIsLoading(false)
        }
    }
    const handleDeleteMarker = async () => {
        setIsLoading(true)
        setFetchError(null)
        try {
            const response = await fetch(`/api/markers/${markerId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const data = await response.json()
                toast.error(data.message || "마커 삭제 실패")
            }

            // Close modal and redirect to home
            onClose()
            router.push("/")
            toast.success("마커가 삭제되었습니다.")
        } catch (error) {
            console.error("Error deleting marker:", error)
            setFetchError(
                error instanceof Error
                    ? error.message
                    : "마커 삭제 중 오류가 발생했습니다."
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className='z-[1000] max-w-md sm:max-w-lg'
                aria-describedby='dialog-description'
            >
                <DialogHeader>
                    <DialogTitle>{markerName}</DialogTitle>
                </DialogHeader>

                {fetchError && (
                    <div className='text-red-500 mb-4'>{fetchError}</div>
                )}
                {isDeleteConfirmOpen ? (                  
                    <div className='space-y-4'>
                        <p>이 마커를 삭제하시겠습니까?</p>
                        <div className='flex justify-end space-x-2'>
                            <Button
                                variant='outline'
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                disabled={isLoading}
                            >
                                취소
                            </Button>
                            <Button
                                variant='destructive'
                                onClick={() => {
                                    setIsDeleteConfirmOpen(false)
                                    handleDeleteMarker()
                                }}
                                disabled={isLoading}
                            >
                                삭제
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 글 목록 */}
                        <div className='space-y-4 max-h-[60vh] overflow-y-auto'>
                            {!isCreateFormOpen && !editPost && (
                                <div className='flex justify-end space-x-2 mb-4'>
                                    {posts.length === 0 && (
                                        <Button
                                            variant='destructive'
                                            onClick={() =>
                                                setIsDeleteConfirmOpen(true)
                                            }
                                            disabled={isLoading}
                                        >
                                            삭제
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() =>
                                            setIsCreateFormOpen(true)
                                        }
                                        disabled={isLoading}
                                    >
                                        글 작성
                                    </Button>
                                </div>
                            )}
                            {isLoading && !posts.length ? (
                                <div className='text-center text-gray-500'>
                                    로딩중...
                                </div>
                            ) : posts.length > 0 ? (
                                posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className='border p-4 rounded-lg'
                                    >
                                        {editPost?.id === post.id ? (
                                            <form
                                                onSubmit={handleEditPost}
                                                className='space-y-2'
                                            >
                                                <Input
                                                    value={editPost.title}
                                                    onChange={(e) =>
                                                        setEditPost({
                                                            ...editPost,
                                                            title: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder='제목'
                                                />
                                                <Textarea
                                                    value={editPost.content}
                                                    onChange={(e) =>
                                                        setEditPost({
                                                            ...editPost,
                                                            content:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder='내용'
                                                    required
                                                />
                                                <Input
                                                    type='password'
                                                    value={editPost.password}
                                                    onChange={(e) =>
                                                        setEditPost({
                                                            ...editPost,
                                                            password:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder='비밀번호'
                                                    required
                                                />
                                                <div className='flex justify-end space-x-2'>
                                                    <Button
                                                        type='button'
                                                        variant='outline'
                                                        onClick={() =>
                                                            setEditPost(null)
                                                        }
                                                        disabled={isLoading}
                                                    >
                                                        취소
                                                    </Button>
                                                    <Button
                                                        type='submit'
                                                        disabled={isLoading}
                                                    >
                                                        저장
                                                    </Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <h3 className='font-bold'>
                                                    {post.title}
                                                </h3>
                                                <p className='break-words'>
                                                    {post.content}
                                                </p>
                                                <p className='text-sm text-gray-500'>
                                                    {new Date(
                                                        post.createdAt
                                                    ).toLocaleString()}
                                                </p>
                                                <div className='flex justify-end space-x-2 mt-2'>
                                                    <Button
                                                        variant='outline'
                                                        onClick={() =>
                                                            handleLikePost(
                                                                post.id
                                                            )
                                                        }
                                                        disabled={isLoading}
                                                    >
                                                        좋아요
                                                    </Button>
                                                    <Button
                                                        variant='outline'
                                                        onClick={() =>
                                                            setEditPost({
                                                                id: post.id,
                                                                title: post.title,
                                                                content:
                                                                    post.content,
                                                                password: "",
                                                            })
                                                        }
                                                        disabled={isLoading}
                                                    >
                                                        수정
                                                    </Button>
                                                    <Button
                                                        variant='destructive'
                                                        onClick={() => {
                                                            const password =
                                                                prompt(
                                                                    "비밀번호를 입력하세요"
                                                                )
                                                            if (password)
                                                                handleDeletePost(
                                                                    post.id,
                                                                    password
                                                                )
                                                        }}
                                                        disabled={isLoading}
                                                    >
                                                        삭제
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className='text-center text-gray-500'>
                                    글이 없습니다.
                                </div>
                            )}
                        </div>

                        {/* 새 글 작성 */}
                        {isCreateFormOpen && (
                            <form
                                onSubmit={handleCreatePost}
                                className='space-y-4 mt-4'
                            >
                                <Input
                                    value={newPost.title}
                                    onChange={(e) =>
                                        setNewPost({
                                            ...newPost,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder='제목'
                                    required
                                    disabled={isLoading}
                                />
                                <Textarea
                                    value={newPost.content}
                                    onChange={(e) =>
                                        setNewPost({
                                            ...newPost,
                                            content: e.target.value,
                                        })
                                    }
                                    placeholder='내용'
                                    required
                                    disabled={isLoading}
                                    className='min-h-[100px]'
                                />
                                <Input
                                    type='password'
                                    value={newPost.password}
                                    onChange={(e) =>
                                        setNewPost({
                                            ...newPost,
                                            password: e.target.value,
                                        })
                                    }
                                    placeholder='비밀번호'
                                    required
                                    disabled={isLoading}
                                />
                                <div className='flex justify-end space-x-2'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={() =>
                                            setIsCreateFormOpen(false)
                                        }
                                        disabled={isLoading}
                                    >
                                        취소
                                    </Button>
                                    <Button type='submit' disabled={isLoading}>
                                        작성
                                    </Button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
