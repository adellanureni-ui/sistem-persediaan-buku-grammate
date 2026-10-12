const themeToggle = document.getElementById('theme-toggle');
const themeStorageKey = 'abook-theme';
let savedTheme = 'light';
try {
  savedTheme = localStorage.getItem(themeStorageKey) || 'light';
} catch (error) { console.warn('Tema tersimpan tidak dapat dibaca:', error); }
document.body.classList.toggle('dark-theme', savedTheme === 'dark');
if (themeToggle) {
  themeToggle.checked = document.body.classList.contains('dark-theme');
  const themeControl = themeToggle.closest('.theme-control');
  if (themeControl) {
    themeControl.addEventListener('click', (event) => {
      if (event.target === themeToggle) return;
      event.preventDefault();
      themeToggle.click();
    });
  }
  themeToggle.addEventListener('change', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    themeToggle.checked = isDark;
    try { localStorage.setItem(themeStorageKey, isDark ? 'dark' : 'light'); } catch (error) { console.warn('Tema tidak dapat disimpan:', error); }
  });
}
const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.getElementById('btn-toggle-sidebar');
if (sidebar && sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
    sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Tampilkan sidebar' : 'Sembunyikan sidebar');
    sidebarToggle.title = isCollapsed ? 'Tampilkan sidebar' : 'Sembunyikan sidebar';
  });
}
const stickerBaseUrl = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/';
function addPixelSticker(element, emojiCode, className = 'pixel-sticker') {
  if (!element || element.querySelector(`.${className}`)) return;
  const image = document.createElement('img');
  image.className = className;
  image.src = `${stickerBaseUrl}${emojiCode}.png`;
  image.alt = '';
  image.setAttribute('aria-hidden', 'true');
  element.prepend(image);
}
document.querySelectorAll('button').forEach((button) => {
  const emojiCode = button.classList.contains('sidebar-toggle') ? '1f4d6'
    : button.classList.contains('secondary-btn') ? '1f4c5'
      : button.classList.contains('danger') ? '1f4c1'
        : button.classList.contains('icon-btn') ? '1f4dd' : '1f9ee';
  addPixelSticker(button, emojiCode);
});

const TABLES = {
  barang: 'barang',
  pelanggan: 'pelanggan',
  supplier: 'supplier',
  pembelian: 'transaksi_pembelian',
  detailPembelian: 'detail_pembelian',
  penjualan: 'transaksi_penjualan',
  detailPenjualan: 'detail_penjualan',
  penyesuaian: 'penyesuaian_stok',
  jurnal: 'jurnal_umum'
};

const state = { barang: [], pelanggan: [], supplier: [], pembelian: [], penjualan: [], penyesuaian: [], jurnal: [] };
const masterConfig = {
  barang: {
    table: TABLES.barang,
    idColumn: 'id_barang',
    bodyId: 'barang-body',
    fields: [
      { name: 'sku', label: 'Kode Barang' },
      { name: 'nama_barang', label: 'Nama Barang' },
      { name: 'harga_pokok', label: 'Harga Beli', type: 'number', min: '0', step: '1' },
      { name: 'harga_jual', label: 'Harga Jual', type: 'number', min: '0', step: '1' },
      { name: 'stok', label: 'Stok', type: 'number', min: '0', step: '1' }
    ]
  },
  pelanggan: {
    table: TABLES.pelanggan,
    idColumn: 'id_pelanggan',
    bodyId: 'pelanggan-body',
    fields: [
      { name: 'nama_pelanggan', label: 'Nama Pelanggan' },
      { name: 'kontak', label: 'Telepon' },
      { name: 'alamat', label: 'Alamat', fullWidth: true }
    ]
  },
  supplier: {
    table: TABLES.supplier,
    idColumn: 'id_supplier',
    bodyId: 'supplier-body',
    fields: [
      { name: 'nama_supplier', label: 'Nama Supplier' },
      { name: 'kontak', label: 'Telepon' },
      { name: 'alamat', label: 'Alamat', fullWidth: true }
    ]
  }
};
const pageTitles = {
  dashboard: 'Ringkasan', 'data-barang': 'Data Barang', 'data-pelanggan': 'Data Pelanggan', 'data-supplier': 'Data Supplier',
  'transaksi-pembelian': 'Transaksi Pembelian', 'transaksi-penjualan': 'Transaksi Penjualan', 'penyesuaian-stok': 'Penyesuaian Stok',
  'jurnal-umum': 'Jurnal Umum', 'buku-besar': 'Buku Besar', 'laporan-barang': 'Laporan Barang',
  'laporan-pembelian': 'Laporan Pembelian', 'laporan-penjualan': 'Laporan Penjualan', 'kartu-persediaan': 'Kartu Persediaan',
  'laporan-laba-rugi': 'Laporan Laba Rugi', neraca: 'Neraca'
};
const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });
const toastContainer = document.getElementById('toast-container');
let supabaseClient;
let refreshTimer;
let realtimeChannel;
let renderRequestId = 0;
const dateColumnCache = new Map();

