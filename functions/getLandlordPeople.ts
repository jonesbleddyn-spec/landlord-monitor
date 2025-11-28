import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (user.user_type !== 'landlord') {
            return Response.json({ error: 'Only landlords can access this' }, { status: 403 });
        }

        // Get all invitations for this landlord
        const invitations = await base44.asServiceRole.entities.Invitation.filter({
            landlord_id: user.id
        });

        // Get accepted invitations
        const acceptedInvitations = invitations.filter(i => i.status === 'accepted' && i.used_by);

        if (acceptedInvitations.length === 0) {
            return Response.json({ 
                tenants: [], 
                contractors: [],
                pendingInvitations: invitations.filter(i => i.status === 'pending')
            });
        }

        // Get unique user IDs
        const userIds = [...new Set(acceptedInvitations.map(i => i.used_by))];

        // Get all users using service role
        const allUsers = await base44.asServiceRole.entities.User.list();

        // Get landlord's properties
        const properties = await base44.entities.Property.filter({
            landlord_id: user.id
        });
        const propertyMap = {};
        properties.forEach(p => {
            propertyMap[p.id] = p;
        });

        // Build people list with their property associations
        const people = [];
        for (const inv of acceptedInvitations) {
            const linkedUser = allUsers.find(u => u.id === inv.used_by);
            if (linkedUser) {
                people.push({
                    id: linkedUser.id,
                    email: linkedUser.email,
                    full_name: linkedUser.full_name || inv.invitee_name || inv.tenant_name || 'Unknown',
                    user_type: inv.invitee_type || 'tenant',
                    property_id: inv.property_id,
                    property_name: propertyMap[inv.property_id]?.name || 'Unknown Property',
                    invitation_id: inv.id,
                    joined_date: inv.used_at
                });
            }
        }

        const tenants = people.filter(p => p.user_type === 'tenant');
        const contractors = people.filter(p => p.user_type === 'contractor');
        const pendingInvitations = invitations.filter(i => i.status === 'pending');

        return Response.json({
            tenants,
            contractors,
            pendingInvitations
        });
    } catch (error) {
        console.error('getLandlordPeople error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});