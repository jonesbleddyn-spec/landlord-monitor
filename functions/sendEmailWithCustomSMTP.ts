import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { landlord_id, to, subject, body } = await req.json();

    // Get landlord's SMTP settings
    const users = await base44.asServiceRole.entities.User.list();
    const landlord = users.find(u => u.id === landlord_id);

    // Check if landlord has custom SMTP configured
    if (landlord?.use_custom_smtp && landlord.smtp_host && landlord.smtp_username && landlord.smtp_password) {
      // Use landlord's custom SMTP
      const response = await fetch('https://api.smtp2go.com/v3/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: Deno.env.get('SMTP2GO_API_KEY'),
          sender: `${landlord.smtp_from_name || landlord.company_name || 'Property Management'} <${landlord.smtp_from_email}>`,
          to: [to],
          subject: subject,
          html_body: body,
          custom_headers: [
            {
              header: 'Reply-To',
              value: landlord.smtp_from_email
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email via custom SMTP');
      }

      return Response.json({ success: true, provider: 'custom' });
    } else {
      // Fallback to platform's default email service
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: landlord?.company_name || 'Property Management',
        to: to,
        subject: subject,
        body: body
      });

      return Response.json({ success: true, provider: 'default' });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});