import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all active reminders
    const reminders = await base44.asServiceRole.entities.Reminder.list();
    const activeReminders = reminders.filter(r => !r.completed);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let emailsSent = 0;
    
    for (const reminder of activeReminders) {
      const reminderDate = new Date(reminder.reminder_date);
      reminderDate.setHours(0, 0, 0, 0);
      
      const daysUntil = Math.ceil((reminderDate - today) / (1000 * 60 * 60 * 24));
      
      // Get landlord details
      const users = await base44.asServiceRole.entities.User.list();
      const landlord = users.find(u => u.id === reminder.landlord_id);
      
      if (!landlord?.email) continue;
      
      // Check if we should send first reminder
      if (daysUntil === reminder.first_reminder_days && !reminder.first_reminder_sent) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: landlord.email,
          subject: `Reminder: ${reminder.title} - ${daysUntil} days left`,
          body: `
            <h2>Reminder Alert</h2>
            <p>Hi ${landlord.full_name},</p>
            <p>This is a reminder about: <strong>${reminder.title}</strong></p>
            ${reminder.description ? `<p>${reminder.description}</p>` : ''}
            <p><strong>Due Date:</strong> ${new Date(reminder.reminder_date).toLocaleDateString()}</p>
            <p><strong>Days Until Due:</strong> ${daysUntil} days</p>
            <p>This is your first reminder. You will receive another reminder ${reminder.second_reminder_days} day(s) before the due date.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Login to your dashboard to manage this reminder.</p>
          `
        });
        
        await base44.asServiceRole.entities.Reminder.update(reminder.id, {
          first_reminder_sent: true
        });
        
        emailsSent++;
      }
      
      // Check if we should send second reminder
      if (daysUntil === reminder.second_reminder_days && !reminder.second_reminder_sent) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: landlord.email,
          subject: `⚠️ URGENT Reminder: ${reminder.title} - ${daysUntil} day(s) left!`,
          body: `
            <h2 style="color: #DC2626;">⚠️ Urgent Reminder</h2>
            <p>Hi ${landlord.full_name},</p>
            <p><strong>FINAL REMINDER</strong> about: <strong>${reminder.title}</strong></p>
            ${reminder.description ? `<p>${reminder.description}</p>` : ''}
            <p><strong>Due Date:</strong> ${new Date(reminder.reminder_date).toLocaleDateString()}</p>
            <p><strong style="color: #DC2626;">Days Until Due: ${daysUntil} day(s)</strong></p>
            <p>This is your final reminder. Please take action soon!</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Login to your dashboard to manage this reminder.</p>
          `
        });
        
        await base44.asServiceRole.entities.Reminder.update(reminder.id, {
          second_reminder_sent: true
        });
        
        emailsSent++;
      }
    }
    
    return Response.json({
      success: true,
      message: `Checked ${activeReminders.length} reminders, sent ${emailsSent} emails`
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});