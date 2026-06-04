import { articles } from './data.js';
import { initAuth, updateUIForUser } from './auth.js';

// DOM Elements
const categoryContainer = document.getElementById('categoryContainer');
const newsGrid = document.getElementById('newsGridContainer');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const fullArticlePage = document.getElementById('fullArticlePage');
const backToNewsBtn = document.getElementById('backToNewsBtn');
const homeLogo = document.getElementById('homeLogo');
const homeLink = document.getElementById('homeLink');
const actionBar = document.getElementById('actionBar');
const categoriesWrap = document.getElementById('categoriesWrap');
const searchSection = document.getElementById('searchSection');
const heroSection = document.getElementById('heroSection');
const heroTitle = document.getElementById('heroTitle');
const heroDesc = document.getElementById('heroDesc');
const heroReadBtn = document.getElementById('heroReadBtn');
const breakingText = document.getElementById('breakingText');
const updateTimeSpan = document.getElementById('updateTime');
const newsletterBtn = document.getElementById('newsletterBtn');
const newsletterEmail = document.getElementById('newsletterEmail');

let activeCategory = 'All';
let searchQuery = '';

// ==================== HELPER FUNCTIONS ====================
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] || m));
}

function sortByNewest(arr) {
  return [...arr].sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
}

function getCategories() {
  const cats = [...new Set(articles.map(a => a.category))];
  return ['All', ...cats.sort()];
}

function updateDateTime() {
  if (updateTimeSpan) {
    const now = new Date();
    updateTimeSpan.textContent = `Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}

// ==================== HERO SECTION ====================
function updateHero() {
  const latest = sortByNewest(articles)[0];
  if (latest && heroTitle && heroDesc) {
    heroTitle.textContent = latest.title;
    heroDesc.textContent = latest.description;
    if (heroReadBtn) {
      heroReadBtn.onclick = () => showFullArticle(latest.id);
    }
  }
}

function updateBreakingNews() {
  if (breakingText && articles[0]) {
    breakingText.textContent = articles[0].title;
  }
}

// ==================== RENDER FUNCTIONS ====================
function renderCategories() {
  const categories = getCategories();
  if (!categoryContainer) return;
  categoryContainer.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-btn ${activeCategory === cat ? 'active' : ''}`;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      activeCategory = cat;
      renderCategories();
      renderNews();
    });
    categoryContainer.appendChild(btn);
  });
}

function getFilteredArticles() {
  let filtered = [...articles];
  if (activeCategory !== 'All') filtered = filtered.filter(a => a.category === activeCategory);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }
  return sortByNewest(filtered);
}

function getRandomRelated(currentId, count = 3) {
  const others = articles.filter(a => a.id !== parseInt(currentId));
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, count);
}

