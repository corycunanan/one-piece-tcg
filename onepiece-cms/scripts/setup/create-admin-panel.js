import fs from 'fs';
import path from 'path';

function createAdminPanel() {
  const adminDir = path.join(process.cwd(), '..', 'admin-panel');
  if (!fs.existsSync(adminDir)) {
    fs.mkdirSync(adminDir, { recursive: true });
  }
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>One Piece TCG Data Manager</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; color: #3498db; }
        .controls { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .search { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; }
        .filters { display: flex; gap: 10px; margin-bottom: 10px; }
        .filter { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: white; }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card-name { font-weight: bold; margin-bottom: 10px; color: #2c3e50; }
        .card-type { display: inline-block; background: #3498db; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin-bottom: 10px; }
        .card-rarity { display: inline-block; background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 10px; }
        .card-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
        .stat { font-size: 0.9em; color: #666; }
        .loading { text-align: center; padding: 40px; color: #666; }
        .error { background: #e74c3c; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎴 One Piece TCG Data Manager</h1>
            <p>Manage your card data with JSON files and Git version control</p>
        </div>
        
        <div class="stats" id="stats">
            <div class="stat-card">
                <div class="stat-number" id="totalCards">-</div>
                <div>Total Cards</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalSets">-</div>
                <div>Total Sets</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="cardTypes">-</div>
                <div>Card Types</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="rarities">-</div>
                <div>Rarities</div>
            </div>
        </div>
        
        <div class="controls">
            <input type="text" class="search" id="search" placeholder="Search cards by name, cardId, or set...">
            <div class="filters">
                <select class="filter" id="typeFilter">
                    <option value="">All Types</option>
                </select>
                <select class="filter" id="rarityFilter">
                    <option value="">All Rarities</option>
                </select>
                <select class="filter" id="setFilter">
                    <option value="">All Sets</option>
                </select>
            </div>
        </div>
        
        <div id="cards" class="cards-grid">
            <div class="loading">Loading cards...</div>
        </div>
    </div>

    <script>
        let allCards = [];
        let filteredCards = [];
        
        async function loadData() {
            try {
                const response = await fetch('http://localhost:3001/cards');
                allCards = await response.json();
                filteredCards = [...allCards];
                
                const metadataResponse = await fetch('http://localhost:3001/metadata');
                const metadata = await metadataResponse.json();
                
                updateStats(metadata);
                updateFilters();
                renderCards();
            } catch (error) {
                document.getElementById('cards').innerHTML = \`
                    <div class="error">
                        <h3>⚠️ Connection Error</h3>
                        <p>Could not connect to JSON Server. Make sure it's running:</p>
                        <code>npm start</code>
                        <p>Then refresh this page.</p>
                    </div>
                \`;
            }
        }
        
        function updateStats(metadata) {
            document.getElementById('totalCards').textContent = metadata.totalCards || allCards.length;
            document.getElementById('totalSets').textContent = metadata.totalSets || 0;
            document.getElementById('cardTypes').textContent = metadata.cardTypes?.length || 0;
            document.getElementById('rarities').textContent = metadata.rarities?.length || 0;
        }
        
        function updateFilters() {
            const types = [...new Set(allCards.map(c => c.cardType))];
            const rarities = [...new Set(allCards.map(c => c.rarity))];
            const sets = [...new Set(allCards.map(c => c.set))];
            
            populateFilter('typeFilter', types);
            populateFilter('rarityFilter', rarities);
            populateFilter('setFilter', sets);
        }
        
        function populateFilter(selectId, options) {
            const select = document.getElementById(selectId);
            const currentValue = select.value;
            
            select.innerHTML = '<option value="">All</option>';
            options.forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option;
                optionEl.textContent = option;
                select.appendChild(optionEl);
            });
            
            select.value = currentValue;
        }
        
        function filterCards() {
            const searchTerm = document.getElementById('search').value.toLowerCase();
            const typeFilter = document.getElementById('typeFilter').value;
            const rarityFilter = document.getElementById('rarityFilter').value;
            const setFilter = document.getElementById('setFilter').value;
            
            filteredCards = allCards.filter(card => {
                const matchesSearch = !searchTerm || 
                    card.name?.toLowerCase().includes(searchTerm) ||
                    card.cardId?.toLowerCase().includes(searchTerm) ||
                    card.set?.toLowerCase().includes(searchTerm);
                
                const matchesType = !typeFilter || card.cardType === typeFilter;
                const matchesRarity = !rarityFilter || card.rarity === rarityFilter;
                const matchesSet = !setFilter || card.set === setFilter;
                
                return matchesSearch && matchesType && matchesRarity && matchesSet;
            });
            
            renderCards();
        }
        
        function renderCards() {
            const container = document.getElementById('cards');
            
            if (filteredCards.length === 0) {
                container.innerHTML = '<div class="loading">No cards found matching your filters.</div>';
                return;
            }
            
            container.innerHTML = filteredCards.map(card => \`
                <div class="card">
                    <div class="card-name">\${card.name || 'Unknown'}</div>
                    <div>
                        <span class="card-type">\${card.cardType || 'Unknown'}</span>
                        <span class="card-rarity">\${card.rarity || 'Unknown'}</span>
                    </div>
                    <div class="card-stats">
                        <div class="stat">Card ID: \${card.cardId || 'N/A'}</div>
                        <div class="stat">Set: \${card.set || 'N/A'}</div>
                        \${card.cost ? \`<div class="stat">Cost: \${card.cost}</div>\` : ''}
                        \${card.power ? \`<div class="stat">Power: \${card.power}</div>\` : ''}
                        \${card.life ? \`<div class="stat">Life: \${card.life}</div>\` : ''}
                        \${card.counter ? \`<div class="stat">Counter: \${card.counter}</div>\` : ''}
                    </div>
                    \${card.images && card.images.length > 0 ? \`
                        <div style="margin-top: 10px;">
                            <small>Images: \${card.images.length}</small>
                        </div>
                    \` : ''}
                    \${card.traits && card.traits.length > 0 ? \`
                        <div style="margin-top: 10px;">
                            <small>Traits: \${card.traits.map(t => t.trait).join(', ')}</small>
                        </div>
                    \` : ''}
                </div>
            \`).join('');
        }
        
        // Event listeners
        document.getElementById('search').addEventListener('input', filterCards);
        document.getElementById('typeFilter').addEventListener('change', filterCards);
        document.getElementById('rarityFilter').addEventListener('change', filterCards);
        document.getElementById('setFilter').addEventListener('change', filterCards);
        
        // Load data on page load
        loadData();
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(adminDir, 'index.html'), html);
  console.log('✅ Created admin panel at admin-panel/index.html');
  console.log('📋 Open admin-panel/index.html in your browser');
}

createAdminPanel(); 