// Test the send invitation functionality
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cxmuzperkittvibslnff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bXV6cGVya2l0dHZpYnNsbmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTk1MDEsImV4cCI6MjA2NTgzNTUwMX0.NxqrBnzSR-dxfWw4mn7nIHB-QTt900MtAh96fCCm1Lg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInvitation() {
  console.log('Testing invitation creation...');
  
  try {
    // Test creating an invitation
    const { data: newInvitation, error } = await supabase
      .from('user_invitations')
      .insert({
        organization_id: '0358e286-699a-43d7-b8ea-6d33c269af5e',
        email: 'test@example.com',
        role: 'case_handler',
        invited_by: '8bd9b4a0-8cf3-49d0-87e3-2e709be5e77f',
        token: '', // This will be replaced by the trigger
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return;
    }

    console.log('Invitation created:', newInvitation);

    // Test sending the invitation email
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-team-invitation', {
      body: { invitationId: newInvitation.id },
    });

    if (emailError) {
      console.error('Error sending invitation email:', emailError);
    } else {
      console.log('Email sent successfully:', emailResult);
    }

    // Clean up - delete the test invitation
    await supabase
      .from('user_invitations')
      .delete()
      .eq('id', newInvitation.id);

    console.log('Test invitation cleaned up');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testInvitation();
