import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("supabase");

    // Step 1: Get projects
    const projectsRes = await fetch("https://api.supabase.com/v1/projects", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const projectsText = await projectsRes.text();
    console.log("Projects raw response:", projectsText);
    const projects = JSON.parse(projectsText);

    if (!projects || projects.length === 0) {
      return Response.json({ error: "No Supabase projects found", raw: projects, status: projectsRes.status }, { status: 404 });
    }

    const results = [];

    for (const project of projects) {
      const projectRef = project.ref;
      const projectName = project.name;

      // Step 2: Get schema via read-only query
      const schemaRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query/read-only`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: `
            SELECT
              t.table_name,
              t.table_schema,
              c.column_name,
              c.data_type,
              c.is_nullable,
              c.column_default,
              c.character_maximum_length,
              tc.constraint_type
            FROM information_schema.tables t
            LEFT JOIN information_schema.columns c
              ON t.table_name = c.table_name AND t.table_schema = c.table_schema
            LEFT JOIN information_schema.key_column_usage kcu
              ON c.column_name = kcu.column_name AND c.table_name = kcu.table_name AND c.table_schema = kcu.table_schema
            LEFT JOIN information_schema.table_constraints tc
              ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
            WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pgtle')
              AND t.table_type = 'BASE TABLE'
            ORDER BY t.table_schema, t.table_name, c.ordinal_position
          `
        })
      });

      const schemaData = await schemaRes.json();
      console.log(`Schema for ${projectRef}:`, JSON.stringify(schemaData).substring(0, 500));

      // Group by schema + table
      const tables = {};
      const rows = Array.isArray(schemaData) ? schemaData : (schemaData.data || []);

      for (const row of rows) {
        const key = `${row.table_schema}.${row.table_name}`;
        if (!tables[key]) {
          tables[key] = {
            schema: row.table_schema,
            table: row.table_name,
            columns: []
          };
        }
        if (row.column_name) {
          tables[key].columns.push({
            name: row.column_name,
            type: row.data_type,
            nullable: row.is_nullable === "YES",
            default: row.column_default,
            maxLength: row.character_maximum_length,
            constraint: row.constraint_type || null
          });
        }
      }

      results.push({
        project: projectName,
        ref: projectRef,
        tables: Object.values(tables)
      });
    }

    return Response.json({ projects: results });
  } catch (error) {
    console.error("Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});