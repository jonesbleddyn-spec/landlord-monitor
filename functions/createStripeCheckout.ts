import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.user_type !== 'landlord') {
      return Response.json({ error: 'Only landlords can subscribe' }, { status: 403 });
    }

    const { price_id, plan_name } = await req.json();

    if (!price_id || !plan_name) {
      return Response.json({ error: 'Missing price_id or plan_name' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: `${Deno.env.get("BASE44_APP_URL") || "https://app.base44.com"}/subscription?success=true`,
      cancel_url: `${Deno.env.get("BASE44_APP_URL") || "https://app.base44.com"}/subscription?canceled=true`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_id: user.id,
        user_email: user.email,
        plan_name: plan_name,
      },
    });

    console.log('Checkout session created:', session.id);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});