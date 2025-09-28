/**
 * Debug database profile script
 */

const { supabaseAdmin } = require('./src/config/supabase');

async function debugProfile() {
    try {
        console.log('🔍 Debugging user profile in database...\n');
        
        const userId = '96378fbd-fe63-4e49-8f46-3813b3d85861';
        console.log('Looking for user ID:', userId);
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single();
        
        if (profileError) {
            console.error('❌ Profile fetch error:', profileError);
            
            // Let's check all profiles to see what's available
            console.log('\nChecking all available profiles...');
            const { data: allProfiles, error: allError } = await supabaseAdmin
                .from("user_profiles")
                .select("*")
                .limit(10);
            
            if (allError) {
                console.error('All profiles error:', allError);
            } else {
                console.log('Available profiles:');
                allProfiles.forEach(p => {
                    console.log(`- ID: ${p.id}, Name: ${p.name}, Role: ${p.role}`);
                });
            }
        } else {
            console.log('✅ Profile found:', JSON.stringify(profile, null, 2));
        }
        
    } catch (error) {
        console.error('Debug failed:', error.message);
    }
}

debugProfile();