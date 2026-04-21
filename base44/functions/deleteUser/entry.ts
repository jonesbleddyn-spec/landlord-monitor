import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const admin = await base44.auth.me();

        // Verify admin access
        if (!admin || admin.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const { user_id } = await req.json();

        if (!user_id) {
            return Response.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Prevent admin from deleting themselves
        if (user_id === admin.id) {
            return Response.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        // Get user details before deletion
        const allUsers = await base44.asServiceRole.entities.User.list();
        const userToDelete = allUsers.find(u => u.id === user_id);

        if (!userToDelete) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // If landlord, delete all associated data
        if (userToDelete.user_type === 'landlord') {
            // Delete properties
            const properties = await base44.asServiceRole.entities.Property.list();
            const landlordProperties = properties.filter(p => p.landlord_id === user_id);
            
            for (const property of landlordProperties) {
                // Delete faults for each property
                const faults = await base44.asServiceRole.entities.Fault.list();
                const propertyFaults = faults.filter(f => f.property_id === property.id);
                for (const fault of propertyFaults) {
                    await base44.asServiceRole.entities.Fault.delete(fault.id);
                }

                // Delete messages for each property
                const messages = await base44.asServiceRole.entities.Message.list();
                const propertyMessages = messages.filter(m => m.property_id === property.id);
                for (const message of propertyMessages) {
                    await base44.asServiceRole.entities.Message.delete(message.id);
                }

                // Delete documents for each property
                const documents = await base44.asServiceRole.entities.Document.list();
                const propertyDocs = documents.filter(d => d.property_id === property.id);
                for (const doc of propertyDocs) {
                    await base44.asServiceRole.entities.Document.delete(doc.id);
                }

                // Delete the property
                await base44.asServiceRole.entities.Property.delete(property.id);
            }

            // Delete payments
            const payments = await base44.asServiceRole.entities.Payment.list();
            const landlordPayments = payments.filter(p => p.landlord_id === user_id);
            for (const payment of landlordPayments) {
                await base44.asServiceRole.entities.Payment.delete(payment.id);
            }

            // Delete invitations
            const invitations = await base44.asServiceRole.entities.Invitation.list();
            const landlordInvitations = invitations.filter(i => i.landlord_id === user_id);
            for (const invitation of landlordInvitations) {
                await base44.asServiceRole.entities.Invitation.delete(invitation.id);
            }
        }

        // Delete the user
        await base44.asServiceRole.entities.User.delete(user_id);

        console.log(`Admin ${admin.email} deleted user ${userToDelete.email}`);

        return Response.json({ 
            success: true,
            message: `User ${userToDelete.email} and all associated data deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});