function on(element, eventName, handler) {
  if (element && typeof element.addEventListener === 'function') element.addEventListener(eventName, handler);
}
function getClient() {
  if (supabaseClient) return supabaseClient;
  if (typeof window.supabase?.getClient === 'function') supabaseClient = window.supabase.getClient();
  else if (window.supabase?.createClient && window.supabase?.config?.url && window.supabase?.config?.anonKey) {
    supabaseClient = window.supabase.createClient(window.supabase.config.url, window.supabase.config.anonKey);
  }
  return supabaseClient;
}
function showStatus(message, type = 'info') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = type === 'error' ? '!' : '✓';

  const text = document.createElement('span');
  text.className = 'toast-message';
  text.textContent = message;

  const dismiss = document.createElement('button');
  dismiss.className = 'toast-dismiss';
  dismiss.type = 'button';
  dismiss.setAttribute('aria-label', 'Tutup notifikasi');
  dismiss.textContent = '×';

  let timeout;
  const removeToast = () => {
    window.clearTimeout(timeout);
    toast.classList.add('is-leaving');
    window.setTimeout(() => toast.remove(), 180);
  };
  dismiss.addEventListener('click', removeToast);
  toast.append(icon, text, dismiss);
  toastContainer.append(toast);
  while (toastContainer.children.length > 4) toastContainer.firstElementChild.remove();
  timeout = window.setTimeout(removeToast, 3000);
}
function setDataLoading(isLoading, restoreSkeletons = false) {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;
  mainContent.classList.toggle('is-loading', isLoading);
  mainContent.setAttribute('aria-busy', String(isLoading));

  document.querySelectorAll('.stat-card .stat-label, .stat-card strong, .stat-card small').forEach((element) => {
    element.classList.toggle('skeleton-text', isLoading);
  });

  document.querySelectorAll('tbody').forEach((body) => {
    if (isLoading) {
      if (body.dataset.loadingMarkup === undefined) body.dataset.loadingMarkup = body.innerHTML;
      const columns = body.closest('table')?.querySelectorAll('thead th').length || 1;
      body.innerHTML = Array.from({ length: 3 }, () => `<tr class="skeleton-row" aria-hidden="true"><td colspan="${columns}"><span class="skeleton-line"></span></td></tr>`).join('');
    } else {
      if (restoreSkeletons && body.querySelector('.skeleton-row')) body.innerHTML = body.dataset.loadingMarkup || '';
      delete body.dataset.loadingMarkup;
    }
  });
}
function safe(value) {
  return String(value ?? '-').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
function valueOf(row, ...keys) {
  for (const key of keys) if (row?.[key] !== undefined && row[key] !== null) return row[key];
  return '';
}
function money(value) { return currency.format(Number(value) || 0); }
function qtyOf(row) { return Number(valueOf(row, 'jumlah', 'qty', 'kuantitas') || 0); }
function totalOf(row) {
  const total = Number(valueOf(row, 'total', 'total_harga', 'subtotal'));
  if (Number.isFinite(total) && total !== 0) return total;
  return qtyOf(row) * Number(valueOf(row, 'harga_satuan', 'harga_pokok', 'harga_jual', 'harga') || 0);
}
function dateValue(row) { return valueOf(row, 'tanggal', 'created_at', 'tanggal_transaksi'); }
function dateText(row) {
  const value = dateValue(row);
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? safe(value) : parsed.toLocaleDateString('id-ID');
}
function todayISODate() { return new Date().toISOString().split('T')[0]; }
function dateTimestamp(value) {
  const [year, month, day] = (value || todayISODate()).split('-').map(Number);
  return new Date(year, month - 1, day, 12).toISOString();
}
function dateInputValue(value) {
  if (!value) return todayISODate();
  const datePrefix = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (datePrefix) return datePrefix;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return todayISODate();
  return parsed.toISOString().split('T')[0];
}
function addDateField(container, before = null, value = '') {
  const template = document.getElementById('date-field-template');
  if (!container || !template || container.querySelector('.form-tanggal')) return null;
  const field = template.content.firstElementChild.cloneNode(true);
  const input = field.querySelector('.form-tanggal');
  input.value = dateInputValue(value);
  if (before) container.insertBefore(field, before);
  else container.append(field);
  return input;
}
document.querySelectorAll('form.form-grid:not(#master-edit-form)').forEach((form) => {
  addDateField(form, form.querySelector('.form-actions'));
});
function emptyRow(columns, message = 'Belum ada data.') { return `<tr class="empty-row"><td colspan="${columns}">${safe(message)}</td></tr>`; }
function setRows(id, rows, columns, renderRow, message) {
  const body = document.getElementById(id);
  if (body) body.innerHTML = rows.length ? rows.map(renderRow).join('') : emptyRow(columns, message);
}
function itemId(item) { return valueOf(item, 'id_barang'); }
function itemName(item) { return valueOf(item, 'nama_barang') || `Barang #${itemId(item) || '-'}`; }
function itemCode(item) { return valueOf(item, 'sku') || `BRG-${itemId(item) || ''}`; }
function partnerId(item, kind) { return valueOf(item, kind === 'supplier' ? 'id_supplier' : 'id_pelanggan'); }
function partnerName(item, kind) { return valueOf(item, kind === 'supplier' ? 'nama_supplier' : 'nama_pelanggan') || `#${partnerId(item, kind) || '-'}`; }
function accountName(row) { return valueOf(row, 'akun'); }
function debit(row) { return Number(valueOf(row, 'debit') || 0); }
function credit(row) { return Number(valueOf(row, 'kredit') || 0); }
function reference(row) { return valueOf(row, 'no_bukti', 'no_faktur', 'no_nota') || '-'; }
function description(row) { return valueOf(row, 'keterangan', 'deskripsi', 'description', 'catatan') || '-'; }
function stockOf(item) { return Number(valueOf(item, 'stok') || 0); }
function stockKey() { return 'stok'; }
function actionCell(kind, id) {
  return `<td><div class="table-actions"><button class="table-action" type="button" data-master-action="edit" data-master-kind="${kind}" data-id="${safe(id)}"><img class="pixel-sticker" src="${stickerBaseUrl}1f4dd.png" alt="" aria-hidden="true" />Edit</button><button class="table-action danger" type="button" data-master-action="delete" data-master-kind="${kind}" data-id="${safe(id)}"><img class="pixel-sticker" src="${stickerBaseUrl}1f4c1.png" alt="" aria-hidden="true" />Hapus</button></div></td>`;
}

function setPage(page) {
  const target = pageTitles[page] ? page : 'dashboard';
  document.querySelectorAll('.page').forEach((section) => { section.hidden = section.id !== `page-${target}`; });
  document.querySelectorAll('.nav-item[data-page]').forEach((link) => link.classList.toggle('active', link.dataset.page === target));
  const title = document.getElementById('current-section');
  if (title) title.textContent = pageTitles[target];
  if (window.location.hash !== `#${target}`) history.replaceState(null, '', `#${target}`);
}

document.querySelectorAll('[data-page]').forEach((link) => on(link, 'click', (event) => {
  event.preventDefault();
  setPage(link.dataset.page);
}));
on(window, 'hashchange', () => setPage(window.location.hash.slice(1)));

const todayLabel = document.getElementById('today-label');
if (todayLabel) todayLabel.textContent = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date());
document.querySelectorAll('[data-refresh]').forEach((button) => on(button, 'click', renderData));

