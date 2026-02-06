const dotenv = require('dotenv');
const sanityClient = require('@sanity/client');

dotenv.config({ path: '.env.local' });
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_SERVER_API_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_AUTH_TOKEN;

console.log('Loaded env:');
console.log('PROJECT_ID=', projectId);
console.log('DATASET=', dataset);
console.log('HAS_TOKEN=', token ? 'yes' : 'no');

if (!projectId) {
  console.error('NEXT_PUBLIC_SANITY_PROJECT_ID not set in .env.local');
  process.exit(1);
}

const client = sanityClient({ projectId, dataset, apiVersion: '2025-10-15', useCdn: false, token });

function fetchWithTimeout(query, params = {}, ms = 15000) {
  return Promise.race([
    client.fetch(query, params),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
}

(async () => {
  try {
    const total = await fetchWithTimeout('count(*)', {}, 15000);
    console.log('Total documents:', total);
  } catch (err) {
    console.error('Total count failed:', err.message || err);
  }

  const types = ['skill','profile','project','blog','service','achievement','certification','testimonial','siteSettings','contact','navigation','education','experience'];
  for (const t of types) {
    try {
      const c = await fetchWithTimeout('count(*[_type == $type])', { type: t }, 15000);
      console.log(`${t}: ${c}`);
    } catch (err) {
      console.error(`${t} failed:`, err.message || err);
    }
  }
})();
