import { useState, useEffect, useMemo } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { debounce } from "lodash"
import * as Dialog from "@radix-ui/react-dialog"

interface Marker {
    id: string
    name: string
    latitude: number
    longitude: number
    posts: { id: string }[]
}

interface Post {
    id: string
    title: string
    content: string
}

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title: string
    description: string
}

function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
}: ConfirmDialogProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className='fixed inset-0 bg-black/50' />
                <Dialog.Content className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-md w-full'>
                    <Dialog.Title className='text-lg font-semibold'>
                        {title}
                    </Dialog.Title>
                    <Dialog.Description className='mt-2 text-gray-600'>
                        {description}
                    </Dialog.Description>
                    <div className='mt-4 flex justify-end space-x-2'>
                        <Button
                            variant='outline'
                            onClick={() => onOpenChange(false)}
                        >
                            취소
                        </Button>
                        <Button variant='destructive' onClick={onConfirm}>
                            확인
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default function AdminPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [deletableMarkers, setDeletableMarkers] = useState<Marker[]>([])
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPosts, setTotalPosts] = useState(0)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState<
        "deletePost" | "deleteMarker" | null
    >(null)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const limit = 10

    const fetchData = useMemo(
        () =>
            debounce(async () => {
                try {
                    setIsLoading(true)
                    const [markersRes, postsRes] = await Promise.all([
                        fetch("/api/markers"),
                        fetch(`/api/posts?page=${page}&limit=${limit}`),
                    ])

                    if (!markersRes.ok || !postsRes.ok) {
                        throw new Error("데이터 조회 실패")
                    }

                    const markersData: Marker[] = await markersRes.json()
                    const postsData = await postsRes.json()

                    const deletable = markersData.filter(
                        (marker) => marker.posts.length === 0
                    )

                    setDeletableMarkers(deletable)
                    setPosts(postsData.posts)
                    setTotalPosts(postsData.total)
                } catch (error) {
                    console.error("Error fetching data:", error)
                    alert("데이터를 불러오는 중 오류가 발생했습니다.")
                } finally {
                    setIsLoading(false)
                }
            }, 500),
        [page, limit]
    )

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login")
        } else if (status === "authenticated") {
            console.log("Session data:", session)
            if (session?.user?.isAdmin !== true) {
                router.push("/")
            } else {
                fetchData()
            }
        }
    }, [status, session, router, fetchData])

    const handleDeleteMarker = (id: string) => {
        setItemToDelete(id)
        setConfirmAction("deleteMarker")
        setConfirmOpen(true)
    }

    const handleDeletePost = (id: string) => {
        setItemToDelete(id)
        setConfirmAction("deletePost")
        setConfirmOpen(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete || !confirmAction) return

        setConfirmOpen(false)

        if (confirmAction === "deleteMarker") {
            const previousMarkers = deletableMarkers
            setDeletableMarkers(
                deletableMarkers.filter((marker) => marker.id !== itemToDelete)
            )

            try {
                const response = await fetch(`/api/markers/${itemToDelete}`, {
                    method: "DELETE",
                })

                if (!response.ok) {
                    const data = await response.json()
                    setDeletableMarkers(previousMarkers)
                    alert(data.message || "마커 삭제에 실패했습니다.")
                    return
                }
            } catch (error) {
                console.error("Error deleting marker:", error)
                setDeletableMarkers(previousMarkers)
                alert("마커 삭제 중 네트워크 오류가 발생했습니다.")
            }
        } else if (confirmAction === "deletePost") {
            if (!session?.user?.id) {
                alert("인증 정보가 없습니다. 다시 로그인해주세요.")
                setItemToDelete(null)
                setConfirmAction(null)
                return
            }

            const previousPosts = posts
            setPosts(posts.filter((post) => post.id !== itemToDelete))

            try {
                const response = await fetch(`/api/posts/${itemToDelete}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${session.user.id}` },
                })

                if (!response.ok) {
                    const data = await response.json()
                    setPosts(previousPosts)
                    alert(data.message || "포스트 삭제에 실패했습니다.")
                    return
                }
            } catch (error) {
                console.error("Error deleting post:", error)
                setPosts(previousPosts)
                alert("포스트 삭제 중 네트워크 오류가 발생했습니다.")
            }
        }

        setItemToDelete(null)
        setConfirmAction(null)
    }

    if (status === "loading" || isLoading) {
        return (
            <div className='h-screen flex items-center justify-center'>
                로딩중...
            </div>
        )
    }

    return (
        <div className='min-h-screen p-4 sm:p-6'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <CardTitle>어드민 대시보드</CardTitle>
                    <Button
                        variant='destructive'
                        onClick={() => signOut({ callbackUrl: "/" })}
                    >
                        로그아웃
                    </Button>
                </CardHeader>
                <CardContent>
                    <h2 className='text-lg font-semibold mt-8 mb-4'>
                        포스트 목록
                    </h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>제목</TableHead>
                                <TableHead>내용</TableHead>
                                <TableHead>작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell>{post.title}</TableCell>
                                        <TableCell className='max-w-xs'>
                                            {post.content}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant='destructive'
                                                size='sm'
                                                onClick={() =>
                                                    handleDeletePost(post.id)
                                                }
                                            >
                                                삭제
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className='text-center'
                                    >
                                        포스트가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <div className='flex justify-between mt-4'>
                        <Button
                            disabled={page === 1}
                            onClick={() => setPage((prev) => prev - 1)}
                        >
                            이전
                        </Button>
                        <span>
                            페이지 {page} / {Math.ceil(totalPosts / limit)}
                        </span>
                        <Button
                            disabled={page * limit >= totalPosts}
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            다음
                        </Button>
                    </div>
                    <h2 className='text-lg font-semibold mt-8 mb-4'>
                        삭제 가능한 마커
                    </h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>이름</TableHead>
                                <TableHead>위도</TableHead>
                                <TableHead>경도</TableHead>
                                <TableHead>작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deletableMarkers.length > 0 ? (
                                deletableMarkers.map((marker) => (
                                    <TableRow key={marker.id}>
                                        <TableCell>{marker.name}</TableCell>
                                        <TableCell>{marker.latitude}</TableCell>
                                        <TableCell>
                                            {marker.longitude}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant='destructive'
                                                size='sm'
                                                onClick={() =>
                                                    handleDeleteMarker(
                                                        marker.id
                                                    )
                                                }
                                            >
                                                삭제
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className='text-center'
                                    >
                                        삭제 가능한 마커가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={(open) => {
                    setConfirmOpen(open)
                    if (!open) {
                        setItemToDelete(null)
                        setConfirmAction(null)
                    }
                }}
                onConfirm={confirmDelete}
                title={
                    confirmAction === "deletePost" ? "포스트 삭제" : "마커 삭제"
                }
                description={
                    confirmAction === "deletePost"
                        ? "이 포스트를 삭제하시겠습니까?"
                        : "이 마커를 삭제하시겠습니까?"
                }
            />
        </div>
    )
}
