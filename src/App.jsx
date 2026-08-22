import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Banknote, Plus, Trash2, Clock, Map, Coffee, Car, Home, PieChart, Camera, Shirt, ChevronDown, Edit2, Check, X } from 'lucide-react';
import { io } from 'socket.io-client';
import { destinations } from './data/destinations';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) return import.meta.env.VITE_SERVER_URL;
  if (import.meta.env.DEV) {
    return `http://${window.location.hostname}:4000`;
  }
  return window.location.origin;
};
const socket = io(getSocketUrl(), {
  transports: ['websocket', 'polling']
});

// ─── DEFAULT ITINERARY DATA ───────────────────────────────────────────────────
const mkItem = (name, emoji, img, desc, cost, startTime, endTime, mapUrl = '') => ({
  dest: { name: `${emoji} ${name}`, image: img, activities: [desc], estimatedCost: cost, mapUrl },
  startTime,
  endTime,
});

const DEFAULT_TIMELINE = {
  day1: {
    date: 'Ngày 1 – Tam Cốc',
    items: [
      mkItem('Đến Ninh Bình + ăn sáng', '🌅', 'https://media.mia.vn/uploads/blog-du-lich/ngam-binh-minh-ninh-binh-dep-nhat-o-dau-1-1650767344.jpg', 'Ăn sáng, nghỉ chân', '', '06:30', '07:00'),
      mkItem('TAM CỐC – Đỉnh Mây + Khe Giời', '🚣', 'https://ticotravel.com.vn/wp-content/uploads/2022/05/tam-coc-ninh-binh-1.jpg', 'Ngồi thuyền ngắm cảnh, leo Đỉnh Mây', '250.000đ', '07:30', '10:30', 'https://goo.gl/maps/zZ6bH7g1oD7h1U9L9'),
      mkItem('BÍCH ĐỘNG', '🏯', 'https://image.vietgoing.com/destination/vietgoing_dmt2106249920.webp', 'Tham quan hang động, leo chùa Thượng', 'Miễn phí', '10:50', '11:40', 'https://goo.gl/maps/BichDong'),
      mkItem('Ăn trưa', '🍜', 'https://cdn.tgdd.vn/Files/2021/09/28/1385777/cach-lam-bun-ca-ro-dong-thom-ngon-chuan-vi-mien-bac-202109282038215659.jpg', 'Nghỉ ngơi, ăn trưa đặc sản Ninh Bình', '', '11:40', '12:40'),
      mkItem('HANG MÚA', '🏔️', 'https://phuotvivu.com/blog/wp-content/uploads/2019/02/hang-mua-ninh-binh-2.jpg', 'Leo ~500 bậc thang, ngắm toàn cảnh Tam Cốc', '150.000đ', '13:10', '14:30', 'https://goo.gl/maps/bH3dM6aFjPqXQzZ38'),
      mkItem('Check-in + Nghỉ ngơi', '🛏️', 'https://ticotravel.com.vn/wp-content/uploads/2021/08/TAM-COC-GARDEN-RESORT-NINH-BINH.jpg', 'Nhận phòng, tắm, nghỉ ngơi', '', '15:00', '15:45'),
      mkItem('PHỐ CỔ HOA LƯ', '🏮', 'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2023/4/10/1177921/Pho-Co-2.jpg', 'Dạo phố, chụp ảnh áo dài / cổ phục', 'Miễn phí', '16:15', '18:00', 'https://goo.gl/maps/KyLan'),
      mkItem('Photobooth', '📸', 'https://icdn.dantri.com.vn/thumb_w/960/2023/03/13/pho-co-hoa-lu-1678681665893.jpeg', 'Chụp ảnh lưu niệm', '', '18:00', '19:00'),
      mkItem('Pizza Sen', '🍕', 'https://i2.wp.com/songduong.com/wp-content/uploads/2023/01/pizza-sen-ninh-binh-2.jpg', 'Ăn tối tại Pizza Sen', '', '19:00', '20:00'),
      mkItem('Dạo Phố cổ buổi tối', '🏮', 'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2023/4/10/1177921/Pho-Co-2.jpg', 'Đi dạo, ngắm đèn đêm phố cổ', '', '20:00', '21:30'),
      mkItem('Ngủ 😴', '🌙', 'https://ticotravel.com.vn/wp-content/uploads/2021/08/TAM-COC-GARDEN-RESORT-NINH-BINH.jpg', 'Nghỉ ngơi, tích năng lượng cho ngày 2', '', '22:00', '23:59'),
    ],
  },
  day2: {
    date: 'Ngày 2 – Tràng An',
    items: [
      mkItem('Dậy + Ăn sáng', '🌅', 'https://media.mia.vn/uploads/blog-du-lich/ngam-binh-minh-ninh-binh-dep-nhat-o-dau-1-1650767344.jpg', 'Dậy sớm, ăn sáng, check-out + gửi đồ', '', '06:00', '07:00'),
      mkItem('TRÀNG AN', '🚣', 'https://vissaihotel.vn/photo/99ac-sac-quan-the-danh-thang-trang-an.jpg', 'Đi đò qua các hang động kỳ ảo', '300.000đ', '07:20', '10:20', 'https://goo.gl/maps/R3XyM5Z8Q6o3E5Zz7'),
      mkItem('CỐ ĐÔ HOA LƯ', '🏯', 'https://datviettour.com.vn/uploads/images/tin-tuc-SEO/mien-bac/Ninh-Binh/danh-thang/hoa-lu.jpg', 'Tham quan kinh đô đầu tiên Việt Nam', '20.000đ', '10:40', '11:40', 'https://goo.gl/maps/HoaLuNinhBinh'),
      mkItem('Ăn trưa', '🍜', 'https://cdn.tgdd.vn/Files/2021/09/28/1385777/cach-lam-bun-ca-ro-dong-thom-ngon-chuan-vi-mien-bac-202109282038215659.jpg', 'Ăn trưa tại khu vực', '', '12:00', '13:00'),
      mkItem('TUYỆT TÌNH CỐC', '🏞️', 'https://datviettour.com.vn/uploads/images/mien-bac/ninh-binh/hinh-danh-thang/tuyet-tinh-coc-du-lich-ninh-binh-8.jpg', 'Đi dạo hồ, tham quan động Am Tiên', '100.000đ', '13:00', '14:30', 'https://goo.gl/maps/kG4zZzXgX8JmUuB29'),
      mkItem('Nghỉ / Cà phê / Thư giãn', '☕', 'https://mia.vn/media/uploads/blog-du-lich/ninh-binh-mountain-side-homestay-cafe-canh-cong-den-vuon-xanh-11-1663138020.jpg', 'Nghỉ ngơi, thưởng thức cà phê', '', '15:00', '16:00'),
      mkItem('Ninh Bình → Hà Nội ❤️', '🏠', 'https://statics.vinpearl.com/ha-noi-lang-ha-1_1631001307.jpg', 'Lấy đồ, chuẩn bị, rồi về Hà Nội', '', '17:00', '19:30'),
    ],
  },
};

