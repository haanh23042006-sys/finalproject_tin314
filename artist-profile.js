/**
 * ARTFAIR - Artist Profile Page Logic (artist-profile.js)
 * Manages URL parameter loading, dynamic profile rendering,
 * artist shop filtering, dedicated commission hub, reviews,
 * guest intercept, and copyright image protection.
 */

// =============================================================================
// 1. STATE MANAGEMENT
// =============================================================================
const PROFILE_STATE = {
  currentArtistId: 'lanchi',
  currentArtist: null,
  activeTab: 'gallery',
  
  // Gallery Sub-filters
  shopCategory: 'all',
  shopSort: 'newest',
  shopSearch: '',
  
  // User Session & Intercept
  currentUser: null,
  pendingIntent: null,
  cart: [],
  favorites: new Set(),
  
  // Selected Artwork for Detail modal
  selectedArt: null,
  selectedDetailTier: 'personal',
  
  // Reviews filter
  reviewFilter: 'all'
};

// =============================================================================
// 2. INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSharedSession();
  parseUrlAndLoadArtist();
  setupImageProtection();
  initProfileUI();
  updateHeaderCounters();
});

// Load user session from localStorage if exists
function loadSharedSession() {
  try {
    const savedUser = localStorage.getItem('artfair_user');
    if (savedUser) {
      PROFILE_STATE.currentUser = JSON.parse(savedUser);
      applyUserHeaderUI(PROFILE_STATE.currentUser);
    }
    const savedCart = localStorage.getItem('artfair_cart');
    if (savedCart) {
      PROFILE_STATE.cart = JSON.parse(savedCart);
    }
    const savedFavs = localStorage.getItem('artfair_favs');
    if (savedFavs) {
      PROFILE_STATE.favorites = new Set(JSON.parse(savedFavs));
    }
  } catch (e) {
    console.warn('Session loading fallback', e);
  }
}

function saveSharedSession() {
  try {
    if (PROFILE_STATE.currentUser) {
      localStorage.setItem('artfair_user', JSON.stringify(PROFILE_STATE.currentUser));
    } else {
      localStorage.removeItem('artfair_user');
    }
    localStorage.setItem('artfair_cart', JSON.stringify(PROFILE_STATE.cart));
    localStorage.setItem('artfair_favs', JSON.stringify([...PROFILE_STATE.favorites]));
  } catch (e) {
    console.warn('Session save error', e);
  }
}

// =============================================================================
// 3. URL PARAMETER PARSING & ARTIST DATA LOADING
// =============================================================================
function parseUrlAndLoadArtist() {
  const urlParams = new URLSearchParams(window.location.search);
  let artistId = urlParams.get('id');

  if (!artistId || !ARTISTS_DATA[artistId]) {
    // If not found by direct ID, check if it's a name query
    if (artistId) {
      artistId = getArtistSlugByName(artistId);
    } else {
      artistId = 'lanchi'; // Default top featured artist
    }
  }

  PROFILE_STATE.currentArtistId = artistId;
  PROFILE_STATE.currentArtist = ARTISTS_DATA[artistId];

  renderArtistProfileHeader(PROFILE_STATE.currentArtist);
  renderArtistGallery();
  renderCommissionHub(PROFILE_STATE.currentArtist);
  renderReviewsHub(PROFILE_STATE.currentArtist);

  // Set default deadline date
  const deadlineInput = document.getElementById('directDeadline');
  if (deadlineInput) {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    deadlineInput.value = d.toISOString().split('T')[0];
  }
}

// =============================================================================
// 4. RENDER HEADER PROFILE & STATS BAR
// =============================================================================
function renderArtistProfileHeader(artist) {
  if (!artist) return;

  // Title and Breadcrumb
  document.title = `${artist.name} - Gian Hàng Nghệ Sĩ ARTFAIR`;
  document.getElementById('breadcrumbArtistName').textContent = artist.name;

  // Cover & Avatar
  document.getElementById('artistCoverImg').src = artist.coverImage;
  document.getElementById('artistAvatarImg').src = artist.avatar;

  // Names & Title
  document.getElementById('artistFullName').textContent = artist.name;
  document.getElementById('artistBadgeTag').innerHTML = `<i class="fa-solid fa-award"></i> ${artist.badgeLabel}`;
  document.getElementById('artistRoleTitle').textContent = artist.roleTitle;
  document.getElementById('artistBioText').textContent = `"${artist.bio}"`;

  // Status
  const statusPill = document.getElementById('artistStatusPill');
  const statusLabel = document.getElementById('artistStatusLabel');
  if (artist.status === 'accepting') {
    statusPill.className = 'artist-status-pill accepting';
    statusLabel.textContent = artist.statusText;
  } else {
    statusPill.className = 'artist-status-pill busy';
    statusLabel.textContent = 'Đã kín lịch trong tháng';
  }

  // Meta info
  document.getElementById('artistLocation').textContent = artist.location;
  document.getElementById('artistJoinDate').textContent = artist.joinedDate;
  document.getElementById('artistFollowersCount').textContent = artist.followersCount;

  // Specialties
  const specialtiesContainer = document.getElementById('artistSpecialties');
  specialtiesContainer.innerHTML = artist.specialties.map(spec => `
    <span class="specialty-chip"><i class="fa-solid fa-sparkles"></i> ${spec}</span>
  `).join('');

  // Stats bar
  document.getElementById('statRatingVal').textContent = artist.rating.toFixed(2);
  document.getElementById('statReviewCount').textContent = artist.reviewsCount;
  document.getElementById('statResponseRate').textContent = artist.responseRate;
  document.getElementById('statResponseTime').textContent = artist.responseTime;
  document.getElementById('statSoldVal').textContent = artist.artworksSold;

  // Update commission form headers
  document.getElementById('commArtistNameHeading').textContent = artist.shortName;
  document.getElementById('formBriefTitle').textContent = `Gửi Yêu Cầu Commission Cho ${artist.name}`;
  document.getElementById('submitBtnArtistName').textContent = artist.shortName;
}

