// 利用可能な硬貨の定義
const COINS = [
  { value: 1, label: '1円', image: 'images/1.png' },
  { value: 5, label: '5円', image: 'images/5.png' },
  { value: 10, label: '10円', image: 'images/10.png' },
  { value: 50, label: '50円', image: 'images/50.png' },
  { value: 100, label: '100円', image: 'images/100.png' },
  { value: 500, label: '500円', image: 'images/500.png' }
];

// 硬貨のサイズ定義（mm）
const COIN_SIZES = {
  1: 20.0,
  5: 22.0,
  10: 22.6,
  50: 20.7,
  100: 22.6,
  500: 26.5
};

let amountCount = 0;

// DOMの初期化
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-amount-btn').addEventListener('click', addAmountBlock);
  document.getElementById('display-btn').addEventListener('click', generatePrintPage);
});

// 値段ブロックを追加
function addAmountBlock() {
  const container = document.getElementById('amounts-container');
  const blockId = `amount-${amountCount}`;
  amountCount++;

  const block = document.createElement('div');
  block.className = 'amount-block';
  block.id = blockId;
  block.innerHTML = `
    <div class="amount-header">
      <div class="amount-input-group">
        <input type="number" class="amount-value" min="1" placeholder="金額">
        <span class="unit">円</span>
      </div>
      <button class="remove-amount-btn" onclick="removeAmountBlock('${blockId}')">削除</button>
    </div>
    <div class="coins-list" id="coins-${blockId}"></div>
    <button class="add-coin-btn" onclick="addCoinRow('${blockId}')">硬貨を追加</button>
  `;
  
  container.appendChild(block);
}

// 値段ブロックを削除
function removeAmountBlock(blockId) {
  document.getElementById(blockId).remove();
}

// コイン行を追加
function addCoinRow(blockId) {
  const coinsList = document.getElementById(`coins-${blockId}`);
  const rowId = `coin-row-${Date.now()}`;

  const row = document.createElement('div');
  row.className = 'coin-row';
  row.id = rowId;

  let coinOptions = COINS.map(coin => `<option value="${coin.value}">${coin.label}</option>`).join('');

  row.innerHTML = `
    <select class="coin-select" onchange="updateCoinCount(this, '${rowId}')">
      <option value="">硬貨を選択</option>
      ${coinOptions}
    </select>
    <input type="number" class="coin-count" min="1" value="1" placeholder="枚数">
    <button class="remove-coin-btn" onclick="removeCoinRow('${rowId}')">削除</button>
  `;

  coinsList.appendChild(row);
}

// コイン行を削除
function removeCoinRow(rowId) {
  document.getElementById(rowId).remove();
}

// コイン選択時の処理
function updateCoinCount(select, rowId) {
  if (select.value) {
    // 必要に応じてバリデーション等を追加
  }
}

// 印刷ページを生成
function generatePrintPage() {
  const amountBlocks = document.querySelectorAll('.amount-block');
  
  if (amountBlocks.length === 0) {
    alert('値段を追加してください');
    return;
  }

  let amounts = [];

  amountBlocks.forEach(block => {
    const amountValue = parseInt(block.querySelector('.amount-value').value);
    
    if (!amountValue) {
      alert('金額を入力してください');
      return;
    }

    const coinRows = block.querySelectorAll('.coin-row');
    let coins = [];

    coinRows.forEach(row => {
      const coinValue = parseInt(row.querySelector('.coin-select').value);
      const coinCount = parseInt(row.querySelector('.coin-count').value);

      if (coinValue && coinCount) {
        coins.push({ value: coinValue, count: coinCount });
      }
    });

    amounts.push({ amount: amountValue, coins: coins });
  });

  if (amounts.some(a => a.coins.length === 0)) {
    alert('各値段に対して硬貨を追加してください');
    return;
  }

  // 印刷ページHTMLを生成
  const htmlContent = generatePrintHTML(amounts);
  
  // 新しいウィンドウで表示
  const newWindow = window.open('', '', 'width=1000,height=800');
  newWindow.document.write(htmlContent);
  newWindow.document.close();
}

// 印刷ページHTMLを生成
function generatePrintHTML(amounts) {
  let coinSections = amounts.map(a => generateCoinSection(a.amount, a.coins)).join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>硬貨学習用A4印刷ページ</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="page">
    ${coinSections}
  </div>
</body>
</html>`;
}

// 単一の値段セクションを生成
function generateCoinSection(amount, coins) {
  // 行に分割（最大6個まで）
  const chunkSize = 6;

  let rowsHTML = '';
  // 各「硬貨を追加」ごとに処理
  coins.forEach(coin => {
    const coinValue = coin.value;
    const coinCount = coin.count;
    
    // このコイングループを行に分割
    for (let i = 0; i < coinCount; i += chunkSize) {
      const remaining = coinCount - i;
      const itemsInThisRow = Math.min(chunkSize, remaining);
      
      const rowCoinsHTML = Array.from({length: itemsInThisRow}).map(() => {
        const coinInfo = COINS.find(c => c.value === coinValue);
        const coinSize = COIN_SIZES[coinValue];
        return `<div class="coin-image coin-${coinValue}">
          <img src="${coinInfo.image}" alt="${coinInfo.label}" style="width: ${coinSize}mm; height: ${coinSize}mm;">
        </div>`;
      }).join('');
      
      rowsHTML += `<div class="row">${rowCoinsHTML}</div>`;
    }
  });

  return `
    <div class="coin-section">
      <div class="amount-label">
        <span class="amount-text">${amount}</span>
        <span class="currency-mark">円</span>
      </div>
      ${rowsHTML}
    </div>`;
}