function renderRelated(currentId) {
  const container = document.getElementById('relatedArticlesContainer');
  if (!container) return;
  const related = getRandomRelated(currentId, 3);
  if (related.length === 0) {
    container.innerHTML = '<p style="color:#64748b;">No related articles found.</p>';
    return;
  }
  container.innerHTML = related.map(a => `
    <div class="related-card" data-id="${a.id}">
      <div class="related-card-img"><img src="${a.imageUrl}" alt="${a.alt}" loading="lazy" onerror="this.src='https://picsum.photos/id/1/400/240'"></div>
      <div class="related-card-content">
        <span class="related-card-category">📁 ${a.category}</span>
        <div class="related-card-title">${escapeHtml(a.title)}</div>
        <div class="related-card-date"><i class="far fa-calendar-alt"></i> ${formatDate(a.date)}</div>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.related-card').forEach(card => {
    card.addEventListener('click', () => showFullArticle(card.dataset.id));
  });
}

function showFullArticle(articleId) {
  const article = articles.find(a => a.id === parseInt(articleId));
  if (!article) return;
  const fullArticleImage = document.getElementById('fullArticleImage');
  const fullArticleTitle = document.getElementById('fullArticleTitle');
  const fullArticleCategory = document.getElementById('fullArticleCategory');
  const fullArticleDate = document.getElementById('fullArticleDate');
  const fullArticleContent = document.getElementById('fullArticleContent');
  
  if (fullArticleImage) fullArticleImage.src = article.imageUrl;
  if (fullArticleTitle) fullArticleTitle.textContent = article.title;
  if (fullArticleCategory) fullArticleCategory.innerHTML = `📁 ${article.category}`;
  if (fullArticleDate) fullArticleDate.innerHTML = `📅 ${formatDate(article.date)}`;
  
  const paragraphs = (article.fullContent || article.description).split(/\n\n+/);
  if (fullArticleContent) {
    fullArticleContent.innerHTML = paragraphs.map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
  }
  
  if (newsGrid) newsGrid.classList.add('hide');
  if (fullArticlePage) fullArticlePage.classList.add('active');
  if (actionBar) actionBar.classList.add('hide');
  if (categoriesWrap) categoriesWrap.classList.add('hide');
  if (searchSection) searchSection.classList.add('hide');
  if (heroSection) heroSection.classList.add('hide');
  renderRelated(article.id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToNews() {
  if (newsGrid) newsGrid.classList.remove('hide');
  if (fullArticlePage) fullArticlePage.classList.remove('active');
  if (actionBar) actionBar.classList.remove('hide');
  if (categoriesWrap) categoriesWrap.classList.remove('hide');
  if (searchSection) searchSection.classList.remove('hide');
  if (heroSection) heroSection.classList.remove('hide');
  window.scrollTo({ top: 0 });
}

function renderNews() {
  const filtered = getFilteredArticles();
  if (!newsGrid) return;
  
  if (filtered.length === 0) {
    newsGrid.innerHTML = '<div class="no-results"><i class="fas fa-newspaper"></i><h3>No matching stories</h3><p>Try another category or search term</p></div>';
    return;
  }
  newsGrid.innerHTML = filtered.map(article => `
    <div class="news-card" data-id="${article.id}">
      <div class="card-img">
        <img src="${article.imageUrl}" alt="${article.alt}" loading="lazy" onerror="this.src='https://picsum.photos/id/1/400/240'">
        <span class="card-category">${article.category}</span>
      </div>
      <div class="card-content">
        <h3 class="news-title">${escapeHtml(article.title)}</h3>
        <p class="news-desc">${escapeHtml(article.description.substring(0, 120))}${article.description.length > 120 ? '...' : ''}</p>
        <div class="card-footer">
          <div class="date-info"><i class="far fa-calendar-alt"></i> ${formatDate(article.date)}</div>
          <div class="read-btn"><span>Read more</span> <i class="fas fa-arrow-right"></i></div>
        </div>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.news-card').forEach(card => {
    card.addEventListener('click', () => {
      const articleId = card.getAttribute('data-id');
      showFullArticle(articleId);
    });
  });
}

// ==================== NEWSLETTER ====================
function initNewsletter() {
  if (newsletterBtn) {
    newsletterBtn.addEventListener('click', () => {
      const email = newsletterEmail?.value.trim();
      if (email) {
        let subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
        if (!subscribers.includes(email)) {
          subscribers.push(email);
          localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
          alert('✅ Thank you for subscribing! You will receive our daily newsletter.');
          if (newsletterEmail) newsletterEmail.value = '';
        } else {
          alert('📧 This email is already subscribed!');
        }
      } else {
        alert('Please enter a valid email address.');
      }
    });
  }
}

// ==================== INITIALIZATION ====================
function init() {
  console.log('Initializing NewsFlash...');
  console.log(`Loaded ${articles.length} articles`);
  
  renderCategories();
  renderNews();
  initAuth();
  updateHero();
  updateBreakingNews();
  updateDateTime();
  initNewsletter();

  if (backToNewsBtn) backToNewsBtn.addEventListener('click', backToNews);
  if (homeLogo) homeLogo.addEventListener('click', backToNews);
  if (homeLink) homeLink.addEventListener('click', (e) => { e.preventDefault(); backToNews(); });
  
  if (searchInput) {
    searchInput.addEventListener('input', () => { searchQuery = searchInput.value.trim(); renderNews(); });
  }
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => { 
      if (searchInput) searchInput.value = ''; 
      searchQuery = ''; 
      renderNews(); 
    });
  }
  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => { 
      activeCategory = 'All'; 
      if (searchInput) searchInput.value = ''; 
      searchQuery = ''; 
      renderCategories(); 
      renderNews(); 
    });
  }
}

// Start the app
init();