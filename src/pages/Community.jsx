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
import { MessageSquare, Send, Calendar, User, AlertCircle, Trash2, Reply, Home } from "lucide-react";
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
    message_type: "message",
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

  const { data: properties = [] } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      if (isTenant && user?.property_id) {
        return allProperties.filter(p => p.id === user.property_id);
      } else if (isLandlord) {
        return allProperties.filter(p => p.landlord_id === user.id);
      }
      return [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (isTenant && properties.length > 0) {
      setSelectedProperty(properties[0].id);
      setNewMessage(prev => ({ ...prev, property_id: properties[0].id }));
    } else if (isLandlord && properties.length > 0 && !selectedProperty) {
      setSelectedProperty(properties[0].id);
      setNewMessage(prev => ({ ...prev, property_id: properties[0].id }));
    }
  }, [isTenant, isLandlord, properties, selectedProperty]);

  const { data: allMessages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['user-messages'],
    queryFn: async () => {
      const allDbMessages = await base44.entities.Message.list('-created_date');
      
      if (isTenant) {
        const myPropertyId = user?.property_id;
        if (!myPropertyId || properties.length === 0) return [];
        
        const myProperty = properties[0];
        const myLandlordId = myProperty.landlord_id;
        
        const filtered = allDbMessages.filter(msg => {
          // Announcements from my landlord
          if (msg.message_type === 'announcement' && msg.landlord_id === myLandlordId) {
            return true;
          }
          // Messages/notices for my property
          if (msg.property_id === myPropertyId) {
            return true;
          }
          return false;
        });
        
        return filtered;
      } else if (isLandlord) {
        return allDbMessages.filter(msg => msg.landlord_id === user.id);
      }
      return [];
    },
    enabled: !!user && properties.length > 0,
  });

  const messages = React.useMemo(() => {
    if (!allMessages) return [];
    
    if (isTenant) {
      return allMessages;
    } else if (isLandlord && selectedProperty) {
      return allMessages.filter(m => 
        m.message_type === 'announcement' || m.property_id === selectedProperty
      );
    } else if (isLandlord) {
      return allMessages;
    }
    return [];
  }, [allMessages, selectedProperty, isTenant, isLandlord]);

  const createMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      let landlordId;
      let propertyId = messageData.property_id;
      
      if (isTenant) {
        const property = properties[0];
        landlordId = property.landlord_id;
        propertyId = property.id;
      } else {
        landlordId = user.id;
      }
      
      return base44.entities.Message.create({
        title: messageData.title || "",
        content: messageData.content,
        message_type: messageData.message_type,
        priority: messageData.priority || "normal",
        property_id: messageData.message_type === 'announcement' ? null : propertyId,
        parent_message_id: messageData.parent_message_id || null,
        landlord_id: landlordId,
        author_name: user?.full_name || user?.email || "Anonymous",
        viewed_by: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      setNewMessage({
        property_id: isTenant && properties.length > 0 ? properties[0].id : selectedProperty,
        message_type: "message",
        title: "",
        content: "",
        priority: "normal",
        parent_message_id: null
      });
      setReplyingTo(null);
      toast.success("Message sent!");
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId) => base44.entities.Message.delete(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      toast.success("Message deleted");
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const propertyToUse = isTenant && properties.length > 0 ? properties[0].id : selectedProperty;
    
    if (!propertyToUse && newMessage.message_type !== 'announcement') {
      toast.error("Please select a property.");
      return;
    }
    
    if (!newMessage.content) {
      toast.error("Please write a message.");
      return;
    }
    
    await createMessageMutation.mutateAsync({
      ...newMessage,
      property_id: propertyToUse
    });
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setNewMessage(prev => ({
      ...prev,
      property_id: message.property_id,
      parent_message_id: message.id,
      message_type: 'message',
      title: message.title ? `Re: ${message.title}` : ''
    }));
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

  const canDelete = (message) => {
    if (isLandlord && message.landlord_id === user.id) return true;
    if (isTenant && message.created_by === user.email) return true;
    return false;
  };

  const canReply = (message) => {
    return message.message_type === 'message';
  };

  const messageTypeColors = {
    announcement: "bg-blue-100 text-blue-800",
    notice: "bg-yellow-100 text-yellow-800",
    message: "bg-purple-100 text-purple-800",
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
          <h1 className="text-4xl font-bold text-gray-900">Community Board</h1>
          <p className="text-lg text-gray-600">
            {isTenant 
              ? "Communicate with your landlord"
              : "Communicate with your tenants"}
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
                  <h3 className="font-semibold text-gray-900">Your Property</h3>
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

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-xl border-none">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {replyingTo ? 'Reply' : 'New Message'}
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
                            parent_message_id: null,
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
                      <Label>Message Type</Label>
                      <Select
                        value={newMessage.message_type}
                        onValueChange={(value) => setNewMessage(prev => ({ ...prev, message_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="announcement">📢 Announcement (All)</SelectItem>
                          <SelectItem value="notice">📋 Notice (Property)</SelectItem>
                          <SelectItem value="message">💬 Message</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {!isTenant && !replyingTo && newMessage.message_type !== 'announcement' && (
                    <div>
                      <Label>Property *</Label>
                      <Select
                        value={selectedProperty}
                        onValueChange={(value) => {
                          setSelectedProperty(value);
                          setNewMessage(prev => ({ ...prev, property_id: value }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map(property => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Title (optional)</Label>
                    <Input
                      value={newMessage.title}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Message title"
                    />
                  </div>

                  <div>
                    <Label>Message *</Label>
                    <Textarea
                      value={newMessage.content}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your message..."
                      rows={4}
                      required
                    />
                  </div>

                  {!replyingTo && !isTenant && (
                    <div>
                      <Label>Priority</Label>
                      <Select
                        value={newMessage.priority}
                        onValueChange={(value) => setNewMessage(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
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
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {loadingMessages ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-semibold text-gray-900">Loading...</h3>
                </CardContent>
              </Card>
            ) : organizedMessages.length === 0 ? (
              <Card className="text-center py-12 border-2 border-dashed">
                <CardContent>
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Messages</h3>
                  <p className="text-gray-600">Start a conversation!</p>
                </CardContent>
              </Card>
            ) : (
              organizedMessages.map((message) => {
                const isViewOnly = isTenant && (message.message_type === 'announcement' || message.message_type === 'notice');
                
                return (
                  <div key={message.id}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={messageTypeColors[message.message_type]}>
                              {message.message_type === 'announcement' ? '📢 Announcement' : 
                               message.message_type === 'notice' ? '📋 Notice' : '💬 Message'}
                            </Badge>
                            {message.priority === "important" && (
                              <Badge className="bg-red-100 text-red-800">Important</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(message.created_date), "MMM d, yyyy")}
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
                            {canReply(message) && !isViewOnly && (
                              <Button variant="outline" size="sm" onClick={() => handleReply(message)}>
                                <Reply className="w-4 h-4 mr-1" />
                                Reply
                              </Button>
                            )}
                            
                            {canDelete(message) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(message)}
                                className="text-red-600 hover:bg-red-50"
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
                                <div className="text-xs text-gray-500">
                                  {format(new Date(reply.created_date), "MMM d")}
                                </div>
                              </div>

                              <p className="text-gray-700 mb-3 text-sm whitespace-pre-wrap">{reply.content}</p>

                              <div className="flex items-center justify-between border-t pt-2">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <User className="w-3 h-3" />
                                  <span>{reply.author_name}</span>
                                </div>

                                {canDelete(reply) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(reply)}
                                    className="h-7 text-red-600"
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
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
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