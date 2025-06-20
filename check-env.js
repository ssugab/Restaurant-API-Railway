require('dotenv').config();

console.log('=== ENVIRONMENT VARIABLES CHECK ===');

// Show all variables starting with MYSQL or DATABASE
const envVars = Object.keys(process.env).filter(key => 
  key.startsWith('MYSQL') || key.startsWith('DATABASE')
);

console.log('Found variables:', envVars);

envVars.forEach(key => {
  const value = process.env[key];
  if (value) {
    // Hide password but show structure
    const maskedValue = value.replace(/:[^:@]*@/, ':***@');
    console.log(`${key}:`, maskedValue);
    
    // Check if it's a connection URL
    if (key.includes('URL') && value.startsWith('mysql://')) {
      console.log(`${key} format looks correct ✅`);
    } else if (key.includes('URL')) {
      console.log(`${key} might have wrong format ❌`);
    }
  }
});

console.log('\n=== CONNECTION STRING ANALYSIS ===');
const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;
if (connectionString) {
  console.log('Using connection string from:', process.env.MYSQL_URL ? 'MYSQL_URL' : 'DATABASE_URL');
  console.log('Masked string:', connectionString.replace(/:[^:@]*@/, ':***@'));
  
  // Parse the URL to check components
  try {
    const url = new URL(connectionString);
    console.log('Protocol:', url.protocol);
    console.log('Host:', url.hostname);
    console.log('Port:', url.port);
    console.log('Database:', url.pathname.slice(1));
    console.log('Username:', url.username);
    console.log('Password exists:', !!url.password);
  } catch (error) {
    console.error('❌ Invalid URL format:', error.message);
  }
} else {
  console.log('No connection string found, checking separate variables...');
  console.log('MYSQL_HOST:', process.env.MYSQL_HOST || 'NOT_SET');
  console.log('MYSQL_PORT:', process.env.MYSQL_PORT || 'NOT_SET');
  console.log('MYSQL_USER:', process.env.MYSQL_USER || 'NOT_SET');
  console.log('MYSQL_PASSWORD exists:', !!process.env.MYSQL_PASSWORD);
  console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE || 'NOT_SET');
} 