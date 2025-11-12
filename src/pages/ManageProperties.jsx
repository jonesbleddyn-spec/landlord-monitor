// This page is no longer needed - redirect to Properties
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ManageProperties() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate(createPageUrl("Properties"), { replace: true });
  }, [navigate]);
  
  return null;
}