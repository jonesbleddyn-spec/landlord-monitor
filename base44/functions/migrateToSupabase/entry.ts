import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_URL = "https://ekwumugpctllqtyevyhx.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const restHeaders = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

// Strip out any keys that don't exist in the table schema, or just let Supabase ignore them
// Instead we'll sanitize rows to only include known columns per table
const TABLE_COLUMNS = {
  properties: ["id","created_date","updated_date","created_by","created_by_id","landlord_id","property_code","name","address","type","units","manager_email","image_url","gas_certificate_expiry","electrical_certificate_expiry","epc_expiry","show_compliance_to_tenants"],
  faults: ["id","created_date","updated_date","created_by","created_by_id","landlord_id","property_id","title","description","category","priority","status","location","unit_number","images","contractor_name","estimated_completion","completed_date","notes"],
  documents: ["id","created_date","updated_date","created_by","created_by_id","landlord_id","property_id","title","document_type","file_url","unit_number","expiry_date","notes"],
  messages: ["id","created_date","updated_date","created_by","created_by_id","landlord_id","property_id","message_type","title","content","priority","author_name","is_admin_broadcast"],
  invitations: ["id","created_date","updated_date","created_by","created_by_id","code","landlord_id","landlord_name","invitee_email","invitee_name","invitee_type","property_id","expires_at","status","used_at","used_by"],
  payments: ["id","created_date","updated_date","created_by","created_by_id","landlord_id","amount","currency","status","payment_method","subscription_plan","stripe_payment_id","stripe_invoice_id","billing_period_start","billing_period_end","invoice_url"],
  reminders: ["id","created_date","updated_date","created_by","created_by_id","landlord_id","title","description","reminder_date","category","property_id","first_reminder_days","second_reminder_days","first_reminder_sent","second_reminder_sent","completed"],
  subscription_plans: ["id","created_date","updated_date","created_by","created_by_id","name","price","currency","billing_interval","features","max_properties","storage_mb","is_popular","is_active","stripe_price_id","sort_order"],
  site_settings: ["id","created_date","updated_date","created_by","created_by_id","site_name","site_url","support_email","smtp_host","smtp_port","smtp_username","smtp_password","smtp_from_email","smtp_from_name","smtp_use_tls","maintenance_mode","maintenance_message","max_login_attempts","session_timeout","require_email_verification","max_file_size","allowed_file_types","social_facebook","social_twitter","social_linkedin","social_instagram","social_youtube"],
};

// First, discover what fields actually exist in the data and detect unknown columns
function sanitizeRow(row, table) {
  const allowedCols = TABLE_COLUMNS[table];
  const sanitized = {};
  for (const key of allowedCols) {
    if (key in row) sanitized[key] = row[key];
  }
  return sanitized;
}

async function upsertRows(table, rows) {
  if (!rows || rows.length === 0) return { inserted: 0 };
  
  const batchSize = 100;
  let totalInserted = 0;
  
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map(r => sanitizeRow(r, table));
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...restHeaders, "Prefer": "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(batch)
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`Insert into ${table} failed (${res.status}):`, err.substring(0, 300));
      throw new Error(`Insert into ${table} failed: ${err}`);
    }
    totalInserted += batch.length;
  }
  
  return { inserted: totalInserted };
}

// Detect all unique keys across all rows to find any new columns we need to add
function detectColumns(rows) {
  const keys = new Set();
  for (const row of rows) {
    for (const k of Object.keys(row)) keys.add(k);
  }
  return [...keys];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const step = body.step || 'migrate';

    if (step === 'detect') {
      // Detect actual columns in Base44 data
      const [properties, faults, documents, messages, invitations, payments, reminders] = await Promise.all([
        base44.asServiceRole.entities.Property.list(),
        base44.asServiceRole.entities.Fault.list(),
        base44.asServiceRole.entities.Document.list(),
        base44.asServiceRole.entities.Message.list(),
        base44.asServiceRole.entities.Invitation.list(),
        base44.asServiceRole.entities.Payment.list(),
        base44.asServiceRole.entities.Reminder.list(),
      ]);
      return Response.json({
        properties: detectColumns(properties),
        faults: detectColumns(faults),
        documents: detectColumns(documents),
        messages: detectColumns(messages),
        invitations: detectColumns(invitations),
        payments: detectColumns(payments),
        reminders: detectColumns(reminders),
      });
    }

    // Migrate: fetch all data and insert
    console.log("Fetching data from Base44...");
    const [properties, faults, documents, messages, invitations, payments, reminders, subscriptionPlans, siteSettings] = await Promise.all([
      base44.asServiceRole.entities.Property.list(),
      base44.asServiceRole.entities.Fault.list(),
      base44.asServiceRole.entities.Document.list(),
      base44.asServiceRole.entities.Message.list(),
      base44.asServiceRole.entities.Invitation.list(),
      base44.asServiceRole.entities.Payment.list(),
      base44.asServiceRole.entities.Reminder.list(),
      base44.asServiceRole.entities.SubscriptionPlan.list(),
      base44.asServiceRole.entities.SiteSettings.list(),
    ]);

    console.log(`Fetched: ${properties.length} properties, ${faults.length} faults, ${documents.length} docs, ${messages.length} msgs`);

    const results = await Promise.all([
      upsertRows("properties", properties),
      upsertRows("faults", faults),
      upsertRows("documents", documents),
      upsertRows("messages", messages),
      upsertRows("invitations", invitations),
      upsertRows("payments", payments),
      upsertRows("reminders", reminders),
      upsertRows("subscription_plans", subscriptionPlans),
      upsertRows("site_settings", siteSettings),
    ]);

    const summary = {
      properties: results[0].inserted,
      faults: results[1].inserted,
      documents: results[2].inserted,
      messages: results[3].inserted,
      invitations: results[4].inserted,
      payments: results[5].inserted,
      reminders: results[6].inserted,
      subscription_plans: results[7].inserted,
      site_settings: results[8].inserted,
    };

    console.log("Migration complete!", JSON.stringify(summary));
    return Response.json({ success: true, summary });

  } catch (error) {
    console.error("Migration error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});