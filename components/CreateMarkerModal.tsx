'use client'
import { useState,useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLanguageText } from "@/utils/language"

interface CreateMarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { lat: number; lng: number };
  onMarkerCreated: () => void;
}

export default function CreateMarkerModal({
  isOpen,
  onClose,
  position,
  onMarkerCreated,
}: CreateMarkerModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const text = getLanguageText();

  useEffect(() => {
    console.log("CreateMarkerModal isOpen:", isOpen);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with name:", name);
    setIsLoading(true);

    try {
        const payload = {
          name,
          latitude: position.lat,
          longitude: position.lng,
        };
        console.log("Sending POST to /api/markers:", payload);
        const response = await fetch("/api/markers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log("POST /api/markers status:", response.status);
  
        if (!response.ok) {
          const data = await response.json();
          console.error("POST error response:", data);
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Created marker:", data);
        setName("");
        onMarkerCreated();
        onClose();
      } catch (error) {
        console.error("Error creating marker:", error);
        alert(error instanceof Error ? error.message : text.errorCreatingMarker);
      } finally {
        setIsLoading(false);
      }
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
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  {text.cancel}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? text.creating: text.create}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      );
    }