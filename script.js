/**
 * ARTFAIR - Hội Chợ Nghệ Thuật Mở Trực Tuyến
 * Complete Interactive Application Logic (Đồng Bộ Chuẩn Hóa VNĐ)
 */

// =============================================================================
// 1. DATA REPOSITORY: 15 REAL ARTWORKS IN WORKSPACE
// =============================================================================
var ARTWORKS_DATABASE = (typeof window !== 'undefined' && window.ARTWORKS_DATABASE) ? window.ARTWORKS_DATABASE : (typeof ARTWORKS_DATABASE !== 'undefined' ? ARTWORKS_DATABASE : []);

// =============================================================================
// 2. STATE MANAGEMENT & GUEST INTERCEPT CORE
// =============================================================================
const APP_STATE = {
  currentUser: null,
  pendingIntent: null,
  favorites: new Set(),
  cart: [],
  appliedCoupon: null,
  discountRate: 0,
  currentCategory: 'all',
  searchQuery: '',
  priceRange: 'all',
  licenseType: 'all',
  sortBy: 'featured',
  activeKeyword: null,
  selectedArtwork: null,
  selectedDetailTier: 'personal',
  otpCode: '888666',
  otpTimerInterval: null,
  otpCountdown: 60
};

// =============================================================================
// 3. INITIALIZATION ON DOM READY
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initAnnouncementBar();
  loadLocalStorageSession();
  setupImageProtection();
  initUIComponents();
  initSearchAndFilters();
  initCalculator();
  initDropzone();
  initHomeCommissionSection();
  setupAccessibleLinks();
  renderArtworkGallery();
  updateHeaderCounters();
});

function initAnnouncementBar() {
  const isClosed = localStorage.getItem('artfair_announcement_closed');
  const bar = document.getElementById('topAnnouncementBar');
  if (bar && isClosed === 'true') {
    bar.style.display = 'none';
  }
}

function closeTopAnnouncement() {
  const bar = document.getElementById('topAnnouncementBar');
  if (bar) {
    bar.style.display = 'none';
    localStorage.setItem('artfair_announcement_closed', 'true');
  }
}

function setupAccessibleLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href="#"]');
    if (link) e.preventDefault();
  });
}

function loadLocalStorageSession() {
  try {
    const savedUser = localStorage.getItem('artfair_user');
    if (savedUser) {
      APP_STATE.currentUser = JSON.parse(savedUser);
      loginUserSuccess(APP_STATE.currentUser, false);
    }
    const savedCart = localStorage.getItem('artfair_cart');
    if (savedCart) {
      APP_STATE.cart = JSON.parse(savedCart);
    }
    const savedFavs = localStorage.getItem('artfair_favs');
    if (savedFavs) {
      APP_STATE.favorites = new Set(JSON.parse(savedFavs));
    }
  } catch (e) {
    console.warn('Storage load fallback', e);
  }
}

function saveLocalStorageSession() {
  try {
    if (APP_STATE.currentUser) {
      localStorage.setItem('artfair_user', JSON.stringify(APP_STATE.currentUser));
    } else {
      localStorage.removeItem('artfair_user');
    }
    localStorage.setItem('artfair_cart', JSON.stringify(APP_STATE.cart));
    localStorage.setItem('artfair_favs', JSON.stringify([...APP_STATE.favorites]));
  } catch (e) {
    console.warn('Storage save fallback', e);
  }
}

function setupImageProtection() {
  document.addEventListener('contextmenu', (e) => {
    if (e.target.matches('img, .card-media-wrapper, .artwork-card, .detail-img-viewport, .showcase-img, .art-watermark-overlay')) {
      e.preventDefault();
      showToast('⚠️ Hình ảnh được bảo hộ bản quyền bởi ARTFAIR.', 'warning');
    }
  });

  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
}

function initUIComponents() {
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const closeMobileNav = document.getElementById('closeMobileNav');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => mobileDrawer.classList.add('active'));
    closeMobileNav.addEventListener('click', () => mobileDrawer.classList.remove('active'));
    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => mobileDrawer.classList.remove('active'));
    });
  }

  const avatarPill = document.getElementById('userAvatarPill');
  const dropdownMenu = document.getElementById('userDropdownMenu');
  if (avatarPill && dropdownMenu) {
    avatarPill.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => dropdownMenu.classList.remove('show'));
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      handleUserLogout();
    });
  }

  document.getElementById('btnOpenLogin')?.addEventListener('click', () => openAuthModal('login'));
  document.getElementById('btnOpenRegister')?.addEventListener('click', () => openAuthModal('register'));
  document.getElementById('closeAuthModal')?.addEventListener('click', closeAuthModal);

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  document.getElementById('closeDetailModal')?.addEventListener('click', () => {
    document.getElementById('artworkDetailModalOverlay').classList.remove('active');
  });

  document.getElementById('btnHeaderCart')?.addEventListener('click', openCartDrawer);
  document.getElementById('closeCartDrawer')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cartDrawerOverlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('cartDrawerOverlay')) closeCartDrawer();
  });

  document.getElementById('btnHeaderFavorites')?.addEventListener('click', () => {
    if (APP_STATE.favorites.size === 0) {
      showToast('Bộ sưu tập yêu thích đang trống. Hãy thả tim cho tác phẩm bạn yêu thích!', 'info');
    } else {
      filterByFavorites();
    }
  });

  setupImageZoomLens();
  setupOtpDigitInputs();
}

