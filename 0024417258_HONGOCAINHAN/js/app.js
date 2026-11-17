// Câu 2: viết JavaScript tại đây

const API_URL = 'http://localhost:4000';

// Hàm có sẵn: đổi giờ UTC sang giờ Việt Nam, vd "08:00 12/09/2026"
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',

    
  });

  
// cau 2a
const formatSeats = (event) => {
  const remaining = event.capacity - event.registeredCount;
  return remaining > 0 ? `Còn ${remaining}/${event.capacity} chỗ` : 'Hết chỗ';
};

//cau 2b

const renderEvents = (events) => {
  const eventListEl = document.querySelector('#event-list');

  const cards = events.map((event) => {
    // 1. Tạo thẻ <article class="event-card">
    const article = document.createElement('article');
    article.setAttribute('class', 'event-card');

    // 2. Tạo thẻ <img src="img/event.svg" alt="...">
    const img = document.createElement('img');
    img.setAttribute('src', 'img/event.svg');
    img.setAttribute('alt', event.name);

    // 3. Tạo <div class="card-body">
    const cardBody = document.createElement('div');
    cardBody.setAttribute('class', 'card-body');

    // 4. Tạo <h2><a href="event-detail.html?id=...">Tên sự kiện</a></h2>
    const title = document.createElement('h2');
    title.setAttribute('class', 'card-title');
    const link = document.createElement('a');
    link.setAttribute('href', `event-detail.html?id=${event.id}`);
    link.textContent = event.name;
    title.appendChild(link);

    // 5. Tạo <p>🕒 <time datetime="...">Giờ VN</time></p>
    const timeP = document.createElement('p');
    timeP.setAttribute('class', 'card-time');
    timeP.textContent = '🕒 ';
    const timeEl = document.createElement('time');
    timeEl.setAttribute('datetime', event.startTime);
    timeEl.textContent = formatDateTime(event.startTime); // Dùng hàm có sẵn của đề
    timeP.appendChild(timeEl);

    // 6. Tạo <p>📍 Địa điểm</p>
    const locationP = document.createElement('p');
    locationP.setAttribute('class', 'card-location');
    locationP.textContent = `📍 ${event.location}`;

    // 7. Tạo <p><span class="seats ...">Số chỗ</span></p>
    const seatsP = document.createElement('p');
    seatsP.setAttribute('class', 'card-seats');
    const seatsSpan = document.createElement('span');
    const seatsText = formatSeats(event); // Gọi hàm ở Câu 2a
    seatsSpan.textContent = seatsText;
    seatsSpan.setAttribute(
      'class',
      seatsText === 'Hết chỗ' ? 'seats badge-full' : 'seats'
    );
    seatsP.appendChild(seatsSpan);

    // 8. Ghép các thẻ con vào cardBody và article
    cardBody.append(title, timeP, locationP, seatsP);
    article.append(img, cardBody);

    return article;
  });

  // 9. Thay toàn bộ nội dung cũ của #event-list bằng danh sách card mới
  eventListEl.replaceChildren(...cards);
};

//cau 2c

const loadEvents = async (keyword = '') => {
  const statusEl = document.querySelector('#status');
  // 1. Hiện "Đang tải…" trước khi gọi API
  statusEl.textContent = 'Đang tải…';

  // 2. Dựng tham số URL bằng URLSearchParams: luôn có pageSize=50, chỉ thêm q khi khác rỗng
  const params = new URLSearchParams({ pageSize: '50' });
  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword !== '') {
    params.set('q', trimmedKeyword);
  }

  try {
    // 3. Gọi API
    const response = await fetch(`${API_URL}/api/events?${params.toString()}`);

    // 4. Kiểm tra response.ok (nếu lỗi 500/503 thì ném lỗi xuống catch)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // 5. Đọc JSON và lấy mảng items
    const data = await response.json();
    const events = data.items ?? [];

    // 6. Vẽ danh sách card ra màn hình
    renderEvents(events);

    // 7. Cập nhật dòng thông báo #status
    if (events.length === 0) {
      statusEl.textContent = 'Không có sự kiện nào khớp từ khoá.';
    } else {
      statusEl.textContent = `Tìm thấy ${events.length} sự kiện`;
    }
  } catch {
    // 8. Khi mất kết nối hoặc server trả lỗi (như khi chạy node start.mjs --fail)
    statusEl.textContent = 'Không tải được dữ liệu, vui lòng thử lại.';
  }
};

// 9. Bắt sự kiện gửi form (#search-form) và gọi loadEvents lúc mới mở trang
const searchForm = document.querySelector('#search-form');
const keywordInput = document.querySelector('#keyword');

searchForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Chặn trình duyệt tải lại trang khi bấm nút Tìm / Enter
  loadEvents(keywordInput.value.trim()); // Cắt khoảng trắng thừa và tìm kiếm
});

// Gọi ngay khi vừa mở trang
loadEvents('');
