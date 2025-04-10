import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

interface CreateMarkerModalProps {
    isOpen: boolean
    onClose: () => void
    position: { lat: number; lng: number }
    onMarkerCreated: () => void
}

export default function CreateMarkerModal({
    isOpen,
    onClose,
    position,
    onMarkerCreated,
}: CreateMarkerModalProps) {
    const [name, setName] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch("/api/markers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    latitude: position.lat,
                    longitude: position.lng,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                alert(data.message)
                return
            }

            setName("")
            onMarkerCreated()
            onClose()
        } catch (error) {
            console.error("Error creating marker:", error)
            alert("마커 생성 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>새 마커 생성</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block text-sm font-medium mb-1'>
                            마커 이름
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='마커 이름을 입력하세요'
                            required
                        />
                    </div>
                    <div className='flex justify-end space-x-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            취소
                        </Button>
                        <Button type='submit' disabled={isLoading}>
                            {isLoading ? "생성 중..." : "생성"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
