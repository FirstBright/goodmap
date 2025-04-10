import { useState } from "react"
import { PrismaClient } from "@prisma/client"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import jwt from "jsonwebtoken"
import { GetServerSidePropsContext } from "next"

const prisma = new PrismaClient()
const JWT_SECRET = "your-secret-key" // Store this in .env in production

interface Post {
    id: string
    title: string
    content: string
    markerName?: string
    likes: number
}

interface AdminProps {
    posts: Post[]
    isAuthenticated: boolean
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const token = context.req.cookies.token
    if (!token) return { props: { posts: [], isAuthenticated: false } }

    try {
        jwt.verify(token, JWT_SECRET)
        const posts = await prisma.post.findMany({ orderBy: { likes: "desc" } })
        return { props: { posts, isAuthenticated: true } }
    } catch {
        return { props: { posts: [], isAuthenticated: false } }
    }
}

export default function Admin({ posts, isAuthenticated }: AdminProps) {
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        })
        if (res.ok) window.location.reload()
        else alert("Login failed")
    }

    const handleDelete = async (postId: string) => {
        await fetch(`/api/posts/${postId}`, { method: "DELETE" }) // Admin bypasses password
        window.location.reload()
    }

    if (!isAuthenticated) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Card className='w-96'>
                    <CardHeader>
                        <CardTitle>Admin Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className='space-y-4'>
                            <input
                                type='text'
                                placeholder='Username'
                                value={credentials.username}
                                onChange={(e) =>
                                    setCredentials({
                                        ...credentials,
                                        username: e.target.value,
                                    })
                                }
                                className='w-full p-2 border rounded'
                            />
                            <input
                                type='password'
                                placeholder='Password'
                                value={credentials.password}
                                onChange={(e) =>
                                    setCredentials({
                                        ...credentials,
                                        password: e.target.value,
                                    })
                                }
                                className='w-full p-2 border rounded'
                            />
                            <Button type='submit'>Login</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className='p-4'>
            <h1 className='text-2xl font-bold mb-4'>Admin Dashboard</h1>
            <div className='space-y-4'>
                {posts.map((post: Post) => (
                    <Card key={post.id}>
                        <CardHeader>
                            <CardTitle>
                                {post.markerName || "Unnamed"} - {post.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{post.content}</p>
                            <p>Likes: {post.likes}</p>
                            <Button
                                variant='destructive'
                                onClick={() => handleDelete(post.id)}
                            >
                                Delete
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