// =============================================================================
// 4. GUEST INTERCEPT SYSTEM (REQUIRE AUTH)
// =============================================================================
function requireAuth(actionDesc, callback, redirectUrl = null) {
  if (APP_STATE.currentUser || localStorage.getItem('artfair_is_logged_in') === 'true') {
    callback();
    return true;
  }

  APP_STATE.pendingIntent = {
    action: actionDesc,
    callback: callback,
    redirectUrl: redirectUrl || window.location.href
  };

  const noticeBox = document.getElementById('guestInterceptNotice');
  const actionText = document.getElementById('interceptActionDesc');
  if (noticeBox && actionText) {
    noticeBox.style.display = 'flex';
    actionText.textContent = `Thao tác "${actionDesc}" yêu cầu đăng nhập tài khoản.`;
  }

  openAuthModal('login');
  showToast(`Vui lòng đăng nhập để thực hiện: ${actionDesc}`, 'warning');
  return false;
}

function executePendingIntent() {
  if (APP_STATE.pendingIntent && typeof APP_STATE.pendingIntent.callback === 'function') {
    const intent = APP_STATE.pendingIntent;
    APP_STATE.pendingIntent = null;
    showToast(`Đã khôi phục thao tác: ${intent.action}`, 'success');
    setTimeout(() => intent.callback(), 350);
  }
}

// =============================================================================
// 5. AUTHENTICATION LOGIC
// =============================================================================
function openAuthModal(defaultTab = 'login') {
  const modal = document.getElementById('authModalOverlay');
  if (modal) modal.classList.add('active');
  switchAuthTab(defaultTab);
}

function closeAuthModal() {
  const modal = document.getElementById('authModalOverlay');
  if (modal) modal.classList.remove('active');
  const notice = document.getElementById('guestInterceptNotice');
  if (notice) notice.style.display = 'none';
}

function switchAuthTab(tabName) {
  const tabBtnLogin = document.getElementById('tabBtnLogin');
  const tabBtnRegister = document.getElementById('tabBtnRegister');
  const paneLogin = document.getElementById('paneLogin');
  const paneRegister = document.getElementById('paneRegister');
  const paneOtp = document.getElementById('paneOtp');

  tabBtnLogin?.classList.remove('active');
  tabBtnRegister?.classList.remove('active');
  paneLogin?.classList.remove('active');
  paneRegister?.classList.remove('active');
  paneOtp?.classList.remove('active');

  if (tabName === 'login') {
    tabBtnLogin?.classList.add('active');
    paneLogin?.classList.add('active');
  } else if (tabName === 'register') {
    tabBtnRegister?.classList.add('active');
    paneRegister?.classList.add('active');
  } else if (tabName === 'otp') {
    paneOtp?.classList.add('active');
    startOtpCountdown();
    setTimeout(() => {
      document.querySelector('.otp-digit-input')?.focus();
    }, 150);
  }
}

function togglePasswordVisibility(fieldId) {
  const input = document.getElementById(fieldId);
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail')?.value.trim() || 'user@artfair.vn';
  loginUserSuccess({
    name: email.split('@')[0] || 'Nghệ Sĩ Trẻ',
    email: email,
    role: 'creator',
    roleLabel: 'Họa Sĩ / Designer Pro',
    avatar: '2e72c41b49afad2d08530b6a0475ba66.jpg'
  });
}

function handleRegisterSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('regFullName')?.value.trim() || 'Thành Viên Mới';
  const email = document.getElementById('regEmail')?.value.trim() || 'user@artfair.vn';
  const role = document.getElementById('regRole')?.value || 'collector';

  const otpTarget = document.getElementById('otpTargetEmail');
  if (otpTarget) otpTarget.textContent = email;

  window._pendingRegUser = {
    name: name,
    email: email,
    role: role,
    roleLabel: role === 'artist' ? 'Họa Sĩ Tự Do' : 'Chủ Shop POD',
    avatar: '2e72c41b49afad2d08530b6a0475ba66.jpg'
  };

  switchAuthTab('otp');
  showToast('Mã OTP xác thực 6 số đã được gửi tới email: ' + email, 'info');
}

function setupOtpDigitInputs() {
  const container = document.getElementById('otpDigitsBox');
  if (!container) return;
  const inputs = container.querySelectorAll('.otp-digit-input');

  inputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length > 0 && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
  });
}

function startOtpCountdown() {
  clearInterval(APP_STATE.otpTimerInterval);
  APP_STATE.otpCountdown = 60;
  const timerLabel = document.getElementById('otpTimerVal');
  const resendBtn = document.getElementById('btnResendOtp');
  if (resendBtn) resendBtn.disabled = true;

  APP_STATE.otpTimerInterval = setInterval(() => {
    APP_STATE.otpCountdown--;
    if (timerLabel) {
      const seconds = APP_STATE.otpCountdown < 10 ? `0${APP_STATE.otpCountdown}` : APP_STATE.otpCountdown;
      timerLabel.textContent = `00:${seconds}s`;
    }
    if (APP_STATE.otpCountdown <= 0) {
      clearInterval(APP_STATE.otpTimerInterval);
      if (resendBtn) resendBtn.disabled = false;
      if (timerLabel) timerLabel.textContent = 'Gửi lại mã';
    }
  }, 1000);
}

function resendOtpCode() {
  startOtpCountdown();
  showToast('Đã gửi lại mã xác thực OTP mới đến email của bạn!', 'info');
  document.querySelectorAll('.otp-digit-input').forEach(inp => inp.value = '');
  document.querySelector('.otp-digit-input')?.focus();
}

