const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { AsyncParser } = require('@json2csv/node');

async function main() {
  await scrapeFromMarvelSnapZone();
}

async function scrapeFromMarvelSnapZone() {
  const url = 'https://marvelsnapzone.com/wp-admin/admin-ajax.php';

  const formData = new FormData();
  formData.append('action', 'api_actions');
  formData.append('searchtype', 'cards');
  formData.append('searchcardstype', 'true');

  const res = await axios.post(url, formData);
  const cards = res.data.success.cards;

  const cardList = [];

  for (const card of cards) {
    cardList.push({
      cid: card.cid,
      name: card.name,
      cost: card.cost,
      power: card.power,
      ability: card.ability,
      flavor: card.flavor,
      image: card.art,
      isReleased: card.status === 'released',
      source: card.source
    });
  }
  
  ensureDataFolderExist();

  const today = getToday();
  const fileName = `./data/${today}.csv`;
  const writeStream = fs.createWriteStream(fileName);

  const parser = new AsyncParser();
  parser.parse(cardList).pipe(writeStream);

  console.log(`${today}.csv generated.`)
}

function getToday() {
  const date = new Date();
 
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();

  return `${year}-${month}-${day}`;
}

function ensureDataFolderExist() {
  const dir = './data';
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log('data folder created.')
  }
}

main();