// =============================================================================
// 5. TAB 1: KHO TRANH TÁC GIẢ (ARTIST GALLERY / SHOP)
// =============================================================================
// Get artworks made by this artist (or matching related styles)
function getArtistArtworks() {
  const currentArtist = PROFILE_STATE.currentArtist;
  if (!currentArtist) return [];

  // Match artworks by artist name
  return ARTWORKS_DATABASE.filter(art => {
    const artArtistClean = art.artist.toLowerCase();
    const currNameClean = currentArtist.name.toLowerCase();
    const currShortClean = currentArtist.shortName.toLowerCase();

    const isMatch = artArtistClean.includes(currShortClean) || currNameClean.includes(artArtistClean);

    // If matching, apply subfilters
    if (!isMatch) return false;

    if (PROFILE_STATE.shopCategory !== 'all' && art.category !== PROFILE_STATE.shopCategory) {
      return false;
    }

    if (PROFILE_STATE.shopSearch) {
      const q = PROFILE_STATE.shopSearch.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchTags = art.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTags) return false;
    }

    return true;
  }).sort((a, b) => {
    if (PROFILE_STATE.shopSort === 'price-asc') return a.basePrice - b.basePrice;
    if (PROFILE_STATE.shopSort === 'price-desc') return b.exclusivePrice - a.exclusivePrice;
    if (PROFILE_STATE.shopSort === 'popular') return b.likes - a.likes;
    return new Date(b.date) - new Date(a.date); // newest
  });
}

