// HearPaw demo interactions: navigation, My Pet dashboard, cart and chat.
(() => {
  const $ = (id) => document.getElementById(id);
  const pages = [...document.querySelectorAll('.page')];
  const navLinks = [...document.querySelectorAll('[data-page]')];
  // Optional customer profile in the header after a successful demo login.
  function renderHeaderAuth() {
    const auth = $('headerAuth');
    if (!auth) return;
    const isLoggedIn = sessionStorage.getItem('hearpawDemoLoggedIn') === 'true';
    if (!isLoggedIn) return;
    const email = sessionStorage.getItem('hearpawDemoEmail') || 'demo@hearpaw.vn';
    const storedName = sessionStorage.getItem('hearpawDemoName') || (email === 'demo@hearpaw.vn' ? 'Demo' : email.split('@')[0]);
    const displayName = storedName.trim() || 'Demo';
    const initial = displayName.charAt(0).toUpperCase();
    auth.innerHTML = `<a class="header-profile" href="#mypet" aria-label="Tài khoản ${displayName}"><span class="header-profile-avatar">${initial}</span><span>${displayName}</span></a>`;
  }
  renderHeaderAuth();

  function showPage(pageId, updateHash = true) {
    const target = document.getElementById(pageId);
    if (!target || !target.classList.contains('page')) return;
    pages.forEach(page => page.classList.toggle('active', page === target));
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === pageId));
    if (updateHash && location.hash !== `#${pageId}`) history.pushState(null, '', `#${pageId}`);
    $('mainNav')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateFromHash() {
    const id = (location.hash || '#home').slice(1);
    const section = document.getElementById(id);
    if (section?.classList.contains('page')) showPage(id, false);
    else if (id) {
      const parentPage = section?.closest('.page');
      if (parentPage) showPage(parentPage.id, false);
      else showPage('home', false);
    } else showPage('home', false);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    const page = target.classList.contains('page') ? target : target.closest('.page');
    if (page) {
      event.preventDefault();
      showPage(page.id);
      if (target !== page) setTimeout(() => target.scrollIntoView({behavior:'smooth', block:'start'}), 100);
    }
  });
  navLinks.forEach(link => link.addEventListener('click', e => { e.preventDefault(); showPage(link.dataset.page); }));
  window.addEventListener('hashchange', navigateFromHash);
  window.addEventListener('popstate', navigateFromHash);
  $('menuToggle')?.addEventListener('click', () => $('mainNav')?.classList.toggle('open'));
  navigateFromHash();

  // Product catalogue: selecting a colour swaps the actual product preview image.
  const catalogue = {
    collar1:{name:'Vòng cổ thông minh - vải',price:1599000,kind:'collar',caption:'HEARPAW SMART COLLAR · FABRIC',description:'Vòng cổ thông minh chất liệu vải mềm, thiết kế tối giản và dễ phối màu.',colors:[['Xanh lá đậm','#42684A','moss'],['Be kem','#F5F0E6','beige'],['Hồng pastel','#F3C3CD','pink'],['Tím lavender','#C7B5E2','lavender'],["Xanh biển", "#4A90C6", "blue"]]},
    collar2:{name:'Vòng cổ thông minh Gen2',price:1799000,kind:'collar',caption:'HEARPAW SMART COLLAR · GEN 2',description:'Thế hệ vòng cổ thông minh mới với kiểu dáng hiện đại và màu sắc nổi bật.',colors:[['Xanh lá đậm','#42684A','moss'],['Be','#E8DCC7','beige'],['Cam','#E98548','orange'],['Đỏ','#B84443','red']]},
    leash1:{name:'Dây dắt thú cưng - vải mềm',price:129000,kind:'leash',caption:'HEARPAW SOFT FABRIC LEASH',description:'Dây dắt vải mềm, dễ cầm nắm, phù hợp cho những buổi dạo chơi mỗi ngày.',colors:[['Xanh lá đậm','#42684A','green'],['Vàng bơ','#E8D77D','butter'],['Hồng','#F0AFC0','pink'],['Xanh da trời','#8EC7E7','sky']],length:true},
    leash2:{name:'Dây dắt thú cưng - da mềm',price:179000,kind:'leash',caption:'HEARPAW SOFT LEATHER LEASH',description:'Dây dắt da mềm với bề mặt mịn và chi tiết kim loại thanh lịch.',colors:[['Xanh lá đậm','#42684A','green'],['Vàng bơ','#E8D77D','butter'],['Đỏ','#B84443','red']],length:true},
    tag1:{name:'Thẻ tên thú cưng cá nhân hóa - Kiểu Xương',price:69000,kind:'bone',caption:'PERSONALIZED PET TAG · BONE',description:'Thẻ tên hình xương có thể cá nhân hóa tên bé, giúp nhận diện dễ dàng.',colors:[['Bạc','#C5CBD0','silver'],['Hồng','#E7A7B7','pink']]},
    tag2:{name:'Thẻ tên thú cưng cá nhân hóa - Kiểu Tròn',price:69000,kind:'round',caption:'PERSONALIZED PET TAG · ROUND',description:'Thẻ tên hình tròn nhỏ gọn, tinh tế và phù hợp với nhiều loại vòng cổ.',colors:[['Bạc','#C5CBD0','silver'],['Hồng','#E7A7B7','pink'],['Vàng champagne','#D6BD8A','gold']]}
  };
  let activeProductId='collar1', activeColorIndex=0, selectedProductSize='M';
  const inventory = { collar1:12, collar2:5, leash1:18, leash2:8, tag1:10, tag2:10 };
  // Demo inventory by product/color; the personalized round pink tag is intentionally sold out.
  const soldOutVariants = new Set(['tag2:pink']);
  const money = value => `${value.toLocaleString('vi-VN')}đ`;
  function renderCatalogue(id, keepColor=false){
    const p=catalogue[id]; if(!p)return; activeProductId=id;
    if(!keepColor)activeColorIndex=0; else activeColorIndex=Math.min(activeColorIndex,p.colors.length-1);
    document.querySelectorAll('[data-product]').forEach(b=>b.classList.toggle('selected',b.dataset.product===id));
    if($('productTitle'))$('productTitle').textContent=p.name;
    if($('productPrice'))$('productPrice').innerHTML=`${money(p.price)} <span>${p.price>=1000000?'Miễn phí vận chuyển':'Giá demo'}</span>`;
    if($('productDescription'))$('productDescription').textContent=p.description;
    if($('productStageCaption'))$('productStageCaption').textContent=p.caption;
    const swatches=$('productSwatches');
    if(swatches)swatches.innerHTML=p.colors.map((c,i)=>`<button type="button" class="swatch ${i===activeColorIndex?'selected':''}" data-color-index="${i}" style="--swatch:${c[1]}" aria-label="${c[0]}" title="${c[0]}"></button>`).join('');
    if($('selectedColorName'))$('selectedColorName').textContent=p.colors[activeColorIndex][0];
    const variantKey = `${id}:${p.colors[activeColorIndex][2]}`;
    const soldOut = soldOutVariants.has(variantKey);
    const stockEl = $('productStock');
    if(stockEl) stockEl.textContent = soldOut ? 'Hết hàng' : `Còn hàng · ${inventory[id] ?? 0} sản phẩm`;
    if($('addProduct')) { $('addProduct').disabled = soldOut; $('addProduct').textContent = soldOut ? 'Sản phẩm hết hàng' : `Thêm vào giỏ · ${money(p.price)}`; }
    const image=$('productPreviewImage');
    if(image){
      const colorKey=p.colors[activeColorIndex][2];
      image.alt=`${p.name} màu ${p.colors[activeColorIndex][0]}`;
      // Ảnh biến thể phải tồn tại và là file ảnh hợp lệ trong thư mục assets.
      // Nếu ảnh biến thể bị thiếu/hỏng, thử lần lượt ảnh chính rồi ảnh dự phòng.
      const candidates=[`assets/${id}-${colorKey}.webp`,`assets/${id}-${colorKey}.png`,`assets/${id}-${colorKey}.jpg`,`assets/${id}-main.webp`,'assets/hearpaw-product.jpg'];
      let candidateIndex=0;
      image.onerror=()=>{
        candidateIndex += 1;
        if(candidateIndex < candidates.length){
          image.src = candidates[candidateIndex];
        } else {
          image.onerror = null;
          image.alt = `${p.name} màu ${p.colors[activeColorIndex][0]} (chưa có ảnh biến thể)`;
          console.warn(`HearPaw: Không tìm thấy ảnh hợp lệ cho ${id} màu ${colorKey}. Hãy thêm file ${id}-${colorKey}.webp vào assets/.`);
        }
      };
      image.src = candidates[candidateIndex];
    }
    let extra='';
    if(p.kind==='collar')extra=`<label class="product-extra-label" for="productSize">Chọn kích cỡ vòng cổ</label><div class="size-options"><button type="button" class="size-option ${selectedProductSize==='S'?'selected':''}" data-size="S">S <small>25–35 cm</small></button><button type="button" class="size-option ${selectedProductSize==='M'?'selected':''}" data-size="M">M <small>35–48 cm</small></button><button type="button" class="size-option ${selectedProductSize==='L'?'selected':''}" data-size="L">L <small>48–65 cm</small></button></div>`;
    if(p.length)extra=`<label class="product-extra-label" for="leashLength">Độ dài dây dắt</label><select id="leashLength" class="product-extra-select"><option value="1m">1 m</option><option value="1.5m" selected>1,5 m</option><option value="2m">2 m</option></select>`;
    if(p.kind==='bone'||p.kind==='round')extra=`<label class="product-extra-label" for="tagText">Tên muốn khắc trên thẻ</label><input id="tagText" class="product-extra-select" maxlength="18" placeholder="Ví dụ: Milo" />`;
    if($('productOptionsExtra'))$('productOptionsExtra').innerHTML=extra;
    if($('addProduct'))$('addProduct').textContent=`Thêm vào giỏ · ${money(p.price)}`;
  }
  $('productSwatches')?.addEventListener('click',e=>{const btn=e.target.closest('[data-color-index]');if(!btn)return;activeColorIndex=Number(btn.dataset.colorIndex);renderCatalogue(activeProductId,true);});
  document.querySelectorAll('[data-product]').forEach(btn=>btn.addEventListener('click',()=>renderCatalogue(btn.dataset.product)));
  document.addEventListener('click',e=>{const btn=e.target.closest('.size-option[data-size]');if(!btn)return;selectedProductSize=btn.dataset.size;document.querySelectorAll('.size-option[data-size]').forEach(x=>x.classList.toggle('selected',x.dataset.size===selectedProductSize));});
  renderCatalogue('collar1');
  function bindSwatches(containerId, previewId, nameId) {
    const container = $(containerId); if (!container) return;
    container.querySelectorAll('.swatch').forEach(button => button.addEventListener('click', () => {
      container.querySelectorAll('.swatch').forEach(item => item.classList.toggle('selected', item === button));
      const color = button.dataset.color || '#687653';
      if ($(previewId)) $(previewId).style.setProperty('--collar-color', color);
      if (nameId && $(nameId)) $(nameId).textContent = button.dataset.name || 'Màu đã chọn';
    }));
  }
  bindSwatches('customSwatches', 'customCollar', null);
  $('petName')?.addEventListener('input', e => { if ($('customPreviewName')) $('customPreviewName').textContent = e.target.value.trim() ? `Vòng cổ của ${e.target.value.trim()}` : 'Vòng cổ của bé'; });
  const customTagPrice = 69000;
  function updateCustomChoices() {
    const location = document.querySelector('input[name="engravingLocation"]:checked')?.value || 'Khắc lên vòng';
    document.querySelectorAll('input[name="tagShape"]').forEach(input => { input.disabled = location !== 'Khắc lên thẻ'; });
    const tagShapeHeading = [...document.querySelectorAll('label')].find(el => el.textContent.trim() === 'Chọn kiểu thẻ khắc tên');
    const tagShapeGroup = tagShapeHeading?.nextElementSibling;
    if(tagShapeHeading) tagShapeHeading.hidden = location !== 'Khắc lên thẻ';
    if(tagShapeGroup) tagShapeGroup.hidden = location !== 'Khắc lên thẻ';
    const otherPattern = document.querySelector('input[name="collarPattern"][value="Khác - thiết kế theo yêu cầu"]');
    if($('customPatternDetails')) $('customPatternDetails').hidden = !otherPattern?.checked;
    const tagRow = $('tagPriceRow');
if (tagRow) {
  tagRow.hidden = location !== 'Khắc lên thẻ';
  tagRow.style.display = location === 'Khắc lên thẻ' ? '' : 'none';
}
    if ($('tagRequirement')) $('tagRequirement').textContent = location === 'Khắc lên thẻ' ? 'Bạn đã chọn khắc lên thẻ: thẻ tên sẽ được tính thêm 69.000đ vào đơn hàng.' : 'Đang chọn khắc lên vòng cổ — không cần mua thẻ tên.';
    if ($('customTotal')) $('customTotal').textContent = money(1748000 + (location === 'Khắc lên thẻ' ? customTagPrice : 0));
  }
  document.querySelectorAll('input[name="engravingLocation"], input[name="tagShape"], input[name="collarPattern"]').forEach(input => input.addEventListener('change', updateCustomChoices));
  $('patternReference')?.addEventListener('change', e => { const f=e.target.files?.[0]; if(f && f.size > 5*1024*1024){ alert('Ảnh mẫu tối đa 5MB.'); e.target.value=''; } if(f && !/\\.(png|jpe?g)$/i.test(f.name)){ alert('Chỉ hỗ trợ ảnh PNG hoặc JPG.'); e.target.value=''; } });
  updateCustomChoices();

  // Demo cart
  const CART_STORAGE_KEY = 'hearpawDemoCart';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]'); if (!Array.isArray(cart)) cart = []; } catch (_) { cart = []; }
  function saveCart() { try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch (_) {} }
  function cartHasGpsCollar(items = cart) {
    return items.some(item => /vòng cổ/i.test(String(item.name || '')));
  }
  function cartSubtotal(items = cart) {
    return items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
  }
  function renderCart() {
    if ($('cartCount')) $('cartCount').textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cartSubtotal();
    if ($('cartTotal')) $('cartTotal').textContent = money(subtotal);
    const shipping = $('cartShipping');
    if (shipping) {
      if (!cart.length) shipping.innerHTML = '';
      else if (cartHasGpsCollar()) shipping.innerHTML = '<div class="cart-shipping-line"><span>Phí vận chuyển</span><b class="green">Miễn phí toàn quốc</b></div>';
      else shipping.innerHTML = '<div class="cart-shipping-line"><span>Phí vận chuyển</span><b>Theo phí đơn vị giao hàng</b></div><small class="shipping-note">Đơn chỉ gồm phụ kiện: phí vận chuyển sẽ do khách hàng thanh toán theo mức phí của đơn vị giao hàng.</small>';
    }
    if (!$('cartItems')) return;
    $('cartItems').innerHTML = cart.length ? cart.map((item, index) => `<div class="cart-item"><div><b>${item.name}</b><small>${money(item.price)} · SL ${item.qty}</small></div><button type="button" data-remove-cart="${index}" aria-label="Xóa sản phẩm">×</button></div>`).join('') : '<p class="empty-cart">Giỏ hàng đang trống. Thêm một chiếc vòng cho bé nhé! 🐾</p>';
    saveCart();
  }
  function addItem(item) {
    const existing = cart.find(row => row.name === item.name);
    if (existing) existing.qty += 1; else cart.push({...item, qty: 1});
    renderCart();
    if ($('paymentSection')) $('paymentSection').hidden = true;
    $('checkoutMessage') && ($('checkoutMessage').textContent = 'Đã thêm sản phẩm vào giỏ hàng demo.');
    openCart();
  }
  function openCart() { $('cartModal')?.classList.add('open'); $('cartModal')?.setAttribute('aria-hidden', 'false'); }
  function closeCart() { $('cartModal')?.classList.remove('open'); $('cartModal')?.setAttribute('aria-hidden', 'true'); }
  $('addProduct')?.addEventListener('click', () => { const p=catalogue[activeProductId]; const color=p.colors[activeColorIndex][0]; let detail=`${p.name} · ${color}`; if(p.kind==='collar')detail+=` · size ${selectedProductSize} (${selectedProductSize==='S'?'25–35':selectedProductSize==='M'?'35–48':'48–65'} cm)`; if(p.length)detail+=` · dài ${$('leashLength')?.value||'1.5m'}`; if(p.kind==='bone'||p.kind==='round'){const tag=$('tagText')?.value.trim();if(tag)detail+=` · khắc tên ${tag}`;} addItem({name:detail,price:p.price}); });
  $('addCustom')?.addEventListener('click', () => {
    const pet = $('petName')?.value.trim();
    const color = $('customSwatches')?.querySelector('.swatch.selected')?.dataset.name || 'Xanh rêu';
    const size = $('customSize')?.value || 'M';
    const engraving = document.querySelector('input[name="engravingLocation"]:checked')?.value || 'Khắc lên vòng';
    const tagShape = document.querySelector('input[name="tagShape"]:checked')?.value || 'Hình xương';
    const pattern = document.querySelector('input[name="collarPattern"]:checked')?.value || 'Xương cá';
    if(pattern === 'Khác - thiết kế theo yêu cầu' && !$('patternDescription')?.value.trim()){ alert('Vui lòng mô tả họa tiết bạn mong muốn.'); return; }
    const patternDescription = $('patternDescription')?.value.trim();
    const referenceFile = $('patternReference')?.files?.[0];
    const engravingText = $('engraving')?.value.trim();
    const name = `Vòng cổ cá nhân hóa${pet ? ` cho ${pet}` : ''} · ${color} · size ${size} · họa tiết ${pattern} · ${engraving}`;
    const details = `${name}${patternDescription ? ` · mô tả họa tiết: ${patternDescription}` : ''}${referenceFile ? ` · ảnh mẫu: ${referenceFile.name}` : ''}${engravingText ? ` · ghi chú: ${engravingText}` : ''}${engraving === 'Khắc lên thẻ' ? ` · thẻ ${tagShape}` : ''}`;
    addItem({name:details, price:1748000 + (engraving === 'Khắc lên thẻ' ? customTagPrice : 0)});
  });
  $('cartOpen')?.addEventListener('click', openCart);
  $('cartClose')?.addEventListener('click', closeCart);
  $('cartModal')?.addEventListener('click', e => { if (e.target === $('cartModal')) closeCart(); });
  $('cartItems')?.addEventListener('click', e => {
    const button = e.target.closest('[data-remove-cart]');
    if (button) { cart.splice(Number(button.dataset.removeCart), 1); renderCart(); if (!cart.length && $('paymentSection')) $('paymentSection').hidden = true; }
  });
  $('checkoutButton')?.addEventListener('click', () => {
    const loggedIn = sessionStorage.getItem('hearpawDemoLoggedIn') === 'true';
    if (!cart.length) { $('checkoutMessage').textContent = 'Giỏ hàng đang trống. Hãy thêm sản phẩm trước nhé!'; return; }
    if (!loggedIn) {
      saveCart();
      sessionStorage.setItem('hearpawReturnUrl', location.pathname + '?resumeCheckout=1#product');
      location.href = 'login.html';
      return;
    }
    if ($('paymentSection')) $('paymentSection').hidden = false;
    if ($('checkoutMessage')) $('checkoutMessage').textContent = 'Giỏ hàng đã được giữ lại. Vui lòng chọn phương thức thanh toán.';
  });
  // VietQR động: tạo QR theo tổng tiền và mã đơn hàng cho tài khoản BIDV đã cung cấp.
  let currentOrderCode = sessionStorage.getItem('hearpawCurrentOrderCode') || '';
  function ensureOrderCode() {
    if (!currentOrderCode) {
      currentOrderCode = 'HP' + Date.now().toString().slice(-8);
      sessionStorage.setItem('hearpawCurrentOrderCode', currentOrderCode);
    }
    return currentOrderCode;
  }
  function updateBankQR() {
    const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
    const qrImage = $('bankQrImage');
    if (!qrImage || total <= 0) return;
    const memo = ensureOrderCode();
    const params = new URLSearchParams({
      amount: String(Math.round(total)),
      addInfo: memo,
      accountName: 'TRAN THI THU HUYEN'
    });
    qrImage.src = `https://img.vietqr.io/image/BIDV-8813737570-compact2.png?${params.toString()}`;
    if ($('bankQrAmount')) $('bankQrAmount').textContent = money(total);
    if ($('bankQrMemo')) $('bankQrMemo').textContent = memo;
  }
  document.querySelectorAll('input[name="paymentMethod"]').forEach(input => input.addEventListener('change', () => {
    const details = $('paymentDetails');
    if (details) details.hidden = input.value !== 'bankqr' || !input.checked;
    if (input.value === 'bankqr' && input.checked) updateBankQR();
  }));
  $('confirmPayment')?.addEventListener('click', () => {
    if (!cart.length) {
      if ($('checkoutMessage')) $('checkoutMessage').textContent = 'Giỏ hàng đang trống.';
      return;
    }
    const customerName = $('customerName')?.value.trim() || '';
    const customerAddress = $('customerAddress')?.value.trim() || '';
    const customerPhone = $('customerPhone')?.value.trim() || '';
    if(!customerName || !customerAddress || !customerPhone){ $('checkoutMessage').textContent = 'Vui lòng nhập đầy đủ tên, địa chỉ nhận hàng và số điện thoại.'; $('shippingInfoSection')?.scrollIntoView({behavior:'smooth',block:'center'}); return; }
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'momo';
    const methodNames = {
      momo: 'MoMo (demo)',
      bankqr: 'Chuyển khoản QR (demo, chưa xác minh giao dịch)',
      cod: 'Thanh toán khi nhận hàng (demo)'
    };
    const order = {
      code: ensureOrderCode(),
      items: cart,
      total: cartSubtotal(),
      shipping: cartHasGpsCollar() ? 'Miễn phí vận chuyển toàn quốc' : 'Khách hàng thanh toán theo phí của đơn vị giao hàng',
      paymentMethod: methodNames[method] || 'Phương thức demo',
      customer: {name:customerName,address:customerAddress,phone:customerPhone},
      createdAt: new Date().toISOString()
    };
    try { sessionStorage.setItem('hearpawLastDemoOrder', JSON.stringify(order)); } catch (_) {}
    cart = [];
    saveCart();
    renderCart();
    sessionStorage.removeItem('hearpawCurrentOrderCode');
    currentOrderCode = '';
    location.href = 'thank-you.html';
  });
  renderCart();
  const resumeCheckout = new URLSearchParams(location.search).get('resumeCheckout') === '1';
  if (resumeCheckout) {
    history.replaceState(null, '', location.pathname + '#product');
    openCart();
    if (sessionStorage.getItem('hearpawDemoLoggedIn') === 'true' && cart.length) {
      if ($('paymentSection')) $('paymentSection').hidden = false;
      if ($('checkoutMessage')) $('checkoutMessage').textContent = 'Chào mừng bạn quay lại! Giỏ hàng đã được khôi phục.';
    }
  }

  // Summary cards navigate to the matching My Pet tab.
  document.querySelectorAll('[data-goto]').forEach(button => button.addEventListener('click', () => {
    const tab = button.dataset.goto;
    const myPetPage = document.getElementById('mypet');
    if (myPetPage) showPage('mypet');
    const tabButton = document.querySelector(`.dash-link[data-tab="${tab}"]`);
    if (tabButton) tabButton.click();
  }));

  // My Pet dashboard tabs
  document.querySelectorAll('.dash-link[data-tab]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.dash-link').forEach(item => item.classList.toggle('active', item === button));
    document.querySelectorAll('.dash-panel').forEach(panel => panel.classList.toggle('active', panel.id === `panel-${button.dataset.tab}`));
  }));
  $('saveProfile')?.addEventListener('click', () => {
    if ($('activePetName')) $('activePetName').textContent = $('profileName')?.value.trim() || 'Bé yêu';
    if ($('profileSaved')) $('profileSaved').textContent = 'Đã lưu hồ sơ demo trong giao diện.';
  });
  $('findPet')?.addEventListener('click', () => { if ($('mapToast')) $('mapToast').textContent = 'Đã làm mới vị trí mô phỏng của bé 🐾'; });
  function updateZoneRadius() {
    const radius = Number($('zoneRadius')?.value || 300);
    if ($('radiusValue')) $('radiusValue').textContent = `${radius.toLocaleString('vi-VN')} m`;
    if ($('zoneCircle')) {
      // Change the diameter only; keep translate(-50%, -50%) so the circle stays centered on the paw.
      const diameter = 100 + ((radius - 100) / 900) * 150;
      $('zoneCircle').style.width = `${diameter}px`;
      $('zoneCircle').style.height = `${diameter}px`;
    }
  }
  $('zoneRadius')?.addEventListener('input', updateZoneRadius);
  function updateZone() {
    const enabled = !!$('zoneToggle')?.checked;
    if ($('zoneStatus')) $('zoneStatus').textContent = enabled ? 'Đang bật' : 'Đã tắt';
    if ($('zoneCircle')) $('zoneCircle').style.opacity = enabled ? '1' : '.18';
  }
  $('zoneToggle')?.addEventListener('change', updateZone);
  $('testAlert')?.addEventListener('click', () => { if ($('zoneMessage')) $('zoneMessage').textContent = 'Cảnh báo demo đã được mô phỏng; không gửi thông báo thật.'; });
  $('resetZone')?.addEventListener('click', () => { if ($('zoneToggle')) $('zoneToggle').checked = true; if ($('zoneRadius')) $('zoneRadius').value = 300; if ($('radiusValue')) $('radiusValue').textContent = '300 m'; updateZoneRadius(); if ($('zoneMessage')) $('zoneMessage').textContent = 'Đã khôi phục cài đặt demo.'; updateZone(); });
  $('refreshDemo')?.addEventListener('click', () => {
    if ($('stepStat')) $('stepStat').textContent = '6.842';
    if ($('activeStat')) $('activeStat').innerHTML = '2,3 <em>giờ</em>';
    if ($('zoneToggle')) $('zoneToggle').checked = true;
    if ($('zoneRadius')) $('zoneRadius').value = 300;
    if ($('radiusValue')) $('radiusValue').textContent = '300 m';
    if ($('zoneMessage')) $('zoneMessage').textContent = '';
    if ($('mapToast')) $('mapToast').textContent = 'Demo đã được làm mới về dữ liệu mặc định.';
    updateZone();
    const refresh = $('refreshDemo');
    if (refresh) { const old = refresh.textContent; refresh.textContent = '✓ Đã làm mới'; setTimeout(() => refresh.textContent = old, 1800); }
  });
  $('resetDemo')?.addEventListener('click', () => { if ($('profileName')) $('profileName').value = 'Milo'; if ($('profileBreed')) $('profileBreed').value = 'Golden Retriever'; if ($('activePetName')) $('activePetName').textContent = 'Milo'; if ($('profileSaved')) $('profileSaved').textContent = 'Đã đặt lại dữ liệu mẫu.'; });
  $('markRead')?.addEventListener('click', () => { document.querySelectorAll('#alertsList .tag').forEach(tag => { tag.textContent = 'Đã xem'; tag.classList.remove('tag-red','tag-yellow'); }); const count = document.querySelector('.alert-count'); if (count) count.textContent = '0'; });
  $('activityPeriod')?.addEventListener('change', e => { if ($('activeStat')) $('activeStat').innerHTML = e.target.value === 'today' ? '1,2 <em>giờ</em>' : e.target.value === 'month' ? '2,5 <em>giờ</em>' : '2,3 <em>giờ</em>'; });

  // Demo contact form
  $('contactForm')?.addEventListener('submit', e => { e.preventDefault(); if ($('contactStatus')) $('contactStatus').textContent = 'Cảm ơn bạn! Lời nhắn đã được ghi nhận trên giao diện demo, chưa gửi lên máy chủ.'; e.target.reset(); });

  // HearPaw assistant: topic buttons plus keyword-based demo replies.
  function addChatMessage(text, type) {
    const message = document.createElement('div');
    message.className = type === 'user' ? 'user-message' : 'bot-message';
    message.textContent = text;
    $('chatMessages')?.appendChild(message);
    if ($('chatMessages')) $('chatMessages').scrollTop = $('chatMessages').scrollHeight;
  }
  const normalizeChat = text => text.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  function replyTo(text) {
    const q = normalizeChat(text);
    if (/(xin chao|hello|hi|chao shop)/.test(q)) return 'Xin chào bạn và bé 🐾 Mình là HearPaw Assistant. Bạn có thể hỏi cách đo vòng cổ, dùng app My Pet, xem sản phẩm hoặc thanh toán.';
    if (/(do co|do vong|kich co|size|vong co vua|chon size)/.test(q)) return '📏 Cách đo vòng cổ: dùng thước dây đo quanh gốc cổ của bé, tại vị trí vòng thường nằm. Để vòng thoải mái, chừa khoảng trống vừa đủ luồn hai ngón tay. Bảng size demo HearPaw: S 25–35 cm, M 35–48 cm, L 48–65 cm. Nếu số đo nằm giữa hai size, hãy kiểm tra khả năng điều chỉnh của mẫu vòng trước khi chọn.';
    if (/(my pet|su dung app|cach dung app|ket noi|xem vi tri|gps|vung an toan|hoat dong cua be)/.test(q)) return '📱 Cách dùng My Pet: mở mục My Pet trên website, xem hồ sơ của bé rồi chọn Tổng quan, Theo dõi vị trí, Vùng an toàn hoặc Hoạt động ở menu. Những vị trí, cảnh báo và số liệu đang hiển thị chỉ là dữ liệu demo; website hiện chưa kết nối vòng cổ GPS thật.';
    if (/(gia|san pham|mua vong|mau sac|day dat|the ten|vong co)/.test(q)) return '🛍️ HearPaw có vòng cổ thông minh vải (1.599.000đ), vòng cổ thông minh da (1.799.000đ), dây dắt vải (129.000đ), dây dắt da mềm (179.000đ) và thẻ tên cá nhân hóa (69.000đ). Đây là giá hiển thị cho bản demo; bạn có thể vào mục Sản phẩm để xem màu và kích cỡ.';
    if (/(ca nhan hoa|khac ten|ten tren the|in ten)/.test(q)) return 'Bạn có thể chọn mẫu thẻ tên, màu sắc và nhập tên cần khắc trong phần Sản phẩm. Với vòng cổ cá nhân hóa, hãy nhập tên bé và chọn màu, kích cỡ trước khi thêm vào giỏ.';
    if (/(thanh toan|momo|ma qr|qr ngan hang|chuyen khoan|tra tien|gio hang)/.test(q)) return '💳 Khi bấm thanh toán, nếu chưa đăng nhập bạn sẽ được chuyển đến trang đăng nhập/đăng ký. Sau khi đăng nhập, giỏ hàng sẽ được khôi phục và bạn có thể chọn MoMo, QR ngân hàng hoặc thanh toán khi nhận hàng.';
    if (/(lien he|ho tro|nhan vien|tu van|gap loi)/.test(q)) return '💬 Bạn có thể vào mục Liên hệ trên website và gửi lời nhắn cho chúng tôi. Nếu câu hỏi chưa được giải đáp, hãy chọn một chủ đề bên dưới hoặc mô tả rõ hơn điều bạn cần hỗ trợ.';
    return 'Mình chưa hiểu rõ câu hỏi này 🐾 Bạn thử hỏi “Cách đo vòng cổ”, “Cách sử dụng app My Pet”, “Sản phẩm và giá” hoặc “Phương thức thanh toán” nhé.';
  }
  $('chatToggle')?.addEventListener('click', () => $('chatPanel')?.classList.toggle('open'));
  $('chatClose')?.addEventListener('click', () => $('chatPanel')?.classList.remove('open'));
  document.querySelectorAll('[data-chat]').forEach(button => button.addEventListener('click', () => { const text = button.dataset.chat; addChatMessage(text, 'user'); addChatMessage(replyTo(text), 'bot'); }));
  $('chatForm')?.addEventListener('submit', e => { e.preventDefault(); const input = $('chatInput'); const text = input?.value.trim(); if (!text) return; addChatMessage(text, 'user'); addChatMessage(replyTo(text), 'bot'); input.value = ''; });
// Đồng bộ dấu chấm với ảnh tự động trượt
const galleryTrack = document.querySelector('.custom-gallery-track');
const galleryDots = [...document.querySelectorAll('.custom-gallery-dots span')];

if (galleryTrack && galleryDots.length) {
  let currentDot = 0;

  setInterval(() => {
    currentDot = (currentDot + 1) % galleryDots.length;

    galleryDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentDot);
    });
  }, 4000);
}
})();