function verifyOtpCode() {
  const inputs = document.querySelectorAll('.otp-digit-input');
  let enteredCode = '';
  inputs.forEach(inp => enteredCode += inp.value);

  if (enteredCode.length < 6) {
    showToast('Vui lòng nhập đủ 6 chữ số mã OTP!', 'warning');
    return;
  }

  showToast('Xác thực OTP thành công!', 'success');
  const newUser = window._pendingRegUser || {
    name: 'Thành Viên Mới',
    email: 'user@artfair.vn',
    role: 'collector',
    roleLabel: 'Gen Z Collector',
    avatar: '45fbff086b31157aa2e23b94f086bd06.jpg'
  };
  loginUserSuccess(newUser);
}

function handleFacebookLogin() {
  showToast('Chuyển hướng đến cổng đăng nhập Facebook...', 'info');
  setTimeout(() => {
    window.location.href = 'https://www.facebook.com/login';
  }, 800);
}

function quickDemoLogin(type) {
  if (type === 'artist') {
    loginUserSuccess({
      name: 'Minh Trí (Artist)',
      email: 'minhtri.art@artfair.vn',
      role: 'artist',
      roleLabel: 'Họa Sĩ Nổi Bật • Pro Studio',
      avatar: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg'
    });
  } else {
    loginUserSuccess({
      name: 'Hoàng My (POD Shop)',
      email: 'my.streetwear@gmail.com',
      role: 'collector',
      roleLabel: 'Chủ Shop POD Gen Z • Gold Member',
      avatar: '2e72c41b49afad2d08530b6a0475ba66.jpg'
    });
  }
}

function loginUserSuccess(userObj, shouldToast = true) {
  APP_STATE.currentUser = userObj;
  saveLocalStorageSession();

  const guestBox = document.getElementById('guestActions');
  const profileZone = document.getElementById('loggedInProfile');
  if (guestBox) guestBox.style.display = 'none';
  if (profileZone) profileZone.style.display = 'block';

  const nameLbl = document.getElementById('userNameLabel');
  const dropName = document.getElementById('dropdownUserName');
  const dropRole = document.getElementById('dropdownUserRole');
  const userAvatar = document.getElementById('userAvatarImg');

  if (nameLbl) nameLbl.textContent = userObj.name;
  if (dropName) dropName.textContent = userObj.name;
  if (dropRole) dropRole.textContent = userObj.roleLabel;
  if (userObj.avatar && userAvatar) userAvatar.src = userObj.avatar;

  closeAuthModal();
  if (shouldToast) showToast(`Xin chào mừng ${userObj.name} đã đến với ARTFAIR!`, 'success');
  executePendingIntent();
}

function handleUserLogout() {
  APP_STATE.currentUser = null;
  saveLocalStorageSession();
  const guestBox = document.getElementById('guestActions');
  const profileZone = document.getElementById('loggedInProfile');
  const userMenu = document.getElementById('userDropdownMenu');

  if (guestBox) guestBox.style.display = 'flex';
  if (profileZone) profileZone.style.display = 'none';
  if (userMenu) userMenu.classList.remove('show');
  showToast('Bạn đã đăng xuất tài khoản.', 'info');
}

function handleForgotPassword(event) {
  event.preventDefault();
  const email = prompt('Vui lòng nhập email đăng ký tài khoản:', 'demo@artfair.vn');
  if (email) showToast(`Đã gửi hướng dẫn khôi phục mật khẩu đến: ${email}`, 'success');
}

// =============================================================================
// 6. GALLERY RENDERING & FILTERING (ĐỒNG BỘ VNĐ)
// =============================================================================
function initSearchAndFilters() {
  const searchInput = document.getElementById('headerSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      APP_STATE.searchQuery = e.target.value.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = APP_STATE.searchQuery ? 'block' : 'none';
      renderArtworkGallery();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      APP_STATE.searchQuery = '';
      clearBtn.style.display = 'none';
      renderArtworkGallery();
    });
  }

  document.querySelectorAll('.category-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.category-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      APP_STATE.currentCategory = tab.dataset.category;
      renderArtworkGallery();
    });
  });

  document.getElementById('priceFilterSelect')?.addEventListener('change', (e) => {
    APP_STATE.priceRange = e.target.value;
    renderArtworkGallery();
  });

  document.getElementById('licenseTypeSelect')?.addEventListener('change', (e) => {
    APP_STATE.licenseType = e.target.value;
    renderArtworkGallery();
  });

  document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    APP_STATE.sortBy = e.target.value;
    renderArtworkGallery();
  });

  document.getElementById('btnResetFilters')?.addEventListener('click', resetAllFilters);

  document.querySelectorAll('.keyword-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.classList.contains('active')) {
        chip.classList.remove('active');
        APP_STATE.activeKeyword = null;
      } else {
        document.querySelectorAll('.keyword-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        APP_STATE.activeKeyword = chip.dataset.keyword;
      }
      renderArtworkGallery();
    });
  });
}