function renderArtistGallery() {
  const grid = document.getElementById('artistArtworkGrid');
  const emptyBox = document.getElementById('artistGalleryEmpty');
  const countBadge = document.getElementById('tabGalleryCount');

  const items = getArtistArtworks();
  countBadge.textContent = items.length;

  if (items.length === 0) {
    grid.innerHTML = '';
    emptyBox.style.display = 'block';
    return;
  }

  emptyBox.style.display = 'none';

  grid.innerHTML = items.map(art => {
    const isLiked = PROFILE_STATE.favorites.has(art.id);
    const tagsHtml = art.tags.slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('');

    return `
      <div class="artwork-card" data-id="${art.id}">
        <div class="card-media-wrapper" onclick="openDetailModal('${art.id}')">
          <img src="${art.image}" alt="${art.title}" class="card-art-img" loading="lazy">
          <div class="card-watermark"></div>
          <span class="card-cat-badge">${art.categoryName}</span>
          
          <div class="card-quick-actions" onclick="event.stopPropagation()">
            <button class="btn-card-action ${isLiked ? 'liked' : ''}" 
                    title="${isLiked ? 'Bỏ thích' : 'Thả tim'}" 
                    onclick="handleArtistCardHeart('${art.id}', this)">
              <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <button class="btn-card-action" title="Xem chi tiết & zoom" onclick="openDetailModal('${art.id}')">
              <i class="fa-solid fa-magnifying-glass-plus"></i>
            </button>
          </div>
        </div>

        <div class="card-info-box">
          <div class="card-title-row">
            <h3 class="artwork-card-title" onclick="openDetailModal('${art.id}')">${art.title}</h3>
            <div class="artist-micro-row">
              <img src="${art.artistAvatar}" alt="${art.artist}" class="artist-micro-avatar">
              <span class="artist-micro-name">${art.artist}</span>
            </div>
          </div>

          <div class="card-tags-list">
            ${tagsHtml}
          </div>

          <div class="card-footer-strip">
            <div class="card-pricing">
              <span class="license-label">Bản quyền từ</span>
              <span class="price-tag">$${art.basePrice}</span>
            </div>
            <button class="btn-card-buy" onclick="handleArtistCardBuy('${art.id}')">
              <i class="fa-solid fa-bolt"></i> Mua Ngay
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterArtistShop(cat) {
  PROFILE_STATE.shopCategory = cat;
  document.querySelectorAll('.shop-filter-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.shopcat === cat);
  });
  renderArtistGallery();
}

function sortArtistShop(sortVal) {
  PROFILE_STATE.shopSort = sortVal;
  renderArtistGallery();
}

// Search in artist shop
document.addEventListener('DOMContentLoaded', () => {
  const shopSearch = document.getElementById('artistSearchInput');
  const clearBtn = document.getElementById('artistSearchClearBtn');

  if (shopSearch) {
    shopSearch.addEventListener('input', (e) => {
      PROFILE_STATE.shopSearch = e.target.value.trim();
      clearBtn.style.display = PROFILE_STATE.shopSearch ? 'block' : 'none';
      renderArtistGallery();
    });

    clearBtn.addEventListener('click', () => {
      shopSearch.value = '';
      PROFILE_STATE.shopSearch = '';
      clearBtn.style.display = 'none';
      renderArtistGallery();
    });
  }
});

// =============================================================================
// 6. TAB 2: GÓC COMMISSION & ĐẶT VẼ RIÊNG (DEDICATED COMMISSION HUB)
// =============================================================================
function renderCommissionHub(artist) {
  if (!artist) return;

  const pkgGrid = document.getElementById('commissionPackagesGrid');
  const pkgSelect = document.getElementById('directSelectedPackage');

  if (!pkgGrid || !pkgSelect) return;

  // Render Packages Cards
  pkgGrid.innerHTML = artist.commissionPackages.map(pkg => `
    <div class="commission-package-card ${pkg.popular ? 'popular' : ''}">
      ${pkg.popular ? '<div class="popular-ribbon"><i class="fa-solid fa-fire"></i> Lựa Chọn Phổ Biến</div>' : ''}
      <div class="package-header">
        <span class="package-badge">${pkg.badge}</span>
        <h4 class="package-title">${pkg.title}</h4>
        <div class="package-price-row">
          <span class="pkg-price">$${pkg.price}</span>
          <span class="pkg-unit">USD / tác phẩm</span>
        </div>
      </div>

      <div class="package-specs-strip">
        <span><i class="fa-regular fa-clock"></i> Bàn giao: ${pkg.deliveryDays} ngày</span>
        <span><i class="fa-solid fa-rotate-left"></i> Chỉnh sửa: ${pkg.revisions} lần</span>
      </div>

      <ul class="package-features-list">
        ${pkg.features.map(f => `<li><i class="fa-solid fa-circle-check text-mint"></i> ${f}</li>`).join('')}
      </ul>

      <button class="btn ${pkg.popular ? 'btn-primary' : 'btn-outline'} w-100 mt-auto" onclick="selectCommissionPackage('${pkg.id}', '${pkg.title}', ${pkg.price})">
        <i class="fa-solid fa-handshake-angle"></i> Chọn Gói Này & Điền Brief
      </button>
    </div>
  `).join('');

  // Populate Select options
  pkgSelect.innerHTML = artist.commissionPackages.map(pkg => `
    <option value="${pkg.id}" data-price="${pkg.price}">${pkg.title} - $${pkg.price} USD</option>
  `).join('') + `<option value="custom">Tùy chỉnh linh hoạt theo ngân sách riêng</option>`;
}

// When customer clicks "Chọn Gói Này & Điền Brief"
function selectCommissionPackage(pkgId, pkgTitle, pkgPrice) {
  const pkgSelect = document.getElementById('directSelectedPackage');
  if (pkgSelect) pkgSelect.value = pkgId;

  // Update slider to matching price
  updateDirectSlider(pkgPrice);

  // Fill project title suggestion
  const titleInput = document.getElementById('directProjectTitle');
  if (titleInput && !titleInput.value) {
    titleInput.value = `[${pkgTitle}] Yêu cầu sáng tác mới`;
  }

  // Smooth scroll to form
  const formBox = document.getElementById('artistBriefBox');
  if (formBox) {
    formBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Đã chọn gói: ${pkgTitle} ($${pkgPrice} USD). Hãy hoàn thiện thông tin ý tưởng bên dưới.`, 'success');
  }
}

function handlePackageSelectChange(val) {
  const select = document.getElementById('directSelectedPackage');
  const selectedOpt = select.options[select.selectedIndex];
  const price = selectedOpt.dataset.price;
  if (price) {
    updateDirectSlider(parseInt(price, 10));
  }
}

function updateDirectSlider(val) {
  const slider = document.getElementById('directBudgetSlider');
  const valDisplay = document.getElementById('directSliderVal');
  const vndDisplay = document.getElementById('directSliderVnd');

  if (slider) slider.value = val;
  if (valDisplay) valDisplay.textContent = `$${parseInt(val, 10).toLocaleString()} USD`;

  const vnd = parseInt(val, 10) * 25400;
  if (vndDisplay) vndDisplay.textContent = `(~ ${vnd.toLocaleString('vi-VN')} VNĐ)`;
}

