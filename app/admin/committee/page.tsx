"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface ExecutiveMember {
  id: number;
  name: string;
  photo: string | null;
  position: string | null;
  description: string | null;
  achivements: string | null;
}

function ManageExecutiveMembersPage() {
  const [members, setMembers] = useState<ExecutiveMember[]>([]);
  const [editingMember, setEditingMember] = useState<ExecutiveMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form states for adding new member
  const [newName, setNewName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAchievements, setNewAchievements] = useState("");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  
  // Form states for editing member
  const [editName, setEditName] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAchievements, setEditAchievements] = useState("");
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editPhotoUrl, setEditPhotoUrl] = useState("");

  const supabase = createClient();

  const fetchMembers = async () => {
    const { data: memberData, error: memberError } = await supabase
      .from("ExecutiveMembers")
      .select("*")
      .order("id", { ascending: true });

    if (memberError) {
      toast({
        title: "Error",
        description: "Failed to fetch executive members",
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
      .from("ExecutiveMembers")
      .insert({
        name: newName,
        position: newPosition,
        description: newDescription,
        achivements: newAchievements,
        photo: photoUrl,
      });

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to add executive member",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Executive member added successfully",
      });
    }

    // Reset form
    setNewName("");
    setNewPosition("");
    setNewDescription("");
    setNewAchievements("");
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
      .from("ExecutiveMembers")
      .update({
        name: editName,
        position: editPosition,
        description: editDescription,
        achivements: editAchievements,
        photo: photoUrl,
      })
      .eq("id", editingMember.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update executive member",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Executive member updated successfully",
      });
    }

    setEditingMember(null);
    setIsEditDialogOpen(false);
    fetchMembers();
  };

  const handleDeleteMember = async (id: number) => {
    const { error: deleteError } = await supabase
      .from("ExecutiveMembers")
      .delete()
      .eq("id", id);

    if (deleteError) {
      toast({
        title: "Error",
        description: "Failed to delete executive member",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Executive member deleted successfully",
      });
    }
    fetchMembers();
  };

  const openEditDialog = (member: ExecutiveMember) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditPosition(member.position || "");
    setEditDescription(member.description || "");
    setEditAchievements(member.achivements || "");
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
            <CardTitle className="text-[#B22222]">Manage Executive Committee Members</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#B22222] text-white hover:bg-[#8B0000]">
                  Add New Executive Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Executive Member</DialogTitle>
                  <DialogDescription>
                    Add a new member to Executive Committee
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
                    <Label htmlFor="newPosition">Position</Label>
                    <Input
                      id="newPosition"
                      value={newPosition}
                      onChange={(e) => setNewPosition(e.target.value)}
                      className="border-[#B22222]"
                      placeholder="e.g., President, Secretary, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newDescription">Description</Label>
                    <Textarea
                      id="newDescription"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="border-[#B22222] min-h-[80px]"
                      placeholder="Brief description about the member"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newAchievements">Achievements</Label>
                    <Textarea
                      id="newAchievements"
                      value={newAchievements}
                      onChange={(e) => setNewAchievements(e.target.value)}
                      className="border-[#B22222] min-h-[80px]"
                      placeholder="List of achievements and contributions"
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
                    {uploading ? "Uploading..." : "Add Executive Member"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member.id} className="bg-white border-2 border-[#B22222]">
              <CardHeader>
                <CardTitle className="text-[#B22222] text-lg">
                  {member.name}
                </CardTitle>
                {member.position && (
                  <p className="text-sm font-semibold text-[#4A2C2A]">{member.position}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
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
                {member.description && (
                  <div>
                    <h4 className="font-semibold text-[#B22222] text-sm mb-1">Description:</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">{member.description}</p>
                  </div>
                )}
                {member.achivements && (
                  <div>
                    <h4 className="font-semibold text-[#B22222] text-sm mb-1">Achievements:</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">{member.achivements}</p>
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
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Executive Member</DialogTitle>
              <DialogDescription>
                Update executive member information
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
                <Label htmlFor="editPosition">Position</Label>
                <Input
                  id="editPosition"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="border-[#B22222]"
                  placeholder="e.g., President, Secretary, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="border-[#B22222] min-h-[80px]"
                  placeholder="Brief description about the member"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAchievements">Achievements</Label>
                <Textarea
                  id="editAchievements"
                  value={editAchievements}
                  onChange={(e) => setEditAchievements(e.target.value)}
                  className="border-[#B22222] min-h-[80px]"
                  placeholder="List of achievements and contributions"
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
                {uploading ? "Uploading..." : "Update Executive Member"}
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

export default ManageExecutiveMembersPage;