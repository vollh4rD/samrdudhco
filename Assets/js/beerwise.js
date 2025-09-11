/**
 * BEERWISE BILL SPLITTER - Refactored
 * Mirrors the inline logic in beerwise.html without requiring HTML edits.
 */

class BeerWiseApp {
  constructor() {
    this.people = [];
    this.foodItems = [];
    this.openFoodId = null;
    this.currentCurrency = 'USD';

    this.currencySymbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'INR': '₹'
    };

    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }

  init() {
    // Set current date
    const dateInput = document.getElementById('billDate');
    if (dateInput) {
      const today = new Date();
      dateInput.value = today.toISOString().split('T')[0];
    }

    // Enter key handlers
    const personInput = document.getElementById('personInput');
    if (personInput) {
      personInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addPerson();
      });
    }

    const foodNameInput = document.getElementById('foodNameInput');
    if (foodNameInput) {
      foodNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const price = document.getElementById('foodPriceInput');
          if (price) price.focus();
        }
      });
    }

    const foodPriceInput = document.getElementById('foodPriceInput');
    if (foodPriceInput) {
      foodPriceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addFood();
      });
    }

    // Currency selector (guarded)
    const selector = document.getElementById('currencySelector');
    if (selector) {
      selector.addEventListener('change', () => this.updateCurrency());
      this.currentCurrency = selector.value || 'USD';
    }

    // Nav hover (optional)
    document.querySelectorAll('.nav-button').forEach(button => {
      button.addEventListener('mouseenter', () => { button.style.transform = 'translateY(-2px)'; });
      button.addEventListener('mouseleave', () => { button.style.transform = 'translateY(0)'; });
    });

    this.renderFood();
    this.calculateBill();
  }

  formatCurrency(amount) {
    const symbol = this.currencySymbols[this.currentCurrency] || '$';
    if (this.currentCurrency === 'JPY') {
      return `${symbol}${Math.round(amount)}`;
    }
    return `${symbol}${amount.toFixed(2)}`;
  }

  updateCurrency() {
    const selector = document.getElementById('currencySelector');
    if (!selector) return;
    this.currentCurrency = selector.value;
    this.renderFood();
    this.calculateBill();
  }

  addPerson() {
    const input = document.getElementById('personInput');
    if (!input) return;
    const name = input.value.trim();
    if (name && !this.people.includes(name)) {
      this.people.push(name);
      input.value = '';
      this.renderPeople();
      this.renderFood();
      this.calculateBill();
    }
  }

  removePerson(name) {
    this.people = this.people.filter(p => p !== name);
    this.foodItems.forEach(item => {
      item.people = item.people.filter(p => p !== name);
      if (item.unequalSplit) {
        delete item.unequalAmounts[name];
      }
    });
    this.renderPeople();
    this.renderFood();
    this.calculateBill();
  }

  renderPeople() {
    const container = document.getElementById('peopleList');
    if (!container) return;
    container.innerHTML = this.people.map(person =>
      `<div class="person-tag">
        ${person}
        <span class="remove" onclick="beerwise.removePerson('${person}')">&times;</span>
      </div>`
    ).join('');
  }

  addFood() {
    const nameInput = document.getElementById('foodNameInput');
    const priceInput = document.getElementById('foodPriceInput');
    if (!nameInput || !priceInput) return;

    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);

    if (name && price > 0) {
      const newFood = {
        id: Date.now(),
        name,
        price,
        people: [],
        equalSplit: true,
        unequalAmounts: {}
      };
      this.foodItems.push(newFood);
      this.openFoodId = newFood.id;

      nameInput.value = '';
      priceInput.value = '';
      this.renderFood();
      this.calculateBill();
    }
  }

  removeFood(id) {
    this.foodItems = this.foodItems.filter(item => item.id !== id);
    if (this.openFoodId === id) this.openFoodId = null;
    this.renderFood();
    this.calculateBill();
  }

  togglePersonForFood(foodId, person) {
    const food = this.foodItems.find(f => f.id === foodId);
    if (!food) return;
    if (food.people.includes(person)) {
      food.people = food.people.filter(p => p !== person);
      delete food.unequalAmounts[person];
    } else {
      food.people.push(person);
      if (!food.equalSplit) {
        food.unequalAmounts[person] = 0;
      }
    }
    this.renderFood();
    this.calculateBill();
  }

  toggleSplitType(foodId, isEqual) {
    const food = this.foodItems.find(f => f.id === foodId);
    if (!food) return;
    food.equalSplit = isEqual;
    if (isEqual) {
      food.unequalAmounts = {};
    } else {
      food.people.forEach(person => {
        food.unequalAmounts[person] = food.unequalAmounts[person] || 0;
      });
    }
    this.renderFood();
    this.calculateBill();
  }

  updateUnequalAmount(foodId, person, amount) {
    const food = this.foodItems.find(f => f.id === foodId);
    if (!food) return;
    food.unequalAmounts[person] = parseInt(amount, 10) || 0;
    this.calculateBill();
  }

  toggleAllPeopleForFood(foodId, checked) {
    const food = this.foodItems.find(f => f.id === foodId);
    if (!food) return;

    if (checked) {
      food.people = [...this.people];
      if (!food.equalSplit) {
        this.people.forEach(person => {
          food.unequalAmounts[person] = food.unequalAmounts[person] || 0;
        });
      }
    } else {
      food.people = [];
      food.unequalAmounts = {};
    }
    this.renderFood();
    this.calculateBill();
  }

  toggleFood(foodId) {
    this.openFoodId = this.openFoodId === foodId ? null : foodId;
    this.renderFood();
  }

  renderFood() {
    const container = document.getElementById('foodList');
    if (!container) return;

    container.innerHTML = this.foodItems.map(food => {
      const isOpen = this.openFoodId === food.id;
      return `
        <div class="food-item">
          <div class="food-header" onclick="beerwise.toggleFood(${food.id})">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 collapse-indicator ${isOpen ? 'open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <span class="food-name">${food.name}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="food-price">${this.formatCurrency(food.price)}</span>
              <button class="terminal-button danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="event.stopPropagation(); beerwise.removeFood(${food.id});">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          ${isOpen ? `
          <div class="food-controls">
            <div class="split-options">
              <label class="split-option">
                <input type="radio" name="split_${food.id}" ${food.equalSplit ? 'checked' : ''} onchange="beerwise.toggleSplitType(${food.id}, true)">
                <span class="text-sm">equal split</span>
              </label>
              <label class="split-option">
                <input type="radio" name="split_${food.id}" ${!food.equalSplit ? 'checked' : ''} onchange="beerwise.toggleSplitType(${food.id}, false)">
                <span class="text-sm">unequal split</span>
              </label>
            </div>
            <div class="people-selection">
              <label class="person-checkbox">
                <input type="checkbox" ${food.people.length === this.people.length && this.people.length > 0 ? 'checked' : ''} onchange="beerwise.toggleAllPeopleForFood(${food.id}, this.checked)">
                <span class="text-sm">all</span>
              </label>
              ${this.people.map(person => `
                <label class="person-checkbox">
                  <input type="checkbox" ${food.people.includes(person) ? 'checked' : ''} onchange="beerwise.togglePersonForFood(${food.id}, '${person}')">
                  <span class="text-sm">${person}</span>
                </label>
              `).join('')}
            </div>
            <div class="unequal-inputs ${!food.equalSplit ? 'show' : ''}">
              ${food.people.map(person => `
                <div class="unequal-input">
                  <span class="text-sm">${person}:</span>
                  <input type="number" min="0" step="1" placeholder="0" value="${food.unequalAmounts[person] || ''}" onchange="beerwise.updateUnequalAmount(${food.id}, '${person}', this.value)">
                  <span class="text-xs text-gray-400">part${food.unequalAmounts[person] > 1 ? 's' : ''}</span>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  calculateBill() {
    const personTotals = {};
    const personItems = {};

    this.people.forEach(person => {
      personTotals[person] = 0;
      personItems[person] = [];
    });

    this.foodItems.forEach(food => {
      if (food.people.length === 0) return;

      if (food.equalSplit) {
        const share = food.price / food.people.length;
        food.people.forEach(person => {
          personTotals[person] += share;
          personItems[person].push(`${food.name} - ${this.formatCurrency(share)}`);
        });
      } else {
        const totalRatio = Object.values(food.unequalAmounts).reduce((sum, ratio) => sum + ratio, 0);
        if (totalRatio > 0) {
          Object.entries(food.unequalAmounts).forEach(([person, ratio]) => {
            if (ratio > 0) {
              const share = (food.price * ratio) / totalRatio;
              personTotals[person] += share;
              personItems[person].push(`${food.name} - ${this.formatCurrency(share)} (${ratio} part${ratio > 1 ? 's' : ''})`);
            }
          });
        }
      }
    });

    const billContainer = document.getElementById('personBills');
    if (billContainer) {
      billContainer.innerHTML = this.people.map(person => `
        <div class="person-bill">
          <div class="person-bill-header">
            <div class="person-name">${person}</div>
            <div class="person-total">${this.formatCurrency(personTotals[person])}</div>
          </div>
          <div class="person-items">${personItems[person].join(' • ')}</div>
        </div>
      `).join('');
    }

    const total = Object.values(personTotals).reduce((sum, amt) => sum + amt, 0);
    const totalBillEl = document.getElementById('totalBill');
    if (totalBillEl) totalBillEl.textContent = `total: ${this.formatCurrency(total)}`;
  }

  async downloadBillAsPng() {
    const billTitle = document.getElementById('billTitle')?.value || 'untitled bill';
    const billDate = document.getElementById('billDate')?.value;
    const paidBy = document.getElementById('paidBy')?.value || 'not specified';

    const formattedDate = billDate ? new Date(billDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : '';

    // Populate existing hidden receipt (keeping HTML structure intact)
    const imageBillTitle = document.getElementById('imageBillTitle');
    const imageBillDate = document.getElementById('imageBillDate');
    const imagePaidBy = document.getElementById('imagePaidBy');
    const imagePersonBills = document.getElementById('imagePersonBills');
    const imageTotalBill = document.getElementById('imageTotalBill');

    if (imageBillTitle) imageBillTitle.textContent = billTitle;
    if (imageBillDate) imageBillDate.textContent = formattedDate;
    if (imagePaidBy) imagePaidBy.textContent = paidBy;

    if (imagePersonBills) {
      imagePersonBills.innerHTML = '';
      const personBills = document.querySelectorAll('.person-bill');
      personBills.forEach(bill => {
        const name = bill.querySelector('.person-name')?.textContent || '';
        const total = bill.querySelector('.person-total')?.textContent || '';
        const items = bill.querySelector('.person-items')?.textContent || '';

        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '1fr auto';
        row.style.alignItems = 'start';
        row.style.margin = '22px 0';

        const left = document.createElement('div');
        left.innerHTML = `<div style="font-weight: 700; color:#0a0a0a;">${name}</div>
                          <div style="font-size: 22px; color:#333; margin-top: 6px;">${items.replace(/ • /g, ', ')}</div>`;

        const right = document.createElement('div');
        right.textContent = total.replace(/^total:\s*/i, '');
        right.style.fontWeight = '700';
        right.style.color = '#0a0a0a';

        row.appendChild(left);
        row.appendChild(right);
        imagePersonBills.appendChild(row);
      });
    }

    const totalBillTxt = document.getElementById('totalBill')?.textContent || '';
    if (imageTotalBill) imageTotalBill.textContent = totalBillTxt.replace(/^total:\s*/i, 'total: ');

    // Generate PNG
    const receiptElement = document.getElementById('receiptForImage');
    if (!receiptElement) return;

    receiptElement.style.display = 'block';
    try {
      const canvas = await html2canvas(receiptElement.children[0], {
        backgroundColor: '#ffffff',
        scale: 2
      });
      const image = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = image;
      a.download = `${billTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_bill.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Failed to generate PNG. Please try again.');
    } finally {
      receiptElement.style.display = 'none';
    }
  }

  async shareOnWhatsApp() {
    const billTitle = document.getElementById('billTitle')?.value || 'untitled bill';
    const billDate = document.getElementById('billDate')?.value;
    const paidBy = document.getElementById('paidBy')?.value || 'not specified';

    const formattedDate = billDate ? new Date(billDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : '';

    let shareText = `beerwise bill split\n\n`;
    shareText += `${billTitle}\n`;
    shareText += `date: ${formattedDate}\n`;
    shareText += `paid by: ${paidBy}\n\n`;

    const personBills = document.querySelectorAll('.person-bill');
    personBills.forEach(bill => {
      const name = bill.querySelector('.person-name')?.textContent || '';
      const total = bill.querySelector('.person-total')?.textContent || '';
      shareText += `${name}: ${total}\n`;
    });

    const totalBill = document.getElementById('totalBill')?.textContent || '';
    shareText += `\n${totalBill}\n\ngenerated by beerwise`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  }
}

// Instantiate and expose global API compatible with existing HTML onclicks
const beerwise = new BeerWiseApp();

// Global wrappers (match function names used in beerwise.html)
window.addPerson = () => beerwise.addPerson();
window.removePerson = (name) => beerwise.removePerson(name);
window.addFood = () => beerwise.addFood();
window.removeFood = (id) => beerwise.removeFood(id);
window.togglePersonForFood = (foodId, person) => beerwise.togglePersonForFood(foodId, person);
window.toggleSplitType = (foodId, isEqual) => beerwise.toggleSplitType(foodId, isEqual);
window.updateUnequalAmount = (foodId, person, amount) => beerwise.updateUnequalAmount(foodId, person, amount);
window.toggleAllPeopleForFood = (foodId, checked) => beerwise.toggleAllPeopleForFood(foodId, checked);
window.toggleFood = (foodId) => beerwise.toggleFood(foodId);
window.downloadBillAsPng = () => beerwise.downloadBillAsPng();
window.shareOnWhatsApp = () => beerwise.shareOnWhatsApp();
window.updateCurrency = () => beerwise.updateCurrency();

