const { firestore, isConfigured } = require('../config/firebaseAdmin');
const db = require('../config/db');

async function seedFirestore() {
  if (!isConfigured || !firestore) {
    console.error('❌ Firebase Admin is not configured. Check serviceAccountKey.json.');
    process.exit(1);
  }

  console.log('🚀 Initiating Cloud Firestore synchronization for TechSchool (techschool-da235)...');

  const tables = [
    'users',
    'classes',
    'subjects',
    'students',
    'teachers',
    'parents',
    'attendance',
    'exams',
    'grades',
    'announcements',
    'fees'
  ];

  for (const table of tables) {
    try {
      const records = db.prepare(`SELECT * FROM ${table}`).all();
      console.log(`📦 Syncing ${records.length} records to collection '${table}'...`);

      // Firestore batches support up to 500 operations
      const batchSize = 400;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = firestore.batch();
        const chunk = records.slice(i, i + batchSize);

        for (const item of chunk) {
          const docRef = firestore.collection(table).doc(String(item.id));
          // Sanitize undefined/null values
          const cleanItem = {};
          for (const [k, v] of Object.entries(item)) {
            cleanItem[k] = v !== undefined ? v : null;
          }
          batch.set(docRef, cleanItem, { merge: true });
        }

        await batch.commit();
      }

      console.log(`✅ Collection '${table}' synced successfully.`);
    } catch (err) {
      console.error(`Error syncing table ${table}:`, err.message);
    }
  }

  console.log('🎉 Cloud Firestore synchronization completed!');
}

if (require.main === module) {
  seedFirestore()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedFirestore;
