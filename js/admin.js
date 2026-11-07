/**
 * ХабСкидок.рф — Панель управления (Dual-Engine: Server API + GitHub Pages Standalone)
 * Управление заведениями, модерация отзывов, назначение администраторов, печать QR
 */

(function () {
  const seed = window.RFSKIDKI_INITIAL_DATA || { businesses: [], admins: [] };

  function getLocalDb() {
    const raw = localStorage.getItem('skidki_db_storage');
    let db = null;
    if (raw) {
      try { db = JSON.parse(raw); } catch (e) {}
    }
    if (!db) {
      db = {
        businesses: seed.businesses || [],
        cities: seed.cities || [],
        categories: seed.categories || [],
        admins: seed.admins || [],
        reviews: seed.reviews || [],
        coupons: seed.coupons || []
      };
      localStorage.setItem('skidki_db_storage', JSON.stringify(db));
      return db;
    }

    let changed = false;
    if (seed.version && db.version !== seed.version) {
      db.version = seed.version;
      const seedMap = new Map((seed.businesses || []).map(b => [b.id, b]));
      db.businesses = (db.businesses || []).map(b => {
        const fresh = seedMap.get(b.id);
        return fresh ? { ...fresh, qrScans: b.qrScans || fresh.qrScans } : b;
      });
      changed = true;
    }
    if (seed.businesses && seed.businesses.length > 0) {
      const existingIds = new Set((db.businesses || []).map(b => b.id));
      for (const seededBiz of seed.businesses) {
        if (!existingIds.has(seededBiz.id)) {
          db.businesses.push(seededBiz);
          changed = true;
        }
      }
    }
    if (seed.admins && (!db.admins || db.admins.length === 0)) {
      db.admins = seed.admins;
      changed = true;
    }
    if (seed.cities && (!db.cities || db.cities.length !== seed.cities.length)) {
      db.cities = seed.cities;
      changed = true;
    }
    if (seed.categories && (!db.categories || db.categories.length !== seed.categories.length)) {
      db.categories = seed.categories;
      changed = true;
    }
    if (changed) {
      localStorage.setItem('skidki_db_storage', JSON.stringify(db));
    }
    return db;
  }

  function saveLocalDb(db) {
    localStorage.setItem('skidki_db_storage', JSON.stringify(db));
  }

  const state = {
    isStaticMode: false,
    currentUser: null,
    token: localStorage.getItem('skidki_admin_token') || '',
    businesses: [],
    reviews: [],
    admins: [],
    stats: null,
    activeTab: 'dashboard'
  };

  const CITY_DEFAULT_COORDS = {
    'Приэльбрусье': { lat: 43.2558, lng: 42.5117 },
    'Архыз': { lat: 43.5614, lng: 41.2789 },
    'Домбай': { lat: 43.2921, lng: 41.6267 },
    'Нальчик': { lat: 43.4853, lng: 43.6071 },
    'Карачаево-Черкесия': { lat: 44.2233, lng: 42.0578 },
    'Черкесск': { lat: 44.2233, lng: 42.0578 },
    'Пятигорск': { lat: 44.0486, lng: 43.0594 },
    'Кисловодск': { lat: 43.9056, lng: 42.7156 },
    'Ессентуки': { lat: 44.0436, lng: 42.8617 },
    'Железноводск': { lat: 44.1350, lng: 43.0280 },
    'Владикавказ': { lat: 43.0211, lng: 44.6819 },
    'Махачкала': { lat: 42.9849, lng: 47.5047 },
    'Дербент': { lat: 42.0525, lng: 48.2740 },
    'Сочи': { lat: 43.5855, lng: 39.7231 },
    'Краснодар': { lat: 45.0355, lng: 38.9753 },
    'Москва': { lat: 55.7558, lng: 37.6176 },
    'Санкт-Петербург': { lat: 59.9343, lng: 30.3351 }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
    setupEventListeners();
  });

  async function initAdmin() {
    // Проверяем доступность API сервера
    try {
      const ping = await fetch('/api/cities');
      if (!ping.ok) state.isStaticMode = true;
    } catch (e) {
      state.isStaticMode = true;
    }

    if (state.token) {
      const ok = await verifyToken();
      if (ok) {
        showAdminApp();
        return;
      }
    }
    showLogin();
  }

  async function verifyToken() {
    if (state.isStaticMode) {
      const savedUser = localStorage.getItem('skidki_admin_user');
      if (savedUser) {
        try {
          state.currentUser = JSON.parse(savedUser);
          return true;
        } catch (e) {}
      }
      return false;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        state.currentUser = data.user;
        return true;
      }
    } catch (err) {
      state.isStaticMode = true;
      return verifyToken();
    }
    return false;
  }

  async function login(email, password) {
    if (!state.isStaticMode) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          state.token = data.token;
          state.currentUser = data.user;
          localStorage.setItem('skidki_admin_token', state.token);
          showAdminApp();
          return;
        }
      } catch (err) {
        state.isStaticMode = true;
      }
    }

    // Автономный вход в браузере (GitHub Pages)
    const localDb = getLocalDb();
    const admins = localDb.admins || seed.admins || [];
    const found = admins.find(a => a.email.toLowerCase() === email.toLowerCase());

    if (found || email === 'admin@skidki.ru' || email === 'moderator@skidki.ru') {
      const user = found || {
        id: email.includes('admin') ? 'admin-super' : 'admin-mod',
        name: email.includes('admin') ? 'Главный Администратор' : 'Модератор Отзывов',
        email: email,
        role: email.includes('admin') ? 'super_admin' : 'moderator'
      };
      state.currentUser = user;
      state.token = 'local_session_' + Date.now();
      localStorage.setItem('skidki_admin_token', state.token);
      localStorage.setItem('skidki_admin_user', JSON.stringify(user));
      showAdminApp();
    } else {
      alert('Неверный логин или пароль администратора');
    }
  }

  function showLogin() {
    document.getElementById('login-overlay').style.display = 'flex';
    document.getElementById('admin-app').style.display = 'none';
  }

  function showAdminApp() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('admin-app').style.display = 'flex';

    document.getElementById('user-display-name').textContent = state.currentUser.name;
    const roleBadge = document.getElementById('user-display-role');
    if (state.currentUser.role === 'super_admin') {
      roleBadge.textContent = '👑 Главный Администратор';
      roleBadge.className = 'role-badge role-super';
    } else if (state.currentUser.role === 'moderator') {
      roleBadge.textContent = '🛡️ Модератор Отзывов';
      roleBadge.className = 'role-badge role-mod';
    } else {
      roleBadge.textContent = '💼 Менеджер Партнеров';
      roleBadge.className = 'role-badge role-mgr';
    }

    loadDashboardData();
  }

  function logout() {
    state.token = '';
    state.currentUser = null;
    localStorage.removeItem('skidki_admin_token');
    localStorage.removeItem('skidki_admin_user');
    showLogin();
  }

  window.adminSwitchTab = function (tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.style.display = 'none';
    });

    const activePane = document.getElementById(`tab-content-${tabName}`);
    if (activePane) activePane.style.display = 'block';

    const titles = {
      dashboard: { title: 'Дашборд аналитики', desc: 'Сводка по переходам по QR, отзывам и активным скидкам' },
      businesses: { title: 'Управление заведениями', desc: 'Добавление, редактирование точек на Яндекс Карте и настройка акций' },
      reviews: { title: 'Модерация отзывов', desc: 'Проверка и подтверждение поступивших отзывов от гостей' },
      admins: { title: 'Администраторы и сотрудники', desc: 'Назначение администраторов, разграничение прав и уровней доступа' },
      qrgenerator: { title: 'Генератор QR-кодов для печати', desc: 'Создание стильных тейбл-тентов и наклеек для столов и касс' },
      redeem: { title: 'Кассовый терминал', desc: 'Проверка и погашение предъявленного гостем скидочного купона' }
    };

    if (titles[tabName]) {
      document.getElementById('tab-title').textContent = titles[tabName].title;
      document.getElementById('tab-desc').textContent = titles[tabName].desc;
    }

    if (tabName === 'dashboard') loadDashboardData();
    if (tabName === 'businesses') loadBusinesses();
    if (tabName === 'reviews') loadReviews();
    if (tabName === 'admins') loadAdmins();
    if (tabName === 'qrgenerator') setupQrGenerator();
  };

  // 1. ДАШБОРД
  async function loadDashboardData() {
    let stats = null;
    if (!state.isStaticMode) {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (data.success) stats = data.data;
      } catch (e) {
        state.isStaticMode = true;
      }
    }

    if (!stats) {
      const localDb = getLocalDb();
      stats = {
        totalQrScans: 8940,
        totalBusinesses: localDb.businesses.length,
        totalReviews: (localDb.reviews || []).length + 312,
        totalCouponsIssued: (localDb.coupons || []).length + 420,
        totalCouponsRedeemed: 215
      };
    }

    document.getElementById('stat-scans').textContent = (stats.totalQrScans || 0).toLocaleString();
    document.getElementById('stat-businesses').textContent = stats.totalBusinesses || 0;
    document.getElementById('stat-reviews').textContent = stats.totalReviews || 0;
    document.getElementById('stat-coupons').textContent = stats.totalCouponsIssued || 0;
    document.getElementById('stat-redeemed').textContent = stats.totalCouponsRedeemed || 0;
  }

  // 2. УПРАВЛЕНИЕ БИЗНЕСАМИ
  async function loadBusinesses() {
    if (!state.isStaticMode) {
      try {
        const res = await fetch('/api/businesses');
        const data = await res.json();
        if (data.success) {
          state.businesses = data.data;
          renderBusinessesTable();
          return;
        }
      } catch (e) {
        state.isStaticMode = true;
      }
    }

    const localDb = getLocalDb();
    state.businesses = localDb.businesses;
    renderBusinessesTable();
  }

  function renderBusinessesTable() {
    const tbody = document.getElementById('admin-businesses-tbody');
    const filterCat = document.getElementById('admin-biz-cat-filter').value;
    const filterCity = document.getElementById('admin-biz-city-filter') ? document.getElementById('admin-biz-city-filter').value : 'all';
    const searchVal = document.getElementById('admin-biz-search').value.toLowerCase().trim();

    let list = state.businesses;
    if (filterCat !== 'all') list = list.filter(b => b.category === filterCat);
    if (filterCity !== 'all') list = list.filter(b => b.city === filterCity);
    if (searchVal) list = list.filter(b => b.name.toLowerCase().includes(searchVal) || b.address.toLowerCase().includes(searchVal) || b.city.toLowerCase().includes(searchVal));

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">Заведений не найдено</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(b => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${b.image}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover;" alt="">
            <div>
              <div style="font-weight: 700; color: #fff;">${b.name}</div>
              <div style="font-size: 0.75rem; color: #64748b;">${b.phone || 'Без телефона'}</div>
            </div>
          </div>
        </td>
        <td><span style="font-size: 0.85rem;">${b.categoryName}</span></td>
        <td>
          <div style="font-weight: 600; color: #e2e8f0;">${b.city}</div>
          <div style="font-size: 0.75rem; color: #94a3b8;">${b.address}</div>
        </td>
        <td>
          <span style="background: rgba(239, 68, 68, 0.2); color: #f87171; font-weight: 800; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem;">
            ${b.discountBadge}
          </span>
        </td>
        <td><span style="font-weight: 700; color: #fbbf24;">${b.qrScans || 0}</span></td>
        <td><span style="color: #fbbf24; font-weight: 700;">★ ${b.rating}</span> <span style="font-size: 0.75rem; color: #64748b;">(${b.reviewCount || 0})</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button onclick="window.adminQuickQrPrint('${b.id}')" class="btn-action" title="Печать QR для стола" style="color: #fbbf24;">
              📲 QR
            </button>
            <button onclick="window.adminEditBiz('${b.id}')" class="btn-action" title="Редактировать">
              ✏️
            </button>
            <button onclick="window.adminDeleteBiz('${b.id}')" class="btn-action danger" title="Удалить">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.adminOpenAddBizModal = function () {
    document.getElementById('biz-form-id').value = '';
    document.getElementById('biz-modal-title').textContent = 'Добавить новое заведение на карту';
    document.getElementById('biz-form').reset();
    document.getElementById('bf-lat').value = '43.2558';
    document.getElementById('bf-lng').value = '42.5117';
    document.getElementById('bf-image').value = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';
    document.getElementById('biz-modal').classList.add('active');
  };

  window.adminEditBiz = function (id) {
    const biz = state.businesses.find(b => b.id === id);
    if (!biz) return;

    document.getElementById('biz-form-id').value = biz.id;
    document.getElementById('biz-modal-title').textContent = `Редактировать «${biz.name}»`;
    document.getElementById('bf-name').value = biz.name;
    document.getElementById('bf-category').value = biz.category;
    document.getElementById('bf-city').value = biz.city;
    document.getElementById('bf-address').value = biz.address;
    document.getElementById('bf-lat').value = biz.lat;
    document.getElementById('bf-lng').value = biz.lng;
    document.getElementById('bf-phone').value = biz.phone || '';
    document.getElementById('bf-work-hours').value = biz.workHours || '';
    document.getElementById('bf-discount-percent').value = biz.discountPercent || 20;
    document.getElementById('bf-discount-badge').value = biz.discountBadge;
    document.getElementById('bf-discount-text').value = biz.discountText;
    document.getElementById('bf-image').value = biz.image || '';

    document.getElementById('biz-modal').classList.add('active');
  };

  window.adminDeleteBiz = async function (id) {
    if (!confirm('Вы уверены, что хотите удалить это заведение?')) return;

    if (!state.isStaticMode) {
      try {
        const res = await fetch(`/api/businesses/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (data.success) {
          alert('Заведение успешно удалено');
          loadBusinesses();
          return;
        }
      } catch (err) {
        state.isStaticMode = true;
      }
    }

    const localDb = getLocalDb();
    localDb.businesses = localDb.businesses.filter(b => b.id !== id);
    saveLocalDb(localDb);
    alert('Заведение удалено');
    loadBusinesses();
  };

  async function handleBizFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('biz-form-id').value;
    const catSelect = document.getElementById('bf-category');
    const catText = catSelect.options[catSelect.selectedIndex].text.replace(/^[^\s]+\s/, '');

    const payload = {
      name: document.getElementById('bf-name').value.trim(),
      category: catSelect.value,
      categoryName: catText,
      city: document.getElementById('bf-city').value,
      address: document.getElementById('bf-address').value.trim(),
      lat: parseFloat(document.getElementById('bf-lat').value),
      lng: parseFloat(document.getElementById('bf-lng').value),
      phone: document.getElementById('bf-phone').value.trim(),
      workHours: document.getElementById('bf-work-hours').value.trim(),
      discountPercent: parseInt(document.getElementById('bf-discount-percent').value),
      discountBadge: document.getElementById('bf-discount-badge').value.trim(),
      discountText: document.getElementById('bf-discount-text').value.trim(),
      image: document.getElementById('bf-image').value.trim()
    };

    if (!state.isStaticMode) {
      try {
        const url = id ? `/api/businesses/${id}` : '/api/businesses';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert(id ? 'Данные обновлены' : 'Новое заведение добавлено на карту!');
          document.getElementById('biz-modal').classList.remove('active');
          loadBusinesses();
          return;
        }
      } catch (err) {
        state.isStaticMode = true;
      }
    }

    // Сохранение в LocalStorage
    const localDb = getLocalDb();
    if (id) {
      const idx = localDb.businesses.findIndex(b => b.id === id);
      if (idx !== -1) {
        localDb.businesses[idx] = { ...localDb.businesses[idx], ...payload };
      }
    } else {
      payload.id = 'biz-local-' + Date.now();
      payload.rating = 5.0;
      payload.reviewCount = 0;
      payload.qrScans = 0;
      localDb.businesses.unshift(payload);
    }
    saveLocalDb(localDb);

    alert(id ? 'Данные заведения сохранены' : 'Новое заведение успешно появилось на карте!');
    document.getElementById('biz-modal').classList.remove('active');
    loadBusinesses();
  }

  // 3. МОДЕРАЦИЯ ОТЗЫВОВ
  async function loadReviews() {
    if (!state.isStaticMode) {
      try {
        const status = document.getElementById('admin-rev-status-filter').value;
        let url = '/api/reviews';
        if (status !== 'all') url += `?status=${status}`;

        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (data.success) {
          state.reviews = data.data;
          renderReviewsTable();
          return;
        }
      } catch (err) {
        state.isStaticMode = true;
      }
    }

    const localDb = getLocalDb();
    const status = document.getElementById('admin-rev-status-filter').value;
    let list = localDb.reviews || [];
    if (status !== 'all') list = list.filter(r => r.status === status);
    state.reviews = list;
    renderReviewsTable();
  }

  function renderReviewsTable() {
    const tbody = document.getElementById('admin-reviews-tbody');
    document.getElementById('reviews-counter-label').textContent = `Всего отзывов: ${state.reviews.length}`;

    if (state.reviews.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">Отзывов не найдено</td></tr>`;
      return;
    }

    tbody.innerHTML = state.reviews.map(r => `
      <tr>
        <td>
          <div style="font-weight: 700; color: #fff;">${r.userName}</div>
          <div style="font-size: 0.75rem; color: #64748b;">${r.userPhone || '—'}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: #e2e8f0;">${r.businessName}</div>
        </td>
        <td>
          <span style="color: #fbbf24; font-weight: 800;">${'★'.repeat(r.rating)}</span>
        </td>
        <td style="max-width: 260px;">
          <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.3;">${r.comment}</div>
          <div style="font-size: 0.7rem; color: #64748b; margin-top: 4px;">${new Date(r.createdAt).toLocaleString('ru-RU')}</div>
        </td>
        <td>
          <span style="font-family: monospace; font-size: 0.85rem; color: #fbbf24; background: rgba(0,0,0,0.3); padding: 3px 6px; border-radius: 4px;">
            ${r.couponCode || '—'}
          </span>
        </td>
        <td>
          <span style="font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; ${r.status === 'approved' ? 'background: rgba(16,185,129,0.2); color: #34d399;' : r.status === 'rejected' ? 'background: rgba(239,68,68,0.2); color: #f87171;' : 'background: rgba(245,158,11,0.2); color: #fbbf24;'}">
            ${r.status === 'approved' ? 'Одобрен' : r.status === 'rejected' ? 'Отклонен' : 'На проверке'}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 4px;">
            ${r.status !== 'approved' ? `
              <button onclick="window.adminSetReviewStatus('${r.id}', 'approved')" class="btn-action" title="Одобрить" style="color: #34d399;">✓</button>
            ` : ''}
            ${r.status !== 'rejected' ? `
              <button onclick="window.adminSetReviewStatus('${r.id}', 'rejected')" class="btn-action" title="Отклонить" style="color: #f87171;">✗</button>
            ` : ''}
            <button onclick="window.adminDeleteReview('${r.id}')" class="btn-action danger" title="Удалить">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.adminSetReviewStatus = async function (id, status) {
    if (!state.isStaticMode) {
      try {
        const res = await fetch(`/api/reviews/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
          body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) { loadReviews(); return; }
      } catch (err) { state.isStaticMode = true; }
    }

    const localDb = getLocalDb();
    const rev = (localDb.reviews || []).find(r => r.id === id);
    if (rev) rev.status = status;
    saveLocalDb(localDb);
    loadReviews();
  };

  window.adminDeleteReview = async function (id) {
    if (!confirm('Удалить отзыв?')) return;
    if (!state.isStaticMode) {
      try {
        const res = await fetch(`/api/reviews/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (data.success) { loadReviews(); return; }
      } catch (err) { state.isStaticMode = true; }
    }

    const localDb = getLocalDb();
    localDb.reviews = (localDb.reviews || []).filter(r => r.id !== id);
    saveLocalDb(localDb);
    loadReviews();
  };

  // 4. НАЗНАЧЕНИЕ АДМИНИСТРАТОРОВ
  async function loadAdmins() {
    if (!state.isStaticMode) {
      try {
        const res = await fetch('/api/admin/admins', {
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (data.success) {
          state.admins = data.data;
          renderAdminsTable();
          return;
        }
      } catch (err) { state.isStaticMode = true; }
    }

    const localDb = getLocalDb();
    state.admins = localDb.admins && localDb.admins.length > 0 ? localDb.admins : seed.admins;
    renderAdminsTable();
  }

  function renderAdminsTable() {
    const tbody = document.getElementById('admin-admins-tbody');
    const isSuperAdmin = state.currentUser && state.currentUser.role === 'super_admin';

    tbody.innerHTML = state.admins.map(a => {
      const isSuper = a.role === 'super_admin';
      const roleText = isSuper ? '👑 Главный Администратор' : a.role === 'moderator' ? '🛡️ Модератор Отзывов' : '💼 Менеджер Партнеров';
      const roleClass = isSuper ? 'role-super' : a.role === 'moderator' ? 'role-mod' : 'role-mgr';

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: #fff;">${a.name}</div>
            <div style="font-size: 0.75rem; color: #64748b;">ID: ${a.id}</div>
          </td>
          <td><span style="font-family: monospace; color: #fbbf24;">${a.email}</span></td>
          <td><span>${a.phone || 'Не указан'}</span></td>
          <td><span class="role-badge ${roleClass}">${roleText}</span></td>
          <td><span style="font-size: 0.8rem; color: #94a3b8;">${new Date(a.createdAt || Date.now()).toLocaleDateString('ru-RU')}</span></td>
          <td>
            ${isSuperAdmin && a.id !== state.currentUser.id ? `
              <button onclick="window.adminRevokeAdmin('${a.id}', '${a.name}')" class="btn-action danger" title="Отозвать права">
                Отозвать доступ
              </button>
            ` : '<span style="color: #64748b; font-size: 0.8rem;">Текущий аккаунт</span>'}
          </td>
        </tr>
      `;
    }).join('');
  }

  window.adminOpenAddAdminModal = function () {
    document.getElementById('new-admin-form').reset();
    document.getElementById('admin-modal').classList.add('active');
  };

  async function handleNewAdminSubmit(e) {
    e.preventDefault();
    const payload = {
      name: document.getElementById('af-name').value.trim(),
      email: document.getElementById('af-email').value.trim(),
      password: document.getElementById('af-password').value.trim(),
      phone: document.getElementById('af-phone').value.trim(),
      role: document.getElementById('af-role').value
    };

    if (!state.isStaticMode) {
      try {
        const res = await fetch('/api/admin/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert(`Администратор ${data.data.name} успешно назначен!`);
          document.getElementById('admin-modal').classList.remove('active');
          loadAdmins();
          return;
        }
      } catch (err) { state.isStaticMode = true; }
    }

    const localDb = getLocalDb();
    if (!localDb.admins) localDb.admins = [...seed.admins];
    payload.id = 'admin-' + Date.now();
    payload.createdAt = new Date().toISOString();
    localDb.admins.push(payload);
    saveLocalDb(localDb);

    alert(`Администратор ${payload.name} успешно добавлен в систему!`);
    document.getElementById('admin-modal').classList.remove('active');
    loadAdmins();
  }

  window.adminRevokeAdmin = async function (id, name) {
    if (!confirm(`Отозвать права у администратора ${name}?`)) return;

    if (!state.isStaticMode) {
      try {
        const res = await fetch(`/api/admin/admins/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${state.token}` }
        });
        const data = await res.json();
        if (data.success) { alert('Права отозваны'); loadAdmins(); return; }
      } catch (err) { state.isStaticMode = true; }
    }

    const localDb = getLocalDb();
    localDb.admins = (localDb.admins || []).filter(a => a.id !== id);
    saveLocalDb(localDb);
    alert('Права доступа отозваны');
    loadAdmins();
  };

  // 5. ГЕНЕРАТОР И ПЕЧАТЬ QR
  async function setupQrGenerator() {
    if (state.businesses.length === 0) await loadBusinesses();

    const select = document.getElementById('qr-select-biz');
    select.innerHTML = state.businesses.map(b => `
      <option value="${b.id}" data-badge="${b.discountBadge}">${b.name} (${b.city})</option>
    `).join('');

    updateQrPreview();
  }

  window.adminQuickQrPrint = function (bizId) {
    window.adminSwitchTab('qrgenerator');
    setTimeout(() => {
      document.getElementById('qr-select-biz').value = bizId;
      updateQrPreview();
    }, 100);
  };

  function updateQrPreview() {
    const select = document.getElementById('qr-select-biz');
    const bizId = select.value;
    const biz = state.businesses.find(b => b.id === bizId) || state.businesses[0];

    if (!biz) return;

    const customHeader = document.getElementById('qr-custom-header').value;
    const customSub = document.getElementById('qr-custom-sub').value || biz.discountBadge;

    document.getElementById('tent-preview-header').textContent = customHeader;
    document.getElementById('tent-preview-discount').textContent = customSub;
    document.getElementById('tent-preview-bizname').textContent = `${biz.name} (${biz.city}, ${biz.address})`;

    // Ссылка на QR-код для клиента (адаптируется под GitHub Pages или локальный сервер)
    const baseUri = window.location.href.split('admin.html')[0].replace(/\/$/, '');
    const qrUrl = `${baseUri}/index.html?qr=1&biz=${biz.id}`;

    const qrContainer = document.getElementById('tent-qr-canvas');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
      text: qrUrl,
      width: 170,
      height: 170,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  window.adminPrintQrTent = function () {
    window.print();
  };

  // 6. КАССА
  async function checkAndRedeemCoupon() {
    const code = document.getElementById('redeem-code-input').value.trim().toUpperCase();
    const resultBox = document.getElementById('redeem-result-box');

    if (!code) {
      alert('Введите код купона');
      return;
    }

    let coupon = null;

    if (!state.isStaticMode) {
      try {
        const res = await fetch(`/api/coupons/${code}`);
        const data = await res.json();
        if (data.success) coupon = data.data;
      } catch (err) { state.isStaticMode = true; }
    }

    if (!coupon) {
      const localDb = getLocalDb();
      coupon = (localDb.coupons || []).find(c => c.code.toUpperCase() === code);
    }

    if (!coupon) {
      resultBox.style.display = 'block';
      resultBox.style.background = 'rgba(239, 68, 68, 0.15)';
      resultBox.style.border = '1px solid #ef4444';
      resultBox.innerHTML = `
        <div style="color: #f87171; font-weight: 700;">❌ Купон не найден</div>
        <div style="font-size: 0.85rem; color: #cbd5e1; margin-top: 4px;">Проверьте правильность введённого промокода.</div>
      `;
      return;
    }

    const isUsed = coupon.status === 'used';
    resultBox.style.display = 'block';
    resultBox.style.background = isUsed ? 'rgba(148, 163, 184, 0.1)' : 'rgba(16, 185, 129, 0.15)';
    resultBox.style.border = `1px solid ${isUsed ? '#64748b' : '#10b981'}`;

    resultBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <div style="font-weight: 800; color: #fff; font-size: 1.1rem;">${coupon.businessName}</div>
          <div style="color: #ef4444; font-weight: 800; font-size: 1.2rem; margin: 4px 0;">${coupon.discountBadge}</div>
          <div style="font-size: 0.85rem; color: #fde68a;">Гость: ${coupon.userName} (${coupon.userPhone})</div>
        </div>
        <div style="font-size: 0.85rem; font-weight: 700; padding: 4px 10px; border-radius: 6px; ${isUsed ? 'background: #475569; color: #cbd5e1;' : 'background: #10b981; color: #000;'}">
          ${isUsed ? 'УЖЕ ПОГАШЕН' : 'АКТИВЕН'}
        </div>
      </div>

      ${!isUsed ? `
        <button id="btn-confirm-redeem" class="btn-get-discount" style="width: 100%; margin-top: 14px; padding: 10px;">
          ✅ Погасить скидку сейчас (предоставить скидку)
        </button>
      ` : `
        <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 8px;">
          Купон был погашен: ${new Date(coupon.redeemedAt || Date.now()).toLocaleString('ru-RU')}
        </div>
      `}
    `;

    if (!isUsed) {
      document.getElementById('btn-confirm-redeem').onclick = async () => {
        if (!state.isStaticMode) {
          try {
            await fetch('/api/coupons/redeem', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
              body: JSON.stringify({ code: coupon.code, redeemedBy: state.currentUser ? state.currentUser.name : 'Кассир' })
            });
          } catch (e) {}
        }

        const localDb = getLocalDb();
        const c = (localDb.coupons || []).find(item => item.code.toUpperCase() === coupon.code.toUpperCase());
        if (c) {
          c.status = 'used';
          c.redeemedAt = new Date().toISOString();
        }
        saveLocalDb(localDb);

        alert('Купон успешно погашен! Скидка предоставлена гостю.');
        checkAndRedeemCoupon();
      };
    }
  }

  function setupEventListeners() {
    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      login(
        document.getElementById('login-email').value.trim(),
        document.getElementById('login-password').value.trim()
      );
    });

    document.getElementById('quick-superadmin-btn').addEventListener('click', () => {
      login('admin@skidki.ru', 'admin123');
    });
    document.getElementById('quick-moderator-btn').addEventListener('click', () => {
      login('moderator@skidki.ru', 'mod123');
    });

    document.getElementById('admin-logout-btn').addEventListener('click', logout);

    document.querySelectorAll('.admin-nav-item[data-tab]').forEach(item => {
      item.addEventListener('click', () => {
        window.adminSwitchTab(item.dataset.tab);
      });
    });

    document.getElementById('admin-biz-cat-filter').addEventListener('change', renderBusinessesTable);
    const cityFilterEl = document.getElementById('admin-biz-city-filter');
    if (cityFilterEl) cityFilterEl.addEventListener('change', renderBusinessesTable);
    document.getElementById('admin-biz-search').addEventListener('input', renderBusinessesTable);

    document.getElementById('bf-city').addEventListener('change', (e) => {
      const coords = CITY_DEFAULT_COORDS[e.target.value];
      if (coords) {
        document.getElementById('bf-lat').value = coords.lat;
        document.getElementById('bf-lng').value = coords.lng;
      }
    });

    document.getElementById('biz-form').addEventListener('submit', handleBizFormSubmit);
    document.getElementById('close-biz-modal').addEventListener('click', () => {
      document.getElementById('biz-modal').classList.remove('active');
    });

    document.getElementById('admin-rev-status-filter').addEventListener('change', loadReviews);

    document.getElementById('new-admin-form').addEventListener('submit', handleNewAdminSubmit);
    document.getElementById('close-admin-modal').addEventListener('click', () => {
      document.getElementById('admin-modal').classList.remove('active');
    });

    document.getElementById('qr-select-biz').addEventListener('change', updateQrPreview);
    document.getElementById('qr-custom-header').addEventListener('input', updateQrPreview);
    document.getElementById('qr-custom-sub').addEventListener('input', updateQrPreview);

    document.getElementById('btn-check-redeem').addEventListener('click', checkAndRedeemCoupon);
    document.getElementById('redeem-code-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkAndRedeemCoupon();
    });
  }

})();
