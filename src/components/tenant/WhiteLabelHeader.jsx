import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function WhiteLabelHeader() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: landlordBranding } = useQuery({
    queryKey: ['landlord-branding', user?.landlord_id],
    queryFn: async () => {
      if (!user?.landlord_id) return null;
      const users = await base44.entities.User.list();
      return users.find(u => u.id === user.landlord_id);
    },
    enabled: !!user?.landlord_id && user?.user_type === 'tenant',
  });

  if (!landlordBranding || user?.user_type !== 'tenant') {
    return null;
  }

  const primaryColor = landlordBranding.brand_color_primary || "#3B82F6";
  const secondaryColor = landlordBranding.brand_color_secondary || "#8B5CF6";
  const companyName = landlordBranding.company_name || "Property Management";
  const companyLogo = landlordBranding.company_logo;

  return (
    <div 
      className="rounded-xl p-6 mb-8 text-white shadow-lg"
      style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
    >
      <div className="flex items-center gap-4">
        {companyLogo && (
          <img
            src={companyLogo}
            alt={companyName}
            className="h-12 bg-white p-2 rounded"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">{companyName}</h2>
          <p className="text-sm opacity-90">Property Management Services</p>
        </div>
      </div>
    </div>
  );
}