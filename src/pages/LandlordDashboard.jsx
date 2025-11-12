// This page is no longer needed - redirect to Dashboard
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LandlordDashboard() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate(createPageUrl("Dashboard"), { replace: true });
  }, [navigate]);
  
  return null;
}