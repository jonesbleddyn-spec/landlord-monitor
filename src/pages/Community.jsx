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
import { MessageSquare, Send, Calendar, User, AlertCircle, Megaphone, Shield, Trash2, Reply, Home, Eye } from "lucide-react";
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
      if (isTenant) {
        if (user?.property_id) {
          return allProperties.filter(p => p.id === user.property_id);
        } else if (user?.landlord_id) {
          const landlordProps = allProperties.filter(p => p.landlord_id === user.landlord_id);
          return landlordProps.slice(0, 1);
        }
        return [];
      } else if (isLandlord) {
        return allProperties.filter(p => p.landlord_id === user.id);
      }
      return allProperties;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (isTenant && properties.length > 0 && !selectedProperty) {
      const tenantProperty = properties[0];
      setSelectedProperty(tenantProperty.id);
      setNewMessage(prev => ({ ...prev, property_id: tenantProperty.id }));
    }
  }, [isTenant, properties, selectedProperty]);

  const { data: adminBroadcasts = [] } = useQuery({
    queryKey: ['admin-broadcasts'],
    queryFn: async () => {
      if (!isLandlord) return [];
      const allMessages = await base44.entities.Message.list('-created_date');
      return allMessages.filter(m => m.is_admin_broadcast === true);
    },
    enabled: isLandlord,
  });

  const { data: allMessages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['user-messages'],
    queryFn: async () => {
      const messages = await base44.entities.Message.list('-created_date');
      
      if (isTenant) {
        const tenantPropertyId = user?.property_id;
        const tenantLandlordId = user?.landlord_id;
        
        if (!tenantPropertyId) return [];
        
        return messages.filter(m => {
          if (m.is_admin_broadcast) return false;
          if (m.message_type === 'community' && m.property_id === tenantPropertyId) return true;
          if (m.message_type === 'notice' && m.property_id === tenantPropertyId) return true;
          if (m.message_type === 'announcement' && m.landlord_id === tenantLandlordId && m.all_properties) return true;
          return false;
        });
      } else if (isLandlord) {
        const landlordMessages = messages.filter(m => m.landlord_id === user.id && !m.is_admin_broadcast);
        
        const uniqueMessages = [];
        const seenAnnouncements = new Set();
        
        for (const msg of landlordMessages) {
          if (msg.message_type === 'announcement' && msg.all_properties) {
            const key = `${msg.created_date}-${msg.content}`;
            if (!seenAnnouncements.has(key)) {
              seenAnnouncements.add(key);
              uniqueMessages.push(msg);
            }
          } else {
            uniqueMessages.push(msg);
          }
        }
        
        return uniqueMessages;
      } else if (isAdmin) {
        return messages.filter(m => !m.is_admin_broadcast);
      }
      return [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user || !allMessages || allMessages.length === 0) return;
    
    const markAsViewed = async () => {
      const messagesToMark = allMessages.filter(m => {
        const viewedBy = m.viewed_by || [];
        return !viewedBy.includes(user.email);
      });
      
      if (messagesToMark.length > 0) {
        for (const message of messagesToMark) {
          const viewedBy = message.viewed_by || [];
          await base44.entities.Message.update(message.id, {
            viewed_by: [...viewedBy, user.email]
          });
        }
        queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      }
    };
    
    const timer = setTimeout(markAsViewed, 1000);
    return () => clearTimeout(timer);
  }, [allMessages, user, queryClient]);

  const messages = React.useMemo(() => {
    if (!allMessages) return [];
    
    if (isTenant) {
      return allMessages;
    } else if (isLandlord && selectedProperty) {
      return allMessages.filter(m => 
        m.property_id === selectedProperty || (m.message_type === 'announcement' && m.all_properties)
      );
    } else {
      return allMessages;
    }
  }, [allMessages, selectedProperty, isTenant, isLandlord]);

  const createMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      if (messageData.message_type === 'announcement' && isLandlord) {
        const createPromises = properties.map(property => 
          base44.entities.Message.create({
            title: messageData.title,
            content: messageData.content,
            message_type: 'announcement',
            priority: messageData.priority,
            property_id: property.id,
            landlord_id: user.id,
            author_name: user?.full_name || user?.email || "Anonymous",
            is_admin_broadcast: false,
            all_properties: true,
            viewed_by: [user.email]
          })
        );
        await Promise.all(createPromises);
        return { success: true };
      } else {
        const propertyData = properties.find(p => p.id === messageData.property_id);
        return base44.entities.Message.create({
          title: messageData.title,
          content: messageData.content,
          message_type: messageData.message_type,
          priority: messageData.priority,
          property_id: messageData.property_id,
          parent_message_id: messageData.parent_message_id,
          landlord_id: isTenant ? propertyData?.landlord_id : user.id,
          author_name: user?.full_name || user?.email || "Anonymous",
          is_admin_broadcast: false,
          all_properties: false,
          viewed_by: [user.email]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      setNewMessage({
        property_id: isTenant && properties.length > 0 ? properties[0].id : selectedProperty,
        message_type: "community",
        title: "",
        content: "",
        priority: "normal",
        parent_message_id: undefined
      });
      setReplyingTo(null);
      toast.success("Message posted successfully!");
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (message) => {
      if (isLandlord && message.message_type === 'announcement' && message.all_properties) {
        const allDbMessages = await base44.entities.Message.list();
        const announcementCopies = allDbMessages.filter(m => 
          m.landlord_id === user.id &&
          m.message_type === 'announcement' &&
          m.all_properties === true &&
          m.content === message.content &&
          m.created_date === message.created_date
        );
        
        await Promise.all(announcementCopies.map(m => base44.entities.Message.delete(m.id)));
      } else {
        await base44.entities.Message.delete(message.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      toast.success("Message deleted successfully");
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newMessage.message_type === 'announcement' && isLandlord) {
      await createMessageMutation.mutateAsync(newMessage);
    } else {
      const propertyToUse = isTenant && properties.length > 0 ? properties[0].id : selectedProperty;
      
      if (!propertyToUse || !newMessage.content) {
        toast.error("Please select a property and write a message.");
        return;
      }
      
      await createMessageMutation.mutateAsync({
        ...newMessage,
        property_id: propertyToUse
      });
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setNewMessage(prev => ({
      ...prev,
      property_id: message.property_id,
      parent_message_id: message.id,
      message_type: 'community',
      title: message.title ? `Re: ${message.title}` : ''
    }));
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

  const canDelete = (message) => {
    if (isAdmin) return true;
    if (isLandlord && message.landlord_id === user.id) return true;
    if (isTenant && message.created_by === user.email) return true;
    return false;
  };

  const canReply = (message) => {
    if (message.message_type !== 'community') return false;
    return true;
  };

  const messageTypeColors = {
    notice: "bg-blue-100 text-blue-800",
    community: "bg-purple-100 text-purple-800",
    announcement: "bg-green-100 text-green-800",
  };

  const messageTypeDescriptions = {
    community: "Two-way conversation - anyone can reply",
    notice: "Read-only notice for this property",
    announcement: "Broadcast to all your properties (read-only for tenants)"
  };

  const organizedMessages = messages.reduce((acc, msg) => {
    if (!msg.parent_message_id) {
      acc.push({ ...msg, replies: [] });
    }
    return acc;
  }, []);

  messages.forEach(msg => {
    if (msg.parent_message_id) {
      const parent = organizedMessages.find(m => m.id === msg.parent_message_id);
      if (parent) {
        parent.replies.push(msg);
      }
    }
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Property Messages</h1>
          <p className="text-lg text-gray-600">
            {isTenant 
              ? "Communicate with your landlord and building community"
              : "Connect with your tenants and share important updates"}
          </p>
        </div>

        {isTenant && properties.length > 0 && (
          <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Messaging for:</h3>
                  <p className="text-sm text-gray-600">
                    {properties[0]?.name} - {properties[0]?.address}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {allMessages.length} Message{allMessages.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

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
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-xl border-none">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {replyingTo ? 'Reply to Message' : 'Post Message'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {replyingTo && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-blue-600 font-semibold">Replying to:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setNewMessage(prev => ({
                            ...prev,
                            parent_message_id: undefined,
                            title: ""
                          }));
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
                  {!isTenant && !replyingTo && (
                    <div>
                      <Label htmlFor="property-select">
                        {newMessage.message_type === 'announcement' ? 'All Properties' : 'Select Property *'}
                      </Label>
                      {newMessage.message_type === 'announcement' ? (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            📢 This announcement will be posted to all {properties.length} of your properties
                          </p>
                        </div>
                      ) : (
                        <Select
                          value={selectedProperty}
                          onValueChange={(value) => {
                            setSelectedProperty(value);
                            setNewMessage(prev => ({ ...prev, property_id: value }));
                          }}
                        >
                          <SelectTrigger id="property-select">
                            <SelectValue placeholder="Choose property" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.length === 0 ? (
                              <SelectItem value="none" disabled>No properties available</SelectItem>
                            ) : (
                              properties.map(property => (
                                <SelectItem key={property.id} value={property.id}>
                                  {property.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  {isTenant && properties.length > 0 && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Posting to: <span className="font-semibold">{properties[0]?.name}</span>
                      </p>
                    </div>
                  )}

                  {!replyingTo && !isTenant && (
                    <div>
                      <Label htmlFor="message-type-select">Message Type</Label>
                      <Select
                        value={newMessage.message_type}
                        onValueChange={(value) => setNewMessage(prev => ({ ...prev, message_type: value }))}
                      >
                        <SelectTrigger id="message-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="community">
                            💬 Property Chat
                          </SelectItem>
                          <SelectItem value="notice">
                            📢 Notice (Read-only)
                          </SelectItem>
                          <SelectItem value="announcement">
                            📣 Announcement (All Properties)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {messageTypeDescriptions[newMessage.message_type]}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="message-title-input">Title {!replyingTo && '(optional)'}</Label>
                    <Input
                      id="message-title-input"
                      value={newMessage.title}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Message title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message-content-textarea">Message *</Label>
                    <Textarea
                      id="message-content-textarea"
                      value={newMessage.content}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your message..."
                      rows={replyingTo ? 3 : 4}
                      required
                    />
                  </div>

                  {!replyingTo && !isTenant && (
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
                  )}

                  <Button
                    type="submit"
                    disabled={!newMessage.content || createMessageMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {replyingTo ? 'Post Reply' : 'Post Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              {isTenant 
                ? 'Messages' 
                : selectedProperty && properties.find(p => p.id === selectedProperty)
                ? properties.find(p => p.id === selectedProperty)?.name
                : 'All Property Messages'}
            </h3>
            
            {loadingMessages ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading messages...</h3>
                </CardContent>
              </Card>
            ) : organizedMessages.length === 0 ? (
              <Card className="text-center py-12 border-2 border-dashed border-gray-300">
                <CardContent>
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Messages Yet</h3>
                  <p className="text-gray-600">
                    {isTenant 
                      ? "No messages have been posted yet. Be the first to start a conversation!"
                      : selectedProperty
                      ? "Be the first to post a message for this property!"
                      : "Select a property to view messages, or post a new one."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              organizedMessages.map((message) => {
                const isReadOnly = isTenant && (message.message_type === 'notice' || message.message_type === 'announcement');
                
                return (
                  <div key={message.id}>
                    <Card className="hover:shadow-lg transition-shadow border-none">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={messageTypeColors[message.message_type]}>
                              {message.message_type === 'community' ? 'Property Chat' : 
                               message.message_type === 'notice' ? 'Notice' : 'Announcement'}
                            </Badge>
                            {isReadOnly && (
                              <Badge variant="outline">
                                <Eye className="w-3 h-3 mr-1" />
                                View Only
                              </Badge>
                            )}
                            {message.all_properties && (
                              <Badge className="bg-green-100 text-green-800">
                                All Properties
                              </Badge>
                            )}
                            {message.priority === "important" && (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Important
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-500 flex items-center gap-1">
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
                          
                          <div className="flex gap-2">
                            {canReply(message) && !isReadOnly && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReply(message)}
                              >
                                <Reply className="w-4 h-4 mr-1" />
                                Reply
                              </Button>
                            )}
                            
                            {canDelete(message) && (
                              <Button
                                variant="outline"
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

                    {message.replies && message.replies.length > 0 && (
                      <div className="ml-12 mt-3 space-y-3">
                        {message.replies.map((reply) => (
                          <Card key={reply.id} className="bg-gray-50 border-l-4 border-purple-500">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="text-xs">
                                  <Reply className="w-3 h-3 mr-1" />
                                  Reply
                                </Badge>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(reply.created_date), "MMM d, yyyy")}
                                </div>
                              </div>

                              <p className="text-gray-700 mb-3 text-sm whitespace-pre-wrap">{reply.content}</p>

                              <div className="flex items-center justify-between border-t pt-2">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <User className="w-3 h-3" />
                                  <span className="font-medium">{reply.author_name}</span>
                                </div>

                                {canDelete(reply) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(reply)}
                                    className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone and will remove it from everyone's view.
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