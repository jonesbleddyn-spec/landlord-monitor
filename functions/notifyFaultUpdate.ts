import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fault_id, notification_type } = await req.json();

        if (!fault_id || !notification_type) {
            return Response.json({ error: 'fault_id and notification_type are required' }, { status: 400 });
        }

        // Get fault details
        const faults = await base44.asServiceRole.entities.Fault.filter({ id: fault_id });
        const fault = faults[0];

        if (!fault) {
            return Response.json({ error: 'Fault not found' }, { status: 404 });
        }

        // Get property details
        const properties = await base44.asServiceRole.entities.Property.filter({ id: fault.property_id });
        const property = properties[0];

        // Get landlord details
        const users = await base44.asServiceRole.entities.User.filter({ id: fault.landlord_id });
        const landlord = users[0];

        let subject = '';
        let body = '';

        switch (notification_type) {
            case 'fault_reported':
                subject = `New Fault Reported: ${fault.title}`;
                body = `
A new fault has been reported at ${property?.name || 'your property'}.

Fault Details:
- Title: ${fault.title}
- Category: ${fault.category}
- Priority: ${fault.priority}
- Location: ${fault.location || 'N/A'}
- Unit: ${fault.unit_number || 'N/A'}
- Description: ${fault.description || 'N/A'}
- Reported by: ${fault.created_by}

Please log in to Landlord Monitor to view more details and take action.

Best regards,
Landlord Monitor Team
                `;
                break;

            case 'fault_status_updated':
                subject = `Fault Status Updated: ${fault.title}`;
                body = `
The status of a fault has been updated.

Fault: ${fault.title}
Property: ${property?.name || 'Unknown'}
New Status: ${fault.status.replace(/_/g, ' ')}
${fault.contractor_name ? `Contractor: ${fault.contractor_name}` : ''}
${fault.notes ? `Notes: ${fault.notes}` : ''}

View details in Landlord Monitor.

Best regards,
Landlord Monitor Team
                `;
                break;

            case 'fault_completed':
                subject = `Fault Completed: ${fault.title}`;
                body = `
Good news! A fault has been marked as completed.

Fault: ${fault.title}
Property: ${property?.name || 'Unknown'}
Location: ${fault.location || 'N/A'}
${fault.contractor_name ? `Completed by: ${fault.contractor_name}` : ''}
${fault.completed_date ? `Completion Date: ${new Date(fault.completed_date).toLocaleDateString()}` : ''}

Thank you for using Landlord Monitor.

Best regards,
Landlord Monitor Team
                `;
                break;

            default:
                return Response.json({ error: 'Invalid notification_type' }, { status: 400 });
        }

        // Send email to landlord
        if (landlord?.email) {
            await base44.integrations.Core.SendEmail({
                from_name: 'Landlord Monitor',
                to: landlord.email,
                subject,
                body
            });
        }

        // If there's a property manager, notify them too
        if (property?.manager_email && property.manager_email !== landlord?.email) {
            await base44.integrations.Core.SendEmail({
                from_name: 'Landlord Monitor',
                to: property.manager_email,
                subject,
                body
            });
        }

        return Response.json({ 
            success: true,
            message: 'Notifications sent successfully'
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});