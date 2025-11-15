import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Megaphone, FileText, MessageSquare, Send, Eye } from "lucide-react";
import { format } from "date-fns";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function CommunityContent() {
  const queryClient = useQueryClient();
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "" });
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "", selectedProperties: [] });
  const [messageForm, setMessageForm] = useState({ content: "" });
  const [selectedPropertyForMessages, setSelectedPropertyForMessages] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const isLandlord = user?.user_type === 'landlord';
  const isTenant = user?.user_type === 'tenant';

  const { data: properties = [] } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      if (isLandlord) {
        return allProperties.filter(p => p.landlord_id === user.id);
      } else if (isTenant && user?.property_id) {
        return allProperties.filter(p => p.id === user.property_id);
      }
      return [];
    },
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', user?.id, user?.property_id, user?.landlord_id],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.list('-created_date');
      
      if (isLandlord) {
        return allMessages.filter(m => m.landlord_id === user.id);
      } else if (isTenant) {
        // Tenant sees messages where:
        // 1. Announcements from their landlord
        // 2. Notices for their property
        // 3. Private messages for their property
        return allMessages.filter(m => {
          if (m.message_type === 'announcement' && m.landlord_id === user.landlord_id) {
            return true;
          }
          if (m.property_id === user.property_id) {
            return true;
          }
          return false;
        });
      }
      return [];
    },
    enabled: !!user && (isLandlord || (isTenant && !!user.property_id && !!user.landlord_id)),
  });

  const createMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
    },
  });

  const markAsViewedMutation = useMutation({
    mutationFn: ({ messageId, viewedBy }) => 
      base44.entities.Message.update(messageId, { viewed_by: viewedBy }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
    },
  });

  const handleCreateAnnouncement = async () => {
    await createMessageMutation.mutateAsync({
      landlord_id: user.id,
      message_type: "announcement",
      title: announcementForm.title,
      content: announcementForm.content,
      sender_id: user.id,
      sender_type: "landlord",
      viewed_by: []
    });
    setAnnouncementForm({ title: "", content: "" });
  };

  const handleCreateNotice = async () => {
    for (const propertyId of noticeForm.selectedProperties) {
      await createMessageMutation.mutateAsync({
        landlord_id: user.id,
        property_id: propertyId,
        message_type: "notice",
        title: noticeForm.title,
        content: noticeForm.content,
        sender_id: user.id,
        sender_type: "landlord",
        viewed_by: []
      });
    }
    setNoticeForm({ title: "", content: "", selectedProperties: [] });
  };

  const handleSendMessage = async (propertyId) => {
    if (!messageForm.content.trim()) return;
    
    await createMessageMutation.mutateAsync({
      landlord_id: isLandlord ? user.id : user.landlord_id,
      property_id: propertyId,
      message_type: "message",
      title: "Private Message",
      content: messageForm.content,
      sender_id: user.id,
      sender_type: isLandlord ? "landlord" : "tenant",
      viewed_by: []
    });
    setMessageForm({ content: "" });
  };

  const markAsViewed = (message) => {
    if (!message.viewed_by?.includes(user.email)) {
      markAsViewedMutation.mutate({
        messageId: message.id,
        viewedBy: [...(message.viewed_by || []), user.email]
      });
    }
  };

  const announcements = messages.filter(m => m.message_type === 'announcement');
  const notices = messages.filter(m => m.message_type === 'notice');
  const privateMessages = messages.filter(m => m.message_type === 'message');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Community
          </h1>
          <p className="text-lg text-gray-600">
            {isLandlord ? "Send announcements, notices, and messages to your tenants" : "View announcements, notices, and messages from your landlord"}
          </p>
        </div>

        <Tabs defaultValue="announcements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="notices" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notices
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            {isLandlord && (
              <Card className="border-none shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <CardTitle>Create Announcement</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      placeholder="Enter announcement title"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      placeholder="Enter announcement content"
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleCreateAnnouncement}
                    disabled={!announcementForm.title || !announcementForm.content || createMessageMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Megaphone className="w-4 h-4 mr-2" />
                    {createMessageMutation.isPending ? "Posting..." : "Post Announcement"}
                  </Button>
                  <p className="text-sm text-gray-500">This will be visible to all tenants across all your properties</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-gray-500">
                    <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No announcements yet</p>
                  </CardContent>
                </Card>
              ) : (
                announcements.map((announcement) => {
                  const isUnread = !announcement.viewed_by?.includes(user.email);
                  return (
                    <Card
                      key={announcement.id}
                      className={`border-l-4 ${isUnread ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                      onClick={() => markAsViewed(announcement)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Megaphone className="w-5 h-5 text-blue-600" />
                              {announcement.title}
                              {isUnread && <Badge className="bg-blue-500">New</Badge>}
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              {format(new Date(announcement.created_date), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          {isTenant && (
                            <Eye className={`w-5 h-5 ${isUnread ? 'text-gray-300' : 'text-green-500'}`} />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Notices Tab */}
          <TabsContent value="notices" className="space-y-6">
            {isLandlord && (
              <Card className="border-none shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                  <CardTitle>Create Notice</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Select Properties</Label>
                    <div className="space-y-2 mt-2">
                      {properties.map((property) => (
                        <div key={property.id} className="flex items-center gap-2">
                          <Checkbox
                            id={property.id}
                            checked={noticeForm.selectedProperties.includes(property.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNoticeForm({
                                  ...noticeForm,
                                  selectedProperties: [...noticeForm.selectedProperties, property.id]
                                });
                              } else {
                                setNoticeForm({
                                  ...noticeForm,
                                  selectedProperties: noticeForm.selectedProperties.filter(id => id !== property.id)
                                });
                              }
                            }}
                          />
                          <label htmlFor={property.id} className="text-sm font-medium cursor-pointer">
                            {property.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={noticeForm.title}
                      onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                      placeholder="Enter notice title"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={noticeForm.content}
                      onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                      placeholder="Enter notice content"
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleCreateNotice}
                    disabled={!noticeForm.title || !noticeForm.content || noticeForm.selectedProperties.length === 0 || createMessageMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {createMessageMutation.isPending ? "Posting..." : "Post Notice"}
                  </Button>
                  <p className="text-sm text-gray-500">This will be visible to tenants in the selected properties only</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {notices.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No notices yet</p>
                  </CardContent>
                </Card>
              ) : (
                notices.map((notice) => {
                  const isUnread = !notice.viewed_by?.includes(user.email);
                  const property = properties.find(p => p.id === notice.property_id);
                  return (
                    <Card
                      key={notice.id}
                      className={`border-l-4 ${isUnread ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}
                      onClick={() => markAsViewed(notice)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-orange-600" />
                              {notice.title}
                              {isUnread && <Badge className="bg-orange-500">New</Badge>}
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              {property?.name} • {format(new Date(notice.created_date), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          {isTenant && (
                            <Eye className={`w-5 h-5 ${isUnread ? 'text-gray-300' : 'text-green-500'}`} />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            {isLandlord ? (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Property List */}
                <Card className="border-none shadow-xl">
                  <CardHeader>
                    <CardTitle>Select Property</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    {properties.map((property) => (
                      <Button
                        key={property.id}
                        variant={selectedPropertyForMessages?.id === property.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedPropertyForMessages(property)}
                      >
                        {property.name}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Message Thread */}
                <Card className="md:col-span-2 border-none shadow-xl">
                  {selectedPropertyForMessages ? (
                    <>
                      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        <CardTitle>{selectedPropertyForMessages.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                          {privateMessages
                            .filter(m => m.property_id === selectedPropertyForMessages.id)
                            .map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.sender_type === 'landlord' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-xs p-3 rounded-lg ${
                                    message.sender_type === 'landlord'
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-gray-200 text-gray-900'
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  <p className="text-xs mt-1 opacity-70">
                                    {format(new Date(message.created_date), "MMM d, h:mm a")}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={messageForm.content}
                            onChange={(e) => setMessageForm({ content: e.target.value })}
                            placeholder="Type your message..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && messageForm.content.trim() && !createMessageMutation.isPending) {
                                handleSendMessage(selectedPropertyForMessages.id);
                              }
                            }}
                          />
                          <Button
                            onClick={() => handleSendMessage(selectedPropertyForMessages.id)}
                            disabled={!messageForm.content.trim() || createMessageMutation.isPending}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className="p-12 text-center text-gray-500">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Select a property to view messages</p>
                    </CardContent>
                  )}
                </Card>
              </div>
            ) : (
              <Card className="border-none shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle>Messages with Landlord</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {privateMessages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      privateMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === 'tenant' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-lg ${
                              message.sender_type === 'tenant'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {format(new Date(message.created_date), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={messageForm.content}
                      onChange={(e) => setMessageForm({ content: e.target.value })}
                      placeholder="Type your message..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && messageForm.content.trim() && user?.property_id && !createMessageMutation.isPending) {
                          handleSendMessage(user.property_id);
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleSendMessage(user?.property_id)}
                      disabled={!messageForm.content.trim() || !user?.property_id || createMessageMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
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