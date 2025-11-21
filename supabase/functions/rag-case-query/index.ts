import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { checkRateLimit, rateLimiters, rateLimitResponse } from '../_shared/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get authentication token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's organization_id from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    if (profileError || !profile?.organization_id) {
      return new Response(
        JSON.stringify({ error: 'User is not associated with an organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userOrganizationId = profile.organization_id;

    // Parse request body
    const { query, organizationId } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CRITICAL SECURITY CHECK: Verify user belongs to requested organization
    if (organizationId && organizationId !== userOrganizationId) {
      console.error('❌ Security violation: User attempted to access different organization');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User does not belong to this organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use user's organization ID (ignore any provided organizationId for security)
    const targetOrganizationId = userOrganizationId;

    // Rate limiting: 10 queries per minute per organization
    const rateLimit = await checkRateLimit(req, rateLimiters.ragQuery, targetOrganizationId);
    if (!rateLimit.success) {
      console.warn('⚠️ Rate limit exceeded for RAG query:', targetOrganizationId);
      return rateLimitResponse(rateLimit, corsHeaders);
    }

    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!DEEPSEEK_API_KEY) {
      console.error('❌ DEEPSEEK_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate query embedding using OpenAI
    console.log('🔍 Generating query embedding...');
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ OpenAI embedding API error:', errorData);
      throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0]?.embedding;

    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      throw new Error('Invalid embedding response from OpenAI');
    }

    // Vector search using match_cases_by_organization RPC function
    // CRITICAL: Organization isolation is enforced in the RPC function
    console.log('🔍 Searching cases with vector similarity...');
    // Pass embedding as array - Supabase will convert to vector type
    const { data: matchedCases, error: searchError } = await supabase.rpc(
      'match_cases_by_organization',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.5, // Lowered from 0.7 to catch more relevant cases
        match_count: 10,
        org_id: targetOrganizationId
      }
    );

    if (searchError) {
      console.error('❌ Vector search error:', searchError);
      throw searchError;
    }

    console.log(`✅ Found ${matchedCases?.length || 0} matching cases via vector search`);

    // If vector search found no cases, try keyword fallback search
    let matchedCasesToUse = matchedCases || [];
    if (matchedCasesToUse.length === 0) {
      console.log('⚠️ No vector matches found, trying keyword fallback search...');
      
      // Extract keywords from query (simple approach)
      const keywords = query.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && !['show', 'me', 'all', 'cases', 'from', 'this', 'that', 'the', 'with', 'about'].includes(word));
      
      if (keywords.length > 0) {
        // Try keyword search in title, report_type, and tags
        // Build OR conditions for each keyword across multiple fields
        const keywordConditions: string[] = [];
        keywords.forEach(kw => {
          keywordConditions.push(`title.ilike.%${kw}%`);
          keywordConditions.push(`report_type.ilike.%${kw}%`);
          // Tags is a JSONB array, so we search differently
          keywordConditions.push(`tags::text.ilike.%${kw}%`);
        });
        
        const { data: keywordMatches, error: keywordError } = await supabase
          .from('reports')
          .select('id, tracking_id, title, status, priority, created_at, report_type, tags')
          .eq('organization_id', targetOrganizationId)
          .or(keywordConditions.join(','))
          .limit(10);
        
        if (!keywordError && keywordMatches && keywordMatches.length > 0) {
          console.log(`✅ Found ${keywordMatches.length} cases via keyword search`);
          // Convert to same format as vector search results
          matchedCasesToUse = keywordMatches.map(c => ({
            id: c.id,
            tracking_id: c.tracking_id,
            title: c.title,
            description: '',
            status: c.status,
            priority: c.priority,
            created_at: c.created_at,
            similarity: 0.5 // Lower similarity score for keyword matches
          }));
        }
      }
    }

    // Decrypt case content for context
    const ENCRYPTION_SALT = Deno.env.get('ENCRYPTION_SALT');
    if (!ENCRYPTION_SALT) {
      throw new Error('ENCRYPTION_SALT not configured');
    }

    const casesWithContent = [];
    if (matchedCasesToUse && matchedCasesToUse.length > 0) {
      // Fetch full case data including encrypted content
      const caseIds = matchedCasesToUse.map(c => c.id);
      const { data: fullCases, error: fetchError } = await supabase
        .from('reports')
        .select('id, tracking_id, title, encrypted_content, encryption_key_hash, status, priority, created_at, report_type')
        .in('id', caseIds)
        .eq('organization_id', targetOrganizationId); // Double-check organization isolation

      if (fetchError) {
        console.error('❌ Error fetching full case data:', fetchError);
      } else if (fullCases) {
        // Decrypt each case
        for (const caseData of fullCases) {
          try {
            const keyMaterial = targetOrganizationId + ENCRYPTION_SALT;
            const keyBuffer = new TextEncoder().encode(keyMaterial);
            const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
            const organizationKey = Array.from(new Uint8Array(hashBuffer))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');

            const combined = new Uint8Array(atob(caseData.encrypted_content).split('').map(c => c.charCodeAt(0)));
            const iv = combined.slice(0, 12);
            const encryptedDataBytes = combined.slice(12);

            const keyBytes = new Uint8Array(organizationKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            const cryptoKey = await crypto.subtle.importKey(
              'raw',
              keyBytes,
              { name: 'AES-GCM' },
              false,
              ['decrypt']
            );

            const decryptedBuffer = await crypto.subtle.decrypt(
              { name: 'AES-GCM', iv: iv },
              cryptoKey,
              encryptedDataBytes
            );

            const decryptedString = new TextDecoder().decode(decryptedBuffer);
            const decryptedData = JSON.parse(decryptedString);

            const matchedCase = matchedCasesToUse.find(c => c.id === caseData.id);
            casesWithContent.push({
              id: caseData.id,
              tracking_id: caseData.tracking_id,
              title: caseData.title,
              description: decryptedData.description || '',
              category: decryptedData.category || '',
              status: caseData.status,
              priority: caseData.priority,
              created_at: caseData.created_at,
              similarity: matchedCase?.similarity || 0,
              report_type: caseData.report_type
            });
          } catch (decryptError) {
            console.warn('⚠️ Failed to decrypt case:', caseData.id, decryptError);
            // Include case without description if decryption fails
            const matchedCase = matchedCasesToUse.find(c => c.id === caseData.id);
            casesWithContent.push({
              id: caseData.id,
              tracking_id: caseData.tracking_id,
              title: caseData.title,
              description: '',
              category: '',
              status: caseData.status,
              priority: caseData.priority,
              created_at: caseData.created_at,
              similarity: matchedCase?.similarity || 0,
              report_type: caseData.report_type
            });
          }
        }
      }
    }

    // Build context string from retrieved cases
    let caseContext = '';
    if (casesWithContent.length > 0) {
      caseContext = casesWithContent.map(c => {
        return `Case ${c.tracking_id}: ${c.title}\nStatus: ${c.status}, Priority: ${c.priority}/5\n${c.description ? `Description: ${c.description.substring(0, 500)}` : ''}\nCreated: ${c.created_at}`;
      }).join('\n\n---\n\n');
    }

    // Build system prompt
    const systemPrompt = `You are a compliance analyst helping explore whistleblowing cases.

🔒 SECURITY: You can ONLY access Organization ${targetOrganizationId}'s data. Never reference other organizations.

${casesWithContent.length > 0 ? `RETRIEVED CASES:\n${caseContext}` : `No cases found matching the query "${query}".

IMPORTANT: If the user is searching for specific case types (e.g., "harassment", "fraud", "safety"), consider:
- Cases might be categorized differently (check report_type, tags, or category fields)
- The search might need broader terms
- Cases might exist but with different wording
- Suggest checking all cases or trying alternative search terms`}

Provide clear insights, reference case numbers (DIS-XXXX format), identify patterns.
If no cases found, acknowledge this and suggest:
1. Trying broader search terms
2. Checking if cases exist under different categories
3. Verifying the time period or filters
Keep responses concise and actionable.`;

    // Call DeepSeek API for response generation
    console.log('🤖 Generating AI response with DeepSeek...');
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    const aiResponse = deepseekData.choices[0]?.message?.content || 'No response generated';

    // Log query to audit table
    const queryId = crypto.randomUUID();
    try {
      await supabase
        .from('rag_query_logs')
        .insert({
          id: queryId,
          organization_id: targetOrganizationId,
          user_id: user.id,
          query_text: query,
          results_count: casesWithContent.length,
          cases_returned: casesWithContent.map(c => c.id),
          metadata: {
            queryId,
            responseLength: aiResponse.length,
            similarityScores: casesWithContent.map(c => c.similarity)
          }
        });
    } catch (logError) {
      console.error('⚠️ Failed to log query (non-blocking):', logError);
    }

    console.log('✅ RAG query completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        cases: casesWithContent.map(c => ({
          id: c.id,
          tracking_id: c.tracking_id,
          title: c.title,
          status: c.status,
          priority: c.priority,
          created_at: c.created_at,
          similarity: c.similarity
        })),
        queryId,
        resultsCount: casesWithContent.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in RAG case query:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