// Handle Direct Commission Brief Submission with Guest Intercept
function handleDirectCommissionSubmit(event) {
  event.preventDefault();

  const artist = PROFILE_STATE.currentArtist;
  const projectTitle = document.getElementById('directProjectTitle').value.trim();
  const pkgName = document.getElementById('directSelectedPackage').options[document.getElementById('directSelectedPackage').selectedIndex].text;
  const budget = document.getElementById('directBudgetSlider').value;
  const deadline = document.getElementById('directDeadline').value;
  const rights = document.getElementById('directUsageRights').options[document.getElementById('directUsageRights').selectedIndex].text;
  const desc = document.getElementById('directDescription').value.trim();

  // Guest Intercept check
  requireProfileAuth(`Gửi yêu cầu Commission cho ${artist.name}`, () => {
    const ticketId = 'COMM-' + Math.floor(1000 + Math.random() * 9000);

    // Show Confirmation Modal
    document.getElementById('directConfirmTicketId').textContent = '#' + ticketId;
    document.getElementById('directConfirmSummaryBox').innerHTML = `
      <p><strong>Nghệ sĩ nhận:</strong> ${artist.name}</p>
      <p><strong>Tiêu đề dự án:</strong> ${projectTitle}</p>
      <p><strong>Gói dịch vụ:</strong> ${pkgName}</p>
      <p><strong>Ngân sách đầu tư:</strong> $${budget} USD (~ ${(budget * 25400).toLocaleString('vi-VN')} VNĐ)</p>
      <p><strong>Thời hạn bàn giao:</strong> ${deadline}</p>
      <p><strong>Cấp độ bản quyền:</strong> ${rights}</p>
      <p><strong>Ghi chú ý tưởng:</strong> "${desc.substring(0, 90)}..."</p>
    `;

    document.getElementById('directCommissionSuccessModal').classList.add('active');

    // Reset Form
    document.getElementById('directArtistBriefForm').reset();
    document.getElementById('directUploadedFiles').innerHTML = '';
    showToast(`Đã gửi brief commission thành công tới ${artist.shortName}!`, 'success');
  });
}

// Drag & drop file simulator in Commission Tab
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('directFileInput');
  const fileList = document.getElementById('directUploadedFiles');

  if (fileInput && fileList) {
    fileInput.addEventListener('change', () => {
      const files = fileInput.files;
      for (let i = 0; i < files.length; i++) {
        const chip = document.createElement('span');
        chip.className = 'uploaded-chip';
        chip.innerHTML = `<i class="fa-solid fa-file-image"></i> ${files[i].name} <i class="fa-solid fa-xmark text-danger" style="cursor:pointer;" onclick="this.parentElement.remove()"></i>`;
        fileList.appendChild(chip);
      }
      showToast(`Đã đính kèm ${files.length} tệp tham khảo cho ${PROFILE_STATE.currentArtist.shortName}!`, 'info');
    });
  }
});

// =============================================================================
// 7. TAB 3: ĐÁNH GIÁ & REVIEW TỪ NGƯỜI MUA (TESTIMONIALS / REVIEWS HUB)
// =============================================================================
function renderReviewsHub(artist) {
  if (!artist) return;

  // Set overall ratings
  document.getElementById('reviewSummaryScore').textContent = artist.rating.toFixed(2);
  document.getElementById('reviewSummaryCount').textContent = artist.reviewsCount;
  document.getElementById('countRevAll').textContent = artist.reviewsCount;
  document.getElementById('tabReviewsCount').textContent = artist.reviewsCount;

  const reviewsList = document.getElementById('reviewsFeedList');
  if (!reviewsList) return;

  const reviews = artist.reviews || [];

  reviewsList.innerHTML = reviews.map(rev => `
    <div class="review-item-card">
      <div class="review-header">
        <img src="${rev.authorAvatar}" alt="${rev.author}" class="reviewer-avatar">
        <div class="reviewer-meta">
          <div class="reviewer-name-row">
            <h4 class="reviewer-name">${rev.author}</h4>
            <span class="verified-buyer-badge"><i class="fa-solid fa-certificate"></i> ${rev.badge}</span>
          </div>
          <div class="review-rating-stars">
            ${'<i class="fa-solid fa-star text-warning"></i>'.repeat(rev.rating)}
            <span class="review-date">${rev.date}</span>
          </div>
        </div>
      </div>

      <div class="review-body">
        <p class="review-text">"${rev.comment}"</p>
      </div>

      ${rev.artworkThumb ? `
        <div class="review-artwork-attachment">
          <img src="${rev.artworkThumb}" alt="Artwork Review" class="review-attached-img" onclick="openDetailModalByImage('${rev.artworkThumb}')">
          <span class="attached-tip"><i class="fa-solid fa-bag-shopping"></i> Tác phẩm thực tế đã giao dịch</span>
        </div>
      ` : ''}

      ${rev.artistReply ? `
        <div class="artist-reply-quote">
          <div class="reply-header">
            <i class="fa-solid fa-reply"></i>
            <strong>${artist.shortName}</strong> đã phản hồi:
          </div>
          <p class="reply-body">"${rev.artistReply}"</p>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function filterReviews(filterType) {
  PROFILE_STATE.reviewFilter = filterType;
  document.querySelectorAll('.review-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.revfilter === filterType);
  });
  showToast(`Đang lọc đánh giá: ${filterType === 'all' ? 'Tất cả' : filterType}`, 'info');
}

// =============================================================================
// 8. IMAGE PROTECTION AGAINST RIGHT-CLICK & DRAGGING
// =============================================================================
function setupImageProtection() {
  // Prevent contextmenu on all images and previews
  document.addEventListener('contextmenu', (e) => {
    if (e.target.matches('img, .card-media-wrapper, .artwork-card, .detail-img-viewport, .profile-cover-img, .profile-avatar-img')) {
      e.preventDefault();
      showToast('⚠️ Hình ảnh được bảo hộ bản quyền bởi ARTFAIR. Vui lòng mua bản quyền để nhận file gốc độ nét cao.', 'warning');
    }
  });

  // Prevent dragging images
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });
}

