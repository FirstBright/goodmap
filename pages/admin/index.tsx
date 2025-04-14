import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Marker {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    posts: { id: string }[];
}

interface Post {
    id: string;
    title: string;
    markerId: string;
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [deletableMarkers, setDeletableMarkers] = useState<Marker[]>([])
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        } else if (status === "authenticated") {
            console.log("Session data:", session);
            if (session?.user?.isAdmin !== true) {
                router.push("/");
            } else {
                fetchData();
            }
        }
    }, [status, session, router]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [markersRes, postsRes] = await Promise.all([
                fetch("/api/markers"),
                fetch("/api/posts"),
            ]);

            if (!markersRes.ok || !postsRes.ok) {
                throw new Error("데이터 조회 실패");
            }

            const markersData: Marker[] = await markersRes.json();
            const postsData: Post[] = await postsRes.json();

            // Filter markers with no posts
            const deletable = markersData.filter((marker) => marker.posts.length === 0);

            setMarkers(markersData);
            setDeletableMarkers(deletable);
            setPosts(postsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMarker = async (id: string) => {
        if (!confirm("이 마커를 삭제하시겠습니까?")) return;

        try {
            const response = await fetch(`/api/markers/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session?.user?.id}` },
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.message);
                return;
            }

            fetchData();
        } catch (error) {
            console.error("Error deleting marker:", error);
            alert("마커 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm("이 포스트를 삭제하시겠습니까?")) return;

        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session?.user?.id}` },
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.message);
                return;
            }

            fetchData();
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("포스트 삭제 중 오류가 발생했습니다.");
        }
    };

    if (status === "loading" || isLoading) {
        return <div className="h-screen flex items-center justify-center">로딩중...</div>;
    }

    return (
        <div className="min-h-screen p-4 sm:p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>어드민 대시보드</CardTitle>
                    <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
                        로그아웃
                    </Button>
                </CardHeader>
                <CardContent>

                    <h2 className="text-lg font-semibold mt-8 mb-4">삭제 가능한 마커</h2>
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
                                        <TableCell>{marker.longitude}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteMarker(marker.id)}
                                            >
                                                삭제
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        삭제 가능한 마커가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <h2 className="text-lg font-semibold mb-4">마커 목록</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>이름</TableHead>
                                <TableHead>위도</TableHead>
                                <TableHead>경도</TableHead>
                                <TableHead>포스트 수</TableHead>
                                <TableHead>작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {markers.map((marker) => (
                                <TableRow key={marker.id}>
                                    <TableCell>{marker.name}</TableCell>
                                    <TableCell>{marker.latitude}</TableCell>
                                    <TableCell>{marker.longitude}</TableCell>
                                    <TableCell>{marker.posts.length}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteMarker(marker.id)}
                                        >
                                            삭제
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <h2 className="text-lg font-semibold mt-8 mb-4">포스트 목록</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>제목</TableHead>
                                <TableHead>마커</TableHead>
                                <TableHead>작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>{post.title}</TableCell>
                                    <TableCell>{post.markerId}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeletePost(post.id)}
                                        >
                                            삭제
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}