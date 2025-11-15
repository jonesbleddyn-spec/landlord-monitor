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
import { MessageSquare, Send, Calendar, User, AlertCircle, Megaphone, Shield, Trash2, Reply } from "lucide-react";
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
  const [selectedProperty, setSelectedProperty] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [newMessage, setNewMessage] = useState({
    property_id: "",
    message_type: "community",
    title: "",
    content: "",
    priority: "normal",
    parent_message_id: null
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
      } else if (isLandlord) {
        return allProperties.filter(p => p.landlord_id === user.id);
      }
      return allProperties; // Admin sees all
    },
    enabled: !!user,
  });

  // Auto-select property for tenants
  useEffect(() => {
    if (isTenant && properties.length === 1) {
      setSelectedProperty(properties[0].id);
      setNewMessage(prev => ({ ...prev, property_id: properties[0].id }));
    }
  }, [isTenant, properties]);

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
    queryKey: ['user-messages', selectedProperty],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.list('-created_date');
      
      if (isTenant && user?.property_id) {
        // Tenants see messages for their property only
        return allMessages.filter(m => m.property_id === user.property_id && !m.is_admin_broadcast);
      } else if (isLandlord) {
        const userRelevantMessages = allMessages.filter(m => 
          m.landlord_id === user.id && !m.is_admin_broadcast
        );
        if (selectedProperty) {
          return userRelevantMessages.filter(m => m.property_id === selectedProperty);
        }
        return userRelevantMessages;
      } else if (isAdmin) {
        if (selectedProperty) {
          return allMessages.filter(m => m.property_id === selectedProperty && !m.is_admin_broadcast);
        }
        return allMessages.filter(m => !m.is_admin_broadcast);
      }
      return [];
    },
    enabled: !!user,
  });

  const createMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const propertyData = properties.find(p => p.id === messageData.property_id);
      
      // For announcements by landlords, create messages for all their properties
      if (messageData.message_type === "announcement" && isLandlord && !messageData.parent_message_id) {
        const landlordProperties = properties.filter(p => p.landlord_id === user.id);
        const createPromises = landlordProperties.map(prop => 
          base44.entities.Message.create({
            ...messageData,
            property_id: prop.id,
            landlord_id: user.id,
            author_name: user?.full_name || user?.email || "Anonymous",
            is_admin_broadcast: false
          })
        );
        return Promise.all(createPromises);
      }
      
      // Regular message creation
      return base44.entities.Message.create({
        ...messageData,
        landlord_id: propertyData?.landlord_id || user?.landlord_id || user?.id,
        author_name: user?.full_name || user?.email || "Anonymous",
        is_admin_broadcast: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      setNewMessage({
        property_id: selectedProperty,
        message_type: "community",
        title: "",
        content: "",
        priority: "normal",
        parent_message_id: null
      });
      setReplyingTo(null);
      toast.success("Message posted successfully!");
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId) => base44.entities.Message.delete(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      toast.success("Message deleted successfully");
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete message");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProperty || !newMessage.content) {
      toast.error("Please select a property and write a message.");
      return;
    }
    await createMessageMutation.mutateAsync({
      ...newMessage,
      property_id: selectedProperty
    });
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setNewMessage(prev => ({
      ...prev,
      message_type: message.message_type,
      parent_message_id: message.id,
      property_id: message.property_id
    }));
    setSelectedProperty(message.property_id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessageMutation.mutate(messageToDelete.id);
    }
  };

  const canDeleteMessage = (message) => {
    return isAdmin || (isLandlord && message.landlord_id === user.id);
  };

  const canReplyToMessage = (message) => {
    // Tenants can only reply to notices
    if (isTenant) {
      return message.message_type === "notice";
    }
    // Landlords and admins can reply to any message
    return isLandlord || isAdmin;
  };

  const canPostMessageType = (type) => {
    // Tenants can't post announcements (view only)
    if (isTenant && type === "announcement") {
      return false;
    }
    return true;
  };

  const messageTypeColors = {
    notice: "bg-blue-100 text-blue-800",
    community: "bg-purple-100 text-purple-800",
    announcement: "bg-green-100 text-green-800",
    admin_broadcast: "bg-red-100 text-red-800"
  };

  const getAvailableMessageTypes = () => {
    if (isTenant) {
      return [
        { value: "community", label: "Community" },
        { value: "notice", label: "Notice" }
      ];
    }
    return [
      { value: "community", label: "Community" },
      { value: "notice", label: "Notice" },
      { value: "announcement", label: "Announcement (All Properties)" }
    ];
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Board</h1>
          <p className="text-lg text-gray-600">
            {isTenant 
              ? "Stay connected with your building community"
              : "Connect with your tenants and stay updated"}
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
          {/* Post Message Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-xl border-none">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  {replyingTo ? <Reply className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                  {replyingTo ? "Reply to Message" : "Post Message"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {replyingTo && (
                  <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-blue-600 font-semibold">Replying to:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setNewMessage(prev => ({ ...prev, parent_message_id: null }));
                        }}
                        className="h-6 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{replyingTo.content}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isTenant && (
                    <div>
                      <Label htmlFor="property-select">
                        {newMessage.message_type === "announcement" ? "Announcement to All Properties" : "Select Property *"}
                      </Label>
                      <Select
                        value={selectedProperty}
                        onValueChange={(value) => {
                          setSelectedProperty(value);
                          setNewMessage(prev => ({ ...prev, property_id: value }));
                        }}
                        disabled={newMessage.message_type === "announcement"}
                      >
                        <SelectTrigger id="property-select">
                          <SelectValue placeholder={
                            newMessage.message_type === "announcement" 
                              ? "Will post to all your properties" 
                              : "Choose property"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.length === 0 ? (
                            <SelectItem value={null} disabled>No properties available</SelectItem>
                          ) : (
                            properties.map(property => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {newMessage.message_type === "announcement" && (
                        <p className="text-xs text-blue-600 mt-1">
                          📢 This announcement will be posted to all your properties
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="message-type-select">Message Type</Label>
                    <Select
                      value={newMessage.message_type}
                      onValueChange={(value) => {
                        setNewMessage(prev => ({ ...prev, message_type: value }));
                        // Clear property selection for announcements
                        if (value === "announcement") {
                          setSelectedProperty(properties[0]?.id || "");
                        }
                      }}
                      disabled={!!replyingTo}
                    >
                      <SelectTrigger id="message-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableMessageTypes().map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newMessage.message_type === "notice" && (
                      <p className="text-xs text-gray-600 mt-1">
                        ℹ️ Notice: Specific to selected property
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message-title-input">Title</Label>
                    <Input
                      id="message-title-input"
                      value={newMessage.title}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Message title (optional)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message-content-textarea">Message *</Label>
                    <Textarea
                      id="message-content-textarea"
                      value={newMessage.content}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Share your message..."
                      rows={4}
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
                    disabled={
                      (!selectedProperty && newMessage.message_type !== "announcement") || 
                      !newMessage.content || 
                      createMessageMutation.isPending
                    }
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {replyingTo ? <Reply className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    {replyingTo ? "Post Reply" : "Post Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Messages Feed */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Property Messages</h3>
            
            {messages.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Messages Yet</h3>
                  <p className="text-gray-600">
                    {isTenant 
                      ? "No messages have been posted for your property yet."
                      : selectedProperty
                      ? "Be the first to post a message for this property!"
                      : "Select a property to view messages, or post a new one."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              messages.map((message) => {
                const property = properties.find(p => p.id === message.property_id);
                const isReply = message.parent_message_id;
                
                return (
                  <Card 
                    key={message.id} 
                    className={`hover:shadow-lg transition-shadow border-none ${isReply ? 'ml-8 border-l-4 border-purple-300' : ''}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isReply && (
                            <Badge variant="outline" className="bg-purple-50">
                              <Reply className="w-3 h-3 mr-1" />
                              Reply
                            </Badge>
                          )}
                          <Badge className={messageTypeColors[message.message_type]}>
                            {message.message_type}
                          </Badge>
                          {message.priority === "important" && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Important
                            </Badge>
                          )}
                          {!isTenant && (
                            <Badge variant="outline" className="text-xs">
                              {property?.name || "Unknown"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(message.created_date), "MMM d, yyyy")}
                          </div>
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
                        
                        <div className="flex items-center gap-2">
                          {canReplyToMessage(message) && !isReply && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReply(message)}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              <Reply className="w-4 h-4 mr-1" />
                              Reply
                            </Button>
                          )}
                          
                          {canDeleteMessage(message) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(message)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
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