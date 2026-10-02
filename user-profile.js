/**
 * ARTFAIR - User Profile Dashboard Logic (user-profile.js)
 * Manages Buyer View (Following Artists, Live Progress Tracker, Collector Hub Certificates)
 * and Creator View (Active Status Toggle, Commission Inbox, Edit Profile, New Artwork Upload).
 */

const DASH_STATE = {
  currentRole: 'collector', // 'collector' (Buyer) or 'artist' (Creator)
  profileData: null,
  activeBuyerTab: 'following',
  activeCreatorTab: 'inbox',
  cart: []
};

// =============================================================================
// 1. INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadUserDashboardSession();
  initDashboardUI();
  setupCopyrightProtection();
});

function loadUserDashboardSession() {
  try {
    const savedUser = localStorage.getItem('artfair_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      DASH_STATE.currentRole = u.role === 'artist' ? 'artist' : 'collector';
    }
  } catch (e) {
    console.warn('Dashboard session fallback', e);
  }

  // Load mock data corresponding to current role
  DASH_STATE.profileData = MOCK_USER_PROFILES[DASH_STATE.currentRole] || MOCK_USER_PROFILES['collector'];
  renderDashboardHeader(DASH_STATE.profileData);
  renderCurrentRoleView();
}

function renderDashboardHeader(user) {
  if (!user) return;

  document.getElementById('dashUserName').textContent = user.name;
  document.getElementById('dashUserEmail').textContent = user.email;
  document.getElementById('dashUserBio').textContent = `"${user.bio}"`;
  document.getElementById('dashUserAvatar').src = user.avatar;

  const roleBadge = document.getElementById('dashRoleBadge');
  if (user.role === 'artist') {
    roleBadge.textContent = '🎨 Người Sáng Tạo / Pro Creator Studio';
    roleBadge.className = 'dash-role-badge creator';
  } else {
    roleBadge.textContent = '🛍️ Người Mua / POD Shop Owner';
    roleBadge.className = 'dash-role-badge buyer';
  }

  // Header user pill
  document.getElementById('userNameLabel').textContent = user.name;
  document.getElementById('userAvatarImg').src = user.avatar;
  document.getElementById('dropdownUserName').textContent = user.name;
  document.getElementById('dropdownUserRole').textContent = user.roleLabel;
}

// =============================================================================
// 2. ROLE SWITCHER (BUYER VS CREATOR)
// =============================================================================
function switchRoleView(role) {
  DASH_STATE.currentRole = role;
  DASH_STATE.profileData = MOCK_USER_PROFILES[role];

  // Save to shared localStorage
  try {
    localStorage.setItem('artfair_user', JSON.stringify({
      name: DASH_STATE.profileData.name,
      email: DASH_STATE.profileData.email,
      role: role,
      roleLabel: DASH_STATE.profileData.roleLabel,
      avatar: DASH_STATE.profileData.avatar
    }));
  } catch (e) {}

  // Update Buttons active class
  document.getElementById('btnRoleBuyer').classList.toggle('active', role === 'collector');
  document.getElementById('btnRoleCreator').classList.toggle('active', role === 'artist');

  renderDashboardHeader(DASH_STATE.profileData);
  renderCurrentRoleView();
  showToast(`Đã chuyển sang giao diện: ${role === 'collector' ? 'Người Mua (Buyer)' : 'Creator Studio'}`, 'info');
}

function renderCurrentRoleView() {
  const buyerView = document.getElementById('viewBuyerDashboard');
  const creatorView = document.getElementById('viewCreatorDashboard');

  if (DASH_STATE.currentRole === 'collector') {
    buyerView.classList.add('active');
    creatorView.classList.remove('active');
    renderBuyerFollowing();
    renderBuyerTracker();
    renderBuyerCollectorHub();
  } else {
    creatorView.classList.add('active');
    buyerView.classList.remove('active');
    renderCreatorInbox();
    renderCreatorMyArtworks();
    renderCreatorStatusToggle();
  }
}