function resetAllFilters() {
  APP_STATE.searchQuery = '';
  APP_STATE.currentCategory = 'all';
  APP_STATE.priceRange = 'all';
  APP_STATE.licenseType = 'all';
  APP_STATE.sortBy = 'featured';
  APP_STATE.activeKeyword = null;

  const searchInput = document.getElementById('headerSearchInput');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) clearBtn.style.display = 'none';

  document.querySelectorAll('.category-tab-btn').forEach((tab, i) => {
    tab.classList.toggle('active', i === 0);
  });
  document.querySelectorAll('.keyword-chip').forEach(chip => chip.classList.remove('active'));
  if (document.getElementById('priceFilterSelect')) document.getElementById('priceFilterSelect').value = 'all';
  if (document.getElementById('licenseTypeSelect')) document.getElementById('licenseTypeSelect').value = 'all';
  if (document.getElementById('sortSelect')) document.getElementById('sortSelect').value = 'featured';

  renderArtworkGallery();
  showToast('Đã đặt lại bộ lọc về mặc định.', 'info');
}

function filterByCategory(cat) {
  document.querySelectorAll('.category-tab-btn').forEach(tab => {
    if (tab.dataset.category === cat) tab.click();
  });
}

function filterByFavorites() {
  APP_STATE.currentCategory = 'favorites';
  renderArtworkGallery();
}

function getFilteredArtworks() {
  return ARTWORKS_DATABASE.filter(item => {
    if (APP_STATE.currentCategory === 'favorites') {
      if (!APP_STATE.favorites.has(item.id)) return false;
    } else if (APP_STATE.currentCategory !== 'all' && item.category !== APP_STATE.currentCategory) {
      return false;
    }

    if (APP_STATE.searchQuery) {
      const q = APP_STATE.searchQuery;
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchArtist = item.artist.toLowerCase().includes(q);
      const matchTags = item.tags.some(t => t.toLowerCase().includes(q));
      const matchCat = item.categoryName.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchArtist && !matchTags && !matchCat && !matchDesc) return false;
    }

    if (APP_STATE.activeKeyword) {
      const kw = APP_STATE.activeKeyword.toLowerCase();
      if (!item.tags.some(t => t.toLowerCase().includes(kw))) return false;
    }

    const toVND = (p) => (p && p < 10000 ? p * 25000 : (p || 0));
    const bPrice = toVND(item.basePrice);
    const cPrice = toVND(item.commercialPrice || 180);
    const ePrice = toVND(item.extendedPrice || 480);
    const exPrice = toVND(item.exclusivePrice || 1500);

    let targetPrice = bPrice;
    if (APP_STATE.licenseType === 'commercial') targetPrice = cPrice;
    else if (APP_STATE.licenseType === 'extended') targetPrice = ePrice;
    else if (APP_STATE.licenseType === 'exclusive') targetPrice = exPrice;

    if (APP_STATE.priceRange === 'under100') {
      if (APP_STATE.licenseType === 'all') {
        if (bPrice >= 2500000) return false;
      } else {
        if (targetPrice >= 2500000) return false;
      }
    } else if (APP_STATE.priceRange === '100to300') {
      if (APP_STATE.licenseType === 'all') {
        const inRange = (bPrice >= 2500000 && bPrice <= 7500000) || (cPrice >= 2500000 && cPrice <= 7500000);
        if (!inRange) return false;
      } else {
        if (targetPrice < 2500000 || targetPrice > 7500000) return false;
      }
    } else if (APP_STATE.priceRange === '300to1000') {
      if (APP_STATE.licenseType === 'all') {
        const inRange = (cPrice >= 7500000 && cPrice <= 25000000) || (ePrice >= 7500000 && ePrice <= 25000000);
        if (!inRange) return false;
      } else {
        if (targetPrice < 7500000 || targetPrice > 25000000) return false;
      }
    } else if (APP_STATE.priceRange === 'above1000') {
      if (APP_STATE.licenseType === 'all') {
        if (exPrice < 25000000) return false;
      } else {
        if (targetPrice < 25000000) return false;
      }
    }

    return true;
  }).sort((a, b) => {
    const pA = a.basePrice < 10000 ? a.basePrice * 25000 : a.basePrice;
    const pB = b.basePrice < 10000 ? b.basePrice * 25000 : b.basePrice;
    if (APP_STATE.sortBy === 'price-asc') return pA - pB;
    if (APP_STATE.sortBy === 'price-desc') return pB - pA;
    if (APP_STATE.sortBy === 'popular') return b.likes - a.likes;
    if (APP_STATE.sortBy === 'newest') return new Date(b.date) - new Date(a.date);
    return 0;
  });
}

