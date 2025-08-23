"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import Image from "next/image";

import { createClient } from "@/utils/supabase/client";

interface GalleryPhoto {
  id: number;
  photo_url: string | null;
}

function ManageGalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form states for adding new photo
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  
  // Form states for editing photo
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editPhotoUrl, setEditPhotoUrl] = useState("");

  const supabase = createClient();

  const fetchPhotos = async () => {
    const { data: photoData, error: photoError } = await supabase
      .from("Gallery")
      .select("*")
      .order("id", { ascending: false }); // Show newest first

    if (photoError) {
      toast({
        title: "Error",
        description: "Failed to fetch gallery photos",
        variant: "destructive",
      });
      return;
    } else {
      setPhotos(photoData);
    }
  };

  // Cloudinary upload function with gallery folder
  const uploadToCloudinary = async (file: File): Promise<string> => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'gallery'); // Specific folder for Gallery
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhoto = async () => {
    let photoUrl = newPhotoUrl;
    
    if (newPhoto) {
      try {
        photoUrl = await uploadToCloudinary(newPhoto);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload photo",
          variant: "destructive",
        });
        return;
      }
    }

    if (!photoUrl) {
      toast({
        title: "Error",
        description: "Please select a photo or provide a photo URL",
        variant: "destructive",
      });
      return;
    }

    const { data: insertData, error: insertError } = await supabase
      .from("Gallery")
      .insert({
        photo_url: photoUrl,
      });

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to add photo to gallery",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Photo added to gallery successfully",
      });
    }

    // Reset form
    setNewPhoto(null);
    setNewPhotoUrl("");
    setIsAddDialogOpen(false);
    
    fetchPhotos();
  };

  const handleEditPhoto = async () => {
    if (!editingPhoto) return;

    let photoUrl = editPhotoUrl;
    
    if (editPhoto) {
      try {
        photoUrl = await uploadToCloudinary(editPhoto);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload photo",
          variant: "destructive",
        });
        return;
      }
    }

    if (!photoUrl) {
      toast({
        title: "Error",
        description: "Please select a photo or provide a photo URL",
        variant: "destructive",
      });
      return;
    }

    const { data: updateData, error: updateError } = await supabase
      .from("Gallery")
      .update({
        photo_url: photoUrl,
      })
      .eq("id", editingPhoto.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update photo",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Photo updated successfully",
      });
    }

    setEditingPhoto(null);
    setIsEditDialogOpen(false);
    fetchPhotos();
  };

  const handleDeletePhoto = async (id: number) => {
    const { error: deleteError } = await supabase
      .from("Gallery")
      .delete()
      .eq("id", id);

    if (deleteError) {
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
    }
    fetchPhotos();
  };

  const openEditDialog = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setEditPhotoUrl(photo.photo_url || "");
    setEditPhoto(null);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
      <div className="container mx-auto">
        <Card className="bg-white border-2 border-[#B22222] mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#B22222]">Manage Gallery</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#B22222] text-white hover:bg-[#8B0000]">
                  Add New Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Photo</DialogTitle>
                  <DialogDescription>
                    Add a new photo to the gallery
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPhotoFile">Upload Photo</Label>
                    <Input
                      id="newPhotoFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewPhoto(e.target.files?.[0] || null)}
                      className="border-[#B22222]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPhotoUrl">Or Photo URL</Label>
                    <Input
                      id="newPhotoUrl"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      className="border-[#B22222]"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {newPhoto && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Selected: {newPhoto.name}</p>
                    </div>
                  )}
                  {newPhotoUrl && !newPhoto && (
                    <div className="mt-2">
                      <Image
                        src={newPhotoUrl}
                        alt="Preview"
                        width={100}
                        height={100}
                        className="w-20 h-20 object-cover rounded-md border"
                        onError={() => {
                          toast({
                            title: "Error",
                            description: "Invalid image URL",
                            variant: "destructive",
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddPhoto}
                    disabled={(!newPhoto && !newPhotoUrl) || uploading}
                    className="bg-[#B22222] text-white hover:bg-[#8B0000]"
                  >
                    {uploading ? "Uploading..." : "Add Photo"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <p className="text-[#4A2C2A]">
              Total Photos: {photos.length}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="bg-white border-2 border-[#B22222]">
              <CardHeader>
                <CardTitle className="text-[#B22222] text-sm">
                  Photo #{photo.id}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {photo.photo_url && (
                  <div className="mb-4">
                    <Image
                      src={photo.photo_url}
                      alt={`Gallery photo ${photo.id}`}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={() => openEditDialog(photo)}
                  variant="outline"
                  className="border-[#B22222] text-[#B22222] hover:bg-[#FFF3E0] flex-1"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeletePhoto(photo.id)}
                  variant="destructive"
                  className="flex-1"
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {photos.length === 0 && (
          <Card className="bg-white border-2 border-[#B22222] mt-8">
            <CardContent className="py-8">
              <p className="text-center text-[#4A2C2A] text-lg">
                No photos in gallery yet. Add your first photo!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Photo</DialogTitle>
              <DialogDescription>
                Update gallery photo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editPhotoFile">Upload New Photo</Label>
                <Input
                  id="editPhotoFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditPhoto(e.target.files?.[0] || null)}
                  className="border-[#B22222]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhotoUrl">Or Photo URL</Label>
                <Input
                  id="editPhotoUrl"
                  value={editPhotoUrl}
                  onChange={(e) => setEditPhotoUrl(e.target.value)}
                  className="border-[#B22222]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {editPhoto && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected: {editPhoto.name}</p>
                </div>
              )}
              {editPhotoUrl && !editPhoto && (
                <div className="mt-2">
                  <Image
                    src={editPhotoUrl}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="w-20 h-20 object-cover rounded-md border"
                    onError={() => {
                      toast({
                        title: "Error",
                        description: "Invalid image URL",
                        variant: "destructive",
                      });
                    }}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={handleEditPhoto}
                disabled={(!editPhoto && !editPhotoUrl) || uploading}
                className="bg-[#B22222] text-white hover:bg-[#8B0000]"
              >
                {uploading ? "Uploading..." : "Update Photo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-8">
          <Link href="/admin/dashboard">
            <Button
              variant="outline"
              className="border-[#B22222] text-[#B22222] hover:bg-[#FFF3E0]"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ManageGalleryPage;