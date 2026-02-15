// === DMC TourLink Main JS ===

// --- Inquiry Modal ---
function openInquiry(title, duration, price, operatorName, operatorEmail) {
  var modal = document.getElementById('inquiryModal');
  document.getElementById('modalProductName').textContent = title;
  document.getElementById('modalProductDetail').textContent = duration + ' / $' + price + '~ / 운영: ' + (operatorName || '-');
  document.getElementById('f_product').value = title;
  document.getElementById('f_operator').value = operatorName || '';
  document.getElementById('f_operator_email').value = operatorEmail || '';
  document.getElementById('formStatus').className = 'form-status';
  document.getElementById('formStatus').textContent = '';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeInquiry() {
  document.getElementById('inquiryModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('click', function(e) {
  if (e.target.id === 'inquiryModal') closeInquiry();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeInquiry();
});

// --- Submit (mailto fallback) ---
function submitInquiry(e) {
  e.preventDefault();
  var btn = document.getElementById('submitBtn');
  var status = document.getElementById('formStatus');
  if (!document.getElementById('privacyAgree').checked) {
    status.className = 'form-status error';
    status.textContent = '개인정보 수집·이용에 동의해주세요.';
    return;
  }
  var tourName = document.getElementById('f_product').value;
  var opEmail = document.getElementById('f_operator_email').value || 'info@londonshow.co.kr';
  var name = document.getElementById('f_name').value;
  var email = document.getElementById('f_email').value;
  var phone = document.getElementById('f_phone').value;
  var date = document.getElementById('f_date').value;
  var pax = document.getElementById('f_pax').value;
  var msg = document.getElementById('f_message').value;

  var subject = encodeURIComponent('[DMC투어링크] ' + tourName + ' 문의');
  var body = encodeURIComponent(
    '투어명: ' + tourName + '\n' +
    '희망일: ' + date + '\n' +
    '인원: ' + pax + '명\n' +
    '이름: ' + name + '\n' +
    '이메일: ' + email + '\n' +
    '연락처: ' + phone + '\n\n' +
    '문의내용:\n' + msg
  );
  var cc = encodeURIComponent('info@londonshow.co.kr');
  var mailto = 'mailto:' + opEmail + '?cc=' + cc + '&subject=' + subject + '&body=' + body;
  window.location.href = mailto;

  status.className = 'form-status success';
  status.textContent = '이메일 앱이 열립니다. 전송해주세요!';
}

// --- Tour Filtering (tours page) ---
function filterTours() {
  var continent = (document.getElementById('f-continent') || {}).value || '';
  var country = (document.getElementById('f-country') || {}).value || '';
  var category = (document.getElementById('f-category') || {}).value || '';
  var priceRange = (document.getElementById('f-price') || {}).value || '';
  var duration = (document.getElementById('f-duration') || {}).value || '';
  var sort = (document.getElementById('sortSelect') || {}).value || 'featured';
  var search = (document.getElementById('f-search') || {}).value.toLowerCase() || '';

  var items = document.querySelectorAll('.cruise-item');
  var visible = 0;
  var arr = Array.from(items);

  arr.forEach(function(item) {
    var show = true;
    if (continent && item.dataset.continent !== continent) show = false;
    if (country && item.dataset.country !== country) show = false;
    if (category && item.dataset.category !== category) show = false;
    if (duration) {
      var d = parseInt(item.dataset.days);
      if (duration === '1' && d !== 1) show = false;
      if (duration === '2-3' && (d < 2 || d > 3)) show = false;
      if (duration === '4+' && d < 4) show = false;
    }
    if (priceRange) {
      var parts = priceRange.split('-').map(Number);
      var p = parseInt(item.dataset.price);
      if (p < parts[0] || p > parts[1]) show = false;
    }
    if (search && !(item.dataset.title || '').toLowerCase().includes(search)) show = false;
    item.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  // Sort
  var list = document.getElementById('tourList');
  if (list) {
    arr.sort(function(a, b) {
      if (sort === 'price-asc') return parseInt(a.dataset.price) - parseInt(b.dataset.price);
      if (sort === 'price-desc') return parseInt(b.dataset.price) - parseInt(a.dataset.price);
      var af = a.dataset.featured === 'true' ? 0 : 1;
      var bf = b.dataset.featured === 'true' ? 0 : 1;
      return af - bf;
    });
    arr.forEach(function(item) { list.appendChild(item); });
  }

  var counter = document.getElementById('resultCount');
  if (counter) counter.textContent = visible;
  var noResults = document.getElementById('noResults');
  if (noResults) noResults.classList.toggle('hidden', visible > 0);
}

// --- Home Search ---
document.addEventListener('DOMContentLoaded', function() {
  var homeBtn = document.getElementById('homeSearchBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var continent = document.getElementById('hf-continent').value;
      var category = document.getElementById('hf-category').value;
      var params = [];
      if (continent) params.push('continent=' + continent);
      if (category) params.push('category=' + category);
      var base = document.querySelector('link[rel="canonical"]');
      var baseurl = '';
      var metaBase = document.querySelector('meta[name="baseurl"]');
      // Use relative path
      window.location.href = (window.BASE_URL || '') + '/tours/' + (params.length ? '?' + params.join('&') : '');
    });
  }

  // Apply URL params on tours page
  if (window.location.pathname.includes('/tours')) {
    var params = new URLSearchParams(window.location.search);
    ['continent', 'country', 'category', 'price', 'duration'].forEach(function(key) {
      var el = document.getElementById('f-' + key);
      if (el && params.get(key)) el.value = params.get(key);
    });
    var searchEl = document.getElementById('f-search');
    if (searchEl && params.get('q')) searchEl.value = params.get('q');
    filterTours();
  }
});

// --- Logo slider duplicate ---
(function() {
  var track = document.getElementById('partnerLogoTrack');
  if (!track) return;
  var items = track.innerHTML;
  track.innerHTML = items + items;
})();

// --- Continent slider ---
function destSlide(dir) {
  var slider = document.getElementById('destSlider');
  if (!slider) return;
  var card = slider.querySelector('.dest-chip');
  if (!card) return;
  slider.scrollBy({ left: dir * card.offsetWidth * 2, behavior: 'smooth' });
}

// --- Gallery Lightbox ---
var galleryImages = [];
var galleryIndex = 0;
(function() {
  var thumbs = document.querySelectorAll('.hero-gallery-main img, .hero-thumb img');
  thumbs.forEach(function(img) { galleryImages.push(img.src); });
})();

function openLightbox(idx) {
  galleryIndex = idx;
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  updateLightbox();
}
function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightbox') && e.target !== document.querySelector('.lightbox-close')) return;
  var lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}
function lightboxNav(dir, e) {
  if (e) e.stopPropagation();
  galleryIndex = (galleryIndex + dir + galleryImages.length) % galleryImages.length;
  updateLightbox();
}
function updateLightbox() {
  var img = document.getElementById('lightboxImg');
  var counter = document.getElementById('lightboxCounter');
  if (img && galleryImages[galleryIndex]) img.src = galleryImages[galleryIndex];
  if (counter) counter.textContent = (galleryIndex + 1) + ' / ' + galleryImages.length;
}
document.addEventListener('keydown', function(e) {
  if (!document.getElementById('lightbox') || !document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowLeft') lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
  if (e.key === 'Escape') { document.getElementById('lightbox').classList.remove('open'); document.body.style.overflow = ''; }
});

// --- Accordion (Itinerary) ---
function toggleAccordion(header) {
  var body = header.nextElementSibling;
  body.classList.toggle('open');
  var toggle = header.querySelector('.tl-toggle');
  if (toggle) toggle.style.transform = body.classList.contains('open') ? '' : 'rotate(-90deg)';
}

// --- FAQ ---
function toggleFaq(el) {
  el.parentElement.classList.toggle('open');
}