function renderArtworkGallery() {
  const container = document.getElementById('artworkGrid');
  const emptyState = document.getElementById('emptyState');
  const countLabel = document.getElementById('resultsCount');
  if (!container) return;

  const items = getFilteredArtworks();
  if (countLabel) countLabel.textContent = `Hiển thị ${items.length} / ${ARTWORKS_DATABASE.length} tác phẩm`;

  if (items.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = items.map(art => {
    const isLiked = APP_STATE.favorites.has(art.id);
    const tagsHtml = art.tags.slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('');
    const baseVnd = art.basePrice < 10000 ? art.basePrice * 25000 : art.basePrice;
    const formattedPrice = typeof formatVND === 'function' ? formatVND(baseVnd) : baseVnd.toLocaleString('vi-VN') + ' VNĐ';

    return `
      <div class="artwork-card" data-id="${art.id}">
        <div class="card-media-wrapper" role="button" tabindex="0" onclick="openArtworkDetail('${art.id}')" onkeydown="if(event.key==='Enter'||event.key===' ')openArtworkDetail('${art.id}')" aria-label="Xem chi tiết ${art.title}">
          <img src="${art.image}" alt="${art.title} - Tác phẩm của ${art.artist}" class="card-art-img" loading="lazy">
          <div class="card-watermark" aria-hidden="true"></div>
          <span class="card-cat-badge">${art.categoryName}</span>
          <div class="card-quick-actions" onclick="event.stopPropagation()">
            <button class="btn-card-action ${isLiked ? 'liked' : ''}" 
                    title="${isLiked ? 'Bỏ thích' : 'Thả tim'}" 
                    onclick="handleCardHeartClick('${art.id}', this)">
              <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <button class="btn-card-action" title="Xem chi tiết & zoom" onclick="openArtworkDetail('${art.id}')">
              <i class="fa-solid fa-magnifying-glass-plus"></i>
            </button>
          </div>
        </div>

        <div class="card-info-box">
          <div class="card-title-row">
            <h3 class="artwork-card-title">
              <button type="button" class="artwork-card-title-btn" onclick="openArtworkDetail('${art.id}')">${art.title}</button>
            </h3>
            <button type="button" class="artist-micro-row artist-micro-btn" onclick="event.stopPropagation(); navigateToArtistProfile('${art.artist}')">
              <img src="${art.artistAvatar}" alt="Avatar ${art.artist}" class="artist-micro-avatar">
              <span class="artist-micro-name">${art.artist} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.65rem;"></i></span>
            </button>
          </div>

          <div class="card-tags-list">${tagsHtml}</div>

          <div class="card-footer-strip">
            <div class="card-pricing">
              <span class="license-label">Bản quyền từ</span>
              <span class="price-tag">${formattedPrice}</span>
            </div>
            <button class="btn-card-buy" onclick="handleCardBuyNow('${art.id}')">
              <i class="fa-solid fa-bolt"></i> Mua Ngay
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleCardHeartClick(artId, buttonEl) {
  requireAuth('Thả tim lưu vào bộ sưu tập', () => {
    const art = ARTWORKS_DATABASE.find(a => a.id === artId);
    if (!art) return;

    if (APP_STATE.favorites.has(artId)) {
      APP_STATE.favorites.delete(artId);
      art.likes = Math.max(0, art.likes - 1);
      showToast(`Đã bỏ tác phẩm "${art.title}" khỏi mục yêu thích.`, 'info');
    } else {
      APP_STATE.favorites.add(artId);
      art.likes += 1;
      showToast(`Đã thêm "${art.title}" vào mục yêu thích!`, 'success');
    }

    updateHeaderCounters();
    renderArtworkGallery();
  });
}

function handleCardBuyNow(artId) {
  requireAuth('Mua bản quyền tác phẩm', () => {
    openArtworkDetail(artId);
  });
}

function handleFollowArtist(artistName) {
  requireAuth(`Theo dõi nghệ sĩ ${artistName}`, () => {
    showToast(`Bạn đã theo dõi thành công gian hàng của ${artistName}!`, 'success');
  });
}

function handleCommissionRequestBtn(preselectedArtist = null) {
  const section = document.getElementById('commission-section');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

function initHomeCommissionSection() {
  const deadlineInput = document.getElementById('homeCommDeadline');
  if (deadlineInput) {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    deadlineInput.value = d.toISOString().split('T')[0];
  }
}

function goToSelectedArtistProfile() {
  const artistSlug = document.getElementById('homeCommArtistSelect')?.value || 'lanchi';
  navigateToArtistProfile(artistSlug);
}

// =============================================================================
// 8. ARTWORK DETAIL MODAL WITH WATERMARK TOGGLE & ZOOM
// =============================================================================
function openArtworkDetail(artId) {
  const art = ARTWORKS_DATABASE.find(a => a.id === artId);
  if (!art) return;

  APP_STATE.selectedArtwork = art;
  APP_STATE.selectedDetailTier = 'personal';

  const modalImg = document.getElementById('modalArtImg');
  if (modalImg) {
    modalImg.src = art.image;
    modalImg.alt = `Tác phẩm ${art.title} bởi ${art.artist}`;
  }

  document.getElementById('modalArtTitle').textContent = art.title;
  document.getElementById('modalArtCategory').textContent = art.categoryName;
  document.getElementById('modalArtId').textContent = `ID: #${art.id}`;
  document.getElementById('modalArtLikes').innerHTML = `<i class="fa-solid fa-heart text-danger"></i> ${art.likes} lượt thích`;
  document.getElementById('modalArtistName').textContent = art.artist;
  document.getElementById('modalArtistAvatar').src = art.artistAvatar;
  document.getElementById('modalArtResolution').textContent = art.dimensions;
  document.getElementById('modalArtFormats').textContent = art.formats;
  document.getElementById('modalArtUsage').textContent = art.usage;
  document.getElementById('modalArtSoftware').textContent = art.software;
  document.getElementById('modalArtDesc').textContent = art.description;

  const pPersonal = document.getElementById('modalPricePersonal');
  const pCommercial = document.getElementById('modalPriceCommercialSmall') || document.getElementById('modalPriceCommercial');
  const pExtended = document.getElementById('modalPriceCommercialExt') || document.getElementById('modalPriceExtended');
  const pExclusive = document.getElementById('modalPriceExclusive');

  const baseVND = art.basePrice < 10000 ? art.basePrice * 25000 : art.basePrice;
  const commVND = (art.commercialPrice && art.commercialPrice < 10000) ? art.commercialPrice * 25000 : (art.commercialPrice || 4500000);
  const extVND = (art.extendedPrice && art.extendedPrice < 10000) ? art.extendedPrice * 25000 : (art.extendedPrice || 12000000);
  const exclVND = (art.exclusivePrice && art.exclusivePrice < 10000) ? art.exclusivePrice * 25000 : (art.exclusivePrice || 37500000);

  if (pPersonal) pPersonal.textContent = typeof formatVND === 'function' ? formatVND(baseVND) : baseVND.toLocaleString('vi-VN') + ' VNĐ';
  if (pCommercial) pCommercial.textContent = typeof formatVND === 'function' ? formatVND(commVND) : commVND.toLocaleString('vi-VN') + ' VNĐ';
  if (pExtended) pExtended.textContent = typeof formatVND === 'function' ? formatVND(extVND) : extVND.toLocaleString('vi-VN') + ' VNĐ';
  if (pExclusive) pExclusive.textContent = typeof formatVND === 'function' ? formatVND(exclVND) : exclVND.toLocaleString('vi-VN') + ' VNĐ';

  const tierRadios = document.querySelectorAll('input[name="modalSelectedTier"]');
  tierRadios.forEach(r => {
    r.checked = r.value === 'personal';
  });

  const isLiked = APP_STATE.favorites.has(art.id);
  const heartBtn = document.getElementById('btnModalToggleHeart');
  const heartText = document.getElementById('modalHeartBtnText');
  if (heartBtn && heartText) {
    heartBtn.classList.toggle('liked', isLiked);
    heartText.textContent = isLiked ? 'Đã Thích' : 'Thả Tim';
    heartBtn.querySelector('i').className = isLiked ? 'fa-solid fa-heart text-danger' : 'fa-regular fa-heart';
  }

  updateModalPrice();
  document.getElementById('artworkDetailModalOverlay').classList.add('active');
}

function updateModalPrice() {
  const art = APP_STATE.selectedArtwork;
  if (!art) return;

  const selectedTierRadio = document.querySelector('input[name="modalSelectedTier"]:checked');
  const tier = selectedTierRadio ? selectedTierRadio.value : 'personal';
  APP_STATE.selectedDetailTier = tier;

  document.querySelectorAll('.modal-tier-radio, .license-card-option').forEach(r => {
    const radioInput = r.querySelector('input');
    r.classList.toggle('active', radioInput ? radioInput.checked : false);
  });

  const baseVND = art.basePrice < 10000 ? art.basePrice * 25000 : art.basePrice;
  let finalPrice = baseVND;

  if (tier === 'commercial_small' || tier === 'commercial') {
    finalPrice = (art.commercialPrice && art.commercialPrice < 10000) ? art.commercialPrice * 25000 : (art.commercialPrice || 4500000);
  } else if (tier === 'commercial_ext' || tier === 'extended') {
    finalPrice = (art.extendedPrice && art.extendedPrice < 10000) ? art.extendedPrice * 25000 : (art.extendedPrice || 12000000);
  } else if (tier === 'exclusive') {
    finalPrice = (art.exclusivePrice && art.exclusivePrice < 10000) ? art.exclusivePrice * 25000 : (art.exclusivePrice || 37500000);
  }

  const finalPriceEl = document.getElementById('modalFinalPrice');
  if (finalPriceEl) {
    finalPriceEl.textContent = typeof formatVND === 'function' ? formatVND(finalPrice) : finalPrice.toLocaleString('vi-VN') + ' VNĐ';
  }
}

function toggleWatermarkPreview(showWatermark) {
  const layer = document.getElementById('modalWatermarkLayer');
  if (layer) layer.style.opacity = showWatermark ? '1' : '0.08';
}

function setupImageZoomLens() {
  const viewport = document.getElementById('detailImgViewport');
  const img = document.getElementById('modalArtImg');
  if (!viewport || !img) return;

  viewport.addEventListener('mousemove', (e) => {
    const rect = viewport.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    img.style.transformOrigin = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
    img.style.transform = 'scale(2.2)';
  });

  viewport.addEventListener('mouseleave', () => {
    img.style.transformOrigin = 'center center';
    img.style.transform = 'scale(1)';
  });
}

function toggleFullscreenArtPreview() {
  const img = document.getElementById('modalArtImg');
  if (!img) return;
  if (img.requestFullscreen) img.requestFullscreen();
  else window.open(img.src, '_blank');
}

function handleModalLike() {
  if (!APP_STATE.selectedArtwork) return;
  handleCardHeartClick(APP_STATE.selectedArtwork.id, null);
}

function handleModalAddToCart() {
  const art = APP_STATE.selectedArtwork;
  if (!art) return;

  requireAuth('Thêm bản quyền vào giỏ hàng', () => {
    const baseVND = art.basePrice < 10000 ? art.basePrice * 25000 : art.basePrice;
    let price = baseVND;
    let tierLabel = 'Cá Nhân';

    if (APP_STATE.selectedDetailTier === 'commercial_small' || APP_STATE.selectedDetailTier === 'commercial') {
      price = (art.commercialPrice && art.commercialPrice < 10000) ? art.commercialPrice * 25000 : (art.commercialPrice || 4500000);
      tierLabel = 'Thương Mại POD Nhỏ';
    } else if (APP_STATE.selectedDetailTier === 'commercial_ext' || APP_STATE.selectedDetailTier === 'extended') {
      price = (art.extendedPrice && art.extendedPrice < 10000) ? art.extendedPrice * 25000 : (art.extendedPrice || 12000000);
      tierLabel = 'POD Toàn Cầu Mở Rộng';
    } else if (APP_STATE.selectedDetailTier === 'exclusive') {
      price = (art.exclusivePrice && art.exclusivePrice < 10000) ? art.exclusivePrice * 25000 : (art.exclusivePrice || 37500000);
      tierLabel = 'Độc Quyền Full Buyout';
    }

    APP_STATE.cart.push({
      id: 'CART-' + Date.now(),
      artId: art.id,
      title: art.title,
      artist: art.artist,
      image: art.image,
      tier: APP_STATE.selectedDetailTier,
      tierLabel: tierLabel,
      price: price
    });

    updateHeaderCounters();
    showToast(`Đã thêm "${art.title}" (${tierLabel}) vào giỏ hàng!`, 'success');
    openCartDrawer();
  });
}

function handleModalBuyNow() {
  handleModalAddToCart();
  closeArtworkDetailModal();
}

function closeArtworkDetailModal() {
  document.getElementById('artworkDetailModalOverlay')?.classList.remove('active');
}

// =============================================================================
// 9. SMART LICENSE CALCULATOR SECTION (ĐỒNG BỘ VNĐ)
// =============================================================================
function initCalculator() {
  const tierRadios = document.querySelectorAll('input[name="calcTier"]');
  tierRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.tier-radio-card').forEach(c => c.classList.remove('active'));
      radio.closest('.tier-radio-card')?.classList.add('active');
      calculateLicensePrice();
    });
  });

  document.querySelectorAll('.addon-checkbox-label input').forEach(chk => {
    chk.addEventListener('change', calculateLicensePrice);
  });

  calculateLicensePrice();
}

