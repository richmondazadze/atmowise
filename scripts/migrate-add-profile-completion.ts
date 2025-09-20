import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function addProfileCompletionColumn() {
  try {
    console.log('Adding isCompleted column to profiles table...');
    
    // Add the isCompleted column with default value false
    await client`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE
    `;
    
    console.log('✅ Successfully added isCompleted column to profiles table');
    
    // Update existing profiles to mark them as completed if they have displayName and ageGroup
    console.log('Updating existing profiles...');
    
    const result = await client`
      UPDATE profiles 
      SET is_completed = TRUE 
      WHERE display_name IS NOT NULL 
      AND sensitivity->>'ageGroup' IS NOT NULL
    `;
    
    console.log(`✅ Updated ${result.count} existing profiles to completed status`);
    
    // Verify the column was added
    const verification = await client`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'is_completed'
    `;
    
    if (verification.length > 0) {
      console.log('✅ Verification successful - isCompleted column exists');
      console.log('Column details:', verification[0]);
    } else {
      console.error('❌ Verification failed - isCompleted column not found');
    }
    
  } catch (error) {
    console.error('❌ Error adding isCompleted column:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
addProfileCompletionColumn()
  .then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
