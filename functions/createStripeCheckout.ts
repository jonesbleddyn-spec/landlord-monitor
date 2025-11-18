import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan_id, price_id } = await req.json();

    // Get site settings for Stripe keys
    const settings = await base44.asServiceRole.functions.invoke('getSiteSettings');
    const stripeSecretKey = settings.data.settings?.stripe_secret_key;

    if (!stripeSecretKey) {
      return Response.json({ error: 'Stripe not configured' }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: `${Deno.env.get('BASE44_APP_URL') || 'http://localhost:3000'}/subscription?success=true`,
      cancel_url: `${Deno.env.get('BASE44_APP_URL') || 'http://localhost:3000'}/subscription?canceled=true`,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan_id: plan_id,
      },
    });

    return Response.json({ 
      checkout_url: session.url,
      session_id: session.id 
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});