import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_URL = "https://ekwumugpctllqtyevyhx.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const restHeaders = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

async function upsertRows(table, rows) {
  if (!rows || rows.length === 0) return { inserted: 0 };
  
  const batchSize = 100;
  let totalInserted = 0;
  
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
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

async function checkTablesExist() {
  // Try to query each table to see if it exists
  const tables = ["properties", "faults", "documents", "messages", "invitations", "payments", "reminders", "subscription_plans", "site_settings"];
  const results = {};
  
  for (const table of tables) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
      headers: restHeaders
    });
    results[table] = res.status === 200 ? "exists" : `missing (${res.status})`;
  }
  return results;
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

    // Step: check if tables exist
    if (step === 'check') {
      const tableStatus = await checkTablesExist();
      return Response.json({ tableStatus });
    }

    // Step: get the SQL to create tables (paste in Supabase SQL editor)
    if (step === 'get_sql') {
      const sql = `
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/ekwumugpctllqtyevyhx/sql)

CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ,
  created_by TEXT,
  landlord_id TEXT,
  property_code TEXT,
  name TEXT,
  address TEXT,
  type TEXT,
  units INTEGER,
  manager_email TEXT,
  image_url TEXT,
  gas_certificate_expiry DATE,
  electrical_certificate_expiry DATE,
  epc_expiry DATE,
  show_compliance_to_tenants BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.faults (
  id TEXT PRIMARY KEY,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ,
  created_by TEXT,
  landlord_id TEXT,
  property_id TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'reported',
  location TEXT,
  unit_number TEXT,
  images JSONB,
  contractor_name TEXT,
  estimated_completion DATE,
  completed_date DATE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ,
  created_by TEXT,
  landlord_id TEXT,
  property_id TEXT,
  title TEXT,
  document_type TEXT,
  file_url TEXT,
  unit_number TEXT,
  expiry_date DATE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ,
  created_by TEXT,
  landlord_id TEXT,
  property_id TEXT,
  message_type TEXT,
  title TEXT,
  content TEXT,
  priority TEXT DEFAULT 'normal',
  author_name TEXT,
  is_admin_broadcast BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.invitations (
  id TEXT PRIMARY KEY,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ,
  created_by TEXT,
  code TEXT,
  landlord_id TEXT,
  landlord_name TEXT,
  invitee_email TEXT,
  invitee_name TEXT,
  invitee_type TEXT DEFAULT 'tenant',
  property_id TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  used_at TIMESTAMPTZ,
  used_by TEXT
);

CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ,
  created_by TEXT,
  landlord_id TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'GBP',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  subscription_plan TEXT,
  stripe_payment_id TEXT,
  stripe_invoice_id TEXT,
  billing_period_start DATE,
  billing_period_end DATE,
  invoice_url TEXT
);

CREATE TABLE IF NOT EXISTS public.reminders (
  id TEXT PRIMARY KEY,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ,
  created_by TEXT,
  landlord_id TEXT,
  title TEXT,
  description TEXT,
  reminder_date DATE,
  category TEXT DEFAULT 'other',
  property_id TEXT,
  first_reminder_days INTEGER DEFAULT 7,
  second_reminder_days INTEGER DEFAULT 1,
  first_reminder_sent BOOLEAN DEFAULT false,
  second_reminder_sent BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ,
  created_by TEXT,
  name TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'GBP',
  billing_interval TEXT DEFAULT 'month',
  features JSONB,
  max_properties INTEGER,
  storage_mb INTEGER,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY,
  created_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ,
  created_by TEXT,
  site_name TEXT,
  site_url TEXT,
  support_email TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password TEXT,
  smtp_from_email TEXT,
  smtp_from_name TEXT,
  smtp_use_tls BOOLEAN,
  maintenance_mode BOOLEAN,
  maintenance_message TEXT,
  max_login_attempts INTEGER,
  session_timeout INTEGER,
  require_email_verification BOOLEAN,
  max_file_size INTEGER,
  allowed_file_types TEXT,
  social_facebook TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_instagram TEXT,
  social_youtube TEXT
);
      `.trim();

      return Response.json({ sql });
    }

    // Step: migrate data (tables must already exist)
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