// =============================================================================
// 9. PROFILE TABS SWITCHING
// =============================================================================
function switchProfileTab(tabName) {
  PROFILE_STATE.activeTab = tabName;

  document.querySelectorAll('.profile-tab-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `pane-${tabName}`);
  });
}

function scrollToCommissionTab() {
  switchProfileTab('commission');
  const section = document.getElementById('pane-commission');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

// =============================================================================
// 10. GUEST INTERCEPT & AUTH MODAL ON PROFILE PAGE
// =============================================================================
function requireProfileAuth(actionDesc, callback) {
  if (PROFILE_STATE.currentUser) {
    callback();
    return true;
  }

  // Intercept
  PROFILE_STATE.pendingIntent = {
    action: actionDesc,
    callback: callback,
    redirectUrl: window.location.href
  };

  const notice = document.getElementById('guestInterceptNotice');
  const actionText = document.getElementById('interceptActionDesc');
  if (notice && actionText) {
    notice.style.display = 'flex';
    actionText.textContent = `Thao tác "${actionDesc}" yêu cầu đăng nhập tài khoản. Vui lòng đăng nhập để tiếp tục.`;
  }

  openAuthModal('login');
  showToast(`Cần đăng nhập để: ${actionDesc}`, 'warning');
  return false;
}

function openAuthModal(tab = 'login') {
  document.getElementById('authModalOverlay').classList.add('active');
  switchAuthTab(tab);
}

function closeAuthModal() {
  document.getElementById('authModalOverlay').classList.remove('active');
  document.getElementById('guestInterceptNotice').style.display = 'none';
}

function switchAuthTab(tab) {
  document.getElementById('tabBtnLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabBtnRegister').classList.toggle('active', tab === 'register');
  document.getElementById('paneLogin').classList.toggle('active', tab === 'login');
  document.getElementById('paneRegister').classList.toggle('active', tab === 'register');
  document.getElementById('paneOtp').classList.toggle('active', tab === 'otp');

  if (tab === 'otp') {
    startProfileOtpCountdown();
    setTimeout(() => {
      const firstInp = document.querySelector('#profileOtpDigits .otp-digit-input');
      if (firstInp) {
        firstInp.focus();
        firstInp.select();
      }
    }, 150);
  }
}

function handleProfileLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('profileLoginEmail').value.trim();
  completeProfileLogin({
    name: email.split('@')[0],
    email: email,
    role: 'collector',
    roleLabel: 'Nhà Sưu Tầm / Shop POD',
    avatar: '2e72c41b49afad2d08530b6a0475ba66.jpg'
  });
}

function handleProfileRegisterSubmit(e) {
  e.preventDefault();
  switchAuthTab('otp');
  showToast('Mã xác thực OTP bảo mật 6 số đã được gửi tới email của bạn.', 'info');
}

function verifyProfileOtp() {
  completeProfileLogin({
    name: 'Thành Viên Mới',
    email: 'newbie@artfair.vn',
    role: 'creator',
    roleLabel: 'Gen Z Creator',
    avatar: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg'
  });
}

function profileQuickLogin(role) {
  if (role === 'artist') {
    completeProfileLogin({
      name: 'Minh Trí Pro',
      email: 'minhtri@artfair.vn',
      role: 'artist',
      roleLabel: 'Họa Sĩ Pro',
      avatar: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg'
    });
  } else {
    completeProfileLogin({
      name: 'Hoàng My (POD)',
      email: 'hoangmy@gmail.com',
      role: 'collector',
      roleLabel: 'Shop POD Gen Z',
      avatar: '2e72c41b49afad2d08530b6a0475ba66.jpg'
    });
  }
}

function completeProfileLogin(user) {
  PROFILE_STATE.currentUser = user;
  saveSharedSession();
  applyUserHeaderUI(user);
  closeAuthModal();
  showToast(`Xin chào ${user.name}! Đăng nhập thành công.`, 'success');

  // Resume intent
  if (PROFILE_STATE.pendingIntent && typeof PROFILE_STATE.pendingIntent.callback === 'function') {
    const intent = PROFILE_STATE.pendingIntent;
    PROFILE_STATE.pendingIntent = null;
    setTimeout(() => intent.callback(), 350);
  }
}

