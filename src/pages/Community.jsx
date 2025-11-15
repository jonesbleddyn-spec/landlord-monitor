import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Calendar, User, AlertCircle, Megaphone, Shield, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function CommunityContent() {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [newMessage, setNewMessage] = useState({
    title: "",
    content: "",
    priority: "normal"
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const isTenant = user?.user_type === 'tenant';
  const isLandlord = user?.user_type === 'landlord';
  const isAdmin = user?.role === 'admin';

  const { data: properties = [] } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      if (isTenant && user?.property_id) {
        return allProperties.filter(p => p.id === user.property_id);
      } else if (isLandlord && user?.id) {
        return allProperties.filter(p => p.landlord_id === user.id);
      }
      return allProperties;
    },
    enabled: !!user,
  });

  // Fetch admin broadcasts (for landlords only)
  const { data: adminBroadcasts = [] } = useQuery({
    queryKey: ['admin-broadcasts'],
    queryFn: async () => {
      if (!isLandlord) return [];
      const allMessages = await base44.entities.Message.list('-created_date');
      return allMessages.filter(m => m.is_admin_broadcast === true);
    },
    enabled: isLandlord,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['user-messages', user?.property_id, user?.id],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.list('-created_date');
      
      if (isTenant && user?.property_id) {
        // Tenants see announcements for their property only
        return allMessages.filter(m => 
          m.property_id === user.property_id && 
          m.message_type === "announcement" &&
          m.is_admin_broadcast !== true
        );
      } else if (isLandlord && user?.id) {
        // Landlords see announcements they created
        return allMessages.filter(m => 
          m.landlord_id === user.id && 
          m.message_type === "announcement" &&
          m.is_admin_broadcast !== true
        );
      } else if (isAdmin) {
        // Admin sees all non-broadcast announcements
        return allMessages.filter(m => 
          m.message_type === "announcement" &&
          m.is_admin_broadcast !== true
        );
      }
      return [];
    },
    enabled: !!user,
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (messageData) => {
      if (!isLandlord || !user?.id) {
        throw new Error("Only landlords can create announcements");
      }

      // Fetch all landlord properties fresh
      const allProperties = await base44.entities.Property.list();
      const landlordProperties = allProperties.filter(p => p.landlord_id === user.id);
      
      if (landlordProperties.length === 0) {
        throw new Error("You need to add properties before posting announcements");
      }
      
      // Create announcement for each property
      const createPromises = landlordProperties.map(prop => 
        base44.entities.Message.create({
          property_id: prop.id,
          landlord_id: user.id,
          message_type: "announcement",
          title: messageData.title,
          content: messageData.content,
          priority: messageData.priority,
          author_name: user?.full_name || user?.email || "Landlord",
          is_admin_broadcast: false
        })
      );
      
      return Promise.all(createPromises);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      setNewMessage({
        title: "",
        content: "",
        priority: "normal"
      });
      toast.success(`Announcement sent to ${results.length} propert${results.length !== 1 ? 'ies' : 'y'}!`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post announcement");
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (message) => {
      // If it's an announcement, delete all copies across properties
      if (message.message_type === "announcement" && isLandlord) {
        const allMessages = await base44.entities.Message.list();
        const relatedMessages = allMessages.filter(m => 
          m.landlord_id === user.id &&
          m.content === message.content &&
          m.created_date === message.created_date
        );
        
        return Promise.all(relatedMessages.map(m => base44.entities.Message.delete(m.id)));
      }
      
      return base44.entities.Message.delete(message.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      toast.success("Announcement deleted successfully");
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete announcement");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.content) {
      toast.error("Please write a message.");
      return;
    }
    
    await createAnnouncementMutation.mutateAsync(newMessage);
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessageMutation.mutate(messageToDelete);
    }
  };

  const canDeleteMessage = (message) => {
    return isAdmin || (isLandlord && message.landlord_id === user.id);
  };

  // Group messages by content/date to show unique announcements for landlords
  const uniqueMessages = isLandlord ? 
    messages.reduce((acc, msg) => {
      const key = `${msg.content}_${msg.created_date}`;
      if (!acc.find(m => `${m.content}_${m.created_date}` === key)) {
        // Count how many properties received this announcement
        const count = messages.filter(m => 
          m.content === msg.content && 
          m.created_date === msg.created_date
        ).length;
        acc.push({ ...msg, propertyCount: count });
      }
      return acc;
    }, []) : messages;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Board</h1>
          <p className="text-lg text-gray-600">
            {isTenant 
              ? "View announcements from your landlord"
              : "Send announcements to all your properties"}
          </p>
        </div>

        {/* Admin Broadcasts Section (Landlords Only) */}
        {isLandlord && adminBroadcasts.length > 0 && (
          <div className="mb-8">
            <Card className="border-2 border-red-500 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  System Administrator Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {adminBroadcasts.map((broadcast) => (
                  <Card key={broadcast.id} className="border-l-4 border-red-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                          {broadcast.priority === "important" && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Important
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(broadcast.created_date), "MMM d, yyyy")}
                        </div>
                      </div>

                      {broadcast.title && (
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{broadcast.title}</h3>
                      )}

                      <p className="text-gray-700 whitespace-pre-wrap">{broadcast.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Post Announcement Form - Landlords Only */}
          {isLandlord && (
            <div className="lg:col-span-1">
              <Card className="sticky top-20 shadow-xl border-none">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    Post Announcement
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700 font-semibold mb-1">
                        📢 Will be sent to all {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}
                      </p>
                      <p className="text-xs text-green-600">
                        Read-only for tenants - they cannot reply
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="message-title-input">Title</Label>
                      <Input
                        id="message-title-input"
                        value={newMessage.title}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Announcement title (optional)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message-content-textarea">Message *</Label>
                      <Textarea
                        id="message-content-textarea"
                        value={newMessage.content}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write your announcement..."
                        rows={6}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority-select">Priority</Label>
                      <Select
                        value={newMessage.priority}
                        onValueChange={(value) => setNewMessage(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger id="priority-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="important">Important</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      disabled={!newMessage.content || createAnnouncementMutation.isPending || properties.length === 0}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {createAnnouncementMutation.isPending ? "Sending..." : "Send Announcement"}
                    </Button>

                    {properties.length === 0 && (
                      <p className="text-xs text-red-600 text-center">
                        You need to add properties first
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Announcements Feed */}
          <div className={isLandlord ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">
                {isTenant ? "Announcements" : "Your Announcements"}
              </h3>
              
              {uniqueMessages.length === 0 ? (
                <Card className="text-center py-12 border-2 border-dashed border-gray-300">
                  <CardContent>
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Announcements Yet</h3>
                    <p className="text-gray-600">
                      {isTenant 
                        ? "Your landlord hasn't posted any announcements yet."
                        : "Post your first announcement to reach all your tenants!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                uniqueMessages.map((message) => {
                  const property = properties.find(p => p.id === message.property_id);
                  
                  return (
                    <Card 
                      key={message.id} 
                      className="hover:shadow-lg transition-shadow border-none border-l-4 border-green-500"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-green-100 text-green-800">
                              <Megaphone className="w-3 h-3 mr-1" />
                              Announcement
                            </Badge>
                            {message.priority === "important" && (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Important
                              </Badge>
                            )}
                            {isLandlord && message.propertyCount && (
                              <Badge variant="outline" className="bg-blue-50">
                                Sent to {message.propertyCount} propert{message.propertyCount !== 1 ? 'ies' : 'y'}
                              </Badge>
                            )}
                            {isTenant && property && (
                              <Badge variant="outline" className="text-xs">
                                {property.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(message.created_date), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>

                        {message.title && (
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{message.title}</h3>
                        )}

                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{message.content}</p>

                        <div className="flex items-center justify-between border-t pt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{message.author_name}</span>
                          </div>
                          
                          {canDeleteMessage(message) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(message)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? 
              {isLandlord && " It will be removed from all properties."}
              {" "}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Community() {
  return (
    <ProtectedRoute>
      <CommunityContent />
    </ProtectedRoute>
  );
}