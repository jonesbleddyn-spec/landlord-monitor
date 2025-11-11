import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.user_type !== 'landlord') {
            return Response.json({ error: 'Only landlords can import properties' }, { status: 403 });
        }

        const { file_url } = await req.json();

        if (!file_url) {
            return Response.json({ error: 'file_url is required' }, { status: 400 });
        }

        // Define the schema for property data extraction
        const propertySchema = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Property name" },
                    address: { type: "string", description: "Full address" },
                    type: { 
                        type: "string", 
                        enum: ["apartment", "house", "commercial", "mixed_use"],
                        description: "Property type" 
                    },
                    units: { type: "number", description: "Number of units" },
                    manager_email: { type: "string", description: "Property manager email" }
                },
                required: ["name", "address"]
            }
        };

        // Extract data from uploaded file
        const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url,
            json_schema: propertySchema
        });

        if (extractionResult.status === 'error') {
            return Response.json({ 
                error: 'Failed to extract data from file', 
                details: extractionResult.details 
            }, { status: 400 });
        }

        const properties = extractionResult.output;

        if (!properties || properties.length === 0) {
            return Response.json({ error: 'No valid properties found in file' }, { status: 400 });
        }

        // Add landlord_id to each property and set defaults
        const propertiesWithLandlord = properties.map(prop => ({
            ...prop,
            landlord_id: user.id,
            type: prop.type || 'apartment',
            units: prop.units || 1
        }));

        // Bulk create properties
        const createdProperties = await base44.asServiceRole.entities.Property.bulkCreate(
            propertiesWithLandlord
        );

        return Response.json({ 
            success: true,
            message: `Successfully imported ${createdProperties.length} properties`,
            properties: createdProperties,
            summary: {
                total_imported: createdProperties.length,
                total_units: createdProperties.reduce((sum, p) => sum + (p.units || 0), 0)
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});