function applyUserHeaderUI(user) {
  document.getElementById('guestActions').style.display = 'none';
  const profileZone = document.getElementById('loggedInProfile');
  profileZone.style.display = 'block';

  document.getElementById('userNameLabel').textContent = user.name;
  document.getElementById('dropdownUserName').textContent = user.name;
  document.getElementById('dropdownUserRole').textContent = user.roleLabel;
  if (user.avatar) {
    document.getElementById('userAvatarImg').src = user.avatar;
  }
}

function handleProfileFollow() {
  requireProfileAuth(`Theo dõi nghệ sĩ ${PROFILE_STATE.currentArtist.name}`, () => {
    const btn = document.getElementById('btnHeroFollowArtist');
    const label = document.getElementById('followBtnText');
    if (btn.classList.contains('following')) {
      btn.classList.remove('following');
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-ghost');
      label.textContent = 'Theo Dõi Gian Hàng';
      showToast(`Đã bỏ theo dõi ${PROFILE_STATE.currentArtist.name}`, 'info');
    } else {
      btn.classList.add('following');
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-ghost');
      label.textContent = '✓ Đang Theo Dõi';
      showToast(`Đã theo dõi ${PROFILE_STATE.currentArtist.name}! Thông báo tác phẩm mới sẽ gửi qua email của bạn.`, 'success');
    }
  });
}

function handleDirectMessage() {
  requireProfileAuth(`Nhắn tin trực tiếp với ${PROFILE_STATE.currentArtist.name}`, () => {
    alert(`Mở hộp thoại chat riêng với ${PROFILE_STATE.currentArtist.name}. Artist sẽ trả lời trong vòng ${PROFILE_STATE.currentArtist.responseTime}.`);
  });
}

function copyProfileShareLink() {
  navigator.clipboard.writeText(window.location.href);
  showToast('Đã copy đường dẫn trang cá nhân của artist vào clipboard!', 'success');
}

// Social SSO handlers
function handleGoogleLogin() {
  showToast('Chuyển hướng đến cổng đăng nhập Google Accounts...', 'info');
  setTimeout(() => {
    window.location.href = 'https://accounts.google.com';
  }, 800);
}

function handleFacebookLogin() {
  showToast('Chuyển hướng đến cổng đăng nhập Facebook...', 'info');
  setTimeout(() => {
    window.location.href = 'https://www.facebook.com/login';
  }, 800);
}

// =============================================================================
// 11. ARTWORK DETAIL MODAL WITH WATERMARK & ZOOM
// =============================================================================
function openDetailModal(artId) {
  const art = ARTWORKS_DATABASE.find(a => a.id === artId);
  if (!art) return;

  PROFILE_STATE.selectedArt = art;
  PROFILE_STATE.selectedDetailTier = 'personal';

  const modalImg = document.getElementById('modalArtImg');
  if (modalImg) {
    modalImg.classList.add('skeleton-shimmer');
    modalImg.src = art.image;
    modalImg.alt = `Tác phẩm ${art.title} bởi nghệ sĩ ${art.artist}`;
    modalImg.onload = () => modalImg.classList.remove('skeleton-shimmer');
  }

  document.getElementById('modalArtTitle').textContent = art.title;
  document.getElementById('modalArtCategory').textContent = art.categoryName;
  document.getElementById('modalArtId').textContent = `ID: #${art.id}`;
  document.getElementById('modalArtLikes').innerHTML = `<i class="fa-solid fa-heart text-danger"></i> ${art.likes} thích`;
  document.getElementById('modalArtResolution').textContent = art.dimensions;
  document.getElementById('modalArtFormats').textContent = art.formats;
  document.getElementById('modalArtUsage').textContent = art.usage;
  document.getElementById('modalArtSoftware').textContent = art.software;
  document.getElementById('modalArtDesc').textContent = art.description;

  document.getElementById('modalPricePersonal').textContent = `$${art.basePrice}`;
  document.getElementById('modalPriceCommercial').textContent = `$${art.commercialPrice}`;
  document.getElementById('modalPriceExclusive').textContent = `$${art.exclusivePrice}`;

  // Reset radio
  document.querySelectorAll('input[name="modalTierSelect"]').forEach(r => {
    r.checked = r.value === 'personal';
    r.closest('.modal-tier-radio').classList.toggle('active', r.value === 'personal');
  });

  updateProfileModalPrice();
  document.getElementById('artworkDetailModalOverlay').classList.add('active');
}

function openDetailModalByImage(imgSrc) {
  const art = ARTWORKS_DATABASE.find(a => a.image === imgSrc);
  if (art) {
    openDetailModal(art.id);
  }
}

function closeDetailModal() {
  document.getElementById('artworkDetailModalOverlay').classList.remove('active');
}