// =============================================================================
// 3. BUYER DASHBOARD LOGIC (ROLE A)
// =============================================================================
function switchBuyerTab(tab) {
  DASH_STATE.activeBuyerTab = tab;
  document.querySelectorAll('.dash-tab-btn[data-buyertab]').forEach(b => {
    b.classList.toggle('active', b.dataset.buyertab === tab);
  });
  document.querySelectorAll('.buyer-tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === `paneBuyer${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
  });
}

// Buyer Tab 1: Following Artists
function renderBuyerFollowing() {
  const container = document.getElementById('followingArtistsGrid');
  const followingIds = DASH_STATE.profileData.followingArtists || ['lanchi', 'kietnguyen'];
  document.getElementById('countFollowing').textContent = followingIds.length;

  if (!container) return;

  container.innerHTML = followingIds.map(artistId => {
    const artist = ARTISTS_DATA[artistId];
    if (!artist) return '';

    return `
      <div class="following-artist-card">
        <div class="artist-card-cover" style="background-image: url('${artist.coverImage}')">
          <span class="card-status-dot ${artist.status}"></span>
        </div>
        <div class="artist-card-avatar-box">
          <img src="${artist.avatar}" alt="${artist.name}" class="card-avatar" loading="lazy" decoding="async">
        </div>
        <div class="artist-card-body">
          <h4>${artist.name}</h4>
          <p class="artist-role-text">${artist.roleTitle}</p>
          <div class="artist-card-stats">
            <span>⭐ ${artist.rating}</span>
            <span>👥 ${artist.followersCount}</span>
            <span>🎨 ${artist.artworksSold} đã bán</span>
          </div>
          <div class="artist-card-actions">
            <button class="btn btn-primary btn-sm w-100" onclick="navigateToArtistProfile('${artist.id}')">
              <i class="fa-solid fa-store"></i> Ghé Gian Hàng
            </button>
            <button class="btn btn-ghost btn-sm" title="Bỏ theo dõi" onclick="unfollowArtist('${artist.id}')">
              <i class="fa-solid fa-user-minus"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function unfollowArtist(artistId) {
  const list = DASH_STATE.profileData.followingArtists;
  const idx = list.indexOf(artistId);
  if (idx > -1) {
    list.splice(idx, 1);
    renderBuyerFollowing();
    showToast('Đã bỏ theo dõi tác giả này.', 'info');
  }
}

// Buyer Tab 2: Live Progress Tracker (Brief -> Phác thảo -> Tinh chỉnh -> Nghiệm thu)
function renderBuyerTracker() {
  const container = document.getElementById('liveTrackerList');
  const commissions = DASH_STATE.profileData.liveCommissions || [];
  document.getElementById('countLiveCommissions').textContent = commissions.length;

  if (!container) return;

  container.innerHTML = commissions.map(item => `
    <div class="tracker-item-card">
      <div class="tracker-header">
        <div class="tracker-artist-info">
          <img src="${item.artistAvatar}" alt="${item.artistName}" class="tracker-avatar">
          <div>
            <h4>${item.projectTitle}</h4>
            <p>Artist: <strong>${item.artistName}</strong> • Mã đơn: <span class="badge-ticket">#${item.ticketId}</span></p>
          </div>
        </div>
        <div class="tracker-budget-tag">
          <span>Ngân sách:</span>
          <strong>$${item.budget} USD</strong>
        </div>
      </div>

      <!-- 4-Step Visual Progress Stepper -->
      <div class="stepper-4-steps">
        <div class="stepper-step ${item.step >= 1 ? 'completed' : ''} ${item.step === 1 ? 'active' : ''}">
          <div class="step-circle">1</div>
          <span>Gửi Brief</span>
        </div>
        <div class="stepper-line ${item.step >= 2 ? 'completed' : ''}"></div>

        <div class="stepper-step ${item.step >= 2 ? 'completed' : ''} ${item.step === 2 ? 'active' : ''}">
          <div class="step-circle">2</div>
          <span>Phác Thảo Thô</span>
        </div>
        <div class="stepper-line ${item.step >= 3 ? 'completed' : ''}"></div>

        <div class="stepper-step ${item.step >= 3 ? 'completed' : ''} ${item.step === 3 ? 'active' : ''}">
          <div class="step-circle">3</div>
          <span>Tinh Chỉnh Màu</span>
        </div>
        <div class="stepper-line ${item.step >= 4 ? 'completed' : ''}"></div>

        <div class="stepper-step ${item.step >= 4 ? 'completed' : ''} ${item.step === 4 ? 'active' : ''}">
          <div class="step-circle">4</div>
          <span>Nghiệm Thu</span>
        </div>
      </div>

      <div class="tracker-footer-strip">
        <div class="tracker-status-text">
          <i class="fa-solid fa-spinner fa-spin text-primary"></i>
          <strong>Trạng thái:</strong> ${item.stepLabel} <span class="time-muted">(${item.lastUpdate})</span>
        </div>

        <div class="tracker-btn-group">
          <button class="btn btn-outline btn-sm" onclick="alert('Đã gửi thông báo nhắc artist cập nhật bản vẽ mới!')">
            <i class="fa-regular fa-bell"></i> Nhắc Tiến Độ
          </button>
          <button class="btn btn-primary btn-sm" onclick="showSketchPreviewModal('${item.ticketId}')">
            <i class="fa-solid fa-eye"></i> Xem Phác Thảo Mới
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function showSketchPreviewModal(ticketId) {
  alert(`[Mã đơn #${ticketId}] Bản phác thảo thô mới nhất đã được tải lên! Hãy phản hồi lại cho artist trong mục nhắn tin.`);
}

// Buyer Tab 3: Collector Hub (Purchased Licenses & Certificate)
function renderBuyerCollectorHub() {
  const container = document.getElementById('purchasedLicensesGrid');
  const licenses = DASH_STATE.profileData.purchasedLicenses || [];
  document.getElementById('countLicenses').textContent = licenses.length;

  if (!container) return;

  container.innerHTML = licenses.map(lic => `
    <div class="license-card-item">
      <img src="${lic.image}" alt="${lic.title}" class="license-art-thumb" loading="lazy" decoding="async">
      
      <div class="license-info">
        <span class="license-code-badge">${lic.id}</span>
        <h4 class="license-title">${lic.title}</h4>
        <p class="license-artist">Tác giả: <strong>${lic.artist}</strong></p>
        <p class="license-tier-tag"><i class="fa-solid fa-certificate text-primary"></i> ${lic.licenseTier}</p>
        <p class="license-date">Ngày thanh toán: ${lic.purchaseDate}</p>

        <div class="license-action-buttons">
          <button class="btn btn-primary btn-sm" onclick="downloadHighResFile('${lic.title}', '${lic.format}')">
            <i class="fa-solid fa-download"></i> Tải File Gốc (${lic.format})
          </button>
          
          <button class="btn btn-outline btn-sm" onclick="openCertificateModal('${lic.id}')">
            <i class="fa-solid fa-file-pdf"></i> Xuất Chứng Nhận PDF
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function downloadHighResFile(title, format) {
  showToast(`Đang khởi tạo liên kết tải an toàn cho "${title}" (${format})...`, 'info');
  setTimeout(() => {
    showToast(`Đã tải xuống thành công tệp gốc 300 DPI của "${title}"!`, 'success');
  }, 1200);
}

// Legal Certificate PDF Modal Opener
function openCertificateModal(licId) {
  const licenses = DASH_STATE.profileData.purchasedLicenses || [];
  const lic = licenses.find(l => l.id === licId) || licenses[0];
  if (!lic) return;

  document.getElementById('certLicenseOwner').textContent = DASH_STATE.profileData.name;
  document.getElementById('certArtworkTitle').textContent = lic.title;
  document.getElementById('certArtworkImg').src = lic.image;
  document.getElementById('certArtistName').textContent = lic.artist;
  document.getElementById('certLicenseTier').textContent = lic.licenseTier;
  document.getElementById('certFormats').textContent = lic.format;
  document.getElementById('certCodeVal').textContent = lic.certificateId;
  document.getElementById('certDateVal').textContent = lic.purchaseDate;

  document.getElementById('certificateModalOverlay').classList.add('active');
}

function closeCertificateModal() {
  document.getElementById('certificateModalOverlay').classList.remove('active');
}

function downloadCertificatePDF() {
  showToast('Đã xuất Giấy chứng nhận bản quyền PDF chuẩn pháp lý!', 'success');
}

// =============================================================================
// 4. CREATOR DASHBOARD LOGIC (ROLE B)
// =============================================================================
function switchCreatorTab(tab) {
  DASH_STATE.activeCreatorTab = tab;
  document.querySelectorAll('.dash-tab-btn[data-creatortab]').forEach(b => {
    b.classList.toggle('active', b.dataset.creatortab === tab);
  });
  document.querySelectorAll('.creator-tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === `paneCreator${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
  });
}

function renderCreatorStatusToggle() {
  const isAccepting = DASH_STATE.profileData.status === 'accepting';
  document.getElementById('btnStatusAccepting').classList.toggle('active', isAccepting);
  document.getElementById('btnStatusBusy').classList.toggle('active', !isAccepting);
}

function setCreatorActiveStatus(accepting) {
  DASH_STATE.profileData.status = accepting ? 'accepting' : 'busy';
  renderCreatorStatusToggle();
  showToast(`Đã cập nhật trạng thái: ${accepting ? '🟢 Còn nhận đơn Commission' : '🔴 Đã kín lịch mụa này'}`, 'success');
}

// Creator Tab 1: Commission Inbox Requests
function renderCreatorInbox() {
  const container = document.getElementById('commissionInboxList');
  const requests = DASH_STATE.profileData.incomingRequests || [];
  document.getElementById('countCreatorInbox').textContent = requests.length;

  if (!container) return;

  container.innerHTML = requests.map(req => `
    <div class="inbox-request-card ${req.status}">
      <div class="inbox-header">
        <div class="client-info">
          <img src="${req.clientAvatar}" alt="${req.clientName}" class="client-avatar">
          <div>
            <h4>${req.projectTitle}</h4>
            <p>Khách hàng: <strong>${req.clientName}</strong> • Mã brief: <span class="badge-ticket">${req.requestId}</span></p>
          </div>
        </div>
        <div class="inbox-budget-badge">
          <span>Ngân sách:</span>
          <strong>$${req.budget} USD</strong>
        </div>
      </div>

      <div class="inbox-brief-box">
        <p><strong>Yêu cầu brief:</strong> "${req.briefSummary}"</p>
        <div class="inbox-meta-strip">
          <span><i class="fa-regular fa-clock"></i> Hạn bàn giao: ${req.deadline}</span>
          <span><i class="fa-solid fa-layer-group"></i> Gói: ${req.packageLabel}</span>
        </div>
      </div>

      <div class="inbox-actions-row">
        ${req.status === 'pending' ? `
          <button class="btn btn-primary btn-sm" onclick="acceptCommissionRequest('${req.requestId}')">
            <i class="fa-solid fa-check"></i> Chấp Nhận Vẽ Brief Này
          </button>
          <button class="btn btn-outline btn-sm text-danger" onclick="rejectCommissionRequest('${req.requestId}')">
            <i class="fa-solid fa-xmark"></i> Từ Chối
          </button>
        ` : `
          <span class="badge-accepted-tag"><i class="fa-solid fa-circle-check"></i> Đã Chấp Nhận Nhận Vẽ</span>
          <button class="btn btn-secondary btn-sm" onclick="alert('Mở Creator Studio để tải bản phác thảo thô cho khách!')">
            <i class="fa-solid fa-cloud-arrow-up"></i> Tải Lên Phác Thảo
          </button>
        `}
      </div>
    </div>
  `).join('');
}

function acceptCommissionRequest(reqId) {
  const req = DASH_STATE.profileData.incomingRequests.find(r => r.requestId === reqId);
  if (req) {
    req.status = 'accepted';
    renderCreatorInbox();
    showToast(`Đã chấp nhận đơn commission #${reqId}! Tiến độ đã được gửi tới khách hàng.`, 'success');
  }
}

function rejectCommissionRequest(reqId) {
  const reqs = DASH_STATE.profileData.incomingRequests;
  const idx = reqs.findIndex(r => r.requestId === reqId);
  if (idx > -1) {
    reqs.splice(idx, 1);
    renderCreatorInbox();
    showToast('Đã từ chối đơn yêu cầu này.', 'info');
  }
}

// Creator Tab 2: My Artworks List
function renderCreatorMyArtworks() {
  const container = document.getElementById('creatorArtworksGrid');
  if (!container) return;

  const artworks = ARTWORKS_DATABASE.slice(0, 6); // Sample gallery for creator
  container.innerHTML = artworks.map(art => `
    <div class="artwork-card">
      <div class="card-media-wrapper">
        <img src="${art.image}" alt="${art.title}" class="card-art-img" loading="lazy" decoding="async">
        <span class="card-cat-badge">${art.categoryName}</span>
      </div>
      <div class="card-info-box">
        <h4 class="artwork-card-title">${art.title}</h4>
        <div class="card-footer-strip">
          <span class="price-tag">$${art.basePrice} - $${art.exclusivePrice}</span>
          <button class="btn btn-ghost btn-xs" onclick="alert('Đã cập nhật cấu hình bản quyền!')">
            <i class="fa-solid fa-gear"></i> Sửa Giá
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Creator Modals (Edit Profile & Upload Artwork)
function openEditProfileModal() {
  document.getElementById('editName').value = DASH_STATE.profileData.name;
  document.getElementById('editBio').value = DASH_STATE.profileData.bio;
  document.getElementById('editProfileModalOverlay').classList.add('active');
}
function closeEditProfileModal() {
  document.getElementById('editProfileModalOverlay').classList.remove('active');
}
function handleEditProfileSubmit(e) {
  e.preventDefault();
  DASH_STATE.profileData.name = document.getElementById('editName').value;
  DASH_STATE.profileData.bio = document.getElementById('editBio').value;
  renderDashboardHeader(DASH_STATE.profileData);
  closeEditProfileModal();
  showToast('Đã cập nhật thông tin hồ sơ cá nhân!', 'success');
}

function openCreatorStudioModal() {
  document.getElementById('creatorStudioModalOverlay').classList.add('active');
}
function closeCreatorStudioModal() {
  document.getElementById('creatorStudioModalOverlay').classList.remove('active');
}
function handleNewArtworkSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('newArtTitle').value;
  closeCreatorStudioModal();
  showToast(`🎉 Đã đăng thành công tác phẩm "${title}" lên chợ phiên ARTFAIR!`, 'success');
  document.getElementById('formNewArtwork').reset();
}

// Copyright image protection
function setupCopyrightProtection() {
  document.addEventListener('contextmenu', (e) => {
    if (e.target.matches('img, .card-media-wrapper, .license-art-thumb, .cert-thumb')) {
      e.preventDefault();
      showToast('⚠️ Hình ảnh được bảo hộ bản quyền bởi ARTFAIR.', 'warning');
    }
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
}

function handleDashboardLogout() {
  localStorage.removeItem('artfair_user');
  showToast('Đã đăng xuất tài khoản.', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
}

function openCartDrawer() {
  document.getElementById('cartDrawerOverlay').classList.add('active');
}
function closeCartDrawer() {
  document.getElementById('cartDrawerOverlay').classList.remove('active');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-card ${type}`;
  toast.innerHTML = `<i class="fa-solid fa-circle-info toast-icon"></i><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function initDashboardUI() {
  const toggle = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('closeMobileNav');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => drawer.classList.add('active'));
    closeBtn.addEventListener('click', () => drawer.classList.remove('active'));
  }

  // Prevent jumping on href="#" links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href="#"]');
    if (link) {
      e.preventDefault();
    }
  });
}

