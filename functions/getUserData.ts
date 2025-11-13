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

        // Get user
        const allUsers = await base44.asServiceRole.entities.User.list();
        const user = allUsers.find(u => u.id === user_id);

        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Get user's properties
        const allProperties = await base44.asServiceRole.entities.Property.list();
        const properties = user.user_type === 'landlord' 
            ? allProperties.filter(p => p.landlord_id === user.id)
            : allProperties.filter(p => p.landlord_id === user.landlord_id);

        // Get user's faults
        const allFaults = await base44.asServiceRole.entities.Fault.list('-created_date');
        const faults = user.user_type === 'landlord'
            ? allFaults.filter(f => f.landlord_id === user.id)
            : allFaults.filter(f => f.landlord_id === user.landlord_id);

        // Get user's messages
        const allMessages = await base44.asServiceRole.entities.Message.list('-created_date');
        const messages = user.user_type === 'landlord'
            ? allMessages.filter(m => m.landlord_id === user.id)
            : allMessages.filter(m => m.landlord_id === user.landlord_id);

        // Get user's documents
        const allDocuments = await base44.asServiceRole.entities.Document.list('-created_date');
        const documents = user.user_type === 'landlord'
            ? allDocuments.filter(d => d.landlord_id === user.id)
            : allDocuments.filter(d => d.landlord_id === user.landlord_id);

        // Get payments (landlords only)
        let payments = [];
        if (user.user_type === 'landlord') {
            const allPayments = await base44.asServiceRole.entities.Payment.list('-created_date');
            payments = allPayments.filter(p => p.landlord_id === user.id);
        }

        console.log(`Admin ${admin.email} viewed data for user ${user.email}`);

        return Response.json({ 
            success: true,
            user,
            properties,
            faults,
            messages,
            documents,
            payments,
            stats: {
                totalProperties: properties.length,
                totalFaults: faults.length,
                openFaults: faults.filter(f => !['completed', 'closed'].includes(f.status)).length,
                urgentFaults: faults.filter(f => f.priority === 'urgent').length,
                completedFaults: faults.filter(f => f.status === 'completed').length,
                totalMessages: messages.length,
                totalDocuments: documents.length,
                totalPayments: payments.length
            }
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});