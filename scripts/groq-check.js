const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const sanityClient = require('@sanity/client');

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_SERVER_API_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_AUTH_TOKEN;

if (!projectId) {
  console.error('NEXT_PUBLIC_SANITY_PROJECT_ID not set in .env.local');
  process.exit(1);
}

const client = sanityClient({
  projectId,
  dataset,
  apiVersion: '2025-10-15',
  useCdn: false,
  token,
});

async function runChecks() {
  console.log(`Using project: ${projectId} dataset: ${dataset}`);
  try {
    const total = await client.fetch('count(*)');
    console.log('Total documents:', total);
  } catch (err) {
    console.error('Error fetching total count:', err.message || err);
  }

  const types = ['skill','profile','project','blog','service','achievement','certification','testimonial','siteSettings','contact','navigation','education','experience'];
  for (const t of types) {
    try {
      const c = await client.fetch(`count(*[_type == $type])`, { type: t });
      console.log(`${t}: ${c}`);
    } catch (err) {
      console.error(`Error fetching count for ${t}:`, err.message || err);
    }
  }
}

runChecks().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
