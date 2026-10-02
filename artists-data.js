const USD_TO_VND_RATE = 25000;

function formatVND(amount) {
  if (isNaN(amount) || amount === null) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' VNĐ';
}
window.USD_TO_VND_RATE = USD_TO_VND_RATE;
window.formatVND = formatVND;

/**
 * ARTFAIR - Shared Data Repository & User Profile Storage
 * Contains artists data, artwork catalog, user profiles, and helpers (Đồng Bộ Chuẩn Hóa VNĐ)
 */

const ARTISTS_DATA = {
  'lanchi': {
    id: 'lanchi',
    name: 'Lan Chi (Chi Art Studio)',
    shortName: 'Lan Chi',
    penName: 'Chi Art Studio',
    roleTitle: 'Chuyên Họa Màu Nước & Storybook Illustration',
    avatar: '2e72c41b49afad2d08530b6a0475ba66.jpg',
    coverImage: '45fbff086b31157aa2e23b94f086bd06.jpg',
    bio: 'Kể lại những giấc mơ tuổi trẻ qua gam màu pastel dịu dàng và nét vẽ thanh tao. Chuyên sáng tác tranh minh họa bìa sách văn học, thời trang pastel và ấn phẩm tranh canvas nghệ thuật.',
    location: 'Hà Nội, Việt Nam',
    joinedDate: 'Tháng 3, 2024',
    verified: true,
    badgeLabel: 'Artist Xác Minh • Verified Pro',
    status: 'accepting',
    statusText: 'Đang nhận đơn Commission (Còn 2 slot trong tháng)',
    rating: 4.95,
    reviewsCount: 128,
    responseRate: '99%',
    responseTime: '< 1 giờ',
    artworksSold: 142,
    followersCount: '1.4k',
    specialties: ['Minh Họa Màu Nước', 'Bìa Sách Văn Học', 'Áo Thun Pastel', 'Poster Canvas Decor', 'Storybook Art'],
    socialLinks: {
      behance: 'https://behance.net',
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com'
    },
    commissionPackages: [
      {
        id: 'pkg-lc-1',
        title: 'Gói Phác Thảo & Chân Dung Màu Nước',
        badge: 'Cơ Bản / Cá Nhân',
        price: 2000000,
        deliveryDays: 5,
        revisions: 2,
        features: [
          'Chân dung 1 nhân vật (bán thân hoặc toàn thân)',
          'Tông màu pastel dịu ngọt đặc trưng của Lan Chi',
          'File PNG chất lượng cao 300 DPI (chuẩn in ấn)',
          'Quyền sử dụng cá nhân phi thương mại'
        ]
      },
      {
        id: 'pkg-lc-2',
        title: 'Gói Minh Họa Bìa Sách & Ấn Phẩm POD',
        badge: 'Phổ Biến Nhất',
        popular: true,
        price: 6250000,
        deliveryDays: 10,
        revisions: 3,
        features: [
          'Tranh minh họa hoàn chỉnh kèm background chi tiết',
          'Tặng kèm mockup bìa sách / mockup áo thun pastel',
          'Bàn giao file PSD phân lớp màu + file in ấn CMYK',
          'Cấp quyền thương mại POD (In dưới 10,000 ấn phẩm)',
          'Hỗ trợ chỉnh sửa typography tiêu đề miễn phí'
        ]
      },
      {
        id: 'pkg-lc-3',
        title: 'Gói Độc Quyền Toàn Phần (Exclusive Buyout)',
        badge: 'VIP / Độc Quyền',
        price: 30000000,
        deliveryDays: 18,
        revisions: 5,
        features: [
          'Tác phẩm độc bản chuyển giao quyền tác giả vĩnh viễn',
          'Cam kết gỡ bỏ hoặc không tái sử dụng cho bất kỳ ai khác',
          'Bàn giao toàn bộ file gốc layered PSD 600 DPI',
          'Hợp đồng nhượng quyền pháp lý có mộc số ARTFAIR',
          'Hỗ trợ 5 lần chỉnh sửa chi tiết theo brief thương hiệu'
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-1',
        author: 'Nguyễn Hải Đăng (Chủ shop Pastel Tee)',
        authorAvatar: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg',
        badge: 'Đã mua bản quyền POD',
        rating: 5,
        date: '2 ngày trước',
        comment: 'Nét vẽ của Lan Chi thực sự đỉnh chóp! File PSD bàn giao rất ngăn nắp, tách layer chuẩn để xưởng in DTG áo thun làm việc trơn tru. Bộ sưu tập áo thun mùa hè của shop mình bán cháy hàng sau 3 ngày mở bán.',
        artworkThumb: '2e72c41b49afad2d08530b6a0475ba66.jpg',
        artistReply: 'Cảm ơn shop Hải Đăng rất nhiều! Chúc BST áo thun tiếp theo của bạn tiếp tục bùng nổ doanh số nhé!'
      },
      {
        id: 'rev-2',
        author: 'Trần Thảo Ly (Nhà Sưu Tầm Nghệ Thuật)',
        authorAvatar: '45fbff086b31157aa2e23b94f086bd06.jpg',
        badge: 'Đã đặt Commission độc bản',
        rating: 5,
        date: '1 tuần trước',
        comment: 'Mình đặt tranh vẽ chân dung kỷ niệm sinh nhật người yêu. Chi giao tranh trước deadline 2 ngày, màu sắc ngoài đời in lên canvas vải canvas siêu nét, nhìn rất có hồn. Chắc chắn sẽ quay lại đặt tiếp!',
        artworkThumb: 'f3aaa4fab0042f111273a9a740806a2a.jpg',
        artistReply: 'Dạ em cảm ơn chị Ly! Rất vui vì anh chị đã yêu thích bức tranh ạ.'
      },
      {
        id: 'rev-3',
        author: 'Minh Hoàng (Book Editor - NXB Trẻ)',
        authorAvatar: '64606c0f0bec432548c54134316a58c7.jpg',
        badge: 'Đã mua bản quyền xuất bản',
        rating: 5,
        date: '2 tuần trước',
        comment: 'Phong cách thơ mộng rất hợp với tản văn thanh xuân. Hợp đồng bản quyền điện tử của ARTFAIR minh bạch, giải ngân nhanh và an tâm pháp lý tuyệt đối.',
        artworkThumb: 'bacedd96a8c1e587dc7174acb7632f80.jpg',
        artistReply: 'Em rất vinh dự khi được đồng hành cùng dự án sách của NXB ạ!'
      }
    ]
  },

  'kietnguyen': {
    id: 'kietnguyen',
    name: 'Kiệt Nguyễn (StreetArt Co.)',
    shortName: 'Kiệt Nguyễn',
    penName: 'StreetArt Co.',
    roleTitle: 'Vector Graphic & T-Shirt Streetwear Specialist',
    avatar: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg',
    coverImage: 'd64d39d01b46f5a1306800d724570c53.jpg',
    bio: 'Chuyên thiết kế graphic tee, hoodie, merchandise và nhận diện đường phố cho các local brand trẻ. Phong cách giao thoa giữa Y2K, Cyberpunk và văn hóa đương đại.',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    joinedDate: 'Tháng 1, 2024',
    verified: true,
    badgeLabel: 'Top Seller POD • Verified Master',
    status: 'accepting',
    statusText: 'Đang nhận đơn thiết kế Local Brand (3 slot trống)',
    rating: 4.98,
    reviewsCount: 215,
    responseRate: '100%',
    responseTime: '< 30 phút',
    artworksSold: 380,
    followersCount: '2.8k',
    specialties: ['Graphic Tee Streetwear', 'Vector Tách Màu In Lụa', 'Mascot Y2K', 'Cyberpunk Mech', 'Typography Khổ Lớn'],
    socialLinks: { behance: '#', instagram: '#', facebook: '#' },
    commissionPackages: [
      {
        id: 'pkg-kn-1',
        title: 'Gói Mini Graphic & Sticker Merch',
        badge: 'Khởi Điểm',
        price: 2250000,
        deliveryDays: 4,
        revisions: 2,
        features: [
          '1 Graphic Vector size nhỏ (in ngực áo / sticker die-cut)',
          'Tối đa 4 màu in sắc nét, file vector chuẩn .AI',
          'Tặng kèm mockup áo thun phôi trắng / đen',
          'Quyền sản xuất POD dưới 3,000 bản'
        ]
      },
      {
        id: 'pkg-kn-2',
        title: 'Gói Full-Back Graphic Tee Streetwear',
        badge: 'Best Seller POD',
        popular: true,
        price: 8000000,
        deliveryDays: 7,
        revisions: 4,
        features: [
          'Thiết kế full lưng áo Oversized cực kỳ hầm hố & bắt trend',
          'File Vector CMYK phân màu in lụa hoặc in kỹ thuật số DTG',
          'Kèm file in ngực áo đồng bộ + nhãn dệt cổ áo',
          'Bộ 5 mockup studio chân thực phục vụ quảng cáo Shopee/TikTok',
          'Cấp quyền thương mại POD không giới hạn số lượng'
        ]
      }
    ],
    reviews: [
      {
        id: 'rev-kn-1',
        author: 'Đức Huy (Founder Saigon Soul)',
        authorAvatar: '64606c0f0bec432548c54134316a58c7.jpg',
        badge: 'Đã đặt BST Độc Quyền',
        rating: 5,
        date: '3 ngày trước',
        comment: 'Làm việc với Kiệt cực kỳ chuyên nghiệp và chuẩn chỉ từng milimet. File in lụa tách màu quá đẹp, thợ in khen nức nở.',
        artworkThumb: 'd64d39d01b46f5a1306800d724570c53.jpg',
        artistReply: 'Cảm ơn anh Huy! Rất vui được hợp tác với anh.'
      }
    ]
  },

  'hoanglong': {
    id: 'hoanglong',
    name: 'Hoàng Long Art',
    shortName: 'Hoàng Long',
    penName: 'Hoàng Long Studio',
    roleTitle: 'Fantasy Concept Artist & Game Environment Designer',
    avatar: 'd4c0ab69c4209ec4c049d75119d9c410.jpg',
    coverImage: 'd4c0ab69c4209ec4c049d75119d9c410.jpg',
    bio: 'Thổi hồn vào thế giới thần tiên và viễn tưởng kỳ ảo với kỹ thuật ánh sáng huyền bí. Từng tham gia thiết kế bối cảnh cho nhiều tựa game indie và phim hoạt hình 2D/3D.',
    location: 'Đà Nẵng, Việt Nam',
    joinedDate: 'Tháng 4, 2024',
    verified: true,
    badgeLabel: 'Featured Concept Artist',
    status: 'accepting',
    statusText: 'Đang nhận dự án Concept Game & Bìa Album (2 slot)',
    rating: 4.92,
    reviewsCount: 94,
    responseRate: '98%',
    responseTime: '< 2 giờ',
    artworksSold: 110,
    followersCount: '3.1k',
    specialties: ['Concept Art Game', 'Môi Trường Thần Thoại', 'Hiệu Ứng Ánh Sáng Huyền Bí', 'Matte Painting', 'Key Visual AAA'],
    socialLinks: { behance: '#', instagram: '#', facebook: '#' },
    commissionPackages: [
      {
        id: 'pkg-hl-1',
        title: 'Gói Phác Thảo Bối Cảnh (Environment Rough)',
        badge: 'Ý Tưởng',
        price: 3750000,
        deliveryDays: 6,
        revisions: 2,
        features: ['3 bản phác thảo thumbnail bối cảnh', '1 bản hoàn thiện màu sắc cơ bản', 'Độ phân giải 4K 300 DPI']
      }
    ],
    reviews: []
  },

  'minhtri': {
    id: 'minhtri',
    name: 'Minh Trí Studio',
    shortName: 'Minh Trí',
    penName: 'Minh Trí Studio',
    roleTitle: 'Cyberpunk & Sci-Fi 3D Concept Artist',
    avatar: '34afaac0faa70a1bb6c4b5ad89b77756.jpg',
    coverImage: '34afaac0faa70a1bb6c4b5ad89b77756.jpg',
    bio: 'Khám phá thế giới viễn tưởng tương lai qua các tác phẩm 3D kết hợp 2D Paint-over.',
    location: 'Hà Nội, Việt Nam',
    joinedDate: 'Tháng 2, 2024',
    verified: true,
    badgeLabel: 'Pro Member • 3D Specialist',
    status: 'accepting',
    statusText: 'Đang nhận đơn thiết kế Visual & Bìa Album',
    rating: 4.9,
    reviewsCount: 86,
    responseRate: '97%',
    responseTime: '< 2 giờ',
    artworksSold: 98,
    followersCount: '2.2k',
    specialties: ['Cyberpunk Cityscape', 'Sci-Fi Vehicle', 'Blender 3D Concept', 'Visual EDM Music', 'Matte Painting'],
    socialLinks: { behance: '#', instagram: '#', facebook: '#' },
    commissionPackages: [],
    reviews: []
  },

  'hoaithuong': {
    id: 'hoaithuong',
    name: 'Hoài Thương',
    shortName: 'Hoài Thương',
    penName: 'Thương Botanical Art',
    roleTitle: 'Họa Sĩ Minh Họa Thực Vật & Tranh Canvas Decor',
    avatar: '45fbff086b31157aa2e23b94f086bd06.jpg',
    coverImage: '2e72c41b49afad2d08530b6a0475ba66.jpg',
    bio: 'Lấy cảm hứng từ nét đẹp thảo mộc nhiệt đới và sự tĩnh lặng trong nội tâm.',
    location: 'Huế, Việt Nam',
    joinedDate: 'Tháng 5, 2024',
    verified: true,
    badgeLabel: 'Botanical Decor Master',
    status: 'accepting',
    statusText: 'Đang nhận đơn vẽ Tranh Canvas Nhà Ở & Quán Cafe',
    rating: 4.96,
    reviewsCount: 110,
    responseRate: '99%',
    responseTime: '< 1 giờ',
    artworksSold: 165,
    followersCount: '2.5k',
    specialties: ['Botanical Art', 'Tranh Treo Canvas', 'Khăn Lụa Nghệ Thuật', 'Vỏ Gối & Decor'],
    socialLinks: { behance: '#', instagram: '#', facebook: '#' },
    commissionPackages: [],
    reviews: []
  },

  'duchuy': {
    id: 'duchuy',
    name: 'Đức Huy (Minimalist Lab)',
    shortName: 'Đức Huy',
    penName: 'Minimalist Lab',
    roleTitle: 'Chuyên Gia Thiết Kế Logo & Ký Hiệu Tối Giản',
    avatar: '64606c0f0bec432548c54134316a58c7.jpg',
    coverImage: 'a8c83640b85ec90791c3ec2dcdff8de9.jpg',
    bio: 'Theo đuổi chủ nghĩa tối giản và hình học thuần khiết.',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    joinedDate: 'Tháng 2, 2024',
    verified: true,
    badgeLabel: 'Branding Specialist',
    status: 'accepting',
    statusText: 'Đang nhận đơn thiết kế Logo & Nhận diện',
    rating: 4.94,
    reviewsCount: 140,
    responseRate: '100%',
    responseTime: '< 30 phút',
    artworksSold: 175,
    followersCount: '1.9k',
    specialties: ['Logo Tối Giản', 'Ký Hiệu Hình Học', 'Origami Symbol', 'Brand Guidelines'],
    socialLinks: { behance: '#', instagram: '#', facebook: '#' },
    commissionPackages: [],
    reviews: []
  },

  'alexdang': {
    id: 'alexdang',
    name: 'Alex Đặng',
    shortName: 'Alex Đặng',
    penName: 'Alex Mecha Concept',
    roleTitle: 'Họa Sĩ Digital Art & Thiết Kế Cơ Khí Viễn Tưởng',
    avatar: 'f945056555f897973024361f3a2951e9.jpg',
    coverImage: 'f945056555f897973024361f3a2951e9.jpg',
    bio: 'Chuyên về nghệ thuật viễn tưởng cơ khí (Mecha) và Cyber-Angel.',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    joinedDate: 'Tháng 1, 2024',
    verified: true,
    badgeLabel: 'Master Mecha Artist',
    status: 'accepting',
    statusText: 'Đang nhận 1 slot dự án VIP cuối cùng',
    rating: 5.0,
    reviewsCount: 78,
    responseRate: '98%',
    responseTime: '< 1 giờ',
    artworksSold: 92,
    followersCount: '3.6k',
    specialties: ['Mecha Concept', 'Cyber Angel', 'Nhân Vật Game AAA', 'Poster Hologram'],
    socialLinks: { behance: '#', instagram: '#', facebook: '#' },
    commissionPackages: [],
    reviews: []
  }
};

// SAMPLE USER PROFILES FOR ROLE-BASED DASHBOARD (ĐỒNG BỘ VNĐ)
const MOCK_USER_PROFILES = {
  collector: {
    id: 'user-buyer-01',
    role: 'collector',
    name: 'Hoàng My (GenZ POD Shop)',
    email: 'my.streetwear@gmail.com',
    roleLabel: 'Chủ Shop POD & Nhà Sưu Tầm',
    avatar: '2e72c41b49afad2d08530b6a0475ba66.jpg',
    bio: 'Sáng lập GenZ Streetwear Brand. Chuyên sưu tầm bản quyền hình in áo thun, poster decor và quà tặng nghệ thuật.',
    joinedDate: 'Tháng 5, 2025',
    followingArtists: ['lanchi', 'kietnguyen', 'hoanglong', 'duchuy'],
    purchasedLicenses: [
      {
        id: 'LIC-2026-901',
        artId: 'AF-2026-02',
        title: 'Cyberpunk Streetwear Vector Edition',
        artist: 'Kiệt Nguyễn (StreetArt Co.)',
        licenseTier: 'Thương Mại POD Mở Rộng (13.750.000 VNĐ)',
        price: 13750000,
        purchaseDate: '2026-09-15',
        format: 'AI Vector CMYK, EPS, PNG 600 DPI',
        image: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg',
        certificateId: 'CERT-POD-88219-KN'
      },
      {
        id: 'LIC-2026-902',
        artId: 'AF-2026-04',
        title: 'Khu Vườn Bí Mật Của Nàng Thơ',
        artist: 'Hoài Thương',
        licenseTier: 'Thương Mại POD Nhỏ (4.750.000 VNĐ)',
        price: 4750000,
        purchaseDate: '2026-09-18',
        format: 'PSD layered 300 DPI, TIFF',
        image: '45fbff086b31157aa2e23b94f086bd06.jpg',
        certificateId: 'CERT-POD-77123-HT'
      }
    ],
    liveCommissions: [
      {
        ticketId: 'COMM-9824',
        artistName: 'Lan Chi (Chi Art Studio)',
        artistAvatar: '2e72c41b49afad2d08530b6a0475ba66.jpg',
        projectTitle: 'Thiết Kế Áo Thun Pastel Mèo Chiêu Tài Y2K',
        budget: '6.250.000 VNĐ',
        step: 2,
        stepLabel: 'Đang Duyệt Phác Thảo Thô (Sketch 2/3)',
        deadline: '2026-10-10',
        lastUpdate: 'Vừa cập nhật 2 giờ trước'
      },
      {
        ticketId: 'COMM-7731',
        artistName: 'Kiệt Nguyễn (StreetArt Co.)',
        artistAvatar: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg',
        projectTitle: 'BST Graphic Full-Back Hoodies Cyberpunk',
        budget: '8.000.000 VNĐ',
        step: 3,
        stepLabel: 'Đang Tách Màu Vector In Lụa',
        deadline: '2026-10-05',
        lastUpdate: 'Vừa cập nhật hôm qua'
      }
    ]
  },

  artist: {
    id: 'user-creator-01',
    role: 'artist',
    name: 'Minh Trí Studio',
    email: 'minhtri.art@artfair.vn',
    roleLabel: 'Pro Creator & Cyberpunk Artist',
    avatar: '34afaac0faa70a1bb6c4b5ad89b77756.jpg',
    coverImage: '34afaac0faa70a1bb6c4b5ad89b77756.jpg',
    bio: 'Họa sĩ Digital Art & 3D Concept chuyên nghiệp. Nhận sáng tác bìa album, visual sân khấu và thiết kế thương mại độc quyền.',
    joinedDate: 'Tháng 2, 2024',
    status: 'accepting',
    statusText: '🟢 Đang nhận đơn Commission',
    rating: 4.90,
    reviewsCount: 86,
    artworksSold: 98,
    revenueTotal: '356.250.000 VNĐ',
    incomingRequests: [
      {
        requestId: 'REQ-1092',
        clientName: 'Hoàng My (GenZ POD)',
        clientAvatar: '2e72c41b49afad2d08530b6a0475ba66.jpg',
        projectTitle: 'Concept Visual Cyberpunk Bìa Album EDM "Neon City 2026"',
        packageLabel: 'Gói Visual Album Thương Mại (8.750.000 VNĐ)',
        budget: '8.750.000 VNĐ',
        deadline: '2026-10-15',
        status: 'pending',
        briefSummary: 'Cần vẽ 1 bối cảnh thành phố viễn tưởng rực màu neon tím pha cam đào, có phi thuyền không gian phía trên.'
      },
      {
        requestId: 'REQ-1088',
        clientName: 'Khang Producer (Sunburst)',
        clientAvatar: 'f945056555f897973024361f3a2951e9.jpg',
        projectTitle: 'Thiết Kế Poster Hologram Dự Án Game Sci-Fi',
        packageLabel: 'Gói Độc Quyền Full Buyout (55.000.000 VNĐ)',
        budget: '55.000.000 VNĐ',
        deadline: '2026-10-25',
        status: 'accepted',
        briefSummary: 'Bản vẽ độc quyền toàn quyền sở hữu 8K TIFF kèm render passes 3D Blender.'
      }
    ]
  }
};

// =============================================================================
// CENTRALIZED ARTWORKS DATABASE
// =============================================================================
var ARTWORKS_DATABASE = window.ARTWORKS_DATABASE = [
  {
    id: 'AF-2026-01',
    title: 'Giấc Mộng Hoa Đào & Ánh Trăng',
    artist: 'Lan Chi (Chi Art Studio)',
    artistAvatar: '2e72c41b49afad2d08530b6a0475ba66.jpg',
    category: 'illustration',
    categoryName: 'Minh Họa',
    image: '2e72c41b49afad2d08530b6a0475ba66.jpg',
    basePrice: 50,
    commercialPrice: 180,
    extendedPrice: 480,
    exclusivePrice: 1500,
    tags: ['#illustration', '#watercolor', '#vietnameseart', '#dreamy'],
    likes: 342,
    views: 1850,
    software: 'Procreate 5.3 & Photoshop',
    dimensions: '4800 x 7200 px (300 DPI)',
    formats: 'PNG, PSD layered, PDF High-res',
    usage: 'Bìa sách, Áo thun Pastel, Canvas treo tường',
    description: 'Bức họa lấy cảm hứng từ những đóa đào chớm nở dưới vầng trăng mùa xuân. Tông màu hồng đào dịu dàng mang lại cảm giác bình yên và chữa lành cho người thưởng lãm.',
    date: '2026-09-15'
  },
  {
    id: 'AF-2026-02',
    title: 'Cyberpunk Streetwear Vector Edition',
    artist: 'Kiệt Nguyễn (StreetArt Co.)',
    artistAvatar: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg',
    category: 'tshirt',
    categoryName: 'Thiết Kế Áo Thun (POD)',
    image: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg',
    basePrice: 65,
    commercialPrice: 220,
    extendedPrice: 550,
    exclusivePrice: 1800,
    tags: ['#streetwear', '#pod', '#vector', '#cyberpunk', '#genz'],
    likes: 512,
    views: 3100,
    software: 'Adobe Illustrator 2026',
    dimensions: '6000 x 4000 px (Vector CMYK)',
    formats: 'AI Vector, EPS, SVG, PNG 600 DPI',
    usage: 'In lụa áo thun Oversized, Hoodie, Decal dán xe',
    description: 'Thiết kế graphic tee chuẩn vector phân tách màu in lụa chuyên nghiệp. Phong cách đường phố Cyberpunk tương lai sắc sảo, tối ưu hóa cho công nghệ in DTG và in lụa cao cấp.',
    date: '2026-09-20'
  },
  {
    id: 'AF-2026-03',
    title: 'Thành Phố Hoàng Hôn Vô Tận (Neon Horizon)',
    artist: 'Minh Trí Studio',
    artistAvatar: '34afaac0faa70a1bb6c4b5ad89b77756.jpg',
    category: 'digital',
    categoryName: 'Digital Art & Concept',
    image: '34afaac0faa70a1bb6c4b5ad89b77756.jpg',
    basePrice: 80,
    commercialPrice: 280,
    extendedPrice: 650,
    exclusivePrice: 2200,
    tags: ['#conceptart', '#cyberpunk', '#neon', '#cityscape', '#scifi'],
    likes: 420,
    views: 2480,
    software: 'Blender 4.2 & Photoshop',
    dimensions: '5000 x 3330 px (300 DPI)',
    formats: 'TIFF 16-bit, PSD layered, PNG',
    usage: 'Concept Game, Poster điện ảnh, Bìa album EDM',
    description: 'Thành phố tương lai chìm đắm trong ánh hoàng hôn tím pha cam đào. Phù hợp hoàn hảo cho các dự án game indie, visual sân khấu và bìa album nhạc điện tử.',
    date: '2026-09-18'
  },
  {
    id: 'AF-2026-04',
    title: 'Khu Vườn Bí Mật Của Nàng Thơ',
    artist: 'Hoài Thương',
    artistAvatar: '45fbff086b31157aa2e23b94f086bd06.jpg',
    category: 'decor',
    categoryName: 'Trang Trí & Poster',
    image: '45fbff086b31157aa2e23b94f086bd06.jpg',
    basePrice: 55,
    commercialPrice: 190,
    extendedPrice: 490,
    exclusivePrice: 1600,
    tags: ['#poster', '#decor', '#botanical', '#aesthetic', '#interior'],
    likes: 678,
    views: 4200,
    software: 'Clip Studio Paint EX',
    dimensions: '4800 x 6000 px (300 DPI)',
    formats: 'PSD 300 DPI, TIFF, PDF in ấn',
    usage: 'Tranh Canvas phòng khách, Khăn lụa, Vỏ gối Decor',
    description: 'Họa tiết thực vật thanh lịch hòa quyện cùng hình tượng thiếu nữ Á Đông. Tác phẩm bán chạy nhất trong danh mục tranh in canvas decor căn hộ phong cách Wabi-sabi.',
    date: '2026-09-22'
  },
  {
    id: 'AF-2026-05',
    title: 'Ký Hiệu Tối Giản: Vũ Trụ Origami',
    artist: 'Đức Huy (Minimalist Lab)',
    artistAvatar: '64606c0f0bec432548c54134316a58c7.jpg',
    category: 'logo',
    categoryName: 'Logo & Thương Hiệu',
    image: '64606c0f0bec432548c54134316a58c7.jpg',
    basePrice: 70,
    commercialPrice: 250,
    extendedPrice: 600,
    exclusivePrice: 2000,
    tags: ['#logo', '#branding', '#minimalist', '#vector', '#origami'],
    likes: 290,
    views: 1950,
    software: 'Adobe Illustrator 2026',
    dimensions: 'Vector Scales Infinite (CMYK & RGB)',
    formats: 'AI Vector, EPS, SVG, PNG 4K',
    usage: 'Logo nhận diện thương hiệu, Bao bì cà phê, App Icon',
    description: 'Hình thái gấp giấy Origami biến hóa thành biểu tượng vô cực không gian. Thiết kế đạt tỷ lệ vàng hình học, thích hợp làm linh hồn cho các thương hiệu phong cách Scandinavian hoặc Minimalist.',
    date: '2026-09-12'
  },
  {
    id: 'AF-2026-06',
    title: 'Hơi Thở Phố Cổ: Chiều Mưa Hà Nội',
    artist: 'Hà An (Retro Corner)',
    artistAvatar: 'a5c6a5b0e7502a38e84ca1cc8924946e.jpg',
    category: 'illustration',
    categoryName: 'Minh Họa',
    image: 'a5c6a5b0e7502a38e84ca1cc8924946e.jpg',
    basePrice: 50,
    commercialPrice: 180,
    extendedPrice: 480,
    exclusivePrice: 1500,
    tags: ['#hanoi', '#vintage', '#nostalgia', '#illustration', '#rain'],
    likes: 812,
    views: 5300,
    software: 'Procreate 5.3',
    dimensions: '4000 x 5000 px (300 DPI)',
    formats: 'PSD layered, PNG, JPEG High-res',
    usage: 'Postcard du lịch, Ly sứ lưu niệm, Tranh treo quán cafe',
    description: 'Một góc ban công rêu phong nhuốm màu ký ức dưới cơn mưa rào tháng Bảy. Tác phẩm đem lại cảm giác hoài niệm ấm áp về những tháng ngày thanh xuân bình dị.',
    date: '2026-09-10'
  },
  {
    id: 'AF-2026-07',
    title: 'Biệt Đội Mèo Lái Tàu Vũ Trụ (Space Neko)',
    artist: 'Lan Chi (Chi Art Studio)',
    artistAvatar: '2e72c41b49afad2d08530b6a0475ba66.jpg',
    category: 'tshirt',
    categoryName: 'Thiết Kế Áo Thun (POD)',
    image: 'a5ce830d24dd490e93701808952d6bd6.jpg',
    basePrice: 60,
    commercialPrice: 200,
    extendedPrice: 500,
    exclusivePrice: 1700,
    tags: ['#cats', '#space', '#cute', '#tshirt', '#genz'],
    likes: 935,
    views: 6100,
    software: 'Adobe Photoshop & Procreate',
    dimensions: '4500 x 5400 px (300 DPI)',
    formats: 'PNG nền trong suốt, PSD phân layer màu',
    usage: 'In áo thun Gen Z, Bình giữ nhiệt, Sticker Hologram',
    description: 'Hình minh họa chú mèo phi hành gia ngộ nghĩnh du hành giữa các dải thiên hà kẹo ngọt. Tối ưu hoàn hảo cho các shop kinh doanh ấn phẩm Gen Z trên Shopee và TikTok Shop.',
    date: '2026-09-24'
  },
  {
    id: 'AF-2026-08',
    title: 'Bộ Nhận Diện Nước Hoa Mộc Miên (Botanical Perfume)',
    artist: 'Đức Huy (Minimalist Lab)',
    artistAvatar: '64606c0f0bec432548c54134316a58c7.jpg',
    category: 'logo',
    categoryName: 'Logo & Thương Hiệu',
    image: 'a8c83640b85ec90791c3ec2dcdff8de9.jpg',
    basePrice: 75,
    commercialPrice: 260,
    extendedPrice: 620,
    exclusivePrice: 2100,
    tags: ['#branding', '#perfume', '#botanical', '#luxury', '#packaging'],
    likes: 310,
    views: 2100,
    software: 'Adobe Illustrator 2026',
    dimensions: 'Vector Master Files (CMYK)',
    formats: 'AI Vector, EPS, PDF, Mockup 3D',
    usage: 'Tem nhãn chai nước hoa, Hộp quà tặng mỹ phẩm cao cấp',
    description: 'Trọn bộ typography và hoa văn viền khắc họa hoa mộc miên thanh tao. Phong cách thiết kế sang trọng, tối giản nhưng đậm dấu ấn hương thơm phương Đông.',
    date: '2026-09-21'
  },
  {
    id: 'AF-2026-09',
    title: 'Tiếng Gọi Rừng Xanh: Nàng Thơ & Hươu Sao',
    artist: 'Hoài Thương',
    artistAvatar: '45fbff086b31157aa2e23b94f086bd06.jpg',
    category: 'decor',
    categoryName: 'Trang Trí & Poster',
    image: 'bacedd96a8c1e587dc7174acb7632f80.jpg',
    basePrice: 65,
    commercialPrice: 220,
    extendedPrice: 530,
    exclusivePrice: 1750,
    tags: ['#forest', '#nature', '#canvas', '#decor', '#deer'],
    likes: 540,
    views: 3800,
    software: 'Photoshop & Rebelle 7',
    dimensions: '4800 x 6000 px (300 DPI)',
    formats: 'PSD 300 DPI, TIFF, PDF High-res',
    usage: 'Tranh Canvas cỡ lớn, Decor phòng ngủ, Tạp chí mỹ thuật',
    description: 'Khung cảnh kỳ diệu khi ánh ban mai xuyên qua tán lá rậm rạp của khu rừng nguyên sinh. Tạo điểm nhấn an yên và thiền định cho không gian sống hiện đại.',
    date: '2026-09-14'
  },
  {
    id: 'AF-2026-10',
    title: 'Bộ Chữ Thái Học Hiện Đại (Vietnamese Typography)',
    artist: 'Phúc Khang (Type Lab)',
    artistAvatar: 'c515018dc244bab598464512770a2417.jpg',
    category: 'typography',
    categoryName: 'Font Chữ Nghệ Thuật',
    image: 'c515018dc244bab598464512770a2417.jpg',
    basePrice: 55,
    commercialPrice: 190,
    extendedPrice: 470,
    exclusivePrice: 1550,
    tags: ['#typography', '#font', '#vietnamesetype', '#poster', '#modern'],
    likes: 415,
    views: 2900,
    software: 'Glyphs 3 & Illustrator',
    dimensions: 'OTF, TTF, WOFF2 + Vector Glyph Sheet',
    formats: 'Full Typeface Family (3 Weights) + Vector Artwork',
    usage: 'Tựa đề phim điện ảnh, Bìa sách văn học, Poster triển lãm',
    description: 'Bộ font chữ lấy cảm hứng từ những bia tiến sĩ Văn Miếu kết hợp nét cọ đương đại. Hỗ trợ đầy đủ tiếng Việt có dấu chuẩn Unicode và bộ ký tự mở rộng.',
    date: '2026-09-23'
  },
  {
    id: 'AF-2026-11',
    title: 'Đêm Huyền Bí Của Phù Thủy Nhỏ',
    artist: 'Hoàng Long Art',
    artistAvatar: 'd4c0ab69c4209ec4c049d75119d9c410.jpg',
    category: 'digital',
    categoryName: 'Digital Art & Concept',
    image: 'd4c0ab69c4209ec4c049d75119d9c410.jpg',
    basePrice: 75,
    commercialPrice: 260,
    extendedPrice: 620,
    exclusivePrice: 2100,
    tags: ['#fantasy', '#witch', '#magic', '#digitalpainting', '#night'],
    likes: 620,
    views: 4100,
    software: 'Photoshop 2026 & Paint Tool SAI',
    dimensions: '5400 x 3600 px (300 DPI)',
    formats: 'PSD 24 layers, PNG, JPEG',
    usage: 'Bìa tiểu thuyết kỳ ảo, Game Card Art, Poster phát sáng dạ quang',
    description: 'Thế giới phép thuật lung linh ánh đom đóm dạ quang giữa khu rừng cổ tích. Kỹ thuật ánh sáng volumetric đỉnh cao tạo chiều sâu hút mắt cho người xem.',
    date: '2026-09-19'
  },
  {
    id: 'AF-2026-12',
    title: 'Typo Đường Phố Sài Gòn: Rực Rỡ & Năng Động',
    artist: 'Kiệt Nguyễn (StreetArt Co.)',
    artistAvatar: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg',
    category: 'typography',
    categoryName: 'Font Chữ Nghệ Thuật',
    image: 'd64d39d01b46f5a1306800d724570c53.jpg',
    basePrice: 50,
    commercialPrice: 180,
    extendedPrice: 480,
    exclusivePrice: 1500,
    tags: ['#streetwear', '#typography', '#graffiti', '#saigon', '#vector'],
    likes: 388,
    views: 2600,
    software: 'Adobe Illustrator 2026',
    dimensions: 'Vector CMYK Master Sheet',
    formats: 'AI Vector, EPS, SVG, PNG High-res',
    usage: 'Áo thun Streetwear, Nón lưỡi trai, Sticker skate',
    description: 'Chữ vẽ tay graffiti mang nhịp sống trẻ trung, phóng khoáng của đô thị phương Nam. File vector sắc nét chuẩn in lụa tách 3 lớp màu nổi bật.',
    date: '2026-09-16'
  },
  {
    id: 'AF-2026-13',
    title: 'Mèo Thần Tài & Cá Chép Vượt Vũ Môn',
    artist: 'Kiệt Nguyễn (StreetArt Co.)',
    artistAvatar: '34afaac0faa70a1bb6c4b5ad89b77756-2.jpg',
    category: 'tshirt',
    categoryName: 'Thiết Kế Áo Thun (POD)',
    image: 'e75243ade5db4a77b12156178c066f2e.jpg',
    basePrice: 70,
    commercialPrice: 240,
    extendedPrice: 580,
    exclusivePrice: 1900,
    tags: ['#luckcat', '#koi', '#streetwear', '#oriental', '#tshirt'],
    likes: 720,
    views: 4900,
    software: 'Illustrator & Procreate',
    dimensions: '5000 x 5000 px (Vector CMYK)',
    formats: 'AI Vector, EPS, PNG nền trong suốt 600 DPI',
    usage: 'In áo khoác Bomber, Lưng áo Hoodie, Khăn Bandana',
    description: 'Sự kết hợp táo bạo giữa mỹ thuật truyền thống Á Đông và văn hóa Hip-hop hiện đại. Thiết kế mang ý nghĩa phong thủy thịnh vượng, may mắn và kiên định.',
    date: '2026-09-25'
  },
  {
    id: 'AF-2026-14',
    title: 'Bản Hòa Tấu Mùa Thu: Giai Điệu Lá Vàng',
    artist: 'Lan Chi (Chi Art Studio)',
    artistAvatar: '2e72c41b49afad2d08530b6a0475ba66.jpg',
    category: 'illustration',
    categoryName: 'Minh Họa',
    image: 'f3aaa4fab0042f111273a9a740806a2a.jpg',
    basePrice: 60,
    commercialPrice: 210,
    extendedPrice: 510,
    exclusivePrice: 1700,
    tags: ['#illustration', '#autumn', '#nature', '#warmcolors', '#peaceful'],
    likes: 470,
    views: 3200,
    software: 'Procreate 5.3 & Photoshop',
    dimensions: '4200 x 5600 px (300 DPI)',
    formats: 'PSD layered, PNG không nền, PDF High-res',
    usage: 'Trang phục Linen, Khăn quàng cổ lụa, Bìa sổ tay Planner',
    description: 'Những gam màu vàng mù tạt, cam đất và nâu ấm dệt nên khúc ca êm dịu của mùa lá rụng. Thiết kế mang phong cách tranh minh họa châu Âu đương đại.',
    date: '2026-09-17'
  },
  {
    id: 'AF-2026-15',
    title: 'Thiên Thần Cơ Khí & Vương Miện Ánh Sáng',
    artist: 'Alex Đặng',
    artistAvatar: 'f945056555f897973024361f3a2951e9.jpg',
    category: 'digital',
    categoryName: 'Digital Art & Concept',
    image: 'f945056555f897973024361f3a2951e9.jpg',
    basePrice: 100,
    commercialPrice: 350,
    extendedPrice: 850,
    exclusivePrice: 3000,
    tags: ['#digitalart', '#mecha', '#angel', '#conceptart', '#cyber'],
    likes: 960,
    views: 7400,
    software: 'Photoshop 2026 & ZBrush',
    dimensions: '4800 x 7200 px (300 DPI High Bitrate)',
    formats: 'PSD 36 layers, TIFF 16-bit, PNG',
    usage: 'Tượng sưu tầm 3D, Tranh Hologram, Bìa game AAA',
    description: 'Kiệt tác nghệ thuật cơ khí viễn tưởng (Mecha-Angel) với vương miện photon rực cháy. Tác phẩm độc quyền cao cấp với mức giá bản quyền toàn phần lên tới 75.000.000 VNĐ.',
    date: '2026-09-28'
  }
];

// Helper: Map artist name to slug
function getArtistSlugByName(name) {
  if (!name) return 'lanchi';
  const clean = name.toLowerCase();
  if (clean.includes('lan chi')) return 'lanchi';
  if (clean.includes('kiệt nguyễn') || clean.includes('streetart')) return 'kietnguyen';
  if (clean.includes('hoàng long')) return 'hoanglong';
  if (clean.includes('minh trí')) return 'minhtri';
  if (clean.includes('hoài thương')) return 'hoaithuong';
  if (clean.includes('đức huy') || clean.includes('minimalist')) return 'duchuy';
  if (clean.includes('alex')) return 'alexdang';
  return 'lanchi';
}

function navigateToArtistProfile(artistNameOrId) {
  let slug = 'lanchi';
  if (ARTISTS_DATA[artistNameOrId]) {
    slug = artistNameOrId;
  } else {
    slug = getArtistSlugByName(artistNameOrId);
  }
  window.location.href = `artist-profile.html?id=${encodeURIComponent(slug)}`;
}

function navigateToUserProfile() {
  window.location.href = 'user-profile.html';
}

// TỰ ĐỘNG QUY ĐỔI GIÁ KHO ARTWORK SANG VNĐ NẾU LÀ GIÁ USD GỐC
if (typeof ARTWORKS_DATABASE !== 'undefined' && Array.isArray(ARTWORKS_DATABASE)) {
  ARTWORKS_DATABASE.forEach(art => {
    if (art.basePrice && art.basePrice < 10000) {
      art.basePrice = art.basePrice * USD_TO_VND_RATE;
      art.commercialPrice = (art.commercialPrice || 180) * USD_TO_VND_RATE;
      art.extendedPrice = (art.extendedPrice || 480) * USD_TO_VND_RATE;
      art.exclusivePrice = (art.exclusivePrice || 1500) * USD_TO_VND_RATE;
    }
  });
}

// ĐẢM BẢO GẮN TOÀN CỤC CHO WINDOW
window.ARTISTS_DATA = ARTISTS_DATA;
window.MOCK_USER_PROFILES = MOCK_USER_PROFILES;