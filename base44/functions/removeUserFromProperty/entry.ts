import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (user.user_type !== 'landlord') {
            return Response.json({ error: 'Only landlords can remove users' }, { status: 403 });
        }

        const { visitorId, userType, propertyId, invitationId } = await req.json();

        if (!propertyId) {
            return Response.json({ error: 'Property ID is required' }, { status: 400 });
        }

        // Delete only the specific invitation for this property
        if (invitationId) {
            await base44.entities.Invitation.delete(invitationId);
        }

        // For contractors, we need to update their property_ids to remove just this property
        if (userType === 'contractor' && visitorId) {
            const users = await base44.asServiceRole.entities.User.list();
            const userToUpdate = users.find(u => u.id === visitorId);

            if (userToUpdate && userToUpdate.property_ids) {
                const updatedPropertyIds = userToUpdate.property_ids.filter(
                    pid => pid !== propertyId
                );

                await base44.asServiceRole.entities.User.update(visitorId, {
                    property_ids: updatedPropertyIds,
                    // Only clear landlord_id if no properties remain
                    landlord_id: updatedPropertyIds.length > 0 ? userToUpdate.landlord_id : null
                });
            }
        }

        // For tenants, only clear if this is their assigned property
        if (userType === 'tenant' && visitorId) {
            const users = await base44.asServiceRole.entities.User.list();
            const userToUpdate = users.find(u => u.id === visitorId);

            if (userToUpdate && userToUpdate.property_id === propertyId) {
                await base44.asServiceRole.entities.User.update(visitorId, {
                    property_id: null,
                    landlord_id: null
                });
            }
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('removeUserFromProperty error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});