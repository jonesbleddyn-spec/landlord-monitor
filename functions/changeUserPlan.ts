import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const admin = await base44.auth.me();

        // Verify admin access
        if (!admin || admin.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const { user_id, new_plan } = await req.json();

        if (!user_id || !new_plan) {
            return Response.json({ error: 'User ID and new plan are required' }, { status: 400 });
        }

        // Validate plan
        const validPlans = ['free', 'basic', 'pro'];
        if (!validPlans.includes(new_plan)) {
            return Response.json({ error: 'Invalid plan. Must be: free, basic, or pro' }, { status: 400 });
        }

        // Get user
        const allUsers = await base44.asServiceRole.entities.User.list();
        const user = allUsers.find(u => u.id === user_id);

        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.user_type !== 'landlord') {
            return Response.json({ error: 'Can only change plans for landlords' }, { status: 400 });
        }

        // Calculate next billing date
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        // Update user subscription
        await base44.asServiceRole.entities.User.update(user_id, {
            subscription_plan: new_plan,
            subscription_status: new_plan === 'free' ? 'trial' : 'active',
            next_billing_date: nextBillingDate.toISOString().split('T')[0]
        });

        console.log(`Admin ${admin.email} changed ${user.email}'s plan to ${new_plan}`);

        return Response.json({ 
            success: true,
            message: `Plan changed to ${new_plan} successfully`
        });
    } catch (error) {
        console.error('Error changing user plan:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});