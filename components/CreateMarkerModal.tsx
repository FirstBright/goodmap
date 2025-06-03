'use client'
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLanguageText } from "@/utils/language"
import { log } from "@/utils/logger";

interface CreateMarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { lat: number; lng: number };
  onMarkerCreated: () => void;
}

interface Tag {
  value: string;
  label: string;
}

const getAvailableTags = (isKorean: boolean): Tag[] => [
  { value: "restaurant", label: isKorean ? "음식점" : "Restaurant" },
  { value: "accommodation", label: isKorean ? "숙박" : "Accommodation" },
  { value: "tourism_view", label: isKorean ? "관광/뷰" : "Tourism/View" },
  { value: "cafe", label: isKorean ? "카페" : "Cafe" },
  { value: "shopping", label: isKorean ? "쇼핑" : "Shopping" },
  { value: "incident", label: isKorean ? "사건" : "Incident" },
  { value: "other", label: isKorean ? "기타" : "Other" },
];

export default function CreateMarkerModal({
  isOpen,
  onClose,
  position,
  onMarkerCreated,
}: CreateMarkerModalProps) {
  const [name, setName] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const text = getLanguageText();
  const isKorean = typeof window !== "undefined" && navigator.language.startsWith("ko");
  const AVAILABLE_TAGS = getAvailableTags(isKorean);

  useEffect(() => {
    log("CreateMarkerModal isOpen:", isOpen);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    log("Form submitted with name:", name);
    setIsLoading(true);
    setError(null)

    try {
      const payload = {
        name,
        latitude: position.lat,
        longitude: position.lng,
        tags: selectedTags,
      };
      log("Sending POST to /api/markers:", payload);
      const response = await fetch("/api/markers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      log("POST /api/markers status:", response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error("POST error response:", data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      log("Created marker:", data);
      setName("");
      onMarkerCreated();
      onClose();
      setSelectedTags([])
    } catch (err) {
      console.error("Error creating marker:", error);
      setError(err instanceof Error ? err.message : text.errorCreatingMarker);
    } finally {
      setIsLoading(false);
    }
  };
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="z-[1000] max-w-full sm:max-w-lg" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>{text.createMarkerTitle}</DialogTitle>
          <DialogDescription id="dialog-description">
            {text.createMarkerDescription(position.lat, position.lng)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="marker-name" className="block text-sm font-medium mb-1">
              {text.markerNameLabel}
            </label>
            <Input
              id="marker-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={text.markerNamePlaceholder}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {text.selectTags}
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {AVAILABLE_TAGS.map((tag) => (
                <label key={tag.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.value)}
                    onChange={() => toggleTag(tag.value)}
                    disabled={isLoading}
                  />
                  <span>{tag.label}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {text.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? text.creating : text.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}