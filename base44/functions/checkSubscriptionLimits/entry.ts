import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { check_type } = await req.json();

        if (!check_type) {
            return Response.json({ error: 'check_type is required' }, { status: 400 });
        }

        // Define plan limits
        const PLAN_LIMITS = {
            free: {
                properties: 2,
                storage_mb: 50,
                documents_per_property: 10,
                tenants_per_property: 5
            },
            basic: {
                properties: 10,
                storage_mb: 500,
                documents_per_property: 50,
                tenants_per_property: 20
            },
            pro: {
                properties: -1, // unlimited
                storage_mb: 5120,
                documents_per_property: -1,
                tenants_per_property: -1
            }
        };

        const currentPlan = user.subscription_plan || 'free';
        const limits = PLAN_LIMITS[currentPlan];

        // Get current usage
        let currentUsage = 0;
        let limit = 0;
        let canProceed = false;

        switch (check_type) {
            case 'properties':
                const properties = await base44.entities.Property.filter({ landlord_id: user.id });
                currentUsage = properties.length;
                limit = limits.properties;
                canProceed = limit === -1 || currentUsage < limit;
                break;

            case 'storage':
                // Would need to track file sizes in production
                currentUsage = 0; // Placeholder
                limit = limits.storage_mb;
                canProceed = limit === -1 || currentUsage < limit;
                break;

            default:
                return Response.json({ error: 'Invalid check_type' }, { status: 400 });
        }

        return Response.json({ 
            success: true,
            can_proceed: canProceed,
            current_usage: currentUsage,
            limit: limit === -1 ? 'unlimited' : limit,
            plan: currentPlan,
            usage_percentage: limit === -1 ? 0 : Math.round((currentUsage / limit) * 100),
            message: canProceed 
                ? 'Within limits' 
                : `You've reached your ${check_type} limit. Upgrade your plan to add more.`
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});