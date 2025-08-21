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

interface DeceasedMember {
  id: number;
  name: string;
  photo: string | null;
}

function ManageDeceasedMembersPage() {
  const [members, setMembers] = useState<DeceasedMember[]>([]);
  const [editingMember, setEditingMember] = useState<DeceasedMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  
  // Form states for adding new member
  const [newName, setNewName] = useState("");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  
  // Form states for editing member
  const [editName, setEditName] = useState("");
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editPhotoUrl, setEditPhotoUrl] = useState("");

  const supabase = createClient();

  const fetchMembers = async () => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from("DeceasedMembers")
        .select("*")
        .order("id", { ascending: true });

      if (memberError) {
        console.error("Fetch error:", memberError);
        toast({
          title: "Error",
          description: `Failed to fetch deceased members: ${memberError.message}`,
          variant: "destructive",
        });
        return;
      }
      
      setMembers(memberData || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching members",
        variant: "destructive",
      });
    }
  };

  // Validate image file
  const validateImageFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image file size should be less than 5MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Fixed upload function with better error handling
  const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!validateImageFile(file)) {
      throw new Error("Invalid file");
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'deceasedmembers');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.url) {
        throw new Error("No URL returned from upload service");
      }
      
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Validate URL format
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddMember = async () => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive",
      });
      return;
    }

    let photoUrl = newPhotoUrl.trim();
    
    // Validate URL if provided
    if (photoUrl && !isValidUrl(photoUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid photo URL",
        variant: "destructive",
      });
      return;
    }
    
    if (newPhoto) {
      try {
        photoUrl = await uploadToCloudinary(newPhoto);
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { error: insertError } = await supabase
        .from("DeceasedMembers")
        .insert({
          name: newName.trim(),
          photo: photoUrl || null,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        toast({
          title: "Error",
          description: `Failed to add deceased member: ${insertError.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Deceased member added successfully",
      });

      // Reset form
      setNewName("");
      setNewPhoto(null);
      setNewPhotoUrl("");
      setIsAddDialogOpen(false);
      
      fetchMembers();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEditMember = async () => {
    if (!editingMember) return;

    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive",
      });
      return;
    }

    let photoUrl = editPhotoUrl.trim();
    
    // Validate URL if provided
    if (photoUrl && !isValidUrl(photoUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid photo URL",
        variant: "destructive",
      });
      return;
    }
    
    if (editPhoto) {
      try {
        photoUrl = await uploadToCloudinary(editPhoto);
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { error: updateError } = await supabase
        .from("DeceasedMembers")
        .update({
          name: editName.trim(),
          photo: photoUrl || null,
        })
        .eq("id", editingMember.id);

      if (updateError) {
        console.error("Update error:", updateError);
        toast({
          title: "Error",
          description: `Failed to update deceased member: ${updateError.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Deceased member updated successfully",
      });

      setEditingMember(null);
      setIsEditDialogOpen(false);
      fetchMembers();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Are you sure you want to delete this member?")) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("DeceasedMembers")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        toast({
          title: "Error",
          description: `Failed to delete deceased member: ${deleteError.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Deceased member deleted successfully",
      });
      
      fetchMembers();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (member: DeceasedMember) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditPhotoUrl(member.photo || "");
    setEditPhoto(null);
    setIsEditDialogOpen(true);
  };

  // Handle image load errors
  const handleImageError = (memberId: number) => {
    setImageErrors(prev => ({ ...prev, [memberId]: true }));
  };

  // Reset image error when URL changes
  const resetImageError = (memberId: number) => {
    setImageErrors(prev => ({ ...prev, [memberId]: false }));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
      <div className="container mx-auto">
        <Card className="bg-white border-2 border-[#B22222] mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#B22222]">Manage Deceased Members</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#B22222] text-white hover:bg-[#8B0000]">
                  Add New Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Deceased Member</DialogTitle>
                  <DialogDescription>
                    Add a new member to the deceased members list
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="newName">Name *</Label>
                    <Input
                      id="newName"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="border-[#B22222]"
                      placeholder="Enter member name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPhotoFile">Upload Photo</Label>
                    <Input
                      id="newPhotoFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNewPhoto(file);
                        if (file) setNewPhotoUrl(""); // Clear URL if file is selected
                      }}
                      className="border-[#B22222]"
                    />
                    <p className="text-sm text-gray-500">Max size: 5MB</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPhotoUrl">Or Photo URL</Label>
                    <Input
                      id="newPhotoUrl"
                      value={newPhotoUrl}
                      onChange={(e) => {
                        setNewPhotoUrl(e.target.value);
                        if (e.target.value) setNewPhoto(null); // Clear file if URL is entered
                      }}
                      className="border-[#B22222]"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {newPhotoUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
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
                    onClick={handleAddMember}
                    disabled={!newName.trim() || uploading}
                    className="bg-[#B22222] text-white hover:bg-[#8B0000]"
                  >
                    {uploading ? "Uploading..." : "Add Member"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member.id} className="bg-white border-2 border-[#B22222]">
              <CardHeader>
                <CardTitle className="text-[#B22222] text-lg">
                  {member.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {member.photo && !imageErrors[member.id] ? (
                  <div className="mb-4">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover rounded-md"
                      onError={() => handleImageError(member.id)}
                      onLoad={() => resetImageError(member.id)}
                    />
                  </div>
                ) : member.photo ? (
                  <div className="mb-4 w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Image failed to load</p>
                  </div>
                ) : (
                  <div className="mb-4 w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-500 text-sm">No photo</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={() => openEditDialog(member)}
                  variant="outline"
                  className="border-[#B22222] text-[#B22222] hover:bg-[#FFF3E0]"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteMember(member.id)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No deceased members found.</p>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Deceased Member</DialogTitle>
              <DialogDescription>
                Update deceased member information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Name *</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border-[#B22222]"
                  placeholder="Enter member name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhotoFile">Upload New Photo</Label>
                <Input
                  id="editPhotoFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditPhoto(file);
                    if (file) setEditPhotoUrl(editingMember?.photo || ""); // Keep original URL if file is selected
                  }}
                  className="border-[#B22222]"
                />
                <p className="text-sm text-gray-500">Max size: 5MB</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhotoUrl">Or Photo URL</Label>
                <Input
                  id="editPhotoUrl"
                  value={editPhotoUrl}
                  onChange={(e) => {
                    setEditPhotoUrl(e.target.value);
                    if (e.target.value !== editingMember?.photo) setEditPhoto(null); // Clear file if URL is changed
                  }}
                  className="border-[#B22222]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {editPhotoUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Current/Preview:</p>
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
                onClick={handleEditMember}
                disabled={!editName.trim() || uploading}
                className="bg-[#B22222] text-white hover:bg-[#8B0000]"
              >
                {uploading ? "Uploading..." : "Update Member"}
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

export default ManageDeceasedMembersPage;