function updateProfileModalPrice() {
  const art = PROFILE_STATE.selectedArt;
  if (!art) return;

  const selectedTier = document.querySelector('input[name="modalTierSelect"]:checked').value;
  PROFILE_STATE.selectedDetailTier = selectedTier;

  document.querySelectorAll('.modal-tier-radio').forEach(r => {
    r.classList.toggle('active', r.querySelector('input').checked);
  });

  let price = art.basePrice;
  if (selectedTier === 'commercial') price = art.commercialPrice;
  if (selectedTier === 'exclusive') price = art.exclusivePrice;

  const priceEl = document.getElementById('modalDetailPriceDisplay');
  if (priceEl) priceEl.textContent = `$${price} USD`;

  const vndEl = document.getElementById('modalProfileVndSub');
  if (vndEl) {
    const vnd = (price * 25400).toLocaleString('vi-VN');
    vndEl.textContent = `(~ ${vnd} VNĐ)`;
  }
}

function toggleWatermark(show) {
  const layer = document.getElementById('modalWatermarkLayer');
  if (layer) layer.style.opacity = show ? '1' : '0.08';
}

function handleArtistCardHeart(artId, btn) {
  requireProfileAuth('Thả tim lưu vào bộ sưu tập', () => {
    const art = ARTWORKS_DATABASE.find(a => a.id === artId);
    if (!art) return;

    if (PROFILE_STATE.favorites.has(artId)) {
      PROFILE_STATE.favorites.delete(artId);
      art.likes = Math.max(0, art.likes - 1);
      showToast(`Đã bỏ thích "${art.title}"`, 'info');
    } else {
      PROFILE_STATE.favorites.add(artId);
      art.likes += 1;
      showToast(`Đã thêm "${art.title}" vào mục yêu thích!`, 'success');
    }

    saveSharedSession();
    updateHeaderCounters();
    renderArtistGallery();
  });
}

function handleArtistCardBuy(artId) {
  openDetailModal(artId);
}

function handleDetailHeart() {
  if (PROFILE_STATE.selectedArt) {
    handleArtistCardHeart(PROFILE_STATE.selectedArt.id, null);
  }
}

function handleDetailAddToCart() {
  const art = PROFILE_STATE.selectedArt;
  if (!art) return;

  requireProfileAuth('Thêm bản quyền vào giỏ hàng', () => {
    let price = art.basePrice;
    let label = 'Cá Nhân';
    if (PROFILE_STATE.selectedDetailTier === 'commercial') {
      price = art.commercialPrice;
      label = 'Thương Mại POD';
    } else if (PROFILE_STATE.selectedDetailTier === 'exclusive') {
      price = art.exclusivePrice;
      label = 'Độc Quyền Full Buyout';
    }

    PROFILE_STATE.cart.push({
      id: art.id + '-' + Date.now(),
      artId: art.id,
      title: art.title,
      artist: art.artist,
      image: art.image,
      tier: PROFILE_STATE.selectedDetailTier,
      tierLabel: label,
      price: price
    });

    saveSharedSession();
    updateHeaderCounters();
    showToast(`Đã thêm "${art.title}" (${label}) vào giỏ hàng!`, 'success');
    openCartDrawer();
  });
}

function handleDetailBuyNow() {
  handleDetailAddToCart();
}

// =============================================================================
// 12. CART DRAWER & CHECKOUT
// =============================================================================
function openCartDrawer() {
  renderProfileCart();
  document.getElementById('cartDrawerOverlay').classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cartDrawerOverlay').classList.remove('active');
}

