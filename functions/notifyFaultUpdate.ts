import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fault_id, notification_type } = await req.json();

        // Get fault details
        const faults = await base44.entities.Fault.list();
        const fault = faults.find(f => f.id === fault_id);

        if (!fault) {
            return Response.json({ error: 'Fault not found' }, { status: 404 });
        }

        // Get property details
        const properties = await base44.entities.Property.list();
        const property = properties.find(p => p.id === fault.property_id);

        // Get landlord details
        const users = await base44.entities.User.list();
        const landlord = users.find(u => u.id === fault.landlord_id);

        let emailSubject = '';
        let emailBody = '';

        switch(notification_type) {
            case 'status_update':
                emailSubject = `Fault Status Update: ${fault.title}`;
                emailBody = `
                    <h2>Fault Status Updated</h2>
                    <p>The status of your reported fault has been updated.</p>
                    <h3>Fault Details:</h3>
                    <ul>
                        <li><strong>Property:</strong> ${property?.name || 'N/A'}</li>
                        <li><strong>Title:</strong> ${fault.title}</li>
                        <li><strong>New Status:</strong> ${fault.status.replace(/_/g, ' ')}</li>
                        <li><strong>Priority:</strong> ${fault.priority}</li>
                        ${fault.contractor_name ? `<li><strong>Assigned Contractor:</strong> ${fault.contractor_name}</li>` : ''}
                        ${fault.estimated_completion ? `<li><strong>Estimated Completion:</strong> ${new Date(fault.estimated_completion).toLocaleDateString()}</li>` : ''}
                    </ul>
                    ${fault.notes ? `<p><strong>Notes:</strong> ${fault.notes}</p>` : ''}
                    <p>You will receive further updates as work progresses.</p>
                `;
                break;

            case 'completed':
                emailSubject = `Fault Completed: ${fault.title}`;
                emailBody = `
                    <h2>Fault Repair Completed</h2>
                    <p>Great news! The fault you reported has been marked as completed.</p>
                    <h3>Fault Details:</h3>
                    <ul>
                        <li><strong>Property:</strong> ${property?.name || 'N/A'}</li>
                        <li><strong>Title:</strong> ${fault.title}</li>
                        <li><strong>Completed Date:</strong> ${fault.completed_date ? new Date(fault.completed_date).toLocaleDateString() : 'Today'}</li>
                    </ul>
                    <p>If you have any concerns about the repair, please contact your property manager.</p>
                `;
                break;

            case 'contractor_assigned':
                emailSubject = `Contractor Assigned: ${fault.title}`;
                emailBody = `
                    <h2>Contractor Assigned to Your Fault</h2>
                    <p>A contractor has been assigned to repair the fault you reported.</p>
                    <h3>Details:</h3>
                    <ul>
                        <li><strong>Property:</strong> ${property?.name || 'N/A'}</li>
                        <li><strong>Fault:</strong> ${fault.title}</li>
                        <li><strong>Contractor:</strong> ${fault.contractor_name}</li>
                        ${fault.estimated_completion ? `<li><strong>Estimated Completion:</strong> ${new Date(fault.estimated_completion).toLocaleDateString()}</li>` : ''}
                    </ul>
                    <p>The contractor may contact you to arrange access to the property.</p>
                `;
                break;

            default:
                emailSubject = `Update on Your Fault Report: ${fault.title}`;
                emailBody = `
                    <h2>Fault Update</h2>
                    <p>There has been an update to your fault report.</p>
                    <h3>Fault Details:</h3>
                    <ul>
                        <li><strong>Property:</strong> ${property?.name || 'N/A'}</li>
                        <li><strong>Title:</strong> ${fault.title}</li>
                        <li><strong>Current Status:</strong> ${fault.status.replace(/_/g, ' ')}</li>
                    </ul>
                `;
        }

        // Send email to tenant (fault reporter)
        if (fault.created_by) {
            const tenantUser = users.find(u => u.id === fault.created_by);
            
            // Send email notification
            if (landlord?.use_custom_smtp && landlord.smtp_host && tenantUser?.email) {
                await base44.functions.invoke('sendEmailWithCustomSMTP', {
                    landlord_id: fault.landlord_id,
                    to: tenantUser.email,
                    subject: emailSubject,
                    body: emailBody
                });
            } else if (tenantUser?.email) {
                await base44.integrations.Core.SendEmail({
                    from_name: landlord?.company_name || 'Landlord Monitor',
                    to: tenantUser.email,
                    subject: emailSubject,
                    body: emailBody
                });
            }

            // Send SMS notification to tenant
            if (tenantUser?.phone_number && landlord?.use_custom_sms) {
                const smsMessage = `${landlord?.company_name || 'Property Management'}: ${fault.title} - ${fault.status.replace(/_/g, ' ')}. ${notification_type === 'completed' ? 'Repair completed!' : notification_type === 'contractor_assigned' ? `Contractor: ${fault.contractor_name}` : 'Status updated'}`;
                
                try {
                    await base44.functions.invoke('sendSMS', {
                        landlord_id: fault.landlord_id,
                        to: tenantUser.phone_number,
                        message: smsMessage
                    });
                } catch (error) {
                    console.error('SMS send failed:', error);
                }
            }
        }

        // Send notification to landlord
        if (landlord?.email) {
            await base44.integrations.Core.SendEmail({
                from_name: 'Landlord Monitor',
                to: landlord.email,
                subject: `Fault Update - ${property?.name || 'Property'}`,
                body: `
                    <h2>Fault Update Notification</h2>
                    <p>A fault at your property has been updated.</p>
                    <h3>Details:</h3>
                    <ul>
                        <li><strong>Property:</strong> ${property?.name || 'N/A'}</li>
                        <li><strong>Fault:</strong> ${fault.title}</li>
                        <li><strong>Status:</strong> ${fault.status.replace(/_/g, ' ')}</li>
                        <li><strong>Priority:</strong> ${fault.priority}</li>
                    </ul>
                `
            });
        }

        // Send SMS notification to landlord
        if (landlord?.phone_number && landlord?.use_custom_sms) {
            const landlordSMS = `Fault Update: ${fault.title} at ${property?.name || 'Property'} - Status: ${fault.status.replace(/_/g, ' ')}, Priority: ${fault.priority}`;
            
            try {
                await base44.functions.invoke('sendSMS', {
                    landlord_id: fault.landlord_id,
                    to: landlord.phone_number,
                    message: landlordSMS
                });
            } catch (error) {
                console.error('Landlord SMS send failed:', error);
            }
        }

        // Send to property manager if exists
        if (property?.manager_email && property.manager_email !== landlord?.email) {
            await base44.integrations.Core.SendEmail({
                from_name: 'Landlord Monitor',
                to: property.manager_email,
                subject: `Fault Update - ${property.name}`,
                body: emailBody
            });
        }

        return Response.json({ 
            success: true,
            message: 'Notifications sent successfully'
        });
    } catch (error) {
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});