function calculateLicensePrice() {
  const selectedTier = document.querySelector('input[name="calcTier"]:checked');
  const basePrice = selectedTier ? parseInt(selectedTier.value, 10) : 1250000;

  let addonsFee = 0;
  document.querySelectorAll('.addon-checkbox-label input:checked').forEach(chk => {
    addonsFee += parseInt(chk.value, 10);
  });

  const totalVnd = basePrice + addonsFee;

  const baseDisp = document.getElementById('calcBasePriceDisplay');
  const addonDisp = document.getElementById('calcAddonsDisplay');
  const totalDisp = document.getElementById('calcTotalUsd');

  if (baseDisp) baseDisp.textContent = typeof formatVND === 'function' ? formatVND(basePrice) : basePrice.toLocaleString('vi-VN') + ' VNĐ';
  if (addonDisp) addonDisp.textContent = '+' + (typeof formatVND === 'function' ? formatVND(addonsFee) : addonsFee.toLocaleString('vi-VN') + ' VNĐ');
  if (totalDisp) totalDisp.textContent = typeof formatVND === 'function' ? formatVND(totalVnd) : totalVnd.toLocaleString('vi-VN') + ' VNĐ';
}

// =============================================================================
// 10. COMMISSION BOOKING LOGIC & SIMULATED UPLOAD
// =============================================================================
function initDropzone() {
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('dummyFileInput');
  const fileList = document.getElementById('uploadedFilesList');

  const deadlineInput = document.getElementById('commDeadline');
  if (deadlineInput) {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    deadlineInput.value = d.toISOString().split('T')[0];
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#ef4444'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = '#e2e8f0'; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#e2e8f0';
      handleDummyFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => handleDummyFiles(fileInput.files));
  }

  function handleDummyFiles(files) {
    if (!files || files.length === 0 || !fileList) return;
    for (let i = 0; i < files.length; i++) {
      const chip = document.createElement('span');
      chip.className = 'uploaded-chip';
      chip.innerHTML = `<i class="fa-solid fa-file-image"></i> ${files[i].name} <i class="fa-solid fa-xmark text-danger" style="cursor:pointer;" onclick="this.parentElement.remove()"></i>`;
      fileList.appendChild(chip);
    }
    showToast(`Đã tải lên ${files.length} tệp tham khảo!`, 'info');
  }
}