function renderOptions() {
  const groups = {
    barang: state.barang.map((item) => ({ id: itemId(item), label: `${itemCode(item)} · ${itemName(item)}` })),
    supplier: state.supplier.map((item) => ({ id: partnerId(item, 'supplier'), label: partnerName(item, 'supplier') })),
    pelanggan: state.pelanggan.map((item) => ({ id: partnerId(item, 'pelanggan'), label: partnerName(item, 'pelanggan') }))
  };
  document.querySelectorAll('select[data-options]').forEach((select) => {
    const previous = select.value;
    const group = groups[select.dataset.options] || [];
    const prompt = select.dataset.options === 'barang' ? 'Pilih barang' : `Pilih ${select.dataset.options}`;
    select.innerHTML = `<option value="">${prompt}</option>${group.map((entry) => `<option value="${safe(entry.id)}">${safe(entry.label)}</option>`).join('')}`;
    if (group.some((entry) => String(entry.id) === previous)) select.value = previous;
  });
  const accountSelect = document.getElementById('ledger-account');
  if (accountSelect) {
    const previous = accountSelect.value || 'all';
    const accounts = [...new Set(state.jurnal.map(accountName).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id'));
    accountSelect.innerHTML = `<option value="all">Semua akun</option>${accounts.map((account) => `<option value="${safe(account)}">${safe(account)}</option>`).join('')}`;
    accountSelect.value = accounts.includes(previous) ? previous : 'all';
  }
  const itemSelect = document.getElementById('inventory-card-item');
  if (itemSelect) {
    const previous = itemSelect.value || 'all';
    itemSelect.innerHTML = `<option value="all">Semua barang</option>${state.barang.map((item) => `<option value="${safe(itemId(item))}">${safe(itemCode(item))} · ${safe(itemName(item))}</option>`).join('')}`;
    itemSelect.value = state.barang.some((item) => String(itemId(item)) === previous) ? previous : 'all';
  }
}

function renderInventory() {
  const barang = state.barang;
  const items = [...barang].sort((a, b) => itemName(a).localeCompare(itemName(b), 'id'));
  const regular = (item) => `<tr><td>${safe(itemCode(item))}</td><td>${safe(itemName(item))}</td><td>-</td><td>${money(valueOf(item, 'harga_pokok'))}</td><td>${money(valueOf(item, 'harga_jual'))}</td><td><span class="stock-pill ${stockOf(item) <= 5 ? 'low' : ''}">${stockOf(item)}</span></td>${actionCell('barang', itemId(item))}</tr>`;
  const report = (item) => `<tr><td>${safe(itemCode(item))}</td><td>${safe(itemName(item))}</td><td>-</td><td>${stockOf(item)}</td><td>${money(valueOf(item, 'harga_pokok'))}</td><td>${money(stockOf(item) * Number(valueOf(item, 'harga_pokok') || 0))}</td></tr>`;
  setRows('barang-body', items, 7, regular);
  setRows('laporan-barang-body', items, 6, report);
  const count = document.getElementById('stat-barang');
  const totalStock = document.getElementById('stat-stok');
  const totalPartners = document.getElementById('stat-mitra');
  if (count) count.textContent = barang.length.toLocaleString('id-ID');
  if (totalStock) totalStock.textContent = barang.reduce((sum, item) => sum + (Number(item.stok) || 0), 0).toLocaleString('id-ID');
  if (totalPartners) totalPartners.textContent = (state.pelanggan.length + state.supplier.length).toLocaleString('id-ID');
}
function renderPartners() {
  const customerRow = (item) => `<tr><td>${safe(partnerId(item, 'pelanggan'))}</td><td>${safe(partnerName(item, 'pelanggan'))}</td><td>${safe(valueOf(item, 'kontak') || '-')}</td><td>${safe(valueOf(item, 'alamat') || '-')}</td>${actionCell('pelanggan', partnerId(item, 'pelanggan'))}</tr>`;
  const supplierRow = (item) => `<tr><td>${safe(partnerId(item, 'supplier'))}</td><td>${safe(partnerName(item, 'supplier'))}</td><td>${safe(valueOf(item, 'kontak') || '-')}</td><td>${safe(valueOf(item, 'alamat') || '-')}</td>${actionCell('supplier', partnerId(item, 'supplier'))}</tr>`;
  setRows('pelanggan-body', state.pelanggan, 5, customerRow);
  setRows('supplier-body', state.supplier, 5, supplierRow);
}
function resolveName(row, kind) {
  const keys = kind === 'supplier' ? ['id_supplier'] : kind === 'pelanggan' ? ['id_pelanggan'] : ['id_barang'];
  const relation = row?.[kind];
  if (relation && typeof relation === 'object') return kind === 'barang' ? itemName(relation) : partnerName(relation, kind);
  const id = valueOf(row, ...keys);
  const source = kind === 'supplier' ? state.supplier : kind === 'pelanggan' ? state.pelanggan : state.barang;
  const found = source.find((item) => String(kind === 'barang' ? itemId(item) : partnerId(item, kind)) === String(id));
  return found ? (kind === 'barang' ? itemName(found) : partnerName(found, kind)) : '-';
}
function renderTransactions() {
  const normalize = (rows, kind, partnerKind) => rows.map((row) => ({
    row,
    kind,
    item: resolveName(row, 'barang'),
    partner: resolveName(row, partnerKind),
    quantity: qtyOf(row),
    total: totalOf(row)
  })).sort((a, b) => new Date(dateValue(b.row) || 0) - new Date(dateValue(a.row) || 0));
  const purchases = normalize(state.pembelian, 'Pembelian', 'supplier');
  const sales = normalize(state.penjualan, 'Penjualan', 'pelanggan');
  const adjustments = normalize(state.penyesuaian, 'Penyesuaian', 'barang');
  const activities = [
    ...purchases.map((entry) => ({ ...entry, partner: entry.partner || '-' })),
    ...sales.map((entry) => ({ ...entry, partner: entry.partner || '-' })),
    ...adjustments.map((entry) => ({ ...entry, partner: description(entry.row) }))
  ].sort((a, b) => new Date(dateValue(b.row) || 0) - new Date(dateValue(a.row) || 0));
  setRows('dashboard-activity-body', activities.slice(0, 20), 7, ({ row, kind, item, partner, quantity, total }) =>
    `<tr><td>${dateText(row)}</td><td>${kind}</td><td>${safe(reference(row))}</td><td>${safe(item)}</td><td>${safe(partner)}</td><td>${quantity}</td><td>${money(total)}</td></tr>`, 'Belum ada aktivitas transaksi.');
  const transactionRow = (entry, kind) => {
    const row = entry.row;
    const ref = reference(row);
    const partner = entry.partner || '-';
    return `<tr><td>${dateText(row)}</td><td>${safe(ref)}</td><td>${safe(partner)}</td><td>${safe(entry.item)}</td><td>${entry.quantity}</td><td>${money(valueOf(row, 'harga_satuan'))}</td><td>${money(entry.total)}</td></tr>`;
  };
  setRows('pembelian-body', purchases, 7, (entry) => transactionRow(entry, 'pembelian'));
  setRows('laporan-pembelian-body', purchases, 6, (entry) => `<tr><td>${dateText(entry.row)}</td><td>${safe(reference(entry.row))}</td><td>${safe(entry.partner)}</td><td>${safe(entry.item)}</td><td>${entry.quantity}</td><td>${money(entry.total)}</td></tr>`);
  setRows('penjualan-body', sales, 7, (entry) => transactionRow(entry, 'penjualan'));
  setRows('laporan-penjualan-body', sales, 6, (entry) => `<tr><td>${dateText(entry.row)}</td><td>${safe(reference(entry.row))}</td><td>${safe(entry.partner)}</td><td>${safe(entry.item)}</td><td>${entry.quantity}</td><td>${money(entry.total)}</td></tr>`);
  setRows('penyesuaian-body', adjustments, 5, (entry) => `<tr><td>${dateText(entry.row)}</td><td>${safe(entry.item)}</td><td>${safe(valueOf(entry.row, 'jenis_penyesuaian') || entry.kind)}</td><td>${entry.quantity}</td><td>${safe(description(entry.row))}</td></tr>`);
  const purchaseTotal = document.getElementById('purchase-total');
  const salesTotal = document.getElementById('sales-total');
  if (purchaseTotal) purchaseTotal.textContent = `Total ${money(purchases.reduce((sum, entry) => sum + entry.total, 0))}`;
  if (salesTotal) salesTotal.textContent = `Total ${money(sales.reduce((sum, entry) => sum + entry.total, 0))}`;
}
function renderAccounting() {
  const journal = [...state.jurnal].sort((a, b) => new Date(dateValue(b) || 0) - new Date(dateValue(a) || 0));
  const row = (entry) => `<tr><td>${dateText(entry)}</td><td>${safe(reference(entry))}</td><td>${safe(description(entry))}</td><td>${safe(accountName(entry))}</td><td>${money(debit(entry))}</td><td>${money(credit(entry))}</td></tr>`;
  setRows('jurnal-body', journal, 6, row);
  const debitTotal = journal.reduce((sum, entry) => sum + debit(entry), 0);
  const creditTotal = journal.reduce((sum, entry) => sum + credit(entry), 0);
  const balanceChip = document.getElementById('journal-balance');
  if (balanceChip) balanceChip.textContent = `Debit ${money(debitTotal)} · Kredit ${money(creditTotal)}`;
  const revenueEntries = journal.filter((entry) => {
    const account = accountName(entry).toLocaleLowerCase('id');
    return account.includes('pendapatan') && !account.includes('penyesuaian');
  });
  const cogsEntries = journal.filter((entry) => /beban pokok penjualan|harga pokok penjualan|^hpp$/i.test(accountName(entry)));
  const adjustmentIncomeEntries = journal.filter((entry) => /pendapatan penyesuaian/i.test(accountName(entry)));
  const adjustmentExpenseEntries = journal.filter((entry) => /beban penyesuaian/i.test(accountName(entry)));
  const revenue = revenueEntries.reduce((sum, entry) => sum + credit(entry) - debit(entry), 0);
  const cogs = cogsEntries.reduce((sum, entry) => sum + debit(entry) - credit(entry), 0);
  const adjustmentIncome = adjustmentIncomeEntries.reduce((sum, entry) => sum + credit(entry) - debit(entry), 0);
  const adjustmentExpense = adjustmentExpenseEntries.reduce((sum, entry) => sum + debit(entry) - credit(entry), 0);
  const revenueEl = document.getElementById('profit-revenue');
  const cogsEl = document.getElementById('profit-cogs');
  const netEl = document.getElementById('profit-net');
  const financialLines = document.querySelector('.financial-report .financial-lines');
  const ensureReportValue = (id, label) => {
    let value = document.getElementById(id);
    if (!value && financialLines) {
      const line = document.createElement('div');
      const name = document.createElement('span');
      value = document.createElement('strong');
      name.textContent = label;
      value.id = id;
      line.append(name, value);
      financialLines.append(line);
    }
    return value;
  };
  const adjustmentIncomeEl = ensureReportValue('profit-adjustment-income', 'Pendapatan Penyesuaian Stok');
  const adjustmentExpenseEl = ensureReportValue('profit-adjustment-expense', 'Beban Penyesuaian Stok');
  if (revenueEl) revenueEl.textContent = money(revenue);
  if (cogsEl) cogsEl.textContent = `(${money(cogs)})`;
  if (adjustmentIncomeEl) adjustmentIncomeEl.textContent = money(adjustmentIncome);
  if (adjustmentExpenseEl) adjustmentExpenseEl.textContent = `(${money(adjustmentExpense)})`;
  if (netEl) netEl.textContent = money(revenue + adjustmentIncome - cogs - adjustmentExpense);
  setRows('profit-journal-body', [...revenueEntries, ...cogsEntries, ...adjustmentIncomeEntries, ...adjustmentExpenseEntries], 6, row, 'Belum ada jurnal pendapatan atau HPP.');
  renderLedger(journal);
  renderBalanceSheet(journal);
  renderInventoryCard();
}
function renderLedger(journal = state.jurnal) {
  const select = document.getElementById('ledger-account');
  const selected = select?.value || 'all';
  const entries = [...journal].filter((entry) => selected === 'all' || accountName(entry) === selected).sort((a, b) => new Date(dateValue(a) || 0) - new Date(dateValue(b) || 0));
  const balances = new Map();
  const rows = entries.map((entry) => {
    const account = accountName(entry);
    const balance = (balances.get(account) || 0) + debit(entry) - credit(entry);
    balances.set(account, balance);
    return `<tr><td>${dateText(entry)}</td><td>${safe(reference(entry))}</td><td>${safe(account)}</td><td>${safe(description(entry))}</td><td>${money(debit(entry))}</td><td>${money(credit(entry))}</td><td>${money(balance)}</td></tr>`;
  });
  const body = document.getElementById('buku-besar-body');
  if (body) body.innerHTML = rows.length ? rows.join('') : emptyRow(7);
}
function renderBalanceSheet(journal) {
  const grouped = new Map();
  journal.forEach((entry) => {
    const name = accountName(entry);
    if (!name) return;
    const current = grouped.get(name) || { debit: 0, credit: 0 };
    current.debit += debit(entry);
    current.credit += credit(entry);
    grouped.set(name, current);
  });
  const accounts = [...grouped].map(([name, value]) => ({ name, ...value, balance: value.debit - value.credit }));
  const assets = accounts.filter(({ name }) => /kas|persediaan|piutang|aset|bank/i.test(name));
  const liabilities = accounts.filter(({ name }) => /utang|liabilitas|kewajiban/i.test(name));
  const equity = accounts.filter(({ name }) => /modal|ekuitas|prive|laba ditahan/i.test(name));
  const profit = accounts.reduce((sum, account) => {
    const name = account.name.toLocaleLowerCase('id');
    if (name.includes('pendapatan')) return sum - account.balance;
    if (name.includes('beban')) return sum - account.balance;
    return sum;
  }, 0);
  const assetTotal = assets.reduce((sum, account) => sum + account.balance, 0);
  const liabilityTotal = liabilities.reduce((sum, account) => sum - account.balance, 0);
  const equityTotal = equity.reduce((sum, account) => sum - account.balance, 0) + profit;
  const other = [...liabilities, ...equity];
  if (profit) other.push({ name: 'Laba (Rugi) Berjalan', balance: -profit });
  const line = (account) => `<div><span>${safe(account.name)}</span><strong>${money(Math.abs(account.balance))}</strong></div>`;
  const assetEl = document.getElementById('balance-assets');
  const otherEl = document.getElementById('balance-liabilities');
  if (assetEl) assetEl.innerHTML = assets.length ? assets.map(line).join('') : '<div><span>Belum ada saldo aset</span><strong>Rp 0</strong></div>';
  if (otherEl) otherEl.innerHTML = other.length ? other.map(line).join('') : '<div><span>Belum ada saldo liabilitas / ekuitas</span><strong>Rp 0</strong></div>';
  setRows('neraca-body', accounts, 4, (account) => `<tr><td>${safe(account.name)}</td><td>${money(account.debit)}</td><td>${money(account.credit)}</td><td>${money(Math.abs(account.balance))} ${account.balance >= 0 ? '(Debit)' : '(Kredit)'}</td></tr>`);
  const check = document.getElementById('balance-check');
  if (check) check.textContent = `Aset ${money(assetTotal)} · Liabilitas & Ekuitas ${money(liabilityTotal + equityTotal)}`;
}
function renderInventoryCard() {
  const selected = document.getElementById('inventory-card-item')?.value || 'all';
  const movements = [];
  const addMovement = (row, kind) => {
    const itemId = valueOf(row, 'id_barang');
    if (selected !== 'all' && String(itemId) !== selected) return;
    const isIn = kind === 'Pembelian' || (kind === 'Penyesuaian' && String(valueOf(row, 'jenis_penyesuaian')).toLowerCase() === 'tambah');
    movements.push({ row, kind, itemId, quantity: qtyOf(row), isIn });
  };
  state.pembelian.forEach((row) => addMovement(row, 'Pembelian'));
  state.penjualan.forEach((row) => addMovement(row, 'Penjualan'));
  state.penyesuaian.forEach((row) => addMovement(row, 'Penyesuaian'));
  movements.sort((a, b) => new Date(dateValue(a.row) || 0) - new Date(dateValue(b.row) || 0));
  const balances = new Map();
  const rows = movements.map(({ row, kind, itemId, quantity, isIn }) => {
    const balance = (balances.get(itemId) || 0) + (isIn ? quantity : -quantity);
    balances.set(itemId, balance);
    const item = resolveName(row, 'barang');
    return `<tr><td>${dateText(row)}</td><td>${safe(reference(row))}</td><td>${safe(item)}</td><td>${safe(kind)}${kind === 'Penyesuaian' ? ` (${safe(valueOf(row, 'jenis_penyesuaian'))})` : ''}</td><td>${isIn ? quantity : '-'}</td><td>${isIn ? '-' : quantity}</td><td>${balance}</td></tr>`;
  });
  const body = document.getElementById('kartu-persediaan-body');
  if (body) body.innerHTML = rows.length ? rows.reverse().join('') : emptyRow(7, 'Belum ada mutasi persediaan.');
}
function renderMasterData() {
  renderOptions();
  renderInventory();
  renderPartners();
}
function renderCurrentData() {
  renderMasterData();
  renderTransactions();
  renderAccounting();
}
async function fetchTable(table, columns = '*') {
  const client = getClient();
  if (!client) throw new Error('Client Supabase tidak tersedia. Periksa backend/app.js.');
  const { data, error } = await client.from(table).select(columns);
  if (error) throw new Error(`${table}: ${error.message}`);
  return data || [];
}
function attachDetails(headers, details, transactionIdKey) {
  return details.map((detail) => {
    const header = headers.find((entry) => String(entry[transactionIdKey]) === String(detail[transactionIdKey])) || {};
    return { ...header, ...detail, tanggal: dateValue(header) || dateValue(detail) };
  });
}
async function renderData() {
  const requestId = ++renderRequestId;
  if (!getClient()) { showStatus('Client Supabase tidak tersedia. Periksa konfigurasi backend/app.js.', 'error'); return; }
  let masterDataLoaded = false;
  setDataLoading(true);
  try {
    const [barang, pelanggan, supplier] = await Promise.all([
      fetchTable(TABLES.barang), fetchTable(TABLES.pelanggan), fetchTable(TABLES.supplier)
    ]);
    if (requestId !== renderRequestId) return;
    Object.assign(state, { barang, pelanggan, supplier });
    masterDataLoaded = true;
    renderMasterData();

    const [pembelianHeader, pembelianDetail, penjualanHeader, penjualanDetail, penyesuaian, jurnal] = await Promise.all([
      fetchTable(TABLES.pembelian), fetchTable(TABLES.detailPembelian),
      fetchTable(TABLES.penjualan), fetchTable(TABLES.detailPenjualan),
      fetchTable(TABLES.penyesuaian), fetchTable(TABLES.jurnal)
    ]);
    if (requestId !== renderRequestId) return;
    const pembelian = attachDetails(pembelianHeader, pembelianDetail, 'id_pembelian');
    const penjualan = attachDetails(penjualanHeader, penjualanDetail, 'id_penjualan');
    Object.assign(state, { pembelian, penjualan, penyesuaian, jurnal });
    renderCurrentData();
    subscribeRealtime();
    showStatus('Data ERP berhasil diperbarui.', 'info');
  } catch (error) {
    if (requestId !== renderRequestId) return;
    if (!masterDataLoaded) {
      ['stat-barang', 'stat-stok', 'stat-mitra'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.textContent = '-';
      });
    }
    console.error('ERP data load failed:', error);
    showStatus(`Gagal memuat data. Periksa tabel, kolom, RLS, dan koneksi Supabase. ${error.message}`, 'error');
  } finally {
    if (requestId === renderRequestId) setDataLoading(false, true);
  }
}
async function loadData() { return renderData(); }
function subscribeRealtime() {
  const client = getClient();
  if (!client?.channel || realtimeChannel) return;
  let channel = client.channel('abook-erp-live');
  Object.values(TABLES).forEach((table) => {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(loadData, 250);
    });
  });
  realtimeChannel = channel;
  channel.subscribe((status) => {
    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') console.warn('Supabase Realtime status:', status);
  });
}
function stripDateColumns(row) {
  const payload = { ...row };
  delete payload.created_at;
  delete payload.tanggal;
  return payload;
}
function dateOnlyFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}
function isMissingDateColumn(error) {
  return /column .* does not exist|could not find .* column|schema cache/i.test(error?.message || '');
}
async function writeWithDate(table, payload, timestamp, write) {
  const rows = Array.isArray(payload) ? payload : [payload];
  const cleanRows = rows.map(stripDateColumns);
  const cleanPayload = Array.isArray(payload) ? cleanRows : cleanRows[0];
  if (!timestamp) return write(payload);

  const candidates = ['tanggal', 'created_at'];
  if (dateColumnCache.has(table)) {
    const cached = dateColumnCache.get(table);
    if (cached === null) return write(cleanPayload);
    candidates.unshift(cached);
  }
  for (const column of [...new Set(candidates)]) {
    const dateValue = column === 'tanggal' ? dateOnlyFromTimestamp(timestamp) : timestamp;
    const datedRows = cleanRows.map((row) => ({ ...row, [column]: dateValue }));
    const datedPayload = Array.isArray(payload) ? datedRows : datedRows[0];
    const result = await write(datedPayload);
    if (!result.error) {
      dateColumnCache.set(table, column);
      return result;
    }
    if (!isMissingDateColumn(result.error)) throw result.error;
  }

  dateColumnCache.set(table, null);
  const result = await write(cleanPayload);
  if (result.error) throw result.error;
  return result;
}
async function insertRow(table, payload, timestamp = payload.created_at || payload.tanggal) {
  const result = await writeWithDate(table, payload, timestamp, (values) =>
    getClient().from(table).insert(values).select().single());
  if (result.error) throw result.error;
  return result.data;
}
async function insertRows(table, rows, timestamp) {
  const result = await writeWithDate(table, rows, timestamp, (values) => getClient().from(table).insert(values));
  if (result.error) throw result.error;
}
async function updateRow(table, idColumn, id, payload, timestamp) {
  const result = await writeWithDate(table, payload, timestamp, (values) =>
    getClient().from(table).update(values).eq(idColumn, id));
  if (result.error) throw result.error;
}
async function synchronizeProductPrice(kind, productId, nextPrice) {
  const isPurchase = kind === 'pembelian';
  const detailTable = isPurchase ? TABLES.detailPembelian : TABLES.detailPenjualan;
  const transactionTable = isPurchase ? TABLES.pembelian : TABLES.penjualan;
  const transactionIdColumn = isPurchase ? 'id_pembelian' : 'id_penjualan';
  const referenceColumn = isPurchase ? 'no_faktur' : 'no_nota';
  const detailIdColumn = isPurchase ? 'id_detail_beli' : 'id_detail_jual';
  const { data: changedDetails, error: detailError } = await getClient()
    .from(detailTable).select('*').eq('id_barang', productId);
  if (detailError) throw detailError;
  if (!changedDetails?.length) return async () => {};

  const transactionIds = [...new Set(changedDetails.map((detail) => detail[transactionIdColumn]))];
  const [{ data: headers, error: headerError }, { data: allDetails, error: allDetailsError }] = await Promise.all([
    getClient().from(transactionTable).select('*').in(transactionIdColumn, transactionIds),
    getClient().from(detailTable).select('*').in(transactionIdColumn, transactionIds)
  ]);
  if (headerError) throw headerError;
  if (allDetailsError) throw allDetailsError;
  const references = [...new Set((headers || []).map((header) => header[referenceColumn]).filter(Boolean))];
  const { data: journalRows, error: journalError } = references.length
    ? await getClient().from(TABLES.jurnal).select('*').in('no_bukti', references)
    : { data: [], error: null };
  if (journalError) throw journalError;

  const changedIds = new Set(changedDetails.map((detail) => detail[detailIdColumn]));
  const oldDetailValues = new Map(changedDetails.map((detail) => [detail[detailIdColumn], {
    harga_satuan: detail.harga_satuan,
    ...(Object.hasOwn(detail, 'subtotal') ? { subtotal: detail.subtotal } : {})
  }]));
  const totalColumn = (headers || []).every((header) => Object.hasOwn(header, 'total_bayar'))
    ? 'total_bayar' : 'total_harga';
  if ((headers || []).some((header) => !Object.hasOwn(header, totalColumn))) {
    throw new Error(`Kolom total transaksi tidak ditemukan pada tabel ${transactionTable}.`);
  }
  const oldHeaderValues = new Map(headers.map((header) => [header[transactionIdColumn], header[totalColumn]]));
  const newHeaderValues = new Map((headers || []).map((header) => [header[transactionIdColumn],
    (allDetails || []).filter((detail) => String(detail[transactionIdColumn]) === String(header[transactionIdColumn]))
      .reduce((sum, detail) => sum + Number(detail.jumlah || 0) * (changedIds.has(detail[detailIdColumn]) ? nextPrice : Number(detail.harga_satuan || 0)), 0)
  ]));
  const oldJournalValues = new Map((journalRows || []).map((entry) => [entry.id_jurnal, {
    debit: entry.debit, kredit: entry.kredit
  }]));
  const journalAccounts = isPurchase
    ? { 'Persediaan Barang': 'debit', Kas: 'kredit' }
    : { Kas: 'debit', Pendapatan: 'kredit' };

  const apply = async (restoreOriginal) => {
    for (const detail of changedDetails) {
      const id = detail[detailIdColumn];
      if (id === undefined) throw new Error(`ID detail transaksi tidak ditemukan pada ${detailTable}.`);
      const values = restoreOriginal
        ? oldDetailValues.get(id)
        : {
          harga_satuan: nextPrice,
          ...(Object.hasOwn(detail, 'subtotal') ? { subtotal: Number(detail.jumlah) * nextPrice } : {})
        };
      const { error } = await getClient().from(detailTable).update(values).eq(detailIdColumn, id);
      if (error) throw error;
    }

    for (const header of headers || []) {
      const transactionId = header[transactionIdColumn];
      const total = restoreOriginal ? oldHeaderValues.get(transactionId) : newHeaderValues.get(transactionId);
      const { error } = await getClient().from(transactionTable).update({ [totalColumn]: total }).eq(transactionIdColumn, transactionId);
      if (error) throw error;
    }

    for (const entry of journalRows || []) {
      const side = journalAccounts[entry.akun];
      const expectedMemo = isPurchase ? /^pembelian\b/i : /^penjualan\b/i;
      if (!side || !expectedMemo.test(entry.keterangan || '')) continue;
      const header = headers.find((candidate) => candidate[referenceColumn] === entry.no_bukti);
      if (!header) continue;
      const total = restoreOriginal
        ? oldJournalValues.get(entry.id_jurnal)
        : { debit: 0, kredit: 0, [side]: Number(newHeaderValues.get(header[transactionIdColumn]) || 0) };
      if (!total) continue;
      const { error } = await getClient().from(TABLES.jurnal).update(total).eq('id_jurnal', entry.id_jurnal);
      if (error) throw error;
    }
  };

  try {
    await apply(false);
  } catch (error) {
    try { await apply(true); } catch (rollbackError) { console.error('Price cascade rollback failed:', rollbackError); }
    throw error;
  }
  return () => apply(true);
}
async function updateStock(item, nextStock) {
  const key = stockKey(item);
  const current = stockOf(item);
  const { data, error } = await getClient().from(TABLES.barang).update({ [key]: nextStock }).eq('id_barang', itemId(item)).eq(key, current).select('id_barang');
  if (error) throw error;
  if (!data?.length) throw new Error('Stok berubah oleh transaksi lain. Muat ulang lalu coba kembali.');
  return { key, current };
}
async function restoreStock(item, previous) {
  if (!previous) return;
  const { error } = await getClient().from(TABLES.barang).update({ [previous.key]: previous.current }).eq('id_barang', itemId(item));
  if (error) console.error('Stock rollback failed:', error);
}
async function removeInserted(table, row, idColumn) {
  const id = row?.[idColumn];
  if (id === undefined || id === null) return;
  const { error } = await getClient().from(table).delete().eq(idColumn, id);
  if (error) console.error(`Rollback ${table} failed:`, error);
}
async function removeTransactionDetail(table, transactionKey, transactionId, idBarang) {
  const { error } = await getClient().from(table).delete().eq(transactionKey, transactionId).eq('id_barang', idBarang);
  if (error) console.error(`Rollback ${table} failed:`, error);
}
function journalPair({ reference: ref, description: memo, debitAccount, creditAccount, amount, createdAt = dateTimestamp() }) {
  const common = { no_bukti: ref, keterangan: memo, created_at: createdAt };
  return [
    { ...common, akun: debitAccount, debit: amount, kredit: 0 },
    { ...common, akun: creditAccount, debit: 0, kredit: amount }
  ];
}
function formValues(form) { return Object.fromEntries(new FormData(form).entries()); }
function bindMaster(formId, table, makePayload, label) {
  const form = document.getElementById(formId);
  on(form, 'submit', async (event) => {
    event.preventDefault();
    const values = formValues(form);
    const payload = { ...makePayload(values), created_at: dateTimestamp(values.tanggal) };
    try {
      await insertRow(table, payload);
      form.reset();
      await loadData();
      showStatus(`${label} berhasil disimpan.`, 'info');
    } catch (error) { showStatus(`Gagal menyimpan ${label.toLowerCase()}: ${error.message}`, 'error'); }
  });
}
bindMaster('form-barang', TABLES.barang, (values) => ({
  sku: values.kode_barang.trim(), nama_barang: values.nama_barang.trim(), stok: Number(values.stok),
  harga_pokok: Number(values.harga_beli), harga_jual: Number(values.harga_jual)
}), 'Barang');
bindMaster('form-pelanggan', TABLES.pelanggan, (values) => ({
  nama_pelanggan: values.nama.trim(), kontak: values.telepon.trim() || null, alamat: values.alamat.trim() || null
}), 'Pelanggan');
bindMaster('form-supplier', TABLES.supplier, (values) => ({
  nama_supplier: values.nama.trim(), kontak: values.telepon.trim() || null, alamat: values.alamat.trim() || null
}), 'Supplier');

