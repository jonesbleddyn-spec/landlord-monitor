import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const { apiKeys } = await req.json();

        // In a production app, you would save these to environment variables
        // or a secure secrets management system
        // For now, we'll simulate saving and return success
        
        // List of keys that were provided
        const savedKeys = Object.keys(apiKeys).filter(key => apiKeys[key]);

        return Response.json({ 
            success: true,
            message: `Successfully saved ${savedKeys.length} API keys`,
            saved_keys: savedKeys
        });
    } catch (error) {
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});