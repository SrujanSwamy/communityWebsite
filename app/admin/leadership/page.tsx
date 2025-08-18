"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Leadership {
  id: number;
  name: string;
  position: string | null;
  photo_url: string | null;
  club_type: number | null;
}

const CLUB_TYPES = [
  { value: 1, label: "D.K. DISTRICT MARATI SAMAJA SEVA SANGHA ® MANGALORE" },
  { value: 2, label: "MARATI WOMEN’S CLUB, MANGALORE" },
];

function ManageLeadershipPage() {
  const [members, setMembers] = useState<Leadership[]>([]);
  const [editingMember, setEditingMember] = useState<Leadership | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form states for adding new member
  const [newName, setNewName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newClubType, setNewClubType] = useState<string>("");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  
  // Form states for editing member
  const [editName, setEditName] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editClubType, setEditClubType] = useState<string>("");
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editPhotoUrl, setEditPhotoUrl] = useState("");

  const supabase = createClient();

  const fetchMembers = async () => {
    const { data: memberData, error: memberError } = await supabase
      .from("Leadership")
      .select("*")
      .order("id", { ascending: true });

    if (memberError) {
      toast({
        title: "Error",
        description: "Failed to fetch leadership members",
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
      .from("Leadership")
      .insert({
        name: newName,
        position: newPosition,
        photo_url: photoUrl,
        club_type: newClubType ? parseInt(newClubType) : null,
      });

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to add leadership member",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Leadership member added successfully",
      });
    }

    // Reset form
    setNewName("");
    setNewPosition("");
    setNewClubType("");
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
      .from("Leadership")
      .update({
        name: editName,
        position: editPosition,
        photo_url: photoUrl,
        club_type: editClubType ? parseInt(editClubType) : null,
      })
      .eq("id", editingMember.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update leadership member",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Leadership member updated successfully",
      });
    }

    setEditingMember(null);
    setIsEditDialogOpen(false);
    fetchMembers();
  };

  const handleDeleteMember = async (id: number) => {
    const { error: deleteError } = await supabase
      .from("Leadership")
      .delete()
      .eq("id", id);

    if (deleteError) {
      toast({
        title: "Error",
        description: "Failed to delete leadership member",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Success",
        description: "Leadership member deleted successfully",
      });
    }
    fetchMembers();
  };

  const openEditDialog = (member: Leadership) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditPosition(member.position || "");
    setEditClubType(member.club_type ? member.club_type.toString() : "");
    setEditPhotoUrl(member.photo_url || "");
    setEditPhoto(null);
    setIsEditDialogOpen(true);
  };

  const getClubTypeName = (clubType: number | null) => {
    if (!clubType) return "Not specified";
    const clubTypeObj = CLUB_TYPES.find(type => type.value === clubType);
    return clubTypeObj ? clubTypeObj.label : `Club Type ${clubType}`;
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9E6] py-8 px-4">
      <div className="container mx-auto">
        <Card className="bg-white border-2 border-[#B22222] mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#B22222]">Manage Leadership Members</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#B22222] text-white hover:bg-[#8B0000]">
                  Add New Leader
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Leadership Member</DialogTitle>
                  <DialogDescription>
                    Add a new member to the leadership team
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
                      placeholder="e.g., President, Vice President, Secretary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newClubType">Club Type</Label>
                    <Select value={newClubType} onValueChange={setNewClubType}>
                      <SelectTrigger className="border-[#B22222]">
                        <SelectValue placeholder="Select club type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLUB_TYPES.map((clubType) => (
                          <SelectItem key={clubType.value} value={clubType.value.toString()}>
                            {clubType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                {member.position && (
                  <p className="text-sm text-[#4A2C2A] font-medium">{member.position}</p>
                )}
                <p className="text-xs text-gray-600">{getClubTypeName(member.club_type)}</p>
              </CardHeader>
              <CardContent>
                {member.photo_url && (
                  <div className="mb-4">
                    <Image
                      src={member.photo_url}
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
              <DialogTitle>Edit Leadership Member</DialogTitle>
              <DialogDescription>
                Update leadership member information
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
                  placeholder="e.g., President, Vice President, Secretary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClubType">Club Type</Label>
                <Select value={editClubType} onValueChange={setEditClubType}>
                  <SelectTrigger className="border-[#B22222]">
                    <SelectValue placeholder="Select club type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLUB_TYPES.map((clubType) => (
                      <SelectItem key={clubType.value} value={clubType.value.toString()}>
                        {clubType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

export default ManageLeadershipPage;