const masterEditModal = document.getElementById('master-edit-modal');
const masterEditForm = document.getElementById('master-edit-form');
const masterEditFields = document.getElementById('master-edit-fields');
const masterEditTitle = document.getElementById('master-edit-title');
function closeMasterEdit() {
  if (!masterEditModal) return;
  masterEditModal.classList.remove('active');
  masterEditModal.hidden = true;
  masterEditModal.setAttribute('aria-hidden', 'true');
  masterEditForm?.reset();
}
function openMasterEdit(kind, id) {
  const config = masterConfig[kind];
  const record = state[kind].find((item) => String(item[config.idColumn]) === String(id));
  if (!config || !record || !masterEditModal || !masterEditForm || !masterEditFields) {
    showStatus('Data master tidak ditemukan untuk diedit.', 'error');
    return;
  }
  masterEditForm.dataset.kind = kind;
  masterEditForm.dataset.id = id;
  if (masterEditTitle) masterEditTitle.textContent = `Edit ${pageTitles[`data-${kind}`] || kind}`;
  masterEditFields.innerHTML = config.fields.map((field) => {
    const type = field.type || 'text';
    const width = field.fullWidth ? ' full-width' : '';
    return `<label class="form-field${width}"><span>${safe(field.label)}</span><input name="${safe(field.name)}" type="${safe(type)}"${field.min !== undefined ? ` min="${safe(field.min)}"` : ''}${field.step !== undefined ? ` step="${safe(field.step)}"` : ''} value="${safe(record[field.name] ?? '')}" required /></label>`;
  }).join('');
  addDateField(masterEditFields, null, record.created_at);
  masterEditModal.hidden = false;
  masterEditModal.setAttribute('aria-hidden', 'false');
  masterEditModal.classList.add('active');
  masterEditFields.querySelector('input')?.focus();
}
async function deleteMaster(kind, id) {
  const config = masterConfig[kind];
  if (!config || id === undefined || id === '') return;
  if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
  try {
    const { error } = await getClient().from(config.table).delete().eq(config.idColumn, id);
    if (error) throw error;
  } catch (error) {
    console.error('Master delete failed:', error);
    const errorText = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ').toLowerCase();
    if (errorText.includes('foreign key') || errorText.includes('violates foreign key constraint')) {
      showStatus('Data tidak dapat dihapus karena memiliki riwayat transaksi atau jurnal keuangan.', 'error');
      await renderData();
      return;
    }
    showStatus(`Gagal menghapus data: ${error.message}`, 'error');
    return;
  }
  await renderData();
  showStatus(`${pageTitles[`data-${kind}`] || kind} berhasil dihapus.`, 'info');
}
Object.entries(masterConfig).forEach(([kind, config]) => {
  const tableBody = document.getElementById(config.bodyId);
  on(tableBody, 'click', async (event) => {
    const button = event.target?.closest?.('[data-master-action]');
    if (!button || !tableBody.contains(button) || button.dataset.masterKind !== kind) return;
    const id = button.dataset.id;
    if (button.dataset.masterAction === 'edit') openMasterEdit(kind, id);
    if (button.dataset.masterAction === 'delete') await deleteMaster(kind, id);
  });
});
document.querySelectorAll('[data-close-edit]').forEach((button) => on(button, 'click', closeMasterEdit));
on(masterEditModal, 'click', (event) => { if (event.target === masterEditModal) closeMasterEdit(); });
on(window, 'keydown', (event) => { if (event.key === 'Escape' && masterEditModal && !masterEditModal.hidden) closeMasterEdit(); });
on(masterEditForm, 'submit', async (event) => {
  event.preventDefault();
  const kind = masterEditForm.dataset.kind;
  const id = masterEditForm.dataset.id;
  const config = masterConfig[kind];
  if (!config || !id) return;
  const values = formValues(masterEditForm);
  const payload = Object.fromEntries(config.fields.map((field) => [
    field.name,
    field.type === 'number' ? Number(values[field.name]) : values[field.name].trim()
  ]));
  payload.created_at = dateTimestamp(values.tanggal);
  const cascadeRollbacks = [];
  try {
    if (kind === 'barang') {
      const currentItem = state.barang.find((item) => String(itemId(item)) === String(id));
      const oldPurchasePrice = Number(valueOf(currentItem, 'harga_pokok') || 0);
      const oldSalesPrice = Number(valueOf(currentItem, 'harga_jual') || 0);
      const newPurchasePrice = Number(payload.harga_pokok);
      const newSalesPrice = Number(payload.harga_jual);
      if (newPurchasePrice !== oldPurchasePrice) {
        cascadeRollbacks.push(await synchronizeProductPrice('pembelian', id, newPurchasePrice));
      }
      if (newSalesPrice !== oldSalesPrice) {
        cascadeRollbacks.push(await synchronizeProductPrice('penjualan', id, newSalesPrice));
      }
    }
    await updateRow(config.table, config.idColumn, id, payload, payload.created_at);
    closeMasterEdit();
    await renderData();
    showStatus(`${pageTitles[`data-${kind}`] || kind} berhasil diperbarui.`, 'info');
  } catch (error) {
    for (const rollback of cascadeRollbacks.reverse()) {
      try { await rollback(); } catch (rollbackError) { console.error('Price cascade rollback failed:', rollbackError); }
    }
    console.error('Master update failed:', error);
    showStatus(`Gagal memperbarui data: ${error.message}`, 'error');
  }
});

