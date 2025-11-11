import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.user_type !== 'landlord') {
            return Response.json({ error: 'Only landlords can generate reports' }, { status: 403 });
        }

        const { property_id, report_type, start_date, end_date } = await req.json();

        if (!property_id) {
            return Response.json({ error: 'property_id is required' }, { status: 400 });
        }

        // Get property details
        const properties = await base44.entities.Property.filter({ id: property_id });
        const property = properties[0];

        if (!property || property.landlord_id !== user.id) {
            return Response.json({ error: 'Property not found or access denied' }, { status: 404 });
        }

        // Get all faults for this property
        let faults = await base44.entities.Fault.filter({ property_id });

        // Filter by date range if provided
        if (start_date) {
            faults = faults.filter(f => new Date(f.created_date) >= new Date(start_date));
        }
        if (end_date) {
            faults = faults.filter(f => new Date(f.created_date) <= new Date(end_date));
        }

        // Calculate statistics
        const totalFaults = faults.length;
        const openFaults = faults.filter(f => !['completed', 'closed'].includes(f.status)).length;
        const completedFaults = faults.filter(f => f.status === 'completed').length;
        const urgentFaults = faults.filter(f => f.priority === 'urgent').length;

        const categoryBreakdown = faults.reduce((acc, fault) => {
            acc[fault.category] = (acc[fault.category] || 0) + 1;
            return acc;
        }, {});

        const avgCompletionTime = faults
            .filter(f => f.completed_date && f.created_date)
            .map(f => {
                const created = new Date(f.created_date);
                const completed = new Date(f.completed_date);
                return (completed - created) / (1000 * 60 * 60 * 24); // days
            })
            .reduce((sum, days, _, arr) => sum + days / arr.length, 0);

        // Generate report using AI
        const report = await base44.integrations.Core.InvokeLLM({
            prompt: `Generate a professional property maintenance report for ${property.name} located at ${property.address}.

Report Period: ${start_date || 'All time'} to ${end_date || 'Present'}

Statistics:
- Total Faults Reported: ${totalFaults}
- Open/Pending Faults: ${openFaults}
- Completed Faults: ${completedFaults}
- Urgent Priority Faults: ${urgentFaults}
- Average Completion Time: ${avgCompletionTime.toFixed(1)} days
- Completion Rate: ${totalFaults > 0 ? ((completedFaults / totalFaults) * 100).toFixed(1) : 0}%

Category Breakdown:
${Object.entries(categoryBreakdown).map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}

Recent Faults:
${faults.slice(0, 10).map(f => `- ${f.title} (${f.status}, ${f.priority} priority) - ${f.category}`).join('\n')}

Please create a comprehensive report with:
1. Executive Summary
2. Key Metrics & Insights
3. Category Analysis
4. Recommendations for Improvement
5. Maintenance Trends

Format it professionally with clear sections and actionable insights.`,
        });

        return Response.json({ 
            success: true,
            property: {
                name: property.name,
                address: property.address
            },
            statistics: {
                total_faults: totalFaults,
                open_faults: openFaults,
                completed_faults: completedFaults,
                urgent_faults: urgentFaults,
                completion_rate: totalFaults > 0 ? ((completedFaults / totalFaults) * 100).toFixed(1) : 0,
                avg_completion_time_days: avgCompletionTime.toFixed(1),
                category_breakdown: categoryBreakdown
            },
            report,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});