// ─── HERO HEADER ──────────────────────────────────────────────────────────────
function HeroHeader() {
  const totalDests = destinations.length;
  const categories = [...new Set(destinations.map(d => d.category))].length;

  return (
    <header className="hero-header">
      <div className="hero-bg-pattern" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-content">
        <div className="hero-badge">
          <span>🏔️</span>
          <span>Ninh Bình • Việt Nam</span>
        </div>
        <h1 className="hero-title">
          Ninh Bình &amp;<br />
          <span>Những Người Bạn</span>
        </h1>
        <p className="hero-subtitle">Khám phá vùng đất di sản thế giới</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">{totalDests}</span>
            <span className="hero-stat-label">Địa điểm</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">{categories}</span>
            <span className="hero-stat-label">Chủ đề</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-num">2</span>
            <span className="hero-stat-label">Ngày</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── EXPLORE TAB ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'trang-an', name: '🚣 Tràng An – Hoa Lư', image: 'https://vissaihotel.vn/photo/99ac-sac-quan-the-danh-thang-trang-an.jpg' },
  { id: 'tam-coc', name: '🌾 Tam Cốc – Bích Động', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tam_Coc_by_Tuan_Mai_%22007%22_%288888350545%29.jpg/960px-Tam_Coc_by_Tuan_Mai_%22007%22_%288888350545%29.jpg' },
  { id: 'nui-hang', name: '⛰️ Núi – Hang động', image: 'https://phuotvivu.com/blog/wp-content/uploads/2019/02/hang-mua-ninh-binh-2.jpg' },
  { id: 'sinh-thai', name: '🌳 Sinh thái – Thiên nhiên', image: 'https://phuotvivu.com/blog/wp-content/uploads/2019/05/khu-bao-ton-thien-nhien-van-long.jpg' },
  { id: 'luu-tru', name: '🏡 Lưu trú', image: 'https://ticotravel.com.vn/wp-content/uploads/2021/08/TAM-COC-GARDEN-RESORT-NINH-BINH.jpg' },
  { id: 'ca-phe', name: '☕ Cà phê – Check-in', image: 'https://mia.vn/media/uploads/blog-du-lich/ninh-binh-mountain-side-homestay-cafe-canh-cong-den-vuon-xanh-11-1663138020.jpg' },
];

function DestCard({ dest, onAdd }) {
  return (
    <div className="dest-card">
      <div className="dest-img-wrapper">
        <img src={dest.image} alt={dest.name} className="dest-img" loading="lazy" />
        <div className="dest-img-overlay" />
        <span className="dest-cost-badge">{dest.estimatedCost}</span>
      </div>
      <div className="dest-content">
        <h2 className="dest-title">{dest.name}</h2>
        <p className="dest-desc">{dest.description}</p>

        <div className="dest-info-group">
          <Camera size={15} className="dest-icon" />
          <div className="dest-info-text">
            <strong>Trải nghiệm</strong>
            {dest.activities.join(' • ')}
          </div>
        </div>

        <div className="dest-info-group">
          <Shirt size={15} className="dest-icon" />
          <div className="dest-info-text">
            <strong>Gợi ý / Lưu ý</strong>
            {dest.outfit}
          </div>
        </div>

        <div className="card-actions">
          <button className="add-btn" onClick={() => onAdd(dest)}>
            <Plus size={16} /> Thêm vào lịch
          </button>
          <a
            href={dest.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest.name + ' Ninh Binh')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="map-btn"
            title="Xem trên Google Maps"
          >
            <Map size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

function ExploreTab({ onAddDest }) {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 14 }}>
        <h2 className="section-title">Khám phá địa điểm</h2>
        <span className="section-count">{destinations.length} nơi</span>
      </div>

      <div className="accordion-container">
        {CATEGORIES.map(cat => {
          const isExpanded = activeCategory === cat.id;
          const items = destinations.filter(d => d.category === cat.id);

          return (
            <div key={cat.id} className={`accordion-item ${isExpanded ? 'expanded' : ''}`}>
              <div
                className="accordion-header"
                style={{ backgroundImage: `url(${cat.image})` }}
                onClick={() => setActiveCategory(isExpanded ? null : cat.id)}
              >
                <div className="accordion-header-inner">
                  <div>
                    <h3>{cat.name}</h3>
                    <span className="accordion-badge">{items.length} địa điểm</span>
                  </div>
                  <ChevronDown size={18} className="accordion-chevron" />
                </div>
              </div>

              {isExpanded && (
                <div className="accordion-content">
                  <div className="destination-list">
                    {items.map(dest => (
                      <DestCard key={dest.id} dest={dest} onAdd={onAddDest} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DEST PICKER SHEET ────────────────────────────────────────────────────────
function DestPickerSheet({ onConfirm, onClose, initialTime }) {
  const [step, setStep] = useState('pick');
  const [selectedDest, setSel] = useState(null);
  const [query, setQuery] = useState('');
  const [catFilter, setCat] = useState(null);
  const [startTime, setStart] = useState((initialTime && initialTime.startTime) || '08:00');
  const [endTime, setEnd] = useState((initialTime && initialTime.endTime) || '09:00');

  const filtered = destinations.filter(d => {
    const matchCat = !catFilter || d.category === catFilter;
    const q = query.toLowerCase();
    const matchQ = !q || d.name.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const handleSelect = dest => { setSel(dest); setStep('time'); };
  const handleConfirm = () => onConfirm({ dest: selectedDest, startTime, endTime });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="dest-picker-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />

        {step === 'pick' ? (
          <>
            <div className="dps-header">
              <h3>Chọn địa điểm</h3>
              <button className="dps-close" onClick={onClose}><X size={18} /></button>
            </div>

            <div className="dps-search-wrap">
              <MapPin size={15} className="dps-search-icon" />
              <input
                className="dps-search"
                placeholder="Tìm địa điểm..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              {query && <button className="dps-clear" onClick={() => setQuery('')}><X size={13} /></button>}
            </div>

            <div className="dps-cats">
              <button className={`dps-cat ${!catFilter ? 'active' : ''}`} onClick={() => setCat(null)}>Tất cả</button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`dps-cat ${catFilter === cat.id ? 'active' : ''}`}
                  onClick={() => setCat(catFilter === cat.id ? null : cat.id)}
                >
                  {cat.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="dps-list">
              {filtered.length === 0 ? (
                <div className="dps-empty">Không tìm thấy địa điểm phù hợp 🔍</div>
              ) : filtered.map(dest => (
                <button key={dest.id} className="dps-item" onClick={() => handleSelect(dest)}>
                  <img src={dest.image} alt={dest.name} className="dps-item-img" loading="lazy" />
                  <div className="dps-item-info">
                    <div className="dps-item-name">{dest.name}</div>
                    <div className="dps-item-meta">
                      {dest.estimatedCost && <span className="dps-item-cost">{dest.estimatedCost}</span>}
                      <span className="dps-item-act">{dest.activities[0]}</span>
                    </div>
                  </div>
                  <ChevronDown size={14} style={{ transform: 'rotate(-90deg)', color: 'var(--primary)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="dps-header">
              <button className="dps-back" onClick={() => setStep('pick')}>← Quay lại</button>
              <button className="dps-close" onClick={onClose}><X size={18} /></button>
            </div>

            <div className="dps-preview">
              <img src={selectedDest.image} alt={selectedDest.name} className="dps-preview-img" />
              <div className="dps-preview-info">
                <div className="dps-preview-name">{selectedDest.name}</div>
                <div className="dps-preview-cost">{selectedDest.estimatedCost || 'Miễn phí'}</div>
                <div className="dps-preview-act">{selectedDest.activities[0]}</div>
              </div>
            </div>

            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>⏰ Chọn thời gian</label>
            <div className="time-inputs">
              <div className="time-input-group">
                <label className="form-label" style={{ marginBottom: 6 }}>Giờ đến</label>
                <input type="time" className="time-input" value={startTime} onChange={e => setStart(e.target.value)} />
              </div>
              <div className="time-input-group">
                <label className="form-label" style={{ marginBottom: 6 }}>Giờ đi</label>
                <input type="time" className="time-input" value={endTime} onChange={e => setEnd(e.target.value)} />
              </div>
            </div>

            <button className="sheet-confirm-btn" onClick={handleConfirm}>✓ Thêm vào lịch trình</button>
            <button className="sheet-cancel-btn" onClick={onClose}>Huỷ</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── TIMELINE TAB ─────────────────────────────────────────────────────────────
function TimelineItem({ item, day, idx, onRemove, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [pickingDest, setPicking] = useState(false);

  const startEdit = () => {
    setDraft({
      name: item.dest.name,
      note: item.dest.activities[0] || '',
      startTime: item.startTime,
      endTime: item.endTime,
    });
    setEditing(true);
  };

  const saveEdit = () => {
    onUpdate(day, idx, {
      ...item,
      dest: { ...item.dest, name: draft.name, activities: [draft.note] },
      startTime: draft.startTime,
      endTime: draft.endTime,
    });
    setEditing(false);
  };

  const cancelEdit = () => setEditing(false);

  if (editing) {
    return (
      <div className="modern-timeline-item">
        <div className="content-col" style={{ width: '100%' }}>
          <div className="timeline-card timeline-card--edit">
            <input
              className="tl-edit-name"
              value={draft.name}
              onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
              placeholder="Tên hoạt động"
            />
            <input
              className="tl-edit-note"
              value={draft.note}
              onChange={e => setDraft(p => ({ ...p, note: e.target.value }))}
              placeholder="Mô tả / ghi chú"
            />
            <div className="tl-time-row">
              <label>Từ <input type="time" className="time-edit-input" value={draft.startTime} onChange={e => setDraft(p => ({ ...p, startTime: e.target.value }))} /></label>
              <label>Đến <input type="time" className="time-edit-input" value={draft.endTime} onChange={e => setDraft(p => ({ ...p, endTime: e.target.value }))} /></label>
            </div>
            <button className="tl-change-dest-btn" onClick={() => setPicking(true)}>
              <MapPin size={13} /> Chọn từ danh sách địa điểm
            </button>
            <div className="tl-edit-actions">
              <button className="tl-save-btn" onClick={saveEdit}><Check size={14} /> Lưu</button>
              <button className="tl-cancel-btn" onClick={cancelEdit}><X size={14} /> Huỷ</button>
            </div>
          </div>
        </div>
        {pickingDest && (
          <DestPickerSheet
            initialTime={{ startTime: draft.startTime, endTime: draft.endTime }}
            onConfirm={({ dest, startTime, endTime }) => {
              onUpdate(day, idx, { dest, startTime, endTime });
              setPicking(false);
              setEditing(false);
            }}
            onClose={() => setPicking(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="modern-timeline-item">
      <div className="content-col" style={{ width: '100%' }}>
        <div className="timeline-card">
          <div className="tl-action-btns">
            <button className="edit-btn" onClick={startEdit} title="Chỉnh sửa"><Edit2 size={12} /></button>
            <button className="remove-btn" onClick={() => onRemove(day, idx)} title="Xoá"><Trash2 size={12} /></button>
          </div>
          <div className="timeline-card-inner">
            <div className="timeline-card-info">
              <div className="timeline-card-title">{item.dest.name}</div>
              {(item.startTime || item.endTime) && (
                <div className="tl-time-badge">
                  <Clock size={11} /> {item.startTime}{item.endTime && item.endTime !== '23:59' && item.endTime !== item.startTime ? ` – ${item.endTime}` : ''}
                </div>
              )}
              <div className="timeline-card-sub">{item.dest.activities.join(' • ')}</div>
              <div className="timeline-card-footer">
                {item.dest.estimatedCost && (
                  <span className="timeline-cost">
                    <Banknote size={12} style={{ verticalAlign: '-1px', marginRight: 2 }} />
                    {item.dest.estimatedCost}
                  </span>
                )}
                {item.dest.mapUrl && (
                  <a href={item.dest.mapUrl} target="_blank" rel="noopener noreferrer" className="timeline-map-link">📍 Bản đồ</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCustomItemBar({ day, onAdd }) {
  const [open, setOpen] = useState(false);

  const handleConfirm = ({ dest, startTime, endTime }) => {
    onAdd(day, { dest, startTime, endTime });
    setOpen(false);
  };

  return (
    <>
      <button className="add-custom-item-btn" onClick={() => setOpen(true)}>
        <Plus size={15} /> Thêm địa điểm vào lịch
      </button>
      {open && (
        <DestPickerSheet
          onConfirm={handleConfirm}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function TimelineTab({ timeline, onRemove, onUpdate, onAddCustom }) {
  const safeTimeline = timeline || DEFAULT_TIMELINE;

  return (
    <div className="timeline-view">
      {['day1', 'day2'].map(day => {
        const dayData = safeTimeline[day] || { date: '', items: [] };
        const items = dayData.items || [];
        const label = dayData.date || (day === 'day1' ? 'Ngày 1 – Tam Cốc' : 'Ngày 2 – Tràng An');

        return (
          <div key={day} className="timeline-day-section">
            <div className="timeline-day-header">
              <Calendar size={18} color="white" />
              <h3>{label}</h3>
              {items.length > 0 && (
                <span className="timeline-day-count">{items.length} hoạt động</span>
              )}
            </div>

            <div className="timeline-day-body">
              {items.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">📍</span>
                  <p>Chưa có hoạt động nào.<br />Nhấn nút bên dưới để thêm!</p>
                </div>
              ) : (
                <div className="modern-timeline">
                  {items.map((item, idx) => (
                    <TimelineItem key={idx} item={item} day={day} idx={idx} onRemove={onRemove} onUpdate={onUpdate} />
                  ))}
                </div>
              )}
              <AddCustomItemBar day={day} onAdd={onAddCustom} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── BUDGET TAB ───────────────────────────────────────────────────────────────
const BUDGET_CATS = [
  { id: 'accommodation', label: 'Chỗ ở (Homestay / Resort)', icon: Home, color: '#b45309' },
  { id: 'food', label: 'Ăn uống', icon: Coffee, color: '#c2410c' },
  { id: 'activities', label: 'Đi chơi & Tham quan', icon: Map, color: '#0369a1' },
];

function BudgetTab({ budgetData, setBudgetData }) {
  const safeBudget = {
    groupSize: 8,
    accommodation: [{ note: '', cost: '' }],
    food: [{ note: '', cost: '' }],
    activities: [{ note: '', cost: '' }],
    ...budgetData
  };

  let total = 0;
  ['accommodation', 'food', 'activities'].forEach(cat => {
    (safeBudget[cat] || []).forEach(item => { total += Number(item?.cost) || 0; });
  });

  const fmt = n => (Number(n) || 0).toLocaleString('vi-VN') + 'đ';

  const handleUpdate = (cat, index, field, value) => {
    const items = [...(safeBudget[cat] || [])];
    items[index] = { ...items[index], [field]: value };
    setBudgetData({ ...safeBudget, [cat]: items });
  };

  const handleAdd = cat => {
    setBudgetData({ ...safeBudget, [cat]: [...(safeBudget[cat] || []), { note: '', cost: '' }] });
  };

  const handleRemove = (cat, index) => {
    setBudgetData({ ...safeBudget, [cat]: (safeBudget[cat] || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="budget-view">
      {/* Summary card */}
      <div className="budget-hero-card">
        <div className="budget-label">Chi phí mỗi người</div>
        <div className="budget-total">{fmt(total / 8)}</div>
      </div>

      {/* Category breakdown */}
      <div className="budget-section-title">
        <PieChart size={18} color="var(--primary)" />
        Bảng kê chi phí
      </div>

      {BUDGET_CATS.map(({ id, label, icon: Icon, color }) => (
        <div key={id} className="budget-category-card">
          <div className="budget-cat-header" style={{ color }}>
            <Icon size={18} />
            <span>{label}</span>
          </div>

          {(safeBudget[id] || []).map((item, idx) => (
            <div key={idx} className="budget-item-row">
              <input
                type="text"
                className="budget-input"
                placeholder="Ghi chú (VD: Thuê xe...)"
                value={item?.note || ''}
                onChange={e => handleUpdate(id, idx, 'note', e.target.value)}
              />
              <input
                type="number"
                className="budget-input budget-amount-input"
                placeholder="0"
                value={item?.cost || ''}
                onChange={e => handleUpdate(id, idx, 'cost', e.target.value)}
              />
              <button className="budget-remove-btn" onClick={() => handleRemove(id, idx)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <button className="budget-add-row-btn" onClick={() => handleAdd(id)}>
            <Plus size={14} /> Thêm khoản chi
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── ACTION SHEET ─────────────────────────────────────────────────────────────
function ActionSheet({ dest, timeline, onConfirm, onClose }) {
  const [selectedDay, setSelectedDay] = useState('day1');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');

  if (!dest) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="action-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-inner">
          <h3 className="sheet-title">Thêm vào lịch trình</h3>

          {/* Preview */}
          <div className="sheet-preview">
            <img src={dest.image} alt={dest.name} />
            <div className="sheet-preview-info">
              <h4>{dest.name}</h4>
              <p>{dest.estimatedCost}</p>
            </div>
          </div>

          {/* Day picker */}
          <label className="form-label">Chọn ngày</label>
          <div className="day-select-grid">
            {['day1', 'day2'].map(d => (
              <button
                key={d}
                className={`day-select-btn ${selectedDay === d ? 'active' : ''}`}
                onClick={() => setSelectedDay(d)}
              >
                {d === 'day1' ? 'Ngày 1' : 'Ngày 2'}
                <span>{timeline[d].date || '—'}</span>
              </button>
            ))}
          </div>

          {/* Time picker */}
          <label className="form-label">Thời gian</label>
          <div className="time-inputs">
            <div className="time-input-group">
              <label className="form-label" style={{ marginBottom: 6 }}>Giờ đến</label>
              <input
                type="time"
                className="time-input"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div className="time-input-group">
              <label className="form-label" style={{ marginBottom: 6 }}>Giờ đi</label>
              <input
                type="time"
                className="time-input"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <button
            className="sheet-confirm-btn"
            onClick={() => onConfirm({ dest, selectedDay, startTime, endTime })}
          >
            ✓ Xác nhận thêm
          </button>
          <button className="sheet-cancel-btn" onClick={onClose}>Huỷ</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'explore', label: 'Khám phá', icon: '🗺️' },
  { id: 'timeline', label: 'Lịch trình', icon: '📅' },
  { id: 'budget', label: 'Chi phí', icon: '💰' },
];

function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [timeline, setTimeline] = useState(DEFAULT_TIMELINE);
  const [budgetData, setBudgetData] = useState({
    groupSize: 8,
    accommodation: [{ note: '', cost: '' }],
    food: [{ note: '', cost: '' }],
    activities: [{ note: '', cost: '' }],
  });
  const [sheetDest, setSheetDest] = useState(null);
  const isRemoteUpdate = useRef(false);

  // ── Socket.IO sync ──────────────────────────────────────────────
  useEffect(() => {
    const handleConnect = () => {
      console.log('Connected to sync server');
      socket.emit('get_initial_state');
    };

    const handleInitState = data => {
      if (data?.timeline && Object.keys(data.timeline).length > 0) {
        setTimeline(data.timeline);
      }
      if (data?.budget) {
        setBudgetData(data.budget);
      }
    };

    const handleTimelineUpdated = newTimeline => {
      if (newTimeline) setTimeline(newTimeline);
    };

    const handleBudgetUpdated = newBudget => {
      if (newBudget) setBudgetData(newBudget);
    };

    socket.on('connect', handleConnect);
    socket.on('init_state', handleInitState);
    socket.on('timeline_updated', handleTimelineUpdated);
    socket.on('budget_updated', handleBudgetUpdated);

    if (socket.connected) {
      socket.emit('get_initial_state');
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('init_state', handleInitState);
      socket.off('timeline_updated', handleTimelineUpdated);
      socket.off('budget_updated', handleBudgetUpdated);
    };
  }, []);

  const updateBudgetData = newBudgetOrFn => {
    setBudgetData(prev => {
      const nextBudget = typeof newBudgetOrFn === 'function' ? newBudgetOrFn(prev) : newBudgetOrFn;
      socket.emit('update_budget', nextBudget);
      return nextBudget;
    });
  };

  // ── Handlers ────────────────────────────────────────────────────
  const handleAddDest = dest => setSheetDest(dest);

  const handleConfirm = ({ dest, selectedDay, startTime, endTime }) => {
    setTimeline(prev => {
      const newItem = { dest, startTime, endTime };
      const updated = [...prev[selectedDay].items, newItem]
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      const nextTimeline = { ...prev, [selectedDay]: { ...prev[selectedDay], items: updated } };
      socket.emit('update_timeline', nextTimeline);
      return nextTimeline;
    });
    setSheetDest(null);
  };

  const handleRemove = (day, idx) => {
    setTimeline(prev => {
      const nextTimeline = {
        ...prev,
        [day]: { ...prev[day], items: prev[day].items.filter((_, i) => i !== idx) },
      };
      socket.emit('update_timeline', nextTimeline);
      return nextTimeline;
    });
  };

  const handleUpdate = (day, idx, updatedItem) => {
    setTimeline(prev => {
      const items = [...prev[day].items];
      items[idx] = updatedItem;
      items.sort((a, b) => a.startTime.localeCompare(b.startTime));
      const nextTimeline = { ...prev, [day]: { ...prev[day], items } };
      socket.emit('update_timeline', nextTimeline);
      return nextTimeline;
    });
  };

  const handleAddCustom = (day, newItem) => {
    setTimeline(prev => {
      const items = [...prev[day].items, newItem]
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      const nextTimeline = { ...prev, [day]: { ...prev[day], items } };
      socket.emit('update_timeline', nextTimeline);
      return nextTimeline;
    });
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <>
      <HeroHeader />

      {/* Sticky tab bar */}
      <nav className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="tab-content">
        {activeTab === 'explore' && (
          <ExploreTab onAddDest={handleAddDest} />
        )}
        {activeTab === 'timeline' && (
          <TimelineTab timeline={timeline} onRemove={handleRemove} onUpdate={handleUpdate} onAddCustom={handleAddCustom} />
        )}
        {activeTab === 'budget' && (
          <BudgetTab budgetData={budgetData} setBudgetData={updateBudgetData} />
        )}
      </main>

      {/* Action Sheet */}
      {sheetDest && (
        <ActionSheet
          dest={sheetDest}
          timeline={timeline}
          onConfirm={handleConfirm}
          onClose={() => setSheetDest(null)}
        />
      )}
    </>
  );
}

export default App;
