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

        // Verify property belongs to landlord
        const properties = await base44.entities.Property.filter({ id: property_id });
        const property = properties[0];

        if (!property || property.landlord_id !== user.id) {
            return Response.json({ error: 'Property not found or access denied' }, { status: 404 });
        }

        // Generate a unique invitation code
        const invitationCode = crypto.randomUUID().slice(0, 8).toUpperCase();
        
        // Create invitation record in database
        const invitation = await base44.asServiceRole.entities.Invitation.create({
            code: invitationCode,
            landlord_id: user.id,
            landlord_name: user.company_name || user.full_name,
            tenant_email,
            tenant_name: tenant_name || tenant_email,
            property_id,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending'
        });

        // Send invitation email
        await base44.integrations.Core.SendEmail({
            from_name: `${user.company_name || 'Landlord Monitor'}`,
            to: tenant_email,
            subject: `You've been invited to Landlord Monitor`,
            body: `
Hello ${tenant_name || tenant_email},

You've been invited by ${user.company_name || user.full_name} to join their property on Landlord Monitor.

Property: ${property.name}
Address: ${property.address}

Your invitation code: ${invitationCode}

To accept this invitation:
1. Sign up or log in to Landlord Monitor
2. Complete your onboarding as a Tenant
3. Enter this invitation code: ${invitationCode}

This invitation will expire in 7 days.

Best regards,
Landlord Monitor Team
            `
        });

        return Response.json({ 
            success: true, 
            invitation_code: invitationCode,
            invitation_id: invitation.id,
            message: 'Invitation sent successfully'
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});