import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This should be called via a scheduled task/cron job
    // Get all properties
    const properties = await base44.asServiceRole.entities.Property.list();
    
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    const reminders = [];
    
    for (const property of properties) {
      const landlord = await base44.asServiceRole.entities.User.list();
      const landlordUser = landlord.find(u => u.id === property.landlord_id);
      
      if (!landlordUser?.email) continue;
      
      // Check gas certificate
      if (property.gas_certificate_expiry) {
        const expiryDate = new Date(property.gas_certificate_expiry);
        if (expiryDate > now && expiryDate <= threeMonthsFromNow) {
          reminders.push({
            email: landlordUser.email,
            property: property.name,
            certificateType: "Gas Safety Certificate",
            expiryDate: property.gas_certificate_expiry
          });
        }
      }
      
      // Check electrical certificate
      if (property.electrical_certificate_expiry) {
        const expiryDate = new Date(property.electrical_certificate_expiry);
        if (expiryDate > now && expiryDate <= threeMonthsFromNow) {
          reminders.push({
            email: landlordUser.email,
            property: property.name,
            certificateType: "Electrical Safety Certificate",
            expiryDate: property.electrical_certificate_expiry
          });
        }
      }
      
      // Check EPC certificate
      if (property.epc_expiry) {
        const expiryDate = new Date(property.epc_expiry);
        if (expiryDate > now && expiryDate <= threeMonthsFromNow) {
          reminders.push({
            email: landlordUser.email,
            property: property.name,
            certificateType: "EPC Certificate",
            expiryDate: property.epc_expiry
          });
        }
      }
    }
    
    // Send email reminders
    for (const reminder of reminders) {
      const formattedDate = new Date(reminder.expiryDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: reminder.email,
        subject: `⚠️ IMPORTANT: ${reminder.certificateType} Expiring Soon - ${reminder.property}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #DC2626 0%, #EA580C 100%); padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Compliance Alert</h1>
            </div>
            
            <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">
                <strong>HIGH IMPORTANCE</strong>
              </p>
              
              <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">
                This is an important reminder that your <strong>${reminder.certificateType}</strong> for 
                <strong>${reminder.property}</strong> is expiring soon.
              </p>
              
              <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400E;">
                  <strong>Expiry Date:</strong> ${formattedDate}
                </p>
              </div>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Please ensure you renew this certificate before it expires to remain compliant with legal requirements.
              </p>
              
              <div style="background: #F3F4F6; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; color: #6B7280; font-size: 14px;">
                  <strong>Property:</strong> ${reminder.property}<br>
                  <strong>Certificate Type:</strong> ${reminder.certificateType}<br>
                  <strong>Status:</strong> Expiring within 3 months
                </p>
              </div>
              
              <p style="font-size: 14px; color: #6B7280; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px;">
                This is an automated reminder to help you stay compliant. Please take action as soon as possible.
              </p>
            </div>
          </div>
        `
      });
    }
    
    return Response.json({
      success: true,
      reminders_sent: reminders.length,
      message: `Sent ${reminders.length} compliance reminders`
    });
    
  } catch (error) {
    console.error('Error checking compliance:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});