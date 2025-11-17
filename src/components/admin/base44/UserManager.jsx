import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Trash2, Shield, RefreshCw, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [], refetch } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => base44.functions.invoke('deleteUser', { user_id: userId }),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries(['all-users']);
    },
    onError: () => {
      toast.error("Failed to delete user");
    }
  });

  const changeUserPlanMutation = useMutation({
    mutationFn: ({ userId, newPlan }) => base44.functions.invoke('changeUserPlan', { 
      user_id: userId, 
      new_plan: newPlan 
    }),
    onSuccess: () => {
      toast.success("User plan updated");
      queryClient.invalidateQueries(['all-users']);
    },
    onError: () => {
      toast.error("Failed to update user plan");
    }
  });

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = (userId) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleChangePlan = (userId, newPlan) => {
    changeUserPlanMutation.mutate({ userId, newPlan });
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            User Management ({users.length})
          </CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-gray-700 border-gray-600 text-white"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="border-gray-600 text-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-white">{user.full_name || 'No name'}</p>
                      {user.role === 'admin' && (
                        <Badge className="bg-red-600">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-gray-300 border-gray-500">
                        {user.user_type || 'N/A'}
                      </Badge>
                      {user.subscription_plan && (
                        <Badge className="bg-purple-600">
                          <CreditCard className="w-3 h-3 mr-1" />
                          {user.subscription_plan}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    {user.company_name && (
                      <p className="text-sm text-gray-400">Company: {user.company_name}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(user.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user.user_type === 'landlord' && (
                      <Select
                        value={user.subscription_plan || 'free'}
                        onValueChange={(value) => handleChangePlan(user.id, value)}
                      >
                        <SelectTrigger className="w-32 bg-gray-600 border-gray-500 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    {user.role !== 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}