function renderProfileCart() {
  const container = document.getElementById('cartItemsContainer');
  const countBadge = document.getElementById('cartDrawerCount');
  const subtotalLabel = document.getElementById('cartSubtotal');
  const grandTotalLabel = document.getElementById('cartGrandTotal');

  countBadge.textContent = PROFILE_STATE.cart.length;

  if (PROFILE_STATE.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card" style="padding: 40px 10px;">
        <i class="fa-solid fa-bag-shopping empty-icon"></i>
        <h4>Giỏ hàng của bạn đang trống</h4>
        <p>Chọn các tác phẩm bản quyền yêu thích từ gian hàng artist.</p>
      </div>
    `;
    subtotalLabel.textContent = '$0';
    grandTotalLabel.textContent = '$0 USD';
    return;
  }

  let subtotal = 0;
  container.innerHTML = PROFILE_STATE.cart.map((item, index) => {
    subtotal += item.price;
    return `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.title}" class="cart-item-thumb">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.title}</h4>
          <p class="cart-item-artist">${item.artist}</p>
          <span class="cart-item-tier-badge">${item.tierLabel}</span>
          <div class="cart-item-price">$${item.price} USD</div>
        </div>
        <button class="cart-item-remove" onclick="removeProfileCartItem(${index})">&times;</button>
      </div>
    `;
  }).join('');

  subtotalLabel.textContent = `$${subtotal.toLocaleString()} USD`;
  grandTotalLabel.textContent = `$${subtotal.toLocaleString()} USD`;
}

function removeProfileCartItem(idx) {
  PROFILE_STATE.cart.splice(idx, 1);
  saveSharedSession();
  updateHeaderCounters();
  renderProfileCart();
  showToast('Đã xóa mục khỏi giỏ hàng.', 'info');
}

function applyProfileCoupon() {
  const input = document.getElementById('couponInput');
  const code = input.value.trim().toUpperCase();
  const msg = document.getElementById('couponMessage');

  if (code === 'GENZART' || code === 'ARTFAIR2026') {
    msg.className = 'coupon-status-msg success';
    msg.textContent = 'Mã hợp lệ! Đã áp dụng giảm 15% tổng đơn.';
  } else {
    msg.className = 'coupon-status-msg error';
    msg.textContent = 'Mã không tồn tại hoặc đã hết hạn.';
  }
}

function handleProfileCheckout() {
  requireProfileAuth('Thanh toán đơn hàng bản quyền', () => {
    alert('Khởi tạo hợp đồng thương mại điện tử thành công! File gốc và chứng thư sẽ được gửi về email của bạn.');
    PROFILE_STATE.cart = [];
    saveSharedSession();
    updateHeaderCounters();
    closeCartDrawer();
  });
}

function updateHeaderCounters() {
  const favBadge = document.getElementById('favoritesCountBadge');
  const cartBadge = document.getElementById('cartCountBadge');
  if (favBadge) favBadge.textContent = PROFILE_STATE.favorites.size;
  if (cartBadge) cartBadge.textContent = PROFILE_STATE.cart.length;
}

// =============================================================================
// 13. TOAST HELPER & ZOOM LENS
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

function initProfileUI() {
  // Mobile nav toggle
  const toggle = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('closeMobileNav');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => drawer.classList.add('active'));
    closeBtn.addEventListener('click', () => drawer.classList.remove('active'));
  }

  // Header Cart & Favs click
  document.getElementById('btnHeaderCart').addEventListener('click', openCartDrawer);
  document.getElementById('btnHeaderFavorites').addEventListener('click', () => {
    showToast(`Bạn đang có ${PROFILE_STATE.favorites.size} tác phẩm trong bộ sưu tập yêu thích.`, 'info');
  });

  // User Dropdown
  const pill = document.getElementById('userAvatarPill');
  const menu = document.getElementById('userDropdownMenu');
  if (pill && menu) {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('show');
    });
    document.addEventListener('click', () => menu.classList.remove('show'));
  }

  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      PROFILE_STATE.currentUser = null;
      saveSharedSession();
      document.getElementById('guestActions').style.display = 'flex';
      document.getElementById('loggedInProfile').style.display = 'none';
      menu.classList.remove('show');
      showToast('Đã đăng xuất tài khoản.', 'info');
    });
  }

  // Zoom lens in detail modal
  const viewport = document.getElementById('detailImgViewport');
  const img = document.getElementById('modalArtImg');
  if (viewport && img) {
    viewport.addEventListener('mousemove', (e) => {
      const rect = viewport.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = 'scale(2.2)';
    });
    viewport.addEventListener('mouseleave', () => {
      img.style.transformOrigin = 'center center';
      img.style.transform = 'scale(1)';
    });
  }

  // OTP inputs auto-advance
  const otpContainer = document.getElementById('profileOtpDigits');
  if (otpContainer) {
    const inputs = otpContainer.querySelectorAll('.otp-digit-input');
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
}

// Profile OTP Countdown & Resend
let profileOtpTimerInterval = null;
let profileOtpCountdown = 60;

function startProfileOtpCountdown() {
  clearInterval(profileOtpTimerInterval);
  profileOtpCountdown = 60;
  const timerLabel = document.getElementById('profileOtpTimerVal');
  const resendBtn = document.getElementById('btnResendProfileOtp');
  if (resendBtn) resendBtn.disabled = true;

  profileOtpTimerInterval = setInterval(() => {
    profileOtpCountdown--;
    if (timerLabel) {
      const s = profileOtpCountdown < 10 ? `0${profileOtpCountdown}` : profileOtpCountdown;
      timerLabel.textContent = `00:${s}s`;
    }
    if (profileOtpCountdown <= 0) {
      clearInterval(profileOtpTimerInterval);
      if (resendBtn) resendBtn.disabled = false;
      if (timerLabel) timerLabel.textContent = 'Gửi lại mã';
    }
  }, 1000);
}

function resendProfileOtp() {
  startProfileOtpCountdown();
  showToast('Đã gửi lại mã xác thực OTP mới đến email của bạn!', 'info');
  const inputs = document.querySelectorAll('#profileOtpDigits .otp-digit-input');
  inputs.forEach(inp => inp.value = '');
  if (inputs.length > 0) inputs[0].focus();
}

// Global anchor listener to prevent default jumping on href="#"
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href="#"]');
  if (link) {
    e.preventDefault();
  }
});

// Check URL Hash for direct navigation to commission tab
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash;
  if (hash === '#commission-section' || hash === '#tab-commission' || hash === '#pane-commission') {
    switchProfileTab('commission');
    setTimeout(() => {
      const sec = document.getElementById('pane-commission');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  }
});
