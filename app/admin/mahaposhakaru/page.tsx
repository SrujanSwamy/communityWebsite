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

interface Mahaposhakaru {
  id: number;
  name: string;
  photo: string | null;
  designation: string | null;
}

function ManageMahaposhakaruPage() {
  const [members, setMembers] = useState<Mahaposhakaru[]>([]);
  const [editingMember, setEditingMember] = useState<Mahaposhakaru | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form states for adding new member
  const [newName, setNewName] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  
  // Form states for editing member
  const [editName, setEditName] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editPhotoUrl, setEditPhotoUrl] = useState("");

  const supabase = createClient();

  const fetchMembers = async () => {
    const { data: memberData, error: memberError } = await supabase
      .from("Mahaposhakaru")
      .select("*")
      .order("id", { ascending: true });

    if (memberError) {
      toast({
        title: "Error",
        description: "Failed to fetch members",
        variant: "destructive",
      });
      return;
    } else {
      setMembers(memberData);
    }
  };

  // Placeholder function for Cloudflare upload
  const uploadToCloudflare = async (file: File): Promise<string> => {
    // TODO: Replace with actual Cloudflare API call
    // For now, return a placeholder URL
    setUploading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Placeholder URL - replace with actual Cloudflare response
      const placeholderUrl = `https://placeholder-cloudflare-url.com/${file.name}`;
      
      // TODO: Actual implementation would be:
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch('CLOUDFLARE_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': 'Bearer YOUR_API_KEY'
      //   },
      //   body: formData
      // });
      // const result = await response.json();
      // return result.url;
      
      return placeholderUrl;
    } catch (error) {
      throw new Error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleAddMember = async () => {
    let photoUrl = newPhotoUrl;
    
    if (newPhoto) {
      try {
        photoUrl = await uploadToCloudflare(newPhoto);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload photo",
          variant: "destructive",
        });
        return;
      }
    }

    const { data: insertData, error: insertError } = await supabase
      .from("Mahaposhakaru")
      .insert({
        name: newName,
        designation: newDesignation,
        photo: photoUrl,
      });

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Member added successfully",
      });
    }

    // Reset form
    setNewName("");
    setNewDesignation("");
    setNewPhoto(null);
    setNewPhotoUrl("");
    setIsAddDialogOpen(false);
    
    fetchMembers();
  };

  const handleEditMember = async () => {
    if (!editingMember) return;

    let photoUrl = editPhotoUrl;
    
    if (editPhoto) {
      try {
        photoUrl = await uploadToCloudflare(editPhoto);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload photo",
          variant: "destructive",
        });
        return;
      }
    }

    const { data: updateData, error: updateError } = await supabase
      .from("Mahaposhakaru")
      .update({
        name: editName,
        designation: editDesignation,
        photo: photoUrl,
      })
      .eq("id", editingMember.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update member",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Member updated successfully",
      });
    }

    setEditingMember(null);
    setIsEditDialogOpen(false);
    fetchMembers();
  };

  const handleDeleteMember = async (id: number) => {
    const { error: deleteError } = await supabase
      .from("Mahaposhakaru")
      .delete()
      .eq("id", id);

    if (deleteError) {
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
    }
    fetchMembers();
  };

  const openEditDialog = (member: Mahaposhakaru) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditDesignation(member.designation || "");
    setEditPhotoUrl(member.photo || "");
    setEditPhoto(null);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
      <div className="container mx-auto">
        <Card className="bg-white border-2 border-[#B22222] mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#B22222]">Manage Mahaposhakaru</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#B22222] text-white hover:bg-[#8B0000]">
                  Add New Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                  <DialogDescription>
                    Add a new member to Mahaposhakaru
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="newName">Name</Label>
                    <Input
                      id="newName"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="border-[#B22222]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newDesignation">Designation</Label>
                    <Input
                      id="newDesignation"
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      className="border-[#B22222]"
                    />
                  </div>
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
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddMember}
                    disabled={!newName || uploading}
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
                {member.designation && (
                  <p className="text-sm text-[#4A2C2A]">{member.designation}</p>
                )}
              </CardHeader>
              <CardContent>
                {member.photo && (
                  <div className="mb-4">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover rounded-md"
                    />
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>
                Update member information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border-[#B22222]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDesignation">Designation</Label>
                <Input
                  id="editDesignation"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="border-[#B22222]"
                />
              </div>
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
              {editPhotoUrl && (
                <div className="mt-2">
                  <Image
                    src={editPhotoUrl}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={handleEditMember}
                disabled={!editName || uploading}
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

export default ManageMahaposhakaruPage;