function closeCommissionSuccessModal() {
  document.getElementById('commissionSuccessModal')?.classList.remove('active');
}

// =============================================================================
// 11. SHOPPING CART DRAWER (ĐỒNG BỘ VNĐ)
// =============================================================================
function openCartDrawer() {
  renderCartDrawer();
  const drawer = document.getElementById('cartDrawerOverlay');
  if (drawer) {
    drawer.style.display = 'block';
    drawer.classList.add('active', 'open');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawerOverlay');
  if (drawer) {
    drawer.style.display = 'none';
    drawer.classList.remove('active', 'open');
  }
}

function renderCartDrawer() {
  const container = document.getElementById('cartItemsContainer');
  const countBadge = document.getElementById('cartDrawerCount');
  const subtotalLabel = document.getElementById('cartSubtotal');
  const discountLabel = document.getElementById('cartDiscount');
  const discountLine = document.getElementById('discountLine');
  const grandTotalLabel = document.getElementById('cartGrandTotal');

  if (countBadge) countBadge.textContent = APP_STATE.cart.length;

  if (APP_STATE.cart.length === 0) {
    if (container) {
      container.innerHTML = `
        <div class="empty-state-card" style="padding: 40px 10px; text-align: center; color: #64748b;">
          <i class="fa-solid fa-bag-shopping" style="font-size: 2.8rem; color: #cbd5e1; margin-bottom: 12px;"></i>
          <h4>Giỏ hàng của bạn đang trống</h4>
          <p>Khám phá chợ phiên và chọn gói bản quyền phù hợp.</p>
          <button class="btn btn-outline btn-sm" onclick="closeCartDrawer()">Tiếp tục xem tranh</button>
        </div>
      `;
    }
    if (subtotalLabel) subtotalLabel.textContent = '0 VNĐ';
    if (discountLine) discountLine.style.display = 'none';
    if (grandTotalLabel) grandTotalLabel.textContent = '0 VNĐ';
    return;
  }

  let subtotal = 0;
  if (container) {
    container.innerHTML = APP_STATE.cart.map((item, index) => {
      const itemPrice = (Number(item.price) < 10000) ? Number(item.price) * 25000 : Number(item.price);
      subtotal += itemPrice;
      const formattedPrice = typeof formatVND === 'function' ? formatVND(itemPrice) : itemPrice.toLocaleString('vi-VN') + ' VNĐ';

      return `
        <div class="cart-item-row" style="display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #f1f5f9; align-items:center;">
          <img src="${item.image || item.img}" alt="${item.title}" style="width:55px; height:55px; border-radius:10px; object-fit:cover;">
          <div class="cart-item-info" style="flex:1;">
            <h4 style="margin:0; font-size:0.88rem; color:#0f172a;">${item.title}</h4>
            <p style="margin:2px 0; font-size:0.75rem; color:#64748b;">${item.artist}</p>
            <span style="font-size:0.72rem; color:#ef4444; font-weight:700;">${item.tierLabel || item.tier}</span>
            <div style="font-weight:800; color:#ef4444; font-size:0.9rem; margin-top:2px;">${formattedPrice}</div>
          </div>
          <button class="cart-item-remove" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:1.2rem;" onclick="removeCartItem(${index})">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  const formattedSubtotal = typeof formatVND === 'function' ? formatVND(subtotal) : subtotal.toLocaleString('vi-VN') + ' VNĐ';
  if (subtotalLabel) subtotalLabel.textContent = formattedSubtotal;

  const discount = Math.round(subtotal * APP_STATE.discountRate);
  if (discount > 0) {
    if (discountLine) discountLine.style.display = 'flex';
    if (discountLabel) discountLabel.textContent = `-${typeof formatVND === 'function' ? formatVND(discount) : discount.toLocaleString('vi-VN') + ' VNĐ'} (${APP_STATE.discountRate * 100}%)`;
  } else {
    if (discountLine) discountLine.style.display = 'none';
  }

  const grandTotal = Math.max(0, subtotal - discount);
  const formattedGrand = typeof formatVND === 'function' ? formatVND(grandTotal) : grandTotal.toLocaleString('vi-VN') + ' VNĐ';
  if (grandTotalLabel) grandTotalLabel.textContent = formattedGrand;
}

function removeCartItem(index) {
  APP_STATE.cart.splice(index, 1);
  saveLocalStorageSession();
  updateHeaderCounters();
  renderCartDrawer();
  showToast('Đã xóa mục khỏi giỏ hàng.', 'info');
}

function applyCouponCode() {
  const input = document.getElementById('couponInput');
  const msg = document.getElementById('couponMessage');
  if (!input || !msg) return;
  const code = input.value.trim().toUpperCase();

  if (code === 'GENZART' || code === 'ARTFAIR2026') {
    APP_STATE.discountRate = 0.15;
    APP_STATE.appliedCoupon = code;
    msg.className = 'coupon-status-msg success';
    msg.textContent = `Áp dụng thành công mã ${code}! Giảm 15% tổng đơn.`;
    renderCartDrawer();
  } else if (!code) {
    msg.className = 'coupon-status-msg error';
    msg.textContent = 'Vui lòng nhập mã giảm giá!';
  } else {
    msg.className = 'coupon-status-msg error';
    msg.textContent = 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
  }
}

function updateHeaderCounters() {
  const favBadge = document.getElementById('favoritesCountBadge');
  const cartBadge = document.getElementById('cartCountBadge');
  if (favBadge) favBadge.textContent = APP_STATE.favorites.size;
  if (cartBadge) cartBadge.textContent = APP_STATE.cart.length;
}

// =============================================================================
// 12. TOAST NOTIFICATIONS & EXTRAS
// =============================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-card ${type}`;

  let icon = 'fa-solid fa-circle-info';
  if (type === 'success') icon = 'fa-solid fa-circle-check';
  if (type === 'warning') icon = 'fa-solid fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="${icon} toast-icon"></i>
    <span class="toast-msg">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function handleNewsletter(e) {
  e.preventDefault();
  const emailInput = e.target.querySelector('input');
  if (emailInput) {
    showToast(`Cảm ơn bạn! Đã gửi voucher 15% vào email: ${emailInput.value}`, 'success');
    emailInput.value = '';
  }
}

function showTermsModal(type) {
  let title = 'Chính Sách Bản Quyền ARTFAIR';
  let content = 'Tất cả tác phẩm trên ARTFAIR đều được xác thực quyền tác giả theo luật sở hữu trí tuệ. Người mua nhận giấy phép thương mại điện tử hợp pháp.';
  if (type === 'privacy') {
    title = 'Chính Sách Bảo Mật';
    content = 'Thông tin thanh toán và sáng tạo của bạn được mã hóa an toàn 256-bit.';
  } else if (type === 'guarantee') {
    title = 'Cam Kết Hoàn Tiền';
    content = 'Hoàn tiền 100% trong 48 giờ nếu file gốc bị lỗi hoặc artist không bàn giao đúng thời hạn.';
  }
  alert(`${title}\n\n${content}`);
}