import { useState } from "react"
import { PrismaClient } from "@prisma/client"
import Maps from "../components/Maps"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog"
import { Textarea } from "../components/ui/textarea"

const prisma = new PrismaClient()

interface Post {
    id: string
    title: string
    content: string
    markerName?: string
    latitude: number
    longitude: number
    likes: number
    password: string
    createdAt: string
}

interface HomeProps {
    posts: Post[]
}

export async function getServerSideProps() {
    const posts = await prisma.post.findMany({
        orderBy: { likes: "desc" },
        select: {
            id: true,
            title: true,
            content: true,
            markerName: true,
            latitude: true,
            longitude: true,
            likes: true,
            password: true,
            createdAt: true,
        },
    })

    const serializedPosts = posts.map((post) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
    }))

    return { props: { posts: serializedPosts } }
}

export default function Home({ posts }: HomeProps) {
    const [newPost, setNewPost] = useState({
        title: "",
        content: "",
        markerName: "",
        lat: 51.505,
        lng: -0.09,
        password: "",
    })
    const [editPost, setEditPost] = useState<Post | null>(null)
    const [selectedMarker, setSelectedMarker] = useState<{
        lat: number
        lng: number
    } | null>(null)

    const handleMapClick = (lat: number, lng: number) => {
        setSelectedMarker({ lat, lng })
        setNewPost({ ...newPost, lat, lng })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedMarker) return

        // 해당 위치에 이미 마커가 있는지 확인
        const existingMarker = posts.find(
            (post) =>
                post.latitude === selectedMarker.lat &&
                post.longitude === selectedMarker.lng
        )

        // 이미 마커가 있고, 마커 이름이 다르다면 에러
        if (
            existingMarker &&
            existingMarker.markerName !== newPost.markerName
        ) {
            alert("이 위치에는 이미 다른 이름의 마커가 있습니다.")
            return
        }

        await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPost),
        })
        setNewPost({
            title: "",
            content: "",
            markerName: "",
            lat: 51.505,
            lng: -0.09,
            password: "",
        })
        setSelectedMarker(null)
        window.location.reload()
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editPost) return
        await fetch(`/api/posts/${editPost.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editPost),
        })
        setEditPost(null)
        window.location.reload()
    }

    const handleDelete = async (postId: string) => {
        const password = prompt("Enter the post password:")
        if (!password) return
        const res = await fetch(`/api/posts/${postId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        })
        if (res.ok) window.location.reload()
        else alert("Incorrect password or error occurred.")
    }

    return (
        <div className='flex h-screen'>
            <div className='w-1/3 p-4 overflow-y-auto'>
                <Card>
                    <CardHeader>
                        <CardTitle>Add a Positive Moment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            {selectedMarker && (
                                <Input
                                    placeholder='Marker Name'
                                    value={newPost.markerName}
                                    onChange={(e) =>
                                        setNewPost({
                                            ...newPost,
                                            markerName: e.target.value,
                                        })
                                    }
                                    required
                                />
                            )}
                            <Input
                                placeholder='Title'
                                value={newPost.title}
                                onChange={(e) =>
                                    setNewPost({
                                        ...newPost,
                                        title: e.target.value,
                                    })
                                }
                            />
                            <textarea
                                placeholder='Share something positive...'
                                value={newPost.content}
                                onChange={(e) =>
                                    setNewPost({
                                        ...newPost,
                                        content: e.target.value,
                                    })
                                }
                                className='w-full p-2 border rounded'
                            />
                            <Input
                                type='password'
                                placeholder='Password for edit/delete'
                                value={newPost.password}
                                onChange={(e) =>
                                    setNewPost({
                                        ...newPost,
                                        password: e.target.value,
                                    })
                                }
                            />
                            <Button type='submit' disabled={!selectedMarker}>
                                Post
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <div className='mt-4 space-y-4'>
                    {posts.map((post: Post) => (
                        <Card
                            className='shadow-lg hover:shadow-xl transition-shadow'
                            key={post.id}
                        >
                            <CardHeader className='bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
                                <CardTitle>
                                    {post.markerName || "Unnamed"} -{" "}
                                    {post.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='pt-4'>
                                <p className='text-gray-700'>{post.content}</p>
                                <p className='text-sm text-gray-500'>
                                    Likes: {post.likes}
                                </p>
                                <div className='flex space-x-2 mt-2'>
                                    <Button
                                        className='bg-green-500 hover:bg-green-600'
                                        onClick={async () => {
                                            await fetch(
                                                `/api/posts/${post.id}/like`,
                                                { method: "POST" }
                                            )
                                            window.location.reload()
                                        }}
                                    >
                                        Like
                                    </Button>
                                    <Button
                                        variant='outline'
                                        onClick={() =>
                                            setEditPost({
                                                ...post,
                                                password: "",
                                            })
                                        }
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant='destructive'
                                        onClick={() => handleDelete(post.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {editPost && (
                    <Dialog
                        open={!!editPost}
                        onOpenChange={() => setEditPost(null)}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Post</DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={handleEditSubmit}
                                className='space-y-4'
                            >
                                <Input
                                    value={editPost.markerName}
                                    onChange={(e) =>
                                        setEditPost({
                                            ...editPost,
                                            markerName: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    value={editPost.title}
                                    onChange={(e) =>
                                        setEditPost({
                                            ...editPost,
                                            title: e.target.value,
                                        })
                                    }
                                />
                                <Textarea
                                    value={editPost.content}
                                    onChange={(e) =>
                                        setEditPost({
                                            ...editPost,
                                            content: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    type='password'
                                    placeholder='Password'
                                    value={editPost.password}
                                    onChange={(e) =>
                                        setEditPost({
                                            ...editPost,
                                            password: e.target.value,
                                        })
                                    }
                                />
                                <Button type='submit'>Save</Button>
                                <Button
                                    variant='outline'
                                    onClick={() => setEditPost(null)}
                                >
                                    Cancel
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <div className='w-2/3'>
                <Maps posts={posts} onMapClick={handleMapClick} />
            </div>
        </div>
    )
}
