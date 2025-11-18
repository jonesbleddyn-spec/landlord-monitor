import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!user.landlord_id) {
            return Response.json({ error: 'No landlord_id found' }, { status: 400 });
        }

        // Use service role to fetch landlord data
        const users = await base44.asServiceRole.entities.User.list();
        const landlord = users.find(u => u.id === user.landlord_id);

        if (!landlord) {
            return Response.json({ error: 'Landlord not found' }, { status: 404 });
        }

        // Return only branding fields
        return Response.json({
            company_name: landlord.company_name || null,
            company_logo: landlord.company_logo || null,
            brand_color_primary: landlord.brand_color_primary || null,
            brand_color_secondary: landlord.brand_color_secondary || null
        });
    } catch (error) {
        console.error('Error fetching landlord branding:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});