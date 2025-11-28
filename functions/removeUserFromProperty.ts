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

        const { userId, userType, propertyId } = await req.json();

        if (!userId) {
            return Response.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Get the user to update
        const users = await base44.asServiceRole.entities.User.list();
        const userToUpdate = users.find(u => u.id === userId);

        if (!userToUpdate) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Get landlord's properties
        const properties = await base44.entities.Property.filter({
            landlord_id: user.id
        });
        const propertyIds = properties.map(p => p.id);

        if (userType === 'contractor') {
            // Remove this landlord's properties from contractor's property_ids
            const currentPropertyIds = userToUpdate.property_ids || [];
            const updatedPropertyIds = currentPropertyIds.filter(
                pid => !propertyIds.includes(pid)
            );

            await base44.asServiceRole.entities.User.update(userId, {
                property_ids: updatedPropertyIds,
                landlord_id: updatedPropertyIds.length > 0 ? userToUpdate.landlord_id : null
            });
        } else {
            // For tenants, clear their property association
            await base44.asServiceRole.entities.User.update(userId, {
                property_id: null,
                landlord_id: null
            });
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('removeUserFromProperty error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});