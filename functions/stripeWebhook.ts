import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get site settings for Stripe keys
    const settings = await base44.asServiceRole.functions.invoke('getSiteSettings');
    const stripeSecretKey = settings.data.settings?.stripe_secret_key;
    const webhookSecret = settings.data.settings?.stripe_webhook_secret;

    if (!stripeSecretKey) {
      return Response.json({ error: 'Stripe not configured' }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;

    // Verify webhook signature if webhook secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return Response.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.user_id;
        const planId = session.metadata?.plan_id;

        if (userId && planId) {
          // Update user subscription
          await base44.asServiceRole.auth.updateUser(userId, {
            subscription_plan_id: planId,
            subscription_status: 'active',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          });

          // Create payment record
          await base44.asServiceRole.entities.Payment.create({
            landlord_id: userId,
            amount: session.amount_total / 100,
            currency: session.currency.toUpperCase(),
            status: 'completed',
            subscription_plan: planId,
            stripe_payment_id: session.payment_intent,
            stripe_invoice_id: session.invoice,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await base44.asServiceRole.auth.updateUser(userId, {
            subscription_status: subscription.status,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await base44.asServiceRole.auth.updateUser(userId, {
            subscription_status: 'canceled',
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const userId = invoice.metadata?.user_id;

        if (userId) {
          await base44.asServiceRole.entities.Payment.create({
            landlord_id: userId,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency.toUpperCase(),
            status: 'completed',
            stripe_payment_id: invoice.payment_intent,
            stripe_invoice_id: invoice.id,
            invoice_url: invoice.hosted_invoice_url,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const userId = invoice.metadata?.user_id;

        if (userId) {
          await base44.asServiceRole.entities.Payment.create({
            landlord_id: userId,
            amount: invoice.amount_due / 100,
            currency: invoice.currency.toUpperCase(),
            status: 'failed',
            stripe_invoice_id: invoice.id,
          });
        }
        break;
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});