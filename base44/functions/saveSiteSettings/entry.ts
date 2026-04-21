import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const settings = await req.json();

        // Validate settings
        const validatedSettings = {
            // SMTP Settings
            smtp_host: settings.smtp_host || '',
            smtp_port: parseInt(settings.smtp_port) || 587,
            smtp_username: settings.smtp_username || '',
            smtp_password: settings.smtp_password || '',
            smtp_from_email: settings.smtp_from_email || '',
            smtp_from_name: settings.smtp_from_name || 'Landlord Monitor',
            smtp_use_tls: settings.smtp_use_tls !== false,
            
            // General Settings
            site_name: settings.site_name || 'Landlord Monitor',
            site_url: settings.site_url || '',
            support_email: settings.support_email || 'support@landlordmonitor.com',
            
            // Maintenance Mode
            maintenance_mode: settings.maintenance_mode === true,
            maintenance_message: settings.maintenance_message || '',
            
            // Security
            max_login_attempts: parseInt(settings.max_login_attempts) || 5,
            session_timeout: parseInt(settings.session_timeout) || 24,
            require_email_verification: settings.require_email_verification !== false,
            
            // Storage
            max_file_size: parseInt(settings.max_file_size) || 10,
            allowed_file_types: settings.allowed_file_types || 'jpg,jpeg,png,pdf,doc,docx'
        };

        // Check if settings exist
        const allSettings = await base44.asServiceRole.entities.SiteSettings.list();
        
        let savedSettings;
        if (allSettings.length > 0) {
            // Update existing settings
            savedSettings = await base44.asServiceRole.entities.SiteSettings.update(
                allSettings[0].id, 
                validatedSettings
            );
        } else {
            // Create new settings
            savedSettings = await base44.asServiceRole.entities.SiteSettings.create(validatedSettings);
        }

        console.log(`Admin ${user.email} updated site settings`);

        return Response.json({ 
            success: true,
            message: 'Settings saved successfully',
            settings: savedSettings
        });
    } catch (error) {
        console.error('Error saving settings:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});