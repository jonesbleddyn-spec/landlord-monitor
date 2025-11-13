import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Send, Calendar, User, AlertCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminBroadcast() {
  const queryClient = useQueryClient();
  const [newBroadcast, setNewBroadcast] = useState({
    title: "",
    content: "",
    priority: "normal"
  });

  const { data: broadcasts = [] } = useQuery({
    queryKey: ['admin-broadcasts'],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.list('-created_date');
      return allMessages.filter(m => m.is_admin_broadcast === true);
    },
  });

  const createBroadcastMutation = useMutation({
    mutationFn: (broadcastData) => {
      return base44.entities.Message.create({
        ...broadcastData,
        message_type: "admin_broadcast",
        is_admin_broadcast: true,
        author_name: "System Administrator",
        landlord_id: null,
        property_id: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-broadcasts'] });
      setNewBroadcast({
        title: "",
        content: "",
        priority: "normal"
      });
      toast.success("Broadcast sent to all landlords!");
    },
  });

  const deleteBroadcastMutation = useMutation({
    mutationFn: (id) => base44.entities.Message.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-broadcasts'] });
      toast.success("Broadcast deleted");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newBroadcast.content) {
      toast.error("Please write a message");
      return;
    }
    await createBroadcastMutation.mutateAsync(newBroadcast);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-600 to-pink-600 border-none text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Megaphone className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Broadcast to All Landlords</h2>
              <p className="text-red-100">Send important announcements to all landlords in the system</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create Broadcast Form */}
        <div className="lg:col-span-1">
          <Card className="shadow-xl border-none">
            <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                New Broadcast
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="broadcast-title">Title</Label>
                  <Input
                    id="broadcast-title"
                    value={newBroadcast.title}
                    onChange={(e) => setNewBroadcast(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., System Maintenance Update"
                  />
                </div>

                <div>
                  <Label htmlFor="broadcast-content">Message *</Label>
                  <Textarea
                    id="broadcast-content"
                    value={newBroadcast.content}
                    onChange={(e) => setNewBroadcast(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your broadcast message..."
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="broadcast-priority">Priority</Label>
                  <Select
                    value={newBroadcast.priority}
                    onValueChange={(value) => setNewBroadcast(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger id="broadcast-priority">
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
                  disabled={!newBroadcast.content || createBroadcastMutation.isPending}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                >
                  <Megaphone className="w-4 h-4 mr-2" />
                  Broadcast to All Landlords
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Broadcast History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-white">Broadcast History</h3>
          
          {broadcasts.length === 0 ? (
            <Card className="text-center py-12 bg-gray-800 border-gray-700">
              <CardContent>
                <Megaphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Broadcasts Yet</h3>
                <p className="text-gray-400">Create your first broadcast to all landlords.</p>
              </CardContent>
            </Card>
          ) : (
            broadcasts.map((broadcast) => (
              <Card key={broadcast.id} className="hover:shadow-lg transition-shadow bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">
                        <Megaphone className="w-3 h-3 mr-1" />
                        Admin Broadcast
                      </Badge>
                      {broadcast.priority === "important" && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Important
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(broadcast.created_date), "MMM d, yyyy")}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBroadcastMutation.mutate(broadcast.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {broadcast.title && (
                    <h3 className="text-lg font-semibold text-white mb-2">{broadcast.title}</h3>
                  )}

                  <p className="text-gray-300 mb-4 whitespace-pre-wrap">{broadcast.content}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-400 border-t border-gray-700 pt-3">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{broadcast.author_name}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}