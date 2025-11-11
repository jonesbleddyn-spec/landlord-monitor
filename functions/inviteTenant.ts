import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.user_type !== 'landlord') {
            return Response.json({ error: 'Only landlords can invite tenants' }, { status: 403 });
        }

        const { tenant_email, tenant_name, property_id } = await req.json();

        if (!tenant_email || !property_id) {
            return Response.json({ error: 'tenant_email and property_id are required' }, { status: 400 });
        }

        // Generate a unique invitation code
        const invitationCode = crypto.randomUUID().slice(0, 8).toUpperCase();
        
        // Store invitation (you could create an Invitation entity for this)
        const invitation = {
            code: invitationCode,
            landlord_id: user.id,
            landlord_name: user.company_name || user.full_name,
            tenant_email,
            tenant_name: tenant_name || tenant_email,
            property_id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            status: 'pending'
        };

        // Send invitation email
        await base44.integrations.Core.SendEmail({
            from_name: `${user.company_name || 'Landlord Monitor'}`,
            to: tenant_email,
            subject: `You've been invited to Landlord Monitor`,
            body: `
Hello ${tenant_name || tenant_email},

You've been invited by ${user.company_name || user.full_name} to join their property on Landlord Monitor.

Your invitation code: ${invitationCode}

To accept this invitation:
1. Sign up or log in to Landlord Monitor
2. Complete your onboarding as a Tenant
3. Use this invitation code to link to your landlord's property

This invitation will expire in 7 days.

Best regards,
Landlord Monitor Team
            `
        });

        return Response.json({ 
            success: true, 
            invitation_code: invitationCode,
            message: 'Invitation sent successfully'
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});