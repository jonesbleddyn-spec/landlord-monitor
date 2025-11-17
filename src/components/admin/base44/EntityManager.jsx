import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Plus, Trash2, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EntityManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showRecords, setShowRecords] = useState(false);
  const queryClient = useQueryClient();

  const entities = [
    { name: "Property", icon: "🏢" },
    { name: "Fault", icon: "⚠️" },
    { name: "Message", icon: "💬" },
    { name: "Document", icon: "📄" },
    { name: "User", icon: "👤" },
    { name: "Invitation", icon: "✉️" },
    { name: "Payment", icon: "💳" },
    { name: "SiteSettings", icon: "⚙️" }
  ];

  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: ['entity-records', selectedEntity],
    queryFn: async () => {
      if (!selectedEntity) return [];
      return await base44.entities[selectedEntity].list();
    },
    enabled: !!selectedEntity && showRecords
  });

  const deleteRecordMutation = useMutation({
    mutationFn: ({ entityName, recordId }) => base44.entities[entityName].delete(recordId),
    onSuccess: () => {
      toast.success("Record deleted");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete record");
    }
  });

  const filteredEntities = entities.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewRecords = (entityName) => {
    setSelectedEntity(entityName);
    setShowRecords(true);
  };

  const handleDeleteRecord = (recordId) => {
    if (confirm("Are you sure you want to delete this record?")) {
      deleteRecordMutation.mutate({ entityName: selectedEntity, recordId });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Entity Manager
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-gray-700 border-gray-600 text-white"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => queryClient.invalidateQueries(['entity-records'])}
                className="border-gray-600 text-gray-300"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredEntities.map((entity) => (
              <Card key={entity.name} className="bg-gray-700 border-gray-600 hover:border-blue-500 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{entity.icon}</span>
                    <Badge className="bg-blue-600">{entity.name}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRecords(entity.name)}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-600"
                  >
                    View Records
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRecords} onOpenChange={setShowRecords}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {selectedEntity} Records ({records.length})
            </DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No records found</div>
          ) : (
            <div className="space-y-3">
              {records.slice(0, 50).map((record) => (
                <Card key={record.id} className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-mono text-gray-400">ID: {record.id}</p>
                        {Object.entries(record).slice(0, 5).map(([key, value]) => (
                          key !== 'id' && (
                            <p key={key} className="text-sm text-gray-300">
                              <span className="font-semibold">{key}:</span>{' '}
                              {typeof value === 'object' ? JSON.stringify(value) : String(value).substring(0, 100)}
                            </p>
                          )
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {records.length > 50 && (
                <p className="text-center text-gray-400 text-sm">
                  Showing first 50 of {records.length} records
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}