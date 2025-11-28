import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Works for both tenants and contractors
        if (!user.landlord_id) {
            return Response.json({ error: 'No landlord_id found' }, { status: 400 });
        }

        // Use service role to fetch fresh landlord data (no caching)
        const landlord = await base44.asServiceRole.entities.User.filter({ id: user.landlord_id });

        if (!landlord || landlord.length === 0) {
            return Response.json({ error: 'Landlord not found' }, { status: 404 });
        }

        const landlordData = landlord[0];

        // Return only branding fields with no-cache headers
        const response = Response.json({
            company_name: landlordData.company_name || null,
            company_logo: landlordData.company_logo || null,
            brand_color_primary: landlordData.brand_color_primary || null,
            brand_color_secondary: landlordData.brand_color_secondary || null
        });

        // Set headers to prevent caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error) {
        console.error('Error fetching landlord branding:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});