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
import { getLanguageText } from "@/utils/language"

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

const trackEvent = (action: string, label: string) => {
    if (typeof window !== "undefined") {
        setTimeout(() => {
            if (window.gtag) {
                window.gtag("event", action, {
                    event_category: "Marker",
                    event_label: label,
                })
            } else {
                console.warn("Google Analytics gtag not available")
            }
        }, 1000)
    }
}

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
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [passwordInput, setPasswordInput] = useState("")
    const [postToDelete, setPostToDelete] = useState<string | null>(null)
    const text = getLanguageText()

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
            setFetchError(text.postError)
        }
    }, [data, error, text.postError])

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
                throw new Error(data.message || text.createPostError)
            }
            trackEvent("post_created", markerName)
            setNewPost({ title: "", content: "", password: "" })
            setIsCreateFormOpen(false)
            mutate() // Revalidate SWR cache
        } catch (error) {
            console.error("Error creating post:", error)
            setFetchError(
                error instanceof Error ? error.message : text.createPostError
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
                throw new Error(data.message || text.editPostError)
            }
            trackEvent("post_edited", editPost.title)
            setEditPost(null)
            mutate()
        } catch (error) {
            console.error("Error editing post:", error)
            toast.error(
                error instanceof Error ? error.message : text.editPostError
            )
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
                throw new Error(data.message || text.deletePostError)
            }
            trackEvent("post_deleted", postId)
            mutate()
        } catch (error) {
            console.error("Error deleting post:", error)
            setFetchError(
                error instanceof Error ? error.message : text.deletePostError
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
                throw new Error(data.message || text.likePostError)
            }
            trackEvent("post_liked", postId)
            mutate()
        } catch (error) {
            console.error("Error liking post:", error)
            setFetchError(
                error instanceof Error ? error.message : text.likePostError
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
                toast.error(data.message || text.deleteMarkerError)
            }

            trackEvent("marker_deleted", markerName)
            onClose()
            router.push("/")
            toast.success(text.deleteMarkerSuccess)
        } catch (error) {
            console.error("Error deleting marker:", error)
            setFetchError(
                error instanceof Error ? error.message : text.deleteMarkerError
            )
        } finally {
            setIsLoading(false)
        }
    }
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (postToDelete && passwordInput) {
            await handleDeletePost(postToDelete, passwordInput)
            setIsPasswordModalOpen(false)
            setPasswordInput("")
            setPostToDelete(null)
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent
                    className='z-[1000] max-w-md sm:max-w-lg'
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>{markerName}</DialogTitle>
                    </DialogHeader>

                    {fetchError && (
                        <div className='text-red-500 mb-4'>{fetchError}</div>
                    )}
                    {isDeleteConfirmOpen ? (
                        <div className='space-y-4'>
                            <p>{text.deleteConfirm}</p>
                            <div className='flex justify-end space-x-2'>
                                <Button
                                    variant='outline'
                                    onClick={() =>
                                        setIsDeleteConfirmOpen(false)
                                    }
                                    disabled={isLoading}
                                >
                                    {text.cancel}
                                </Button>
                                <Button
                                    variant='destructive'
                                    onClick={() => {
                                        setIsDeleteConfirmOpen(false)
                                        handleDeleteMarker()
                                    }}
                                    disabled={isLoading}
                                >
                                    {text.delete}
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
                                                {text.delete}
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() =>
                                                setIsCreateFormOpen(true)
                                            }
                                            disabled={isLoading}
                                        >
                                            {text.writePost}
                                        </Button>
                                    </div>
                                )}
                                {isLoading && !posts.length ? (
                                    <div className='text-center text-gray-500'>
                                        {text.loading}
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
                                                        placeholder={
                                                            text.titlePlaceholder
                                                        }
                                                    />
                                                    <Textarea
                                                        value={editPost.content}
                                                        onChange={(e) =>
                                                            setEditPost({
                                                                ...editPost,
                                                                content:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder={
                                                            text.contentPlaceholder
                                                        }
                                                        required
                                                    />
                                                    <Input
                                                        type='password'
                                                        value={
                                                            editPost.password
                                                        }
                                                        onChange={(e) =>
                                                            setEditPost({
                                                                ...editPost,
                                                                password:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder={
                                                            text.passwordPlaceholder
                                                        }
                                                        required
                                                    />
                                                    <div className='flex justify-end space-x-2'>
                                                        <Button
                                                            type='button'
                                                            variant='outline'
                                                            onClick={() =>
                                                                setEditPost(
                                                                    null
                                                                )
                                                            }
                                                            disabled={isLoading}
                                                        >
                                                            {text.cancel}
                                                        </Button>
                                                        <Button
                                                            type='submit'
                                                            disabled={isLoading}
                                                        >
                                                            {text.save}
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
                                                            {text.like}
                                                        </Button>
                                                        <Button
                                                            variant='outline'
                                                            onClick={() =>
                                                                setEditPost({
                                                                    id: post.id,
                                                                    title: post.title,
                                                                    content:
                                                                        post.content,
                                                                    password:
                                                                        "",
                                                                })
                                                            }
                                                            disabled={isLoading}
                                                        >
                                                            {text.edit}
                                                        </Button>
                                                        <Button
                                                            variant='destructive'
                                                            onClick={() => {
                                                                setPostToDelete(
                                                                    post.id
                                                                )
                                                                setIsPasswordModalOpen(
                                                                    true
                                                                )
                                                            }}
                                                            disabled={isLoading}
                                                        >
                                                            {text.delete}
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className='text-center text-gray-500'>
                                        {text.noPosts}
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
                                        placeholder={text.titlePlaceholder}
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
                                        placeholder={text.contentPlaceholder}
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
                                        placeholder={text.passwordPlaceholder}
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
                                            {text.cancel}
                                        </Button>
                                        <Button
                                            type='submit'
                                            disabled={isLoading}
                                        >
                                            {text.writePost}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* New Password Modal */}
            <Dialog
                open={isPasswordModalOpen}
                onOpenChange={(open) => {
                    setIsPasswordModalOpen(open)
                    if (!open) {
                        setPasswordInput("")
                        setPostToDelete(null)
                    }
                }}
            >
                <DialogContent
                    className='z-[1001] max-w-md'
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle>{text.passwordPlaceholder}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePasswordSubmit} className='space-y-4'>
                        <Input
                            type='password'
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder={text.passwordPlaceholder}
                            required
                            disabled={isLoading}
                        />
                        <div className='flex justify-end space-x-2'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    setIsPasswordModalOpen(false)
                                    setPasswordInput("")
                                    setPostToDelete(null)
                                }}
                                disabled={isLoading}
                            >
                                {text.cancel}
                            </Button>
                            <Button
                                type='submit'
                                disabled={isLoading || !passwordInput}
                            >
                                {text.delete}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
