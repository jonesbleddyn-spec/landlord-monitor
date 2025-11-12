import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Get or create settings entity
        const allSettings = await base44.asServiceRole.entities.SiteSettings.list();
        
        let settings = allSettings[0];
        
        // If no settings exist, create default settings
        if (!settings) {
            settings = await base44.asServiceRole.entities.SiteSettings.create({
                site_name: "Landlord Monitor",
                site_url: "",
                support_email: "support@landlordmonitor.com",
                smtp_host: "",
                smtp_port: 587,
                smtp_username: "",
                smtp_from_email: "",
                smtp_from_name: "Landlord Monitor",
                smtp_use_tls: true,
                maintenance_mode: false,
                maintenance_message: "We're currently performing scheduled maintenance. We'll be back soon!",
                max_login_attempts: 5,
                session_timeout: 24,
                require_email_verification: true,
                max_file_size: 10,
                allowed_file_types: "jpg,jpeg,png,pdf,doc,docx"
            });
        }

        return Response.json({ 
            success: true,
            settings 
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return Response.json({ 
            error: error.message,
            settings: {
                site_name: "Landlord Monitor",
                support_email: "support@landlordmonitor.com"
            }
        }, { status: 500 });
    }
});