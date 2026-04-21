import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const { 
            property_code, 
            reporter_name, 
            reporter_email,
            reporter_phone,
            title, 
            description, 
            category,
            priority,
            location,
            unit_number,
            images 
        } = await req.json();

        if (!property_code || !reporter_name || !reporter_email || !title || !description || !category) {
            return Response.json({ 
                error: 'Missing required fields: property_code, reporter_name, reporter_email, title, description, category' 
            }, { status: 400 });
        }

        // Find property by code
        const properties = await base44.asServiceRole.entities.Property.filter({ 
            property_code: property_code.toUpperCase() 
        });
        const property = properties[0];

        if (!property) {
            return Response.json({ 
                error: 'Invalid property code. Please check the code and try again.' 
            }, { status: 404 });
        }

        // Create fault record
        const fault = await base44.asServiceRole.entities.Fault.create({
            landlord_id: property.landlord_id,
            property_id: property.id,
            title,
            description: `Reporter: ${reporter_name} (${reporter_email}${reporter_phone ? ', ' + reporter_phone : ''})\n\n${description}`,
            category,
            priority: priority || 'medium',
            location: location || '',
            unit_number: unit_number || '',
            status: 'reported',
            images: images || []
        });

        // Get landlord details
        const landlords = await base44.asServiceRole.entities.User.filter({ id: property.landlord_id });
        const landlord = landlords[0];

        // Send notification email to landlord
        if (landlord?.email) {
            await base44.integrations.Core.SendEmail({
                from_name: 'Landlord Monitor',
                to: landlord.email,
                subject: `🔔 New Fault Reported at ${property.name}`,
                body: `
Hello ${landlord.full_name || landlord.company_name},

A new fault has been reported at your property:

Property: ${property.name}
Address: ${property.address}
${unit_number ? `Unit: ${unit_number}` : ''}

Issue: ${title}
Category: ${category}
Priority: ${priority || 'medium'}
${location ? `Location: ${location}` : ''}

Description:
${description}

Reported by: ${reporter_name}
Email: ${reporter_email}
${reporter_phone ? `Phone: ${reporter_phone}` : ''}

Please log in to your dashboard to view full details and manage this fault.

Best regards,
Landlord Monitor Team
                `
            });
        }

        // Send confirmation email to reporter
        await base44.integrations.Core.SendEmail({
            from_name: 'Landlord Monitor',
            to: reporter_email,
            subject: `✅ Fault Report Received - ${property.name}`,
            body: `
Hello ${reporter_name},

Thank you for reporting the issue. Your fault report has been successfully submitted and the property owner has been notified.

Your Report Details:
Property: ${property.name}
Issue: ${title}
Priority: ${priority || 'medium'}
Reference ID: ${fault.id.slice(0, 8).toUpperCase()}

The property owner will review your report and take appropriate action. You will be contacted if any additional information is needed.

If this is an emergency, please also contact your property manager directly.

Best regards,
Landlord Monitor Team
            `
        });

        return Response.json({ 
            success: true,
            message: 'Fault reported successfully',
            fault_id: fault.id,
            property_name: property.name
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});