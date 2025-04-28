export const getLanguageText = () => {
    const isKorean =
        typeof window !== "undefined" && navigator.language.startsWith("ko")
    return isKorean
        ? {
            // Korean text
            createMarkerTitle: "새로운 장소 생성",
            createMarkerDescription: (lat: number, lng: number) =>
                `위도: ${lat.toFixed(2)}, 경도: ${lng.toFixed(2)}`,
            markerNameLabel: "장소 이름",
            markerNamePlaceholder: "장소 이름을 입력하세요",
            cancel: "취소",
            create: "생성",
            creating: "생성 중...",
            errorCreatingMarker: "마커 생성 중 오류가 발생했습니다.",
            loading: "로딩중...",
            errorLoadingMarkers: "마커 데이터를 불러오지 못했습니다.",
            searchPlaceholder: "장소 이름으로 검색...",
            reset: "초기화",
            noPosts: "글이 없습니다.",
            writePost: "글 작성",
            delete: "삭제",
            edit: "수정",
            like: "좋아요",
            save: "저장",
            titlePlaceholder: "제목",
            contentPlaceholder: "내용",
            passwordPlaceholder: "비밀번호",
            deleteConfirm: "이 마커를 삭제하시겠습니까?",
            deleteMarkerSuccess: "마커가 삭제되었습니다.",
            deleteMarkerError: "마커 삭제 중 오류가 발생했습니다.",
            postError: "글을 불러오는 데 실패했습니다.",
            createPostError: "글 생성 중 오류가 발생했습니다.",
            editPostError: "글 수정 중 오류가 발생했습니다.",
            deletePostError: "글 삭제 중 오류가 발생했습니다.",
            likePostError: "글 좋아요 중 오류가 발생했습니다.",
            welcomeTitle: "GoodMap에 오신 것을 환영합니다!",
            welcomeDescription:
                "GoodMap은 누구나 자유롭게 숨겨진 장소를 공유하고 탐험할 수 있는 커뮤니티 지도입니다! 대륙을 선택하여 지금 시작하세요.",
            watchTutorial: "튜토리얼 동영상 보기",
        }
        : {
            // English text
            createMarkerTitle: "Create New Place",
            createMarkerDescription: (lat: number, lng: number) =>
                `Latitude: ${lat.toFixed(2)}, Longitude: ${lng.toFixed(2)}`,
            markerNameLabel: "Place Name",
            markerNamePlaceholder: "Enter place name",
            cancel: "Cancel",
            create: "Create",
            creating: "Creating...",
            errorCreatingMarker:
                "An error occurred while creating the marker.",
            loading: "Loading...",
            errorLoadingMarkers: "Failed to load marker data.",
            searchPlaceholder: "Search by place name...",
            reset: "Reset",
            noPosts: "No posts available.",
            writePost: "Write Post",
            delete: "Delete",
            edit: "Edit",
            like: "Like",
            save: "Save",
            titlePlaceholder: "Title",
            contentPlaceholder: "Content",
            passwordPlaceholder: "Password",
            deleteConfirm: "Are you sure you want to delete this marker?",
            deleteMarkerSuccess: "Marker deleted successfully.",
            deleteMarkerError: "An error occurred while deleting the marker.",
            postError: "Failed to load posts.",
            createPostError: "An error occurred while creating the post.",
            editPostError: "An error occurred while editing the post.",
            deletePostError: "An error occurred while deleting the post.",
            likePostError: "An error occurred while liking the post.",
            welcomeTitle: "Welcome to GoodMap!",
            welcomeDescription:
                "GoodMap is a community map where anyone can freely share and explore hidden places! Select a continent to get started.",
            watchTutorial: "Watch Tutorial Video",
        }
}
