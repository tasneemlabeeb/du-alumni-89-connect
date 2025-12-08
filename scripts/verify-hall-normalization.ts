import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Normalize hall name function (same as in the page)
function normalizeHallName(hall: string | undefined): string | undefined {
  if (!hall) return undefined;
  
  const normalized = hall.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // Map variations to standard names
  const hallMappings: { [key: string]: string } = {
    // A. F. Rahman Hall variations
    'a f rahman hall': 'A. F. Rahman Hall',
    'a.f. rahman hall': 'A. F. Rahman Hall',
    'sir a f rahman hall': 'A. F. Rahman Hall',
    'sir a.f. rahman': 'A. F. Rahman Hall',
    'f rahman hall': 'A. F. Rahman Hall',
    
    // Bangabandhu Sheikh Mujibur Rahman Hall variations
    'bangabandhu sheikh mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabandhu sheikh mojibur rahman': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabandhu sheikh mujib hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabandhu hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabandhu': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabondhu sheikh mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabundu (mujib) hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'banghobondhu sheikh mujibur rahman': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangobandhu sheikh mujibur rahman': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangobondhu sheikh mujib hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bongobondhu sheikh mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'b b mujibar rahman': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bb sheikh mujibur rahman hall.': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'sheikh mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'sheikh mojibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'sk. mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'sk mujib hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'skeikh mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'mujib hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabandhu sk. mujib hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    
    // Bangladesh Kuwait Maitree Hall variations
    'bangladesh kuwait maitree hall': 'Bangladesh Kuwait Maitree Hall',
    'bangladesh kuwait maitry hall': 'Bangladesh Kuwait Maitree Hall',
    'bangladesh kuwait moitri hall': 'Bangladesh Kuwait Maitree Hall',
    'bangladesh kwait maitre hall': 'Bangladesh Kuwait Maitree Hall',
    'bangladesh-kuwait maitree': 'Bangladesh Kuwait Maitree Hall',
    'bangladesh-kuwait maitree hall': 'Bangladesh Kuwait Maitree Hall',
    'kuwait maitree hall': 'Bangladesh Kuwait Maitree Hall',
    'kuwait maitry hall': 'Bangladesh Kuwait Maitree Hall',
    'kuwait moitri': 'Bangladesh Kuwait Maitree Hall',
    'kuwait moitri hall': 'Bangladesh Kuwait Maitree Hall',
    'kuwait moyitri': 'Bangladesh Kuwait Maitree Hall',
    
    // Begum Rokeya Hall variations
    'begum rokeya hall': 'Begum Rokeya Hall',
    'rokeya hall': 'Begum Rokeya Hall',
    'rokeya': 'Begum Rokeya Hall',
    'ruqayyah hall': 'Begum Rokeya Hall',
    'ruqayyah': 'Begum Rokeya Hall',
    'rukeya hall': 'Begum Rokeya Hall',
    
    // Fazlul Haq Muslim Hall variations
    'fazlul haq muslim hall': 'Fazlul Haq Muslim Hall',
    'fazlul haque muslim hall': 'Fazlul Haq Muslim Hall',
    'fazlul haque muslinn hall': 'Fazlul Haq Muslim Hall',
    'fazlul haq muslinn hall': 'Fazlul Haq Muslim Hall',
    'fazlul haque hall': 'Fazlul Haq Muslim Hall',
    'fazlul haque': 'Fazlul Haq Muslim Hall',
    'fazlul hoque': 'Fazlul Haq Muslim Hall',
    'fazlul hauque hall': 'Fazlul Haq Muslim Hall',
    'fazlul huq muslim hall': 'Fazlul Haq Muslim Hall',
    'fh hall': 'Fazlul Haq Muslim Hall',
    'f. h hall': 'Fazlul Haq Muslim Hall',
    
    // Haji Muhammad Mohsin Hall variations
    'haji muhammad mohsin hall': 'Haji Muhammad Mohsin Hall',
    'haji mohammad mohsin hall': 'Haji Muhammad Mohsin Hall',
    'haji mohammad mohashin hall': 'Haji Muhammad Mohsin Hall',
    'haji mohammad mohshin hall': 'Haji Muhammad Mohsin Hall',
    'haji mohsin hall': 'Haji Muhammad Mohsin Hall',
    'haji muhammad mohsin': 'Haji Muhammad Mohsin Hall',
    'hazi md mohsin hall': 'Haji Muhammad Mohsin Hall',
    'hazi mohammad mohasin hall': 'Haji Muhammad Mohsin Hall',
    'hazi mohammad mohsin': 'Haji Muhammad Mohsin Hall',
    'hazi mohammad mohsin hall': 'Haji Muhammad Mohsin Hall',
    'hazi muhammad mohsin hall': 'Haji Muhammad Mohsin Hall',
    'kazi mohammad mohsin hall': 'Haji Muhammad Mohsin Hall',
    'mohoshin hall': 'Haji Muhammad Mohsin Hall',
    'mohosin hall': 'Haji Muhammad Mohsin Hall',
    'mohsin hall': 'Haji Muhammad Mohsin Hall',
    
    // Jagannath Hall variations
    'jagannath hall': 'Jagannath Hall',
    'jagannat hall': 'Jagannath Hall',
    'jagonnath hall': 'Jagannath Hall',
    
    // Kabi Jasimuddin Hall variations
    'kabi jasimuddin hall': 'Kabi Jasimuddin Hall',
    'kabi jashimuddin hall': 'Kabi Jasimuddin Hall',
    'kabi jashim uddin hall': 'Kabi Jasimuddin Hall',
    'kabi jasim uddin hall': 'Kabi Jasimuddin Hall',
    'kabi jasimuddin': 'Kabi Jasimuddin Hall',
    'kobi jashim uddin': 'Kabi Jasimuddin Hall',
    'kobi joshim uddin': 'Kabi Jasimuddin Hall',
    'jashim uddin hall': 'Kabi Jasimuddin Hall',
    'jashimuddin hall': 'Kabi Jasimuddin Hall',
    'jasim uddin': 'Kabi Jasimuddin Hall',
    'jasim uddin hall': 'Kabi Jasimuddin Hall',
    'jasimuddin hall': 'Kabi Jasimuddin Hall',
    
    // Muktijoddha Ziaur Rahman Hall variations
    'muktijoddha ziaur rahman hall': 'Muktijoddha Ziaur Rahman Hall',
    'muktijoddha ziaur rahman': 'Muktijoddha Ziaur Rahman Hall',
    'muktijoddha ziaur rohman hall': 'Muktijoddha Ziaur Rahman Hall',
    'muktijoddha zlaur rahman hall': 'Muktijoddha Ziaur Rahman Hall',
    'muktizoddha ziaur rahman hall': 'Muktijoddha Ziaur Rahman Hall',
    'ziaur rahman hall': 'Muktijoddha Ziaur Rahman Hall',
    'ziaur rahman': 'Muktijoddha Ziaur Rahman Hall',
    
    // Salimullah Muslim Hall variations
    'salimullah muslim hall': 'Salimullah Muslim Hall',
    'salimulla hall': 'Salimullah Muslim Hall',
    'salimullah hall': 'Salimullah Muslim Hall',
    'salimullah muslim': 'Salimullah Muslim Hall',
    'salinnullah muslinn hall': 'Salimullah Muslim Hall',
    'sallmullah': 'Salimullah Muslim Hall',
    'sir salimullah muslim hall': 'Salimullah Muslim Hall',
    'sir solimullah hall': 'Salimullah Muslim Hall',
    'sm hall': 'Salimullah Muslim Hall',
    's.m hall': 'Salimullah Muslim Hall',
    's.m.hall': 'Salimullah Muslim Hall',
    's m hall': 'Salimullah Muslim Hall',
    
    // Sergeant Zahurul Haque Hall variations
    'sergeant zahurul haque hall': 'Sergeant Zahurul Haque Hall',
    'sergent zahurul haq hall': 'Sergeant Zahurul Haque Hall',
    'sergent zahurul huq hall': 'Sergeant Zahurul Haque Hall',
    'sargent jahurul haque hall': 'Sergeant Zahurul Haque Hall',
    'sergeant jahurul haque hall': 'Sergeant Zahurul Haque Hall',
    'sergeant zahurul huq hall': 'Sergeant Zahurul Haque Hall',
    'surgent jahurul hall': 'Sergeant Zahurul Haque Hall',
    'surgent zuhurul haque hall': 'Sergeant Zahurul Haque Hall',
    'zahurul haq': 'Sergeant Zahurul Haque Hall',
    'zahurul haq hall': 'Sergeant Zahurul Haque Hall',
    'zahurul haque': 'Sergeant Zahurul Haque Hall',
    'zahurul haque hall': 'Sergeant Zahurul Haque Hall',
    'zahurul huq hall': 'Sergeant Zahurul Haque Hall',
    'jahurul haque hall': 'Sergeant Zahurul Haque Hall',
    
    // Shahidullah Hall variations
    'shahidullah hall': 'Shahidullah Hall',
    'dr. mohammad shahidullah hall': 'Shahidullah Hall',
    'dr. mohammad shahidullah hall.': 'Shahidullah Hall',
    'shahldullah hall': 'Shahidullah Hall',
    'shaldullah hall': 'Shahidullah Hall',
    
    // Shamsunnahar Hall (already clean)
    'shamsunnahar hall': 'Shamsunnahar Hall',
    
    // Surja Sen Hall variations
    'surja sen hall': 'Surja Sen Hall',
    'surjasen hall': 'Surja Sen Hall',
    'surjasen hall.': 'Surja Sen Hall',
    'surjo sen hall': 'Surja Sen Hall',
    'surya sen hall': 'Surja Sen Hall',
    'master da surja sen hall': 'Surja Sen Hall',
    'master da surjasen hall': 'Surja Sen Hall',
    'master da surya sen': 'Surja Sen Hall',
    'masterda surja sen': 'Surja Sen Hall',
    'shurzo shen hall': 'Surja Sen Hall',
    
    // Zia Hall variations
    'zia hall': 'Zia Hall',
    'hall zia hall': 'Zia Hall',
  };
  
  return hallMappings[normalized] || hall.trim();
}

