import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { invitation_code } = await req.json();

        if (!invitation_code) {
            return Response.json({ error: 'invitation_code is required' }, { status: 400 });
        }

        // Find invitation by code
        const invitations = await base44.asServiceRole.entities.Invitation.filter({ 
            code: invitation_code.toUpperCase() 
        });
        const invitation = invitations[0];

        if (!invitation) {
            return Response.json({ error: 'Invalid invitation code' }, { status: 404 });
        }

        // Check if invitation is already used
        if (invitation.status === 'accepted') {
            return Response.json({ error: 'This invitation has already been used' }, { status: 400 });
        }

        // Check if invitation is expired
        if (new Date(invitation.expires_at) < new Date()) {
            await base44.asServiceRole.entities.Invitation.update(invitation.id, {
                status: 'expired'
            });
            return Response.json({ error: 'This invitation has expired' }, { status: 400 });
        }

        // Check if email matches
        const inviteeEmail = invitation.invitee_email || invitation.tenant_email;
        if (user.email.toLowerCase() !== inviteeEmail.toLowerCase()) {
            return Response.json({ 
                error: `This invitation was sent to ${inviteeEmail}. Please use that email address.` 
            }, { status: 403 });
        }

        const inviteeType = invitation.invitee_type || 'tenant';

        // Update user based on invitee type
        if (inviteeType === 'contractor') {
            // For contractors, add property to their property_ids array
            const existingPropertyIds = user.property_ids || [];
            const newPropertyIds = existingPropertyIds.includes(invitation.property_id)
                ? existingPropertyIds
                : [...existingPropertyIds, invitation.property_id];

            await base44.auth.updateMe({
                landlord_id: invitation.landlord_id,
                property_ids: newPropertyIds,
                user_type: 'contractor'
            });
        } else {
            // For tenants, set single property_id
            await base44.auth.updateMe({
                landlord_id: invitation.landlord_id,
                property_id: invitation.property_id,
                user_type: 'tenant'
            });
        }

        // Mark invitation as accepted
        await base44.asServiceRole.entities.Invitation.update(invitation.id, {
            status: 'accepted',
            used_at: new Date().toISOString(),
            used_by: user.id
        });

        // Get property details
        const properties = await base44.asServiceRole.entities.Property.filter({ 
            id: invitation.property_id 
        });
        const property = properties[0];

        return Response.json({ 
            success: true,
            message: 'Invitation accepted successfully!',
            landlord_name: invitation.landlord_name,
            invitee_type: inviteeType,
            property: {
                id: property?.id,
                name: property?.name,
                address: property?.address
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});