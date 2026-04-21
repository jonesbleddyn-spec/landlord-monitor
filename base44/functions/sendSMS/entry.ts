import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { landlord_id, to, message } = await req.json();

    // Validate phone number format
    if (!to || !to.startsWith('+')) {
      return Response.json({ error: 'Invalid phone number. Must include country code (e.g., +44)' }, { status: 400 });
    }

    // Get landlord's Twilio settings
    const users = await base44.asServiceRole.entities.User.list();
    const landlord = users.find(u => u.id === landlord_id);

    // Check if landlord has custom Twilio configured
    if (landlord?.use_custom_sms && landlord.twilio_account_sid && landlord.twilio_auth_token && landlord.twilio_phone_number) {
      // Use landlord's custom Twilio
      const twilioAuth = btoa(`${landlord.twilio_account_sid}:${landlord.twilio_auth_token}`);
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${landlord.twilio_account_sid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${twilioAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: to,
            From: landlord.twilio_phone_number,
            Body: message
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('Twilio error:', result);
        return Response.json({ 
          error: 'Failed to send SMS via Twilio', 
          details: result.message 
        }, { status: 500 });
      }

      return Response.json({ 
        success: true, 
        provider: 'custom_twilio',
        message_sid: result.sid 
      });
    } else {
      // No SMS service configured
      return Response.json({ 
        success: false, 
        error: 'SMS service not configured for this landlord' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('SMS error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});