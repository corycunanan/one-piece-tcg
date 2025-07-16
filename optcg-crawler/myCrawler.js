const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const https = require('https');
const path = require('path');

async function fetchCardsPuppeteer() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const baseURL = 'https://en.onepiece-cardgame.com/cardlist/';
  const baseImageURL = 'https://en.onepiece-cardgame.com'; // For relative image srcs

  await page.goto(baseURL, { waitUntil: 'networkidle0' });

  // Dismiss the cookie popup if present
  try {
    await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
    await page.click('#onetrust-accept-btn-handler');
    console.log('✅ Accepted cookies');
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for popup to disappear
  } catch (e) {
    console.log('No cookie popup found or already dismissed.');
  }

  const cards = [];
  while (true) {
    const cardBtns = await page.$$('a.modalOpen');
    if (cardBtns.length === 0) break;

    const cardBtn = cardBtns[0];
    if (!cardBtn) {
      console.log('⚠️ No card button found.');
      break;
    }

    // Scroll into view
    await cardBtn.evaluate(el => el.scrollIntoView());

    // Check for visibility
    const isVisible = await cardBtn.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        window.getComputedStyle(el).visibility !== 'hidden'
      );
    });
    if (!isVisible) {
      console.log('Button not visible, skipping.');
      continue;
    }

    console.log(`🔍 Scraping card (remaining: ${cardBtns.length})`);

    try {
      // Get the data-src for the modal ID
      const dataSrc = await cardBtn.evaluate(el => el.getAttribute('data-src'));
      const modalSelector = `dl.modalCol${dataSrc}`;

      // Use page.evaluate to click the button directly
      await page.evaluate(el => el.click(), cardBtn);
      console.log(`... clicked, waiting for modal ${modalSelector}`);

      await new Promise(resolve => setTimeout(resolve, 500)); // Small wait for animation
      await page.waitForSelector(modalSelector, { visible: true, timeout: 10000 });

      // Scrape modal content
      const cardData = await page.evaluate((modalSelector) => {
        const modal = document.querySelector(modalSelector);
        const name = modal.querySelector('.cardName')?.innerText.trim();
        const modalId = modal.getAttribute('id') || '';
        const cardId = modalId || null;
        // Try to extract cost from multiple possible locations
        let cost = null;
        const costEl = modal.querySelector('.cost');
        if (costEl) {
          const costText = costEl.innerText.replace(/[^0-9]/g, '');
          cost = costText ? parseInt(costText) : null;
        }
        const attribute = modal.querySelector('.attribute i')?.innerText.trim();
        let effectText = modal.querySelector('.text')?.innerText.trim() || null;
        // Remove 'Effect:' from the beginning if present
        if (effectText && effectText.toLowerCase().startsWith('effect:')) {
          effectText = effectText.slice(7).trim();
        }

        let triggerText = null;
        if (effectText && effectText.toLowerCase().includes('trigger:')) {
          const match = effectText.match(/trigger:(.*)/i);
          if (match) triggerText = match[1].trim();
        }

        let imgSrc = modal.querySelector('.frontCol img')?.getAttribute('src') || null;

        return { name, cardId, cost, attribute, effectText, triggerText, relativeImg: imgSrc };
      }, modalSelector);

      console.log(`✅ ${cardData.cardId} ${cardData.name}`);

      // Build full image URL
      if (cardData.relativeImg) {
        cardData.imageUrl = baseImageURL + cardData.relativeImg.replace('..', '');
      } else {
        cardData.imageUrl = null;
      }

      // Download image
      if (cardData.imageUrl && cardData.cardId) {
        const filename = `${cardData.cardId.replace('/', '-')}.jpg`;
        await downloadImage(cardData.imageUrl, path.join(__dirname, 'images', filename));
        cardData.localImage = filename;
      } else {
        cardData.localImage = '';
      }

      cards.push(cardData);

      // Close modal
      await page.keyboard.press('Escape');
      await new Promise(resolve => setTimeout(resolve, 800)); // Longer wait for DOM update

    } catch (error) {
      console.log(`⚠️ Error scraping card: ${error}`);
      break;
    }
  }

  await writeCSV(cards);

  await browser.close();
  console.log('🎉 Done! All cards scraped, images downloaded, CSV saved.');
}

async function writeCSV(data) {
  const csvWriter = createCsvWriter({
    path: 'onepiece_cards_modal.csv',
    header: [
      { id: 'cardId', title: 'cardId' },
      { id: 'name', title: 'name' },
      { id: 'cost', title: 'cost' },
      { id: 'attribute', title: 'attribute' },
      { id: 'imageUrl', title: 'imageUrl' },
      { id: 'localImage', title: 'localImage' },
      { id: 'effectText', title: 'effectText' },
      { id: 'triggerText', title: 'triggerText' },
    ]
  });

  await csvWriter.writeRecords(data);
  console.log(`📄 CSV written with ${data.length} cards.`);
}

async function downloadImage(url, filepath) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const file = fs.createWriteStream(filepath);
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`🖼️ Saved image: ${filepath}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(filepath, () => reject(err));
    });
  });
}

fetchCardsPuppeteer();
