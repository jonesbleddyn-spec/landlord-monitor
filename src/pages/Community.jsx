
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Calendar, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function CommunityContent() {
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState("");
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

  const { data: properties = [] } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      if (user?.user_type === 'tenant' && user?.landlord_id) {
        return allProperties.filter(p => p.landlord_id === user.landlord_id);
      } else if (user?.user_type === 'landlord') {
        return allProperties.filter(p => p.landlord_id === user.id);
      }
      return [];
    },
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['user-messages', selectedProperty],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.list('-created_date');
      // Filter messages by property_id if selectedProperty is set, otherwise show all relevant messages for the user.
      // Additionally, ensure only messages related to the user's landlord_id (for tenants) or user.id (for landlords) are shown.
      const userRelevantMessages = allMessages.filter(m => {
        if (user?.user_type === 'tenant' && user?.landlord_id) {
          return m.landlord_id === user.landlord_id;
        } else if (user?.user_type === 'landlord') {
          return m.landlord_id === user.id;
        }
        return false;
      });

      if (selectedProperty) {
        return userRelevantMessages.filter(m => m.property_id === selectedProperty);
      }
      return userRelevantMessages;
    },
    enabled: !!user,
  });

  const createMessageMutation = useMutation({
    mutationFn: (messageData) => {
      const propertyData = properties.find(p => p.id === messageData.property_id);
      return base44.entities.Message.create({
        ...messageData,
        landlord_id: propertyData?.landlord_id || user?.landlord_id || user?.id,
        author_name: user?.full_name || user?.email || "Anonymous"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      setNewMessage({
        property_id: selectedProperty, // Keep selected property for convenience
        message_type: "community",
        title: "",
        content: "",
        priority: "normal"
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProperty || !newMessage.content) {
      alert("Please select a property and write a message.");
      return;
    }
    await createMessageMutation.mutateAsync({
      ...newMessage,
      property_id: selectedProperty
    });
  };

  const messageTypeColors = {
    notice: "bg-blue-100 text-blue-800",
    community: "bg-purple-100 text-purple-800",
    announcement: "bg-green-100 text-green-800"
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Board</h1>
          <p className="text-lg text-gray-600">
            Connect with your neighbors and stay updated with building announcements
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Post Message Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-xl border-none">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Post Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="property-select">Select Property *</Label>
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
                  </div>

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
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="notice">Notice</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
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
                    disabled={!selectedProperty || !newMessage.content || createMessageMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Messages Feed */}
          <div className="lg:col-span-2 space-y-4">
            {messages.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Messages Yet</h3>
                  <p className="text-gray-600">
                    {selectedProperty
                      ? "Be the first to post a message for this property!"
                      : "Select a property to view messages, or post a new one."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              messages.map((message) => (
                <Card key={message.id} className="hover:shadow-lg transition-shadow border-none">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={messageTypeColors[message.message_type]}>
                          {message.message_type}
                        </Badge>
                        {message.priority === "important" && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Important
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(message.created_date), "MMM d, yyyy")}
                      </div>
                    </div>

                    {message.title && (
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{message.title}</h3>
                    )}

                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{message.content}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-600 border-t pt-3">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{message.author_name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
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
