import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.user_type !== 'landlord') {
            return Response.json({ error: 'Only landlords can change plans' }, { status: 403 });
        }

        const { plan } = await req.json();

        if (!plan || !['free', 'basic', 'pro'].includes(plan)) {
            return Response.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        const currentPlan = user.subscription_plan || 'free';

        // Plan pricing
        const PLAN_PRICES = {
            free: 0,
            basic: 29.99,
            pro: 79.99
        };

        const isUpgrade = PLAN_PRICES[plan] > PLAN_PRICES[currentPlan];
        const isDowngrade = PLAN_PRICES[plan] < PLAN_PRICES[currentPlan];

        // Calculate next billing date (30 days from now for paid plans)
        const nextBillingDate = plan !== 'free' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : null;

        // Update user subscription
        await base44.auth.updateMe({
            subscription_plan: plan,
            subscription_status: plan === 'free' ? 'trial' : 'active',
            next_billing_date: nextBillingDate,
            ...(plan === 'free' && {
                trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
        });

        // Create payment record for paid plans
        if (plan !== 'free') {
            const billingPeriodStart = new Date();
            const billingPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await base44.asServiceRole.entities.Payment.create({
                landlord_id: user.id,
                amount: PLAN_PRICES[plan],
                currency: 'GBP',
                status: 'completed', // In production, this would be 'pending' until Stripe confirms
                payment_method: 'manual', // Would be 'card' with Stripe
                subscription_plan: plan,
                billing_period_start: billingPeriodStart.toISOString().split('T')[0],
                billing_period_end: billingPeriodEnd.toISOString().split('T')[0]
            });

            // Send confirmation email
            await base44.integrations.Core.SendEmail({
                from_name: 'Landlord Monitor',
                to: user.email,
                subject: `Subscription ${isUpgrade ? 'Upgrade' : isDowngrade ? 'Change' : 'Update'} Confirmed`,
                body: `
Hello ${user.full_name || user.company_name},

Your subscription has been successfully ${isUpgrade ? 'upgraded' : isDowngrade ? 'changed' : 'updated'} to the ${plan.toUpperCase()} plan.

Plan Details:
- Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}
- Price: £${PLAN_PRICES[plan]}/month
- Next billing date: ${new Date(nextBillingDate).toLocaleDateString()}

Thank you for choosing Landlord Monitor!

Best regards,
Landlord Monitor Team
                `
            });
        }

        return Response.json({ 
            success: true,
            message: `Successfully ${isUpgrade ? 'upgraded' : isDowngrade ? 'downgraded' : 'changed'} to ${plan} plan`,
            plan,
            next_billing_date: nextBillingDate
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});