async function verifyHallNormalization() {
  try {
    console.log('🔍 Verifying hall name normalization...\n');

    const profilesSnapshot = await db.collection('profiles').get();
    
    // Group by raw hall names
    const rawHallCounts: { [key: string]: number } = {};
    const normalizedHallCounts: { [key: string]: number } = {};
    
    profilesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const rawHall = data.hall?.trim();
      const normalizedHall = normalizeHallName(rawHall);
      
      if (rawHall) {
        rawHallCounts[rawHall] = (rawHallCounts[rawHall] || 0) + 1;
      }
      
      if (normalizedHall) {
        normalizedHallCounts[normalizedHall] = (normalizedHallCounts[normalizedHall] || 0) + 1;
      }
    });
    
    console.log('📊 BEFORE Normalization:');
    console.log(`Total unique hall variations: ${Object.keys(rawHallCounts).length}\n`);
    
    console.log('📊 AFTER Normalization:');
    console.log(`Total standardized halls: ${Object.keys(normalizedHallCounts).length}\n`);
    
    console.log('✅ Standardized Hall Distribution:');
    console.log('─'.repeat(60));
    
    const sortedNormalized = Object.entries(normalizedHallCounts)
      .sort((a, b) => b[1] - a[1]);
    
    sortedNormalized.forEach(([hall, count]) => {
      console.log(`${hall.padEnd(45)} | ${count} members`);
    });
    
    console.log('\n✅ Normalization successful!');
    console.log(`Reduced ${Object.keys(rawHallCounts).length} variations to ${Object.keys(normalizedHallCounts).length} standard names`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyHallNormalization();
