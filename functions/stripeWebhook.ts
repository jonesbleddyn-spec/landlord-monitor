import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not set');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Webhook event received:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout completed:', session.id);
        
        // Update user subscription status
        const userId = session.metadata.user_id;
        const planName = session.metadata.plan_name;
        
        if (userId && planName) {
          await base44.asServiceRole.auth.updateUser(userId, {
            subscription_status: 'active',
            subscription_plan: planName.toLowerCase().replace(' plan', ''),
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          });
          
          console.log(`Updated user ${userId} subscription to ${planName}`);
        }
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);
        
        // Find user by stripe_subscription_id and update status
        const users = await base44.asServiceRole.entities.User.list();
        const user = users.find(u => u.stripe_subscription_id === subscription.id);
        
        if (user) {
          await base44.asServiceRole.auth.updateUser(user.id, {
            subscription_status: subscription.status === 'active' ? 'active' : 'canceled',
          });
          console.log(`Updated user ${user.id} subscription status to ${subscription.status}`);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription deleted:', deletedSubscription.id);
        
        // Find user and update to free plan
        const allUsers = await base44.asServiceRole.entities.User.list();
        const deletedUser = allUsers.find(u => u.stripe_subscription_id === deletedSubscription.id);
        
        if (deletedUser) {
          await base44.asServiceRole.auth.updateUser(deletedUser.id, {
            subscription_status: 'canceled',
            subscription_plan: 'free',
          });
          console.log(`Updated user ${deletedUser.id} to free plan`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});