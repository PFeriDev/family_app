"use client";

import { useState, useEffect } from "react";
import { Plus, Image, Trash2, FolderOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Album, Photo, Person } from "@/types";

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<string>("all");
  const [activePerson, setActivePerson] = useState<string>("all");

  const [albumOpen, setAlbumOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoAlbum, setPhotoAlbum] = useState("none");
  const [photoPerson, setPhotoPerson] = useState("none");
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  const fetchAll = async () => {
    const [albumsRes, photosRes, personsRes] = await Promise.all([
      fetch("/api/albums"),
      fetch("/api/photos"),
      fetch("/api/persons"),
    ]);
    setAlbums(await albumsRes.json());
    setPhotos(await photosRes.json());
    setPersons(await personsRes.json());
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreateAlbum = async () => {
    if (!albumTitle.trim()) return;
    await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: albumTitle }),
    });
    setAlbumOpen(false);
    setAlbumTitle("");
    fetchAll();
  };

  const handleAddPhoto = async () => {
    if (!photoUrl.trim()) return;
    await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: photoUrl,
        caption: photoCaption || null,
        albumId: photoAlbum === "none" ? null : photoAlbum,
        personId: photoPerson === "none" ? null : photoPerson,
      }),
    });
    setPhotoOpen(false);
    setPhotoUrl("");
    setPhotoCaption("");
    setPhotoAlbum("none");
    setPhotoPerson("none");
    fetchAll();
  };

  const handleDeletePhoto = async (id: string) => {
    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    setLightbox(null);
    fetchAll();
  };

  const filteredPhotos = photos.filter((p) => {
    if (activeAlbum !== "all" && p.albumId !== activeAlbum) return false;
    if (activePerson !== "all" && p.personId !== activePerson) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Galéria</h1>
          <p className="text-sm text-muted-foreground">{filteredPhotos.length} fotó</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAlbumOpen(true)} className="gap-1.5">
            <FolderOpen className="h-4 w-4" /> Album
          </Button>
          <Button onClick={() => setPhotoOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Fotó
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center mr-1">Album:</span>
          {[{ id: "all", title: "Összes" }, ...albums].map((a) => (
            <button key={a.id} onClick={() => setActiveAlbum(a.id)}
              className={cn("rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                activeAlbum === a.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
              )}>
              {a.title}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center mr-1">Személy:</span>
          {[{ id: "all", name: "Összes" }, ...persons].map((p) => (
            <button key={p.id} onClick={() => setActivePerson(p.id)}
              className={cn("rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                activePerson === p.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
              )}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Photo grid */}
      {filteredPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
          <Image className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Még nincs fotó.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} onClick={() => setLightbox(photo)}
              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer">
              <img src={photo.url} alt={photo.caption ?? ""} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity truncate">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption ?? ""} className="max-h-[80vh] max-w-full rounded-lg object-contain" />
            {lightbox.caption && <p className="mt-2 text-center text-sm text-white">{lightbox.caption}</p>}
            <div className="absolute right-6 top-6 flex gap-2">
              <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeletePhoto(lightbox.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Album dialog */}
      <Dialog open={albumOpen} onOpenChange={(v) => !v && setAlbumOpen(false)}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader><DialogTitle>Új album</DialogTitle></DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label>Album neve</Label>
            <Input value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} placeholder="pl. Nyaralás 2025" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlbumOpen(false)}>Mégse</Button>
            <Button onClick={handleCreateAlbum} disabled={!albumTitle.trim()}>Létrehozás</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo dialog */}
      <Dialog open={photoOpen} onOpenChange={(v) => !v && setPhotoOpen(false)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Fotó hozzáadása</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Kép URL</Label>
              <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
            </div>
            {photoUrl && <img src={photoUrl} alt="preview" className="h-32 w-full object-cover rounded-lg" />}
            <div className="space-y-1.5">
              <Label>Felirat (opcionális)</Label>
              <Input value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)} placeholder="Rövid leírás..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Album</Label>
                <Select value={photoAlbum} onValueChange={setPhotoAlbum}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nincs album</SelectItem>
                    {albums.map((a) => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Személy</Label>
                <Select value={photoPerson} onValueChange={setPhotoPerson}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nincs személy</SelectItem>
                    {persons.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoOpen(false)}>Mégse</Button>
            <Button onClick={handleAddPhoto} disabled={!photoUrl.trim()}>Hozzáadás</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
