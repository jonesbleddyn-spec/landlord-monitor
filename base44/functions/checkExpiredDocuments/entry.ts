import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // This function can be called via cron or manually
        // Get all documents with expiry dates
        const allDocuments = await base44.asServiceRole.entities.Document.list();
        const documentsWithExpiry = allDocuments.filter(doc => doc.expiry_date);

        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        const expiredDocs = [];
        const expiringDocs = [];

        documentsWithExpiry.forEach(doc => {
            const expiryDate = new Date(doc.expiry_date);
            
            if (expiryDate < today) {
                expiredDocs.push(doc);
            } else if (expiryDate <= thirtyDaysFromNow) {
                expiringDocs.push(doc);
            }
        });

        // Group by landlord
        const landlordNotifications = {};

        [...expiredDocs, ...expiringDocs].forEach(doc => {
            if (!landlordNotifications[doc.landlord_id]) {
                landlordNotifications[doc.landlord_id] = {
                    expired: [],
                    expiring: []
                };
            }
            
            if (new Date(doc.expiry_date) < today) {
                landlordNotifications[doc.landlord_id].expired.push(doc);
            } else {
                landlordNotifications[doc.landlord_id].expiring.push(doc);
            }
        });

        // Send notifications to each landlord
        const notificationPromises = Object.entries(landlordNotifications).map(async ([landlordId, docs]) => {
            const users = await base44.asServiceRole.entities.User.filter({ id: landlordId });
            const landlord = users[0];

            if (!landlord?.email) return null;

            const expiredList = docs.expired.map(d => 
                `- ${d.title} (${d.document_type}) - Expired: ${new Date(d.expiry_date).toLocaleDateString()}`
            ).join('\n');

            const expiringList = docs.expiring.map(d => 
                `- ${d.title} (${d.document_type}) - Expires: ${new Date(d.expiry_date).toLocaleDateString()}`
            ).join('\n');

            const body = `
Hello ${landlord.full_name || landlord.company_name},

This is a reminder about document expiry dates in your Landlord Monitor account.

${docs.expired.length > 0 ? `EXPIRED DOCUMENTS (${docs.expired.length}):\n${expiredList}\n\n` : ''}
${docs.expiring.length > 0 ? `EXPIRING SOON (${docs.expiring.length}):\n${expiringList}\n\n` : ''}

Please log in to Landlord Monitor to review and update these documents.

Best regards,
Landlord Monitor Team
            `;

            await base44.integrations.Core.SendEmail({
                from_name: 'Landlord Monitor',
                to: landlord.email,
                subject: `Document Expiry Alert - ${docs.expired.length} Expired, ${docs.expiring.length} Expiring Soon`,
                body
            });

            return {
                landlord_id: landlordId,
                email: landlord.email,
                expired_count: docs.expired.length,
                expiring_count: docs.expiring.length
            };
        });

        const results = await Promise.all(notificationPromises);

        return Response.json({ 
            success: true,
            message: 'Document expiry check completed',
            summary: {
                total_expired: expiredDocs.length,
                total_expiring: expiringDocs.length,
                notifications_sent: results.filter(r => r !== null).length
            },
            notifications: results.filter(r => r !== null)
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});