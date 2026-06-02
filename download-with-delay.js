const fs = require('fs');
const path = require('path');
const https = require('https');

const map = {
  // Football
  'public/images/football/salah.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Mohamed_Salah_2018.jpg',
  'public/images/football/neymar.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Neymar_JR_2018.jpg',
  'public/images/football/mbappe.jpg': 'https://upload.wikimedia.org/wikipedia/commons/5/57/Kylian_Mbapp%C3%A9_2018.jpg',
  'public/images/football/benzema.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Karim_Benzema_2018.jpg',

  // Celebrities
  'public/images/celebrities/helmy.jpg': 'https://upload.wikimedia.org/wikipedia/commons/8/80/Ahmed_Helmy_Cairo_Film_Festival.jpg',
  'public/images/celebrities/imam.jpg': 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Adel_Imam_2012.jpg',
  'public/images/celebrities/ramadan.jpg': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Mohamed_Ramadan_2020.jpg',
  'public/images/celebrities/hosny.jpg': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Tamer_Hosny_2019.jpg',
  'public/images/celebrities/diab.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Amr_Diab.jpg',
  'public/images/celebrities/henedi.jpg': 'https://upload.wikimedia.org/wikipedia/commons/0/07/Mohamed_Henedy_Cairo_Film_Festival.jpg',

  // Cartoons
  'public/images/cartoons/spongebob.svg': 'https://upload.wikimedia.org/wikipedia/commons/3/3b/SpongeBob_SquarePants_character.svg',
  'public/images/cartoons/tom.png': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Tom_and_Jerry_art_in_MultiVersus.png',
  'public/images/cartoons/batman.png': 'https://upload.wikimedia.org/wikipedia/en/c/c5/Batman_infobox.png',
  'public/images/cartoons/gumball.png': 'https://upload.wikimedia.org/wikipedia/en/8/87/Gumball_Watterson.png'
};

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0'
];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
    const options = {
      headers: {
        'User-Agent': randomUA,
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    https.get(url, options, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, options, (res) => {
          if (res.statusCode !== 200) {
            fs.unlink(dest, () => {});
            reject(new Error(`Status Code: ${res.statusCode}`));
            return;
          }
          res.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
      } else {
        if (response.statusCode !== 200) {
          fs.unlink(dest, () => {});
          reject(new Error(`Status Code: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Starting missing images download with 5-second delays...');
  const entries = Object.entries(map);
  
  for (let i = 0; i < entries.length; i++) {
    const [dest, url] = entries[i];
    const fullDest = path.join(__dirname, dest);
    
    // Add delay between requests (except the first one)
    if (i > 0) {
      console.log('Waiting 5 seconds to avoid rate limiting...');
      await wait(5000);
    }
    
    try {
      console.log(`[${i+1}/${entries.length}] Downloading ${url} -> ${dest}...`);
      await download(url, fullDest);
      
      // Verify it's not HTML
      const stat = fs.statSync(fullDest);
      const buffer = Buffer.alloc(200);
      const fd = fs.openSync(fullDest, 'r');
      fs.readSync(fd, buffer, 0, 200, 0);
      fs.closeSync(fd);
      
      const content = buffer.toString('utf8');
      if (content.includes('<!DOCTYPE') || content.includes('<html')) {
        console.error(`❌ Downloaded file is HTML error page! Size: ${stat.size} bytes`);
        // Delete it
        fs.unlinkSync(fullDest);
      } else {
        console.log(`✅ Success! Size: ${stat.size} bytes`);
      }
    } catch (error) {
      console.error(`❌ Failed:`, error.message);
    }
  }
  console.log('Download process finished.');
}

run();
