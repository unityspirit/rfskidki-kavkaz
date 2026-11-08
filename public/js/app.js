/**
 * ХабСкидок.рф — Клиентское приложение (Dual Engine: Server API + GitHub Pages Standalone)
 * Интерактивная Яндекс Карта, Геолокация, Отзывы, Генерация QR-купонов
 */

(function () {
  const seed = window.RFSKIDKI_INITIAL_DATA || { cities: [], categories: [], businesses: [] };

  // Локальное хранилище данных для автономного режима (GitHub Pages)
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
        reviews: seed.reviews || [],
        coupons: seed.coupons || []
      };
      localStorage.setItem('skidki_db_storage', JSON.stringify(db));
      return db;
    }

    // Автоматическая синхронизация новых заведений и обновление версий из сида
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
    businesses: [],
    categories: seed.categories || [],
    cities: seed.cities || [],
    currentCity: "Приэльбрусье",
    selectedCategory: "all",
    searchQuery: "",
    userCoords: null,
    selectedRadius: 15,
    selectedBizId: null,
    yandexMap: null,
    placemarksMap: new Map(),
    clusterer: null,
    userPlacemark: null,
    myCoupons: JSON.parse(localStorage.getItem('skidki_my_coupons') || '[]')
  };

  const CATEGORY_MAP_STYLES = {
    restaurants: { preset: 'islands#redFoodIcon', color: '#ef4444' },
    coffee: { preset: 'islands#orangeCafeIcon', color: '#f97316' },
    auto: { preset: 'islands#blueAutoIcon', color: '#3b82f6' },
    beauty: { preset: 'islands#violetBeautyIcon', color: '#8b5cf6' },
    spa: { preset: 'islands#darkGreenPoolIcon', color: '#10b981' },
    fitness: { preset: 'islands#yellowSportIcon', color: '#eab308' },
    entertainment: { preset: 'islands#purpleEntertainmentIcon', color: '#a855f7' },
    medical: { preset: 'islands#redMedicalIcon', color: '#dc2626' },
    taxi: { preset: 'islands#yellowAutoIcon', color: '#f59e0b' },
    default: { preset: 'islands#orangeDotIcon', color: '#f59e0b' }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    updateMyCouponsCounter();
    checkUrlQrParams();
  });

  async function initApp() {
    await fetchCities();
    await fetchBusinesses();

    if (typeof ymaps !== 'undefined') {
      ymaps.ready(initYandexMap);
    } else {
      console.warn('Яндекс Карты подгружаются...');
    }
  }

  // ========================================================
  // ЗАГРУЗКА ДАННЫХ (API + STATIC FALLBACK)
  // ========================================================
  async function fetchCities() {
    try {
      const res = await fetch('/api/cities');
      if (!res.ok) throw new Error('API not available');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        state.cities = data.data;
        renderCitiesModal();
        return;
      }
    } catch (err) {
      // Автономный режим (GitHub Pages)
      state.isStaticMode = true;
    }

    const localDb = getLocalDb();
    state.cities = localDb.cities.length > 0 ? localDb.cities : seed.cities;
    renderCitiesModal();
  }

  async function fetchBusinesses() {
    if (!state.isStaticMode) {
      try {
        let url = `/api/businesses?city=${encodeURIComponent(state.currentCity)}`;
        if (state.selectedCategory !== 'all') url += `&category=${encodeURIComponent(state.selectedCategory)}`;
        if (state.searchQuery) url += `&search=${encodeURIComponent(state.searchQuery)}`;
        if (state.userCoords) url += `&lat=${state.userCoords.lat}&lng=${state.userCoords.lng}&radius=${state.selectedRadius}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            state.businesses = data.data;
            renderBusinessesList();
            updateMapMarkers();
            return;
          }
        }
      } catch (err) {
        state.isStaticMode = true;
      }
    }

    // Автономный режим из LocalStorage
    const localDb = getLocalDb();
    let list = [...localDb.businesses];

    if (state.selectedCategory !== 'all') {
      list = list.filter(b => b.category === state.selectedCategory);
    }
    if (state.currentCity) {
      const cityClean = state.currentCity.toLowerCase().trim();
      list = list.filter(b => b.city.toLowerCase().includes(cityClean));
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.discountText.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
      );
    }
    if (state.userCoords) {
      list = list.map(b => ({
        ...b,
        distanceKm: calcDistance(state.userCoords.lat, state.userCoords.lng, b.lat, b.lng)
      }));
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    state.businesses = list;
    renderBusinessesList();
    updateMapMarkers();
  }

  function calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 10) / 10;
  }

  // ========================================================
  // ИНТЕГРАЦИЯ ЯНДЕКС КАРТ
  // ========================================================
  function initYandexMap() {
    const currentCityObj = state.cities.find(c => c.name === state.currentCity) || {
      center: [43.2558, 42.5117],
      zoom: 12
    };

    state.yandexMap = new ymaps.Map('yandex-map', {
      center: currentCityObj.center,
      zoom: currentCityObj.zoom || 12,
      controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
    }, {
      suppressMapOpenBlock: true
    });

    state.clusterer = new ymaps.Clusterer({
      preset: 'islands#invertedOrangeClusterIcons',
      groupByCoordinates: false,
      clusterDisableClickZoom: false,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false
    });

    state.yandexMap.geoObjects.add(state.clusterer);
    updateMapMarkers();
  }

  function updateMapMarkers() {
    if (!state.yandexMap || !state.clusterer) return;

    state.clusterer.removeAll();
    state.placemarksMap.clear();

    const placemarks = [];

    state.businesses.forEach(biz => {
      const style = CATEGORY_MAP_STYLES[biz.category] || CATEGORY_MAP_STYLES.default;

      const balloonContent = `
        <div style="font-family: sans-serif; max-width: 280px; padding: 4px; color: #1e293b;">
          <div style="position: relative; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #334155;">
            <img src="${biz.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${biz.name}">
            <div style="position: absolute; top: 6px; left: 6px; background: #ef4444; color: #fff; font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 6px;">
              ${biz.discountBadge}
            </div>
          </div>
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; line-height: 1.2;">${biz.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📍 ${biz.city}, ${biz.address}</div>
          <div style="background: #fef3c7; border: 1px dashed #f59e0b; padding: 6px 8px; border-radius: 6px; font-size: 12px; color: #92400e; font-weight: 600; margin-bottom: 10px;">
            ${biz.discountText}
          </div>
          ${(biz.category === 'taxi' || (biz.id && biz.id.startsWith('biz-transfer'))) ? `
            <button onclick="window.appOpenTransferModal({ to: '${biz.city}' })" style="width: 100%; background: #10b981; color: #000; font-weight: 800; font-size: 12px; padding: 8px; border: none; border-radius: 6px; cursor: pointer;">
              🚕 Забронировать трансфер со скидкой
            </button>
          ` : `
            <button onclick="window.appOpenReviewModal('${biz.id}')" style="width: 100%; background: #f59e0b; color: #000; font-weight: 800; font-size: 12px; padding: 8px; border: none; border-radius: 6px; cursor: pointer;">
              🎁 Получить скидку за отзыв
            </button>
          `}
        </div>
      `;

      const placemark = new ymaps.Placemark([biz.lat, biz.lng], {
        balloonContent: balloonContent,
        hintContent: `<b>${biz.name}</b><br>${biz.discountBadge}`
      }, {
        preset: style.preset,
        balloonCloseButton: true,
        hideIconOnBalloonOpen: false
      });

      placemark.events.add('click', () => {
        highlightBusinessCard(biz.id);
      });

      state.placemarksMap.set(biz.id, placemark);
      placemarks.push(placemark);
    });

    state.clusterer.add(placemarks);
  }

  function renderBusinessesList() {
    const listEl = document.getElementById('places-cards-list');
    const counterEl = document.getElementById('places-count-text');

    counterEl.textContent = `Заведений в регионе: ${state.businesses.length}`;

    if (state.businesses.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #94a3b8; background: #131a26; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🔍</div>
          <div style="font-weight: 700; color: #fff; margin-bottom: 4px;">Заведения не найдены</div>
          <div style="font-size: 0.85rem;">Попробуйте выбрать другой город в шапке (Приэльбрусье, Архыз, Домбай, Нальчик) или сбросить категорию.</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = state.businesses.map(biz => `
      <div class="business-card ${state.selectedBizId === biz.id ? 'selected' : ''}" id="card-${biz.id}" data-id="${biz.id}">
        <div class="card-image-wrap">
          <img src="${biz.image}" alt="${biz.name}" class="card-image" loading="lazy">
          <div class="card-discount-badge">${biz.discountBadge}</div>
          ${biz.distanceKm !== undefined ? `
            <div class="card-distance-badge">📍 ${biz.distanceKm < 1 ? Math.round(biz.distanceKm * 1000) + ' м' : biz.distanceKm + ' км'}</div>
          ` : ''}
        </div>

        <div class="card-content">
          <div class="card-meta-row">
            <span>${biz.categoryName} • ${biz.city}</span>
            <div class="card-rating">
              <span>★</span>
              <span>${biz.rating || '5.0'}</span>
              <span style="color: #64748b; font-size: 0.75rem;">(${biz.reviewCount || 0})</span>
            </div>
          </div>

          <h3 class="card-title">${biz.name}</h3>
          <div class="card-address">
            <span>📍</span>
            <span>${biz.address}</span>
          </div>

          <div class="card-discount-desc">
            ⚡ ${biz.discountText}
          </div>

          <div class="card-actions">
            ${(biz.category === 'taxi' || (biz.id && biz.id.startsWith('biz-transfer'))) ? `
              <button class="btn-get-discount" onclick="window.appOpenTransferModal({ to: '${biz.city}' })" style="background: linear-gradient(135deg, #f59e0b, #10b981); color: #000; font-weight: 800;">
                <span>🚕 Заказать трансфер</span>
              </button>
            ` : `
              <button class="btn-get-discount" onclick="window.appOpenReviewModal('${biz.id}')">
                <span>🎁 Забрать скидку</span>
              </button>
            `}
            <button class="btn-show-map" onclick="window.appFocusMap('${biz.id}')" title="Показать на карте">
              <span>📍 На карте</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function highlightBusinessCard(bizId) {
    state.selectedBizId = bizId;
    document.querySelectorAll('.business-card').forEach(c => c.classList.remove('selected'));
    const targetCard = document.getElementById(`card-${bizId}`);
    if (targetCard) {
      targetCard.classList.add('selected');
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  window.appFocusMap = function (bizId) {
    const biz = state.businesses.find(b => b.id === bizId);
    if (!biz || !state.yandexMap) return;

    highlightBusinessCard(bizId);

    state.yandexMap.setCenter([biz.lat, biz.lng], 15, { duration: 600 }).then(() => {
      const placemark = state.placemarksMap.get(bizId);
      if (placemark) placemark.balloon.open();
    });

    if (window.innerWidth <= 900) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  function handleGeolocation() {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим устройством');
      return;
    }

    const geoBtn = document.getElementById('geo-btn');
    const geoStatus = document.getElementById('geo-status-indicator');
    geoBtn.innerHTML = '<span>⏳</span> <span>Определяем...</span>';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.userCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        geoBtn.innerHTML = '<span>🎯</span> <span>Рядом найдены</span>';
        geoBtn.style.background = 'rgba(16, 185, 129, 0.3)';
        geoStatus.textContent = '● Местоположение определено';

        const radiusSelect = document.getElementById('radius-select');
        if (radiusSelect) radiusSelect.style.display = 'block';

        if (state.yandexMap) {
          if (state.userPlacemark) {
            state.yandexMap.geoObjects.remove(state.userPlacemark);
          }
          state.userPlacemark = new ymaps.Placemark([state.userCoords.lat, state.userCoords.lng], {
            hintContent: 'Вы находитесь здесь',
            balloonContent: '<b>Ваше текущее местоположение на Кавказе</b>'
          }, {
            preset: 'islands#geolocationIcon'
          });
          state.yandexMap.geoObjects.add(state.userPlacemark);
          state.yandexMap.setCenter([state.userCoords.lat, state.userCoords.lng], 13, { duration: 600 });
        }

        fetchBusinesses();
      },
      () => {
        geoBtn.innerHTML = '<span>🎯</span> <span>Рядом со мной</span>';
        alert('Пожалуйста, разрешите доступ к геолокации в браузере.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  function checkUrlQrParams() {
    const params = new URLSearchParams(window.location.search);
    const isQr = params.get('qr') || params.get('source') === 'qr';
    const bizId = params.get('biz');

    if (isQr) {
      if (!state.isStaticMode) {
        fetch('/api/qr/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: bizId || null, source: 'qr_table_tent' })
        }).catch(() => {});
      }

      const pill = document.getElementById('qr-welcome-pill');
      if (pill) {
        pill.innerHTML = '<span>🔥 ВЫ ПЕРЕШЛИ ПО QR-КОДУ — ЗАБЕРИТЕ СВОЮ СКИДКУ!</span>';
        pill.style.background = 'rgba(239, 68, 68, 0.3)';
        pill.style.color = '#f87171';
        pill.style.borderColor = '#ef4444';
      }

      if (bizId) {
        setTimeout(() => {
          window.appOpenReviewModal(bizId);
        }, 500);
      }
    }
  }

  window.appOpenReviewModal = function (bizId) {
    const biz = state.businesses.find(b => b.id === bizId) || (seed.businesses || []).find(b => b.id === bizId);
    if (!biz) return;

    document.getElementById('form-biz-id').value = biz.id;
    document.getElementById('modal-biz-title').textContent = biz.name;
    document.getElementById('modal-biz-sub').textContent = `${biz.city}, ${biz.address}`;
    document.getElementById('modal-discount-badge').textContent = biz.discountBadge;
    document.getElementById('modal-discount-desc').textContent = biz.discountText;

    document.getElementById('modal-form-view').style.display = 'block';
    document.getElementById('modal-coupon-result').style.display = 'none';
    document.getElementById('form-comment').value = '';

    const savedProfile = JSON.parse(localStorage.getItem('skidki_user_profile') || '{}');
    if (savedProfile.name) document.getElementById('form-user-name').value = savedProfile.name;
    if (savedProfile.phone) document.getElementById('form-user-phone').value = savedProfile.phone;

    document.getElementById('review-modal').classList.add('active');
  };

  async function handleReviewSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳ Генерируем персональный купон...</span>';

    const bizId = document.getElementById('form-biz-id').value;
    const userName = document.getElementById('form-user-name').value.trim();
    const userPhone = document.getElementById('form-user-phone').value.trim();
    const rating = document.getElementById('form-rating-val').value;
    const comment = document.getElementById('form-comment').value.trim();
    const biz = state.businesses.find(b => b.id === bizId) || (seed.businesses || []).find(b => b.id === bizId);

    let coupon = null;

    if (!state.isStaticMode) {
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: bizId, userName, userPhone, rating, comment })
        });
        const json = await res.json();
        if (json.success) {
          coupon = json.data.coupon;
        }
      } catch (err) {
        state.isStaticMode = true;
      }
    }

    // Если работаем в автономном режиме (GitHub Pages)
    if (!coupon && biz) {
      const code = `${biz.city.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-VIP`;
      coupon = {
        id: "coup-" + Date.now(),
        code,
        businessId: biz.id,
        businessName: biz.name,
        businessCity: biz.city,
        businessAddress: biz.address,
        discountBadge: biz.discountBadge,
        discountText: biz.discountText,
        userName,
        userPhone,
        status: "active",
        expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
        createdAt: new Date().toISOString()
      };

      const localDb = getLocalDb();
      localDb.reviews.unshift({
        id: "rev-" + Date.now(),
        businessId: biz.id,
        businessName: biz.name,
        userName,
        userPhone,
        rating: parseInt(rating),
        comment,
        status: "approved",
        couponCode: code,
        createdAt: new Date().toISOString()
      });
      localDb.coupons.unshift(coupon);
      saveLocalDb(localDb);
    }

    localStorage.setItem('skidki_user_profile', JSON.stringify({ name: userName, phone: userPhone }));

    if (coupon) {
      state.myCoupons.unshift(coupon);
      localStorage.setItem('skidki_my_coupons', JSON.stringify(state.myCoupons));
      updateMyCouponsCounter();

      if (typeof confetti === 'function') {
        confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });
      }

      showCouponResult(coupon, biz);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = '🎉 Получить скидку прямо сейчас';
  }

  function showCouponResult(coupon, biz) {
    document.getElementById('modal-form-view').style.display = 'none';
    const resultView = document.getElementById('modal-coupon-result');
    resultView.style.display = 'block';

    document.getElementById('res-biz-name').textContent = biz ? biz.name : coupon.businessName;
    document.getElementById('res-discount-badge').textContent = coupon.discountBadge;
    document.getElementById('res-discount-text').textContent = coupon.discountText;
    document.getElementById('res-coupon-code').textContent = coupon.code;

    const qrHolder = document.getElementById('coupon-qr-holder');
    qrHolder.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrHolder, {
        text: `RFSKIDKI:${coupon.code}:${coupon.businessId}`,
        width: 140,
        height: 140,
        colorDark: "#0b0f17",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }

    document.getElementById('btn-copy-code').onclick = () => {
      navigator.clipboard.writeText(coupon.code).then(() => {
        alert(`Код купона ${coupon.code} скопирован в буфер обмена!`);
      });
    };

    document.getElementById('btn-save-coupon-done').onclick = () => {
      document.getElementById('review-modal').classList.remove('active');
    };
  }

  function updateMyCouponsCounter() {
    const counter = document.getElementById('my-coupons-count');
    if (state.myCoupons.length > 0) {
      counter.style.display = 'inline-block';
      counter.textContent = state.myCoupons.length;
    } else {
      counter.style.display = 'none';
    }
  }

  function openMyCouponsModal() {
    const listEl = document.getElementById('my-coupons-list');
    if (state.myCoupons.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 30px 10px; text-align: center; color: #94a3b8;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🎟️</div>
          <div style="font-weight: 700; color: #fff; margin-bottom: 4px;">У вас пока нет сохраненных скидок</div>
          <p style="font-size: 0.85rem;">Оставьте отзыв о любом заведении на карте, чтобы получить первый купон со скидкой!</p>
        </div>
      `;
    } else {
      listEl.innerHTML = state.myCoupons.map(c => `
        <div style="background: #182234; border: 1px dashed ${c.status === 'used' ? '#64748b' : '#f59e0b'}; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div style="font-weight: 700; color: #fff; font-size: 1rem;">${c.businessName}</div>
              <div style="color: #ef4444; font-weight: 800; font-size: 0.95rem; margin: 2px 0;">${c.discountBadge}</div>
            </div>
            <span style="font-size: 0.75rem; padding: 3px 8px; border-radius: 6px; font-weight: 700; ${c.status === 'used' ? 'background: rgba(148, 163, 184, 0.2); color: #94a3b8;' : 'background: rgba(16, 185, 129, 0.2); color: #34d399;'}">
              ${c.status === 'used' ? 'Погашен' : 'Активен'}
            </span>
          </div>

          <div style="font-size: 0.82rem; color: #fde68a; margin: 6px 0;">${c.discountText || ''}</div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; margin-top: 8px;">
            <div style="font-family: monospace; font-size: 1.1rem; font-weight: 800; color: #fbbf24;">${c.code}</div>
            <button onclick="navigator.clipboard.writeText('${c.code}'); alert('Код скопирован!');" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
              Скопировать
            </button>
          </div>
        </div>
      `).join('');
    }

    document.getElementById('my-coupons-modal').classList.add('active');
  }

  function renderCitiesModal() {
    const list = document.getElementById('cities-list');
    list.innerHTML = state.cities.map(city => `
      <button class="city-pick-item" data-name="${city.name}" style="background: #182234; border: 1px solid rgba(255,255,255,0.08); color: ${city.name === state.currentCity ? '#fbbf24' : '#fff'}; padding: 10px; border-radius: 8px; cursor: pointer; text-align: left; font-size: 0.9rem; font-weight: 600;">
        📍 ${city.name}
        <span style="display: block; font-size: 0.75rem; color: #64748b; font-weight: normal;">${city.region || 'Кавказ'}</span>
      </button>
    `).join('');

    list.querySelectorAll('.city-pick-item').forEach(btn => {
      btn.onclick = () => selectCity(btn.dataset.name);
    });
  }

  function selectCity(cityName) {
    state.currentCity = cityName;
    document.getElementById('current-city-label').textContent = cityName;
    document.getElementById('city-modal').classList.remove('active');

    const cityObj = state.cities.find(c => c.name === cityName);
    if (cityObj && state.yandexMap) {
      state.yandexMap.setCenter(cityObj.center, cityObj.zoom || 12, { duration: 600 });
    }

    fetchBusinesses();
  }

  function setupEventListeners() {
    document.querySelectorAll('.category-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedCategory = chip.dataset.cat;
        fetchBusinesses();
      });
    });

    let searchTimeout = null;
    document.getElementById('search-input').addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.searchQuery = e.target.value.trim();
        fetchBusinesses();
      }, 300);
    });

    document.getElementById('geo-btn').addEventListener('click', handleGeolocation);
    document.getElementById('map-locate-btn').addEventListener('click', handleGeolocation);

    document.getElementById('map-recenter-btn').addEventListener('click', () => {
      const cityObj = state.cities.find(c => c.name === state.currentCity);
      if (cityObj && state.yandexMap) {
        state.yandexMap.setCenter(cityObj.center, cityObj.zoom || 12, { duration: 400 });
      }
    });

    document.getElementById('radius-select').addEventListener('change', (e) => {
      state.selectedRadius = parseFloat(e.target.value);
      fetchBusinesses();
    });

    document.getElementById('city-btn').addEventListener('click', () => {
      document.getElementById('city-modal').classList.add('active');
    });
    document.getElementById('close-city-modal').addEventListener('click', () => {
      document.getElementById('city-modal').classList.remove('active');
    });

    document.getElementById('my-coupons-btn').addEventListener('click', openMyCouponsModal);
    document.getElementById('close-my-coupons').addEventListener('click', () => {
      document.getElementById('my-coupons-modal').classList.remove('active');
    });

    document.getElementById('close-review-modal').addEventListener('click', () => {
      document.getElementById('review-modal').classList.remove('active');
    });

    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }
    });

    const starBtns = document.querySelectorAll('.star-icon-btn');
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.value);
        document.getElementById('form-rating-val').value = val;
        starBtns.forEach(s => {
          if (parseInt(s.dataset.value) <= val) {
            s.classList.add('selected');
          } else {
            s.classList.remove('selected');
          }
        });
      });
    });

    const tagBtns = document.querySelectorAll('.tag-btn');
    tagBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const activeTags = Array.from(document.querySelectorAll('.tag-btn.active')).map(t => t.dataset.tag);
        const commentField = document.getElementById('form-comment');
        if (activeTags.length > 0 && !commentField.value.includes(btn.dataset.tag)) {
          commentField.value = activeTags.join(', ') + '. ' + (commentField.value || '');
        }
      });
    });

    document.getElementById('review-form').addEventListener('submit', handleReviewSubmit);

    // Слушатели модуля такси и горных трансферов
    const headerTfBtn = document.getElementById('header-transfer-btn');
    if (headerTfBtn) headerTfBtn.addEventListener('click', () => window.appOpenTransferModal());

    const bannerTfBtn = document.getElementById('banner-transfer-btn');
    if (bannerTfBtn) bannerTfBtn.addEventListener('click', () => window.appOpenTransferModal());

    const closeTfBtn = document.getElementById('close-transfer-modal');
    if (closeTfBtn) {
      closeTfBtn.addEventListener('click', () => {
        document.getElementById('transfer-modal').classList.remove('active');
      });
    }

    const tfFrom = document.getElementById('tf-from');
    const tfTo = document.getElementById('tf-to');
    const tfFromCustom = document.getElementById('tf-from-custom');
    const tfToCustom = document.getElementById('tf-to-custom');

    if (tfFrom) tfFrom.addEventListener('change', updateTransferCalculation);
    if (tfTo) tfTo.addEventListener('change', updateTransferCalculation);
    if (tfFromCustom) tfFromCustom.addEventListener('input', updateTransferCalculation);
    if (tfToCustom) tfToCustom.addEventListener('input', updateTransferCalculation);

    document.querySelectorAll('input[name="vehicleClass"]').forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.vehicle-option').forEach(l => {
          const inp = l.querySelector('input');
          if (inp && inp.checked) {
            l.style.borderColor = '#fbbf24';
            l.style.background = 'rgba(245, 158, 11, 0.15)';
          } else {
            l.style.borderColor = 'rgba(255,255,255,0.1)';
            l.style.background = '#182234';
          }
        });
        updateTransferCalculation();
      });
    });

    const tfForm = document.getElementById('transfer-form');
    if (tfForm) tfForm.addEventListener('submit', handleTransferSubmit);
  }

  // ========================================================
  // МОДУЛЬ ТАКСИ И ГОРНЫХ ТРАНСФЕРОВ (СО СКИДКОЙ 20%)
  // ========================================================
  const TRANSFER_ROUTES = {
    'Аэропорт Минеральные Воды (MRV) -> Приэльбрусье (Терскол / Поляна Азау / Чегет)': { km: 185, time: '2.5 ч', basePrice: 3500 },
    'Аэропорт Минеральные Воды (MRV) -> Архыз (пос. Романтик / курорт Архыз)': { km: 215, time: '3.0 ч', basePrice: 4200 },
    'Аэропорт Минеральные Воды (MRV) -> Домбай (пос. Домбай / Теберда)': { km: 225, time: '3.2 ч', basePrice: 4500 },
    'Аэропорт Минеральные Воды (MRV) -> Кисловодск (Курортный бульвар / санатории)': { km: 55, time: '50 мин', basePrice: 1400 },
    'Аэропорт Минеральные Воды (MRV) -> Пятигорск (центр / отели)': { km: 28, time: '30 мин', basePrice: 800 },
    'Аэропорт Минеральные Воды (MRV) -> Нальчик (центр / Долинск)': { km: 105, time: '1.3 ч', basePrice: 2200 },
    'Аэропорт Минеральные Воды (MRV) -> Верхний Фиагдон (Куртатинское ущелье)': { km: 220, time: '3.0 ч', basePrice: 4600 },
    'Аэропорт Минеральные Воды (MRV) -> Цейское ущелье (отели / альплагерь)': { km: 250, time: '3.5 ч', basePrice: 5200 },
    'Аэропорт Минеральные Воды (MRV) -> Сулакский каньон (пгт Дубки / Главрыба)': { km: 410, time: '5.5 ч', basePrice: 8500 },
    'Аэропорт Минеральные Воды (MRV) -> Дербент (крепость / побережье)': { km: 490, time: '6.5 ч', basePrice: 9900 },

    'Аэропорт Нальчик (NAL) -> Приэльбрусье (Терскол / Поляна Азау / Чегет)': { km: 125, time: '1.8 ч', basePrice: 2600 },
    'Аэропорт Нальчик (NAL) -> Архыз (пос. Романтик / курорт Архыз)': { km: 260, time: '3.5 ч', basePrice: 5200 },
    'Аэропорт Нальчик (NAL) -> Домбай (пос. Домбай / Теберда)': { km: 270, time: '3.8 ч', basePrice: 5500 },
    'Аэропорт Нальчик (NAL) -> Пятигорск (центр / отели)': { km: 85, time: '1.2 ч', basePrice: 1800 },
    'Аэропорт Нальчик (NAL) -> Кисловодск (Курортный бульвар / санатории)': { km: 110, time: '1.5 ч', basePrice: 2200 },
    'Аэропорт Нальчик (NAL) -> Верхний Фиагдон (Куртатинское ущелье)': { km: 125, time: '1.8 ч', basePrice: 2800 },

    'Аэропорт Владикавказ / Беслан (OGZ) -> Верхний Фиагдон (Куртатинское ущелье)': { km: 50, time: '50 мин', basePrice: 1500 },
    'Аэропорт Владикавказ / Беслан (OGZ) -> Цейское ущелье (отели / альплагерь)': { km: 85, time: '1.5 ч', basePrice: 2400 },
    'Аэропорт Владикавказ / Беслан (OGZ) -> Приэльбрусье (Терскол / Поляна Азау / Чегет)': { km: 220, time: '3.0 ч', basePrice: 4800 },
    'Аэропорт Владикавказ / Беслан (OGZ) -> Архыз (пос. Романтик / курорт Архыз)': { km: 350, time: '4.8 ч', basePrice: 7500 },
    'Аэропорт Владикавказ / Беслан (OGZ) -> Дербент (крепость / побережье)': { km: 310, time: '4.5 ч', basePrice: 6800 },

    'Аэропорт Махачкала / Уйташ (MCX) -> Сулакский каньон (пгт Дубки / Главрыба)': { km: 95, time: '1.5 ч', basePrice: 2500 },
    'Аэропорт Махачкала / Уйташ (MCX) -> Дербент (крепость / побережье)': { km: 115, time: '1.8 ч', basePrice: 2800 },

    'Ж/Д вокзал Минеральные Воды -> Приэльбрусье (Терскол / Поляна Азау / Чегет)': { km: 180, time: '2.5 ч', basePrice: 3400 },
    'Ж/Д вокзал Минеральные Воды -> Архыз (пос. Романтик / курорт Архыз)': { km: 210, time: '3.0 ч', basePrice: 4100 },
    'Ж/Д вокзал Минеральные Воды -> Домбай (пос. Домбай / Теберда)': { km: 220, time: '3.1 ч', basePrice: 4400 }
  };

  const VEHICLE_MULTIPLIERS = {
    comfort: { factor: 1.0, name: 'Комфорт (до 4 чел)' },
    suv: { factor: 1.25, name: 'Джип 4x4 (горы / снег)' },
    minivan: { factor: 1.5, name: 'Минивэн (до 7-8 чел)' },
    business: { factor: 1.8, name: 'Бизнес (премиум)' }
  };

  function updateTransferCalculation() {
    const fromSelect = document.getElementById('tf-from');
    const toSelect = document.getElementById('tf-to');
    const fromCustom = document.getElementById('tf-from-custom');
    const toCustom = document.getElementById('tf-to-custom');
    if (!fromSelect || !toSelect) return;

    const isFromCustom = fromSelect.value === 'custom';
    const isToCustom = toSelect.value === 'custom';

    if (fromCustom) fromCustom.style.display = isFromCustom ? 'block' : 'none';
    if (toCustom) toCustom.style.display = isToCustom ? 'block' : 'none';

    const fromVal = isFromCustom ? (fromCustom.value.trim() || 'Индивидуальный адрес') : fromSelect.value;
    const toVal = isToCustom ? (toCustom.value.trim() || 'Индивидуальный адрес') : toSelect.value;

    const routeKey = `${fromSelect.value} -> ${toSelect.value}`;
    const route = TRANSFER_ROUTES[routeKey] || { km: 180, time: '~2.5 ч', basePrice: 3600 };

    const selectedVehicle = document.querySelector('input[name="vehicleClass"]:checked');
    const vClass = selectedVehicle ? selectedVehicle.value : 'comfort';
    const vInfo = VEHICLE_MULTIPLIERS[vClass] || VEHICLE_MULTIPLIERS.comfort;

    let base = Math.round((route.basePrice * vInfo.factor) / 50) * 50;
    let discounted = Math.round((base * 0.8) / 50) * 50; // -20% скидка

    const routeInfoEl = document.getElementById('tf-calc-route-info');
    const priceDiscEl = document.getElementById('tf-price-discount');
    const priceOrigEl = document.getElementById('tf-price-original');

    if (routeInfoEl) routeInfoEl.textContent = `Расстояние: ~${route.km} км | В пути: ~${route.time}`;
    if (priceDiscEl) priceDiscEl.textContent = `${discounted.toLocaleString('ru-RU')} ₽`;
    if (priceOrigEl) priceOrigEl.textContent = `${base.toLocaleString('ru-RU')} ₽`;

    return {
      km: route.km,
      time: route.time,
      originalPrice: base,
      discountPrice: discounted,
      from: fromVal,
      to: toVal,
      vehicleClass: vClass,
      vehicleName: vInfo.name
    };
  }

  window.appOpenTransferModal = function (opts = {}) {
    const modal = document.getElementById('transfer-modal');
    if (!modal) return;

    const form = document.getElementById('transfer-form');
    const successBox = document.getElementById('transfer-success-box');
    if (form) form.style.display = 'block';
    if (successBox) successBox.style.display = 'none';

    const dateInput = document.getElementById('tf-date');
    if (dateInput && !dateInput.value) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      dateInput.min = today;
    }

    if (opts.to) {
      const toSelect = document.getElementById('tf-to');
      if (toSelect) {
        for (let i = 0; i < toSelect.options.length; i++) {
          if (toSelect.options[i].value.toLowerCase().includes(opts.to.toLowerCase())) {
            toSelect.selectedIndex = i;
            break;
          }
        }
      }
    }

    if (opts.from) {
      const fromSelect = document.getElementById('tf-from');
      if (fromSelect) {
        for (let i = 0; i < fromSelect.options.length; i++) {
          if (fromSelect.options[i].value.toLowerCase().includes(opts.from.toLowerCase())) {
            fromSelect.selectedIndex = i;
            break;
          }
        }
      }
    }

    updateTransferCalculation();
    modal.classList.add('active');
  };

  async function handleTransferSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('tf-submit-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳ Отправляем заявку водителям...';
    }

    const calc = updateTransferCalculation();
    const payload = {
      from: calc.from,
      to: calc.to,
      vehicleClass: calc.vehicleClass,
      vehicleName: calc.vehicleName,
      date: document.getElementById('tf-date').value,
      time: document.getElementById('tf-time').value,
      flight: (document.getElementById('tf-flight').value || '').trim(),
      passengers: parseInt(document.getElementById('tf-passengers').value) || 1,
      hasSki: document.getElementById('tf-opt-ski') ? document.getElementById('tf-opt-ski').checked : false,
      hasChildSeat: document.getElementById('tf-opt-child') ? document.getElementById('tf-opt-child').checked : false,
      name: document.getElementById('tf-name').value.trim(),
      phone: document.getElementById('tf-phone').value.trim(),
      originalPrice: calc.originalPrice,
      discountPrice: calc.discountPrice,
      km: calc.km,
      duration: calc.time
    };

    let result = null;
    if (!state.isStaticMode) {
      try {
        const res = await fetch('/api/transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) result = data.data;
      } catch (err) {
        state.isStaticMode = true;
      }
    }

    if (!result) {
      result = {
        id: 'tf-' + Date.now().toString(36),
        createdAt: new Date().toISOString(),
        status: 'pending',
        ...payload
      };
      const stored = localStorage.getItem('skidki_transfers');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(result);
      localStorage.setItem('skidki_transfers', JSON.stringify(list));

      const myTfs = localStorage.getItem('skidki_my_transfers');
      const myTfsList = myTfs ? JSON.parse(myTfs) : [];
      myTfsList.unshift(result);
      localStorage.setItem('skidki_my_transfers', JSON.stringify(myTfsList));
    }

    document.getElementById('transfer-form').style.display = 'none';
    const successBox = document.getElementById('transfer-success-box');
    successBox.style.display = 'block';

    const detailsEl = document.getElementById('transfer-summary-details');
    if (detailsEl) {
      detailsEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
          <span style="color: #94a3b8;">Номер бронирования:</span>
          <strong style="color: #fbbf24; font-family: monospace;">#${result.id}</strong>
        </div>
        <div style="margin-bottom: 4px;"><strong>🛫 Маршрут:</strong> ${result.from} → ${result.to}</div>
        <div style="margin-bottom: 4px;"><strong>🚗 Автомобиль:</strong> ${result.vehicleName} (${result.passengers} пасс.${result.hasSki ? ', с лыжами' : ''}${result.hasChildSeat ? ', детское кресло' : ''})</div>
        <div style="margin-bottom: 4px;"><strong>📅 Дата и время:</strong> ${result.date} в ${result.time} ${result.flight ? `(Рейс: ${result.flight})` : ''}</div>
        <div style="margin-bottom: 4px;"><strong>👤 Пассажир:</strong> ${result.name} (${result.phone})</div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.15);">
          <span style="font-weight: 700; color: #fff;">Стоимость со скидкой 20%:</span>
          <span style="font-size: 1.25rem; font-weight: 800; color: #34d399;">${result.discountPrice.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div style="font-size: 0.75rem; color: #94a3b8; text-align: right; margin-top: 2px;">(Обычная цена: ${result.originalPrice.toLocaleString('ru-RU')} ₽)</div>
      `;
    }

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🚕 Забронировать трансфер со скидкой 20%';
    }
  }

})();