async function submitTransaction(form, kind) {
  const values = formValues(form);
  const createdAt = dateTimestamp(values.tanggal);
  const item = state.barang.find((row) => String(itemId(row)) === values.barang_id);
  const quantity = Number(values.jumlah);
  const unitPrice = Number(kind === 'pembelian' ? values.harga_beli : values.harga_jual);
  const partnerId = values[kind === 'pembelian' ? 'supplier_id' : 'pelanggan_id'];
  if (!item || !partnerId || !Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(unitPrice) || unitPrice <= 0) {
    showStatus('Pilih mitra dan barang, lalu isi jumlah serta harga yang valid.', 'error');
    return;
  }
  const current = stockOf(item);
  if (kind === 'penjualan' && current < quantity) {
    showStatus(`Stok ${itemName(item)} tidak cukup. Tersedia ${current}, dibutuhkan ${quantity}.`, 'error');
    return;
  }
  const ref = String(kind === 'pembelian' ? values.no_faktur : values.no_nota).trim();
  const total = quantity * unitPrice;
  const itemPrimaryKey = itemId(item);
  const cogs = quantity * Number(valueOf(item, 'harga_pokok') || 0);
  const headerIdKey = kind === 'pembelian' ? 'id_pembelian' : 'id_penjualan';
  const detailTable = kind === 'pembelian' ? TABLES.detailPembelian : TABLES.detailPenjualan;
  const headerTable = TABLES[kind];
  let previous;
  let header;
  let detail;
  try {
    const headerPayload = kind === 'pembelian'
      ? { no_faktur: ref, id_supplier: Number(partnerId), total_bayar: total, created_at: createdAt }
      : { no_nota: ref, id_pelanggan: Number(partnerId), total_bayar: total, created_at: createdAt };
    header = await insertRow(headerTable, headerPayload);
    const detailPayload = kind === 'pembelian'
      ? { id_pembelian: header[headerIdKey], id_barang: itemPrimaryKey, jumlah: quantity, harga_satuan: unitPrice, created_at: createdAt }
      : { id_penjualan: header[headerIdKey], id_barang: itemPrimaryKey, jumlah: quantity, harga_satuan: unitPrice, hpp_satuan: Number(valueOf(item, 'harga_pokok') || 0), created_at: createdAt };
    detail = await insertRow(detailTable, detailPayload);
    previous = await updateStock(item, current + (kind === 'pembelian' ? quantity : -quantity));
    const entries = kind === 'pembelian'
      ? journalPair({ reference: ref, description: `Pembelian ${itemName(item)}`, debitAccount: 'Persediaan Barang', creditAccount: 'Kas', amount: total, createdAt })
      : [...journalPair({ reference: ref, description: `Penjualan ${itemName(item)}`, debitAccount: 'Kas', creditAccount: 'Pendapatan', amount: total, createdAt }), ...journalPair({ reference: ref, description: `HPP ${itemName(item)}`, debitAccount: 'Beban Pokok Penjualan', creditAccount: 'Persediaan Barang', amount: cogs, createdAt })];
    await insertRows(TABLES.jurnal, entries, createdAt);
    form.reset();
    await loadData();
    showStatus(`${kind === 'pembelian' ? 'Pembelian' : 'Penjualan'} berhasil disimpan, stok diperbarui, dan jurnal dibuat.`, 'info');
  } catch (error) {
    await restoreStock(item, previous);
    if (header?.[headerIdKey] !== undefined) {
      await removeTransactionDetail(detailTable, headerIdKey, header[headerIdKey], itemPrimaryKey);
      await removeInserted(headerTable, header, headerIdKey);
    } else if (detail?.id !== undefined) {
      await removeInserted(detailTable, detail, 'id');
    }
    console.error('Transaction failed:', error);
    showStatus(`Transaksi gagal: ${error.message}`, 'error');
    await loadData();
  }
}
const purchaseForm = document.getElementById('form-pembelian');
on(purchaseForm, 'submit', (event) => { event.preventDefault(); submitTransaction(purchaseForm, 'pembelian'); });
const salesForm = document.getElementById('form-penjualan');
on(salesForm, 'submit', (event) => { event.preventDefault(); submitTransaction(salesForm, 'penjualan'); });
const adjustmentForm = document.getElementById('form-penyesuaian');
on(adjustmentForm, 'submit', async (event) => {
  event.preventDefault();
  const values = formValues(adjustmentForm);
  const createdAt = dateTimestamp(values.tanggal);
  const item = state.barang.find((row) => String(itemId(row)) === values.barang_id);
  const quantity = Number(values.jumlah);
  if (!item || !Number.isInteger(quantity) || quantity < 1 || !['Tambah', 'Kurang'].includes(values.jenis) || !values.keterangan.trim()) {
    showStatus('Pilih barang dan jenis, lalu isi jumlah serta keterangan.', 'error');
    return;
  }
  const current = stockOf(item);
  const next = current + (values.jenis === 'Tambah' ? quantity : -quantity);
  if (next < 0) { showStatus(`Stok tidak cukup. Stok saat ini ${current}.`, 'error'); return; }
  let previous;
  let adjustment;
  try {
    adjustment = await insertRow(TABLES.penyesuaian, {
      id_barang: itemId(item), jenis_penyesuaian: values.jenis,
      jumlah: quantity, keterangan: values.keterangan.trim(), created_at: createdAt
    });
    previous = await updateStock(item, next);
    const adjustmentValue = quantity * Number(valueOf(item, 'harga_pokok') || 0);
    const entries = values.jenis === 'Tambah'
      ? journalPair({
        reference: `ADJ-${adjustment.id_penyesuaian}`, description: `Penyesuaian tambah ${itemName(item)}`,
        debitAccount: 'Persediaan Barang', creditAccount: 'Pendapatan Penyesuaian Stok', amount: adjustmentValue, createdAt
      })
      : journalPair({
        reference: `ADJ-${adjustment.id_penyesuaian}`, description: `Penyesuaian kurang ${itemName(item)}`,
        debitAccount: 'Beban Penyesuaian Stok', creditAccount: 'Persediaan Barang', amount: adjustmentValue, createdAt
      });
    await insertRows(TABLES.jurnal, entries, createdAt);
    adjustmentForm.reset();
    await loadData();
    showStatus('Penyesuaian stok berhasil dicatat.', 'info');
  } catch (error) {
    await restoreStock(item, previous);
    if (adjustment?.id_penyesuaian !== undefined) await removeInserted(TABLES.penyesuaian, adjustment, 'id_penyesuaian');
    showStatus(`Penyesuaian gagal: ${error.message}`, 'error');
    await loadData();
  }
});
on(document.getElementById('ledger-account'), 'change', () => renderLedger());
on(document.getElementById('inventory-card-item'), 'change', () => renderInventoryCard());

setPage(window.location.hash.slice(1) || 'dashboard');
loadData();
