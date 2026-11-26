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
const outlineIconPaths = {
  '1f4c5': '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7 3v4M17 3v4M4 10h16"/>',
  '1f4c1': '<path d="M3 6.5h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 9h18"/>',
  '1f9ee': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h8"/>',
  '1f4dd': '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h8"/>',
  '1f50d': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  '1f4d6': '<path d="M3 5.5c4-1.5 7-.8 9 1v14c-2-1.8-5-2.5-9-1zM21 5.5c-4-1.5-7-.8-9 1v14c2-1.8 5-2.5 9-1z"/>',
  '1f3ea': '<path d="M3 10h18v11H3zM2 10l2-6h16l2 6M7 21v-7h5v7M16 14h2"/>',
  edit: '<path d="M12 20h9"/><path d="m16.5 3.5 4 4L9 19l-5 1 1-5z"/>',
  delete: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3"/>'
};
function replacePixelIcons(root = document) {
  root.querySelectorAll('img.pixel-sticker').forEach((image) => {
    const code = image.getAttribute('src')?.split('/').pop()?.replace('.png', '');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('pixel-sticker', 'outline-icon');
    svg.innerHTML = outlineIconPaths[code] || outlineIconPaths['1f4d6'];
    image.replaceWith(svg);
  });
}
replacePixelIcons();

function actionIcon(name) {
  return `<svg class="pixel-sticker outline-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${outlineIconPaths[name]}</svg>`;
}

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
      { name: 'penulis', label: 'Penulis', required: false },
      { name: 'isbn', label: 'ISBN', required: false },
      { name: 'kategori', label: 'Kategori', required: false },
      { name: 'penerbit', label: 'Penerbit', required: false },
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
  dashboard: 'Ringkasan', 'data-barang': 'Data Buku', 'data-pelanggan': 'Data Pelanggan', 'data-supplier': 'Data Supplier',
  'transaksi-pembelian': 'Transaksi Pembelian', 'transaksi-penjualan': 'Transaksi Penjualan', 'penyesuaian-stok': 'Penyesuaian Stok',
  'jurnal-umum': 'Jurnal Umum', 'buku-besar': 'Buku Besar', 'laporan-barang': 'Laporan Buku',
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
let authenticated = false;
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
  return `<td><div class="table-actions"><button class="table-action" type="button" data-master-action="edit" data-master-kind="${kind}" data-id="${safe(id)}">${actionIcon('edit')}Edit</button></div></td>`;
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
  const items = filterBookItems([...barang].sort((a, b) => itemName(a).localeCompare(itemName(b), 'id')));
  const regular = (item) => `<tr><td>${safe(itemCode(item))}</td><td>${safe(itemName(item))}</td><td>${safe(bookMetadata(item, 'penulis') || '-')}</td><td>${safe(bookMetadata(item, 'isbn') || '-')}</td><td>${safe(bookMetadata(item, 'kategori') || '-')}</td><td>${safe(bookMetadata(item, 'penerbit') || '-')}</td><td>${money(valueOf(item, 'harga_pokok'))}</td><td>${money(valueOf(item, 'harga_jual'))}</td><td><span class="stock-pill ${stockStatus(item) !== 'tersedia' ? 'low' : ''}">${stockOf(item)}</span></td>${actionCell('barang', itemId(item))}</tr>`;
  const report = (item) => `<tr><td>${safe(itemCode(item))}</td><td>${safe(itemName(item))}</td><td>${safe(bookMetadata(item, 'penulis') || '-')}</td><td>${safe(bookMetadata(item, 'isbn') || '-')}</td><td>${safe(bookMetadata(item, 'kategori') || '-')}</td><td>${safe(bookMetadata(item, 'penerbit') || '-')}</td><td>${stockOf(item)}</td><td>${money(valueOf(item, 'harga_pokok'))}</td><td>${money(stockOf(item) * Number(valueOf(item, 'harga_pokok') || 0))}</td></tr>`;
  setRows('barang-body', items, 10, regular);
  setRows('laporan-barang-body', items, 9, report);
  const countLabel = document.getElementById('book-filter-count');
  if (countLabel) countLabel.textContent = `Menampilkan ${items.length} dari ${barang.length} buku`;
  const count = document.getElementById('stat-barang');
  const totalStock = document.getElementById('stat-stok');
  const totalPartners = document.getElementById('stat-mitra');
  if (count) count.textContent = barang.length.toLocaleString('id-ID');
  if (totalStock) totalStock.textContent = barang.reduce((sum, item) => sum + (Number(item.stok) || 0), 0).toLocaleString('id-ID');
  if (totalPartners) totalPartners.textContent = (state.pelanggan.length + state.supplier.length).toLocaleString('id-ID');
}
const bookMetadataKeys = {
  judul: ['nama_barang', 'judul', 'title'],
  penulis: ['penulis', 'author', 'pengarang'],
  isbn: ['isbn', 'kode_isbn'],
  kategori: ['kategori', 'category'],
  penerbit: ['penerbit', 'publisher']
};
function bookMetadata(item, field) {
  return valueOf(item, ...(bookMetadataKeys[field] || []));
}
function stockStatus(item) {
  const stock = stockOf(item);
  return stock <= 0 ? 'habis' : stock <= 5 ? 'menipis' : 'tersedia';
}
function currentBookFilters() {
  const filters = {};
  document.querySelectorAll('[data-book-filter]').forEach((input) => {
    if (input.value.trim()) filters[input.dataset.bookFilter] = input.value.trim().toLocaleLowerCase('id');
  });
  return filters;
}
function filterBookItems(items) {
  const filters = currentBookFilters();
  return items.filter((item) => {
    for (const field of ['judul', 'penulis', 'isbn', 'kategori', 'penerbit']) {
      if (filters[field] && !String(bookMetadata(item, field)).toLocaleLowerCase('id').includes(filters[field])) return false;
    }
    return !filters.status || stockStatus(item) === filters.status;
  });
}
function syncBookFilters(source) {
  document.querySelectorAll(`[data-book-filter="${source.dataset.bookFilter}"]`).forEach((input) => {
    if (input !== source) input.value = source.value;
  });
  renderInventory();
}
document.querySelectorAll('[data-book-filter]').forEach((input) => {
  on(input, input.tagName === 'SELECT' ? 'change' : 'input', () => syncBookFilters(input));
});
document.querySelectorAll('[data-clear-book-filters]').forEach((button) => on(button, 'click', () => {
  document.querySelectorAll('[data-book-filter]').forEach((input) => { input.value = ''; });
  renderInventory();
}));

function exportData(type) {
  const printedAt = new Date();
  if (type === 'books') {
    const items = filterBookItems([...state.barang].sort((a, b) => itemName(a).localeCompare(itemName(b), 'id')));
    const totalAmount = items.reduce((sum, item) => sum + stockOf(item) * Number(valueOf(item, 'harga_pokok') || 0), 0);
    return {
      title: 'LAPORAN PERSEDIAAN & TRANSAKSI BUKU',
      subtitle: 'Laporan persediaan buku',
      filename: 'laporan-buku',
      headers: ['Kode Buku', 'Judul', 'Penulis', 'ISBN', 'Kategori', 'Penerbit', 'Stok', 'Harga Beli', 'Nilai Stok'],
      rows: items.map((item) => [itemCode(item), itemName(item), bookMetadata(item, 'penulis'), bookMetadata(item, 'isbn'),
        bookMetadata(item, 'kategori'), bookMetadata(item, 'penerbit'), stockOf(item),
        Number(valueOf(item, 'harga_pokok') || 0), stockOf(item) * Number(valueOf(item, 'harga_pokok') || 0)]),
      currencyColumns: [7, 8],
      printedAt,
      recordCount: items.length,
      totalAmount
    };
  }
  const purchases = type === 'purchases';
  const entries = purchases ? state.pembelian : state.penjualan;
  return {
    title: 'LAPORAN PERSEDIAAN & TRANSAKSI BUKU',
    subtitle: `Laporan transaksi ${purchases ? 'pembelian' : 'penjualan'}`,
    filename: purchases ? 'laporan-pembelian' : 'laporan-penjualan',
    headers: ['Tanggal', purchases ? 'No Faktur' : 'No Nota', purchases ? 'Supplier' : 'Pelanggan', 'Barang', 'Jumlah', 'Harga Satuan', 'Total'],
    rows: entries.map((row) => [dateText(row), reference(row), resolveName(row, purchases ? 'supplier' : 'pelanggan'),
      resolveName(row, 'barang'), qtyOf(row), Number(valueOf(row, 'harga_satuan') || 0), totalOf(row)]),
    currencyColumns: [5, 6],
    printedAt,
    recordCount: entries.length,
    totalAmount: entries.reduce((sum, row) => sum + totalOf(row), 0)
  };
}
function csvCell(value) {
  let text = String(value ?? '');
  if (typeof value === 'string' && /^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
function downloadCsv(report) {
  const metadata = [
    [report.title],
    [report.subtitle],
    [`Dicetak: ${report.printedAt.toLocaleString('id-ID')}`],
    [`Jumlah data: ${report.recordCount}`, `Total nilai: ${money(report.totalAmount)}`],
    []
  ];
  const headers = ['No.', ...report.headers];
  const rows = report.rows.map((row, index) => [
    index + 1,
    ...row.map((value, column) => report.currencyColumns.includes(column) ? money(value) : value)
  ]);
  const content = [...metadata, headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.filename}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function downloadXlsx(report) {
  if (!window.ExcelJS) throw new Error('Pustaka ExcelJS tidak tersedia. Periksa koneksi internet lalu coba lagi.');
  const workbook = new window.ExcelJS.Workbook();
  workbook.creator = 'Grammate Bookstore';
  workbook.created = report.printedAt;
  const sheet = workbook.addWorksheet('Laporan', {
    pageSetup: { orientation: report.headers.length > 6 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1 }
  });
  const columnCount = report.headers.length + 1;
  const endColumn = sheet.getColumn(columnCount).letter;
  sheet.mergeCells(`A1:${endColumn}1`);
  sheet.getCell('A1').value = 'GRAMMATE BOOKSTORE';
  sheet.getCell('A1').font = { name: 'Playfair Display', size: 17, bold: true, color: { argb: 'FFF2E9D8' } };
  sheet.getCell('A1').alignment = { vertical: 'middle' };
  sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A2E' } };
  sheet.getCell('A1').border = { bottom: { style: 'medium', color: { argb: 'FFB59A62' } } };
  sheet.getRow(1).height = 30;
  sheet.mergeCells(`A2:${endColumn}2`);
  sheet.getCell('A2').value = report.title;
  sheet.getCell('A2').font = { name: 'Playfair Display', size: 13, bold: true, color: { argb: 'FF6B1D24' } };
  sheet.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2E9D8' } };
  sheet.mergeCells(`A3:${endColumn}3`);
  sheet.getCell('A3').value = report.subtitle;
  sheet.getCell('A3').font = { name: 'Aptos', size: 11, color: { argb: 'FF241E1A' } };
  sheet.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2E9D8' } };
  sheet.mergeCells(`A4:${endColumn}4`);
  sheet.getCell('A4').value = `Dicetak: ${report.printedAt.toLocaleString('id-ID')}`;
  sheet.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2E9D8' } };
  sheet.mergeCells(`A5:${endColumn}5`);
  sheet.getCell('A5').value = `Jumlah data: ${report.recordCount}  |  Total nilai: ${money(report.totalAmount)}`;
  sheet.getCell('A5').font = { bold: true, color: { argb: 'FF241E1A' } };
  sheet.getCell('A5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2E9D8' } };
  const headerRow = sheet.addRow(['No.', ...report.headers]);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Aptos', bold: true, color: { argb: 'FFF2E9D8' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A2E' } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFB59A62' } },
      left: { style: 'thin', color: { argb: 'FFB59A62' } },
      bottom: { style: 'thin', color: { argb: 'FFB59A62' } },
      right: { style: 'thin', color: { argb: 'FFB59A62' } }
    };
  });
  report.rows.forEach((values, index) => {
    const row = sheet.addRow([index + 1, ...values]);
    row.eachCell((cell, column) => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFB59A62' } },
        left: { style: 'thin', color: { argb: 'FFB59A62' } },
        bottom: { style: 'thin', color: { argb: 'FFB59A62' } },
        right: { style: 'thin', color: { argb: 'FFB59A62' } }
      };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 === 1 ? 'FFE9E2D2' : 'FFF2E9D8' } };
      if (column > 1 && report.currencyColumns.includes(column - 2)) {
        cell.numFmt = '"Rp" #,##0;[Red]("Rp" #,##0);-';
      }
    });
  });
  sheet.columns.forEach((column, index) => {
    const values = [index === 0 ? 'No.' : report.headers[index - 1], ...report.rows.map((row) => String(row[index - 1] ?? ''))];
    const width = Math.max(...values.map((value) => value.length)) + 3;
    column.width = Math.min(42, Math.max(index === 0 ? 7 : 12, width));
  });
  sheet.views = [{ state: 'frozen', ySplit: 6 }];
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.filename}.xlsx`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function downloadPdf(report) {
  const JsPDF = window.jspdf?.jsPDF;
  if (!JsPDF) throw new Error('Pustaka PDF tidak tersedia. Periksa koneksi internet lalu coba lagi.');
  const pdf = new JsPDF({ orientation: report.headers.length > 6 ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(31, 58, 46);
  pdf.rect(0, 0, pageWidth, 38, 'F');
  pdf.setFillColor(181, 154, 98);
  pdf.rect(0, 37, pageWidth, 1, 'F');
  pdf.setTextColor(242, 233, 216);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('GRAMMATE BOOKSTORE', 14, 10);
  pdf.setTextColor(201, 147, 59);
  pdf.setFontSize(14);
  pdf.text(report.title, 14, 18, { maxWidth: pageWidth - 28 });
  pdf.setTextColor(242, 233, 216);
  pdf.setFontSize(11);
  pdf.text(report.subtitle, 14, 25);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(`Dicetak: ${report.printedAt.toLocaleString('id-ID')}   |   Jumlah data: ${report.recordCount}   |   Total nilai: ${money(report.totalAmount)}`, 14, 32);
  const rows = report.rows.map((row, index) => [
    index + 1,
    ...row.map((value, column) => report.currencyColumns.includes(column) ? money(value) : String(value ?? '-'))
  ]);
  if (typeof pdf.autoTable !== 'function') throw new Error('Plugin tabel PDF tidak tersedia.');
  pdf.autoTable({
    startY: 42,
    head: [['No.', ...report.headers]],
    body: rows,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: report.headers.length > 7 ? 7 : 8, cellPadding: 2.2, overflow: 'linebreak', fillColor: [242, 233, 216], textColor: [36, 30, 26], lineColor: [181, 154, 98], lineWidth: .2 },
    headStyles: { fillColor: [31, 58, 46], textColor: [242, 233, 216], fontStyle: 'bold', lineColor: [181, 154, 98], lineWidth: .35 },
    alternateRowStyles: { fillColor: [233, 226, 210] },
    margin: { left: 12, right: 12, bottom: 15 },
    horizontalPageBreak: report.headers.length > 7,
    showHead: 'everyPage'
  });
  const pageCount = pdf.internal.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFontSize(8);
    pdf.setTextColor(107, 29, 36);
    pdf.text(`Grammate Bookstore  |  Halaman ${page} dari ${pageCount}`, pageWidth - 12, pdf.internal.pageSize.getHeight() - 7, { align: 'right' });
  }
  pdf.save(`${report.filename}.pdf`);
}
document.querySelectorAll('[data-export][data-format="csv"]').forEach((csvButton) => {
  const xlsxButton = csvButton.cloneNode(true);
  xlsxButton.dataset.format = 'xlsx';
  xlsxButton.textContent = 'Unduh Excel';
  csvButton.after(xlsxButton);
});
document.querySelectorAll('[data-export]').forEach((button) => on(button, 'click', async () => {
  try {
    const report = exportData(button.dataset.export);
    if (button.dataset.format === 'csv') downloadCsv(report);
    else if (button.dataset.format === 'xlsx') await downloadXlsx(report);
    else if (button.dataset.format === 'pdf') downloadPdf(report);
    else throw new Error('Format ekspor tidak didukung.');
  } catch (error) {
    console.error('Report export failed:', error);
    showStatus(`Gagal mengekspor laporan: ${error.message}`, 'error');
  }
}));
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
    const headerId = kind === 'pembelian' ? valueOf(row, 'id_pembelian') : valueOf(row, 'id_penjualan');
    const detailId = kind === 'pembelian' ? valueOf(row, 'id_detail_beli') : valueOf(row, 'id_detail_jual');
    return `<tr><td>${dateText(row)}</td><td>${safe(ref)}</td><td>${safe(partner)}</td><td>${safe(entry.item)}</td><td>${entry.quantity}</td><td>${money(valueOf(row, 'harga_satuan'))}</td><td>${money(entry.total)}</td><td><div class="table-actions"><button class="table-action" type="button" data-transaction-action="edit" data-kind="${kind}" data-id="${safe(headerId)}" data-detail-id="${safe(detailId)}">${actionIcon('edit')}Edit</button></div></td></tr>`;
  };
  setRows('pembelian-body', purchases, 8, (entry) => transactionRow(entry, 'pembelian'));
  setRows('laporan-pembelian-body', purchases, 6, (entry) => `<tr><td>${dateText(entry.row)}</td><td>${safe(reference(entry.row))}</td><td>${safe(entry.partner)}</td><td>${safe(entry.item)}</td><td>${entry.quantity}</td><td>${money(entry.total)}</td></tr>`);
  setRows('penjualan-body', sales, 8, (entry) => transactionRow(entry, 'penjualan'));
  setRows('laporan-penjualan-body', sales, 6, (entry) => `<tr><td>${dateText(entry.row)}</td><td>${safe(reference(entry.row))}</td><td>${safe(entry.partner)}</td><td>${safe(entry.item)}</td><td>${entry.quantity}</td><td>${money(entry.total)}</td></tr>`);
  setRows('penyesuaian-body', adjustments, 5, (entry) => `<tr><td>${dateText(entry.row)}</td><td>${safe(entry.item)}</td><td>${safe(valueOf(entry.row, 'jenis_penyesuaian') || entry.kind)}</td><td>${entry.quantity}</td><td>${safe(description(entry.row))}</td></tr>`);
  const purchaseTotal = document.getElementById('purchase-total');
  const salesTotal = document.getElementById('sales-total');
  if (purchaseTotal) purchaseTotal.textContent = `Total ${money(purchases.reduce((sum, entry) => sum + entry.total, 0))}`;
  if (salesTotal) salesTotal.textContent = `Total ${money(sales.reduce((sum, entry) => sum + entry.total, 0))}`;
  renderTransactionChart();
}
let transactionChart;
function transactionCount(rows, idKey) {
  return new Set(rows.map((row, index) => {
    const id = valueOf(row, idKey);
    const ref = valueOf(row, 'no_faktur', 'no_nota');
    return String(id || ref || `transaksi-${index}`);
  })).size;
}
function renderTransactionChart() {
  const canvas = document.getElementById('transaction-chart');
  const unavailable = document.getElementById('chart-unavailable');
  if (!canvas) return;
  if (typeof window.Chart !== 'function') {
    if (unavailable) unavailable.hidden = false;
    return;
  }
  if (unavailable) unavailable.hidden = true;
  const data = [
    transactionCount(state.pembelian, 'id_pembelian'),
    transactionCount(state.penjualan, 'id_penjualan')
  ];
  if (transactionChart) {
    transactionChart.data.datasets[0].data = data;
    transactionChart.update();
    return;
  }
  transactionChart = new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Pembelian', 'Penjualan'],
      datasets: [{
        label: 'Jumlah transaksi',
        data,
        backgroundColor: ['#A8442A', '#354A3A'],
        borderColor: ['#8C351E', '#3B576E'],
        borderWidth: 1,
        borderRadius: 0,
        maxBarThickness: 110
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (context) => `${context.label}: ${context.parsed.y} transaksi` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#26211D' } },
        y: { beginAtZero: true, ticks: { precision: 0, color: '#26211D' }, grid: { color: 'rgba(38, 33, 29, .16)' } }
      }
    }
  });
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
  if (!authenticated) return;
  const requestId = ++renderRequestId;
  if (!getClient()) { showStatus('Client Supabase tidak tersedia. Periksa konfigurasi backend/app.js.', 'error'); return; }
  let masterDataLoaded = false;
  setDataLoading(true);
  try {
    const [barang, pelanggan, supplier] = await Promise.all([
      fetchTable(TABLES.barang), fetchTable(TABLES.pelanggan), fetchTable(TABLES.supplier)
    ]);
    if (requestId !== renderRequestId || !authenticated) return;
    Object.assign(state, { barang, pelanggan, supplier });
    masterDataLoaded = true;
    renderMasterData();

    const [pembelianHeader, pembelianDetail, penjualanHeader, penjualanDetail, penyesuaian, jurnal] = await Promise.all([
      fetchTable(TABLES.pembelian), fetchTable(TABLES.detailPembelian),
      fetchTable(TABLES.penjualan), fetchTable(TABLES.detailPenjualan),
      fetchTable(TABLES.penyesuaian), fetchTable(TABLES.jurnal)
    ]);
    if (requestId !== renderRequestId || !authenticated) return;
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
async function loadData() {
  if (!authenticated) return;
  return renderData();
}
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
  penulis: values.penulis.trim() || null, isbn: values.isbn.trim() || null,
  kategori: values.kategori.trim() || null, penerbit: values.penerbit.trim() || null,
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
  const deleteButton = document.getElementById('delete-master-button');
  if (deleteButton) deleteButton.hidden = false;
  if (masterEditTitle) masterEditTitle.textContent = `Edit ${pageTitles[`data-${kind}`] || kind}`;
  masterEditFields.innerHTML = config.fields.map((field) => {
    const type = field.type || 'text';
    const width = field.fullWidth ? ' full-width' : '';
    return `<label class="form-field${width}"><span>${safe(field.label)}</span><input name="${safe(field.name)}" type="${safe(type)}"${field.min !== undefined ? ` min="${safe(field.min)}"` : ''}${field.step !== undefined ? ` step="${safe(field.step)}"` : ''} value="${safe(record[field.name] ?? '')}"${field.required === false ? '' : ' required'} /></label>`;
  }).join('');
  addDateField(masterEditFields, null, record.created_at);
  masterEditModal.hidden = false;
  masterEditModal.setAttribute('aria-hidden', 'false');
  masterEditModal.classList.add('active');
  masterEditFields.querySelector('input')?.focus();
}
async function deleteMaster(kind, id) {
  const config = masterConfig[kind];
  if (!config || id === undefined || id === '') return false;
  if (!window.confirm(`Apakah Anda yakin ingin menghapus ${pageTitles[`data-${kind}`] || kind} ini? Tindakan ini tidak dapat dibatalkan.`)) return false;
  try {
    const { error } = await getClient().from(config.table).delete().eq(config.idColumn, id);
    if (error) throw error;
  } catch (error) {
    console.error('Master delete failed:', error);
    const errorText = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ').toLowerCase();
    if (errorText.includes('foreign key') || errorText.includes('violates foreign key constraint')) {
      showStatus('Data tidak dapat dihapus karena memiliki riwayat transaksi atau jurnal keuangan.', 'error');
      await renderData();
      return false;
    }
    showStatus(`Gagal menghapus data: ${error.message}`, 'error');
    return false;
  }
  await renderData();
  showStatus(`${pageTitles[`data-${kind}`] || kind} berhasil dihapus.`, 'info');
  return true;
}
Object.entries(masterConfig).forEach(([kind, config]) => {
  const tableBody = document.getElementById(config.bodyId);
  on(tableBody, 'click', async (event) => {
    const button = event.target?.closest?.('[data-master-action]');
    if (!button || !tableBody.contains(button) || button.dataset.masterKind !== kind) return;
    const id = button.dataset.id;
    if (button.dataset.masterAction === 'edit') openMasterEdit(kind, id);
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
const transactionEditModal = document.getElementById('transaction-edit-modal');
const transactionEditForm = document.getElementById('transaction-edit-form');
const transactionEditFields = document.getElementById('transaction-edit-fields');
const transactionEditTitle = document.getElementById('transaction-edit-title');

function closeTransactionEdit() {
  if (!transactionEditModal) return;
  transactionEditModal.classList.remove('active');
  transactionEditModal.hidden = true;
  transactionEditModal.setAttribute('aria-hidden', 'true');
  transactionEditForm?.reset();
}

async function deleteTransaction(kind, headerId) {
  if (!kind || !headerId) return false;
  if (!window.confirm(`Hapus transaksi ${kind === 'pembelian' ? 'pembelian' : 'penjualan'} ini beserta stok dan jurnalnya? Tindakan ini tidak dapat dibatalkan.`)) return false;
  const isPurchase = kind === 'pembelian';
  const headerTable = isPurchase ? TABLES.pembelian : TABLES.penjualan;
  const detailTable = isPurchase ? TABLES.detailPembelian : TABLES.detailPenjualan;
  const headerIdKey = isPurchase ? 'id_pembelian' : 'id_penjualan';
  const referenceColumn = isPurchase ? 'no_faktur' : 'no_nota';
  try {
    const { data: headers, error: headerError } = await getClient().from(headerTable).select('*').eq(headerIdKey, headerId);
    if (headerError) throw headerError;
    const header = headers?.[0];
    if (!header) throw new Error('Transaksi tidak ditemukan.');
    const { data: details, error: detailError } = await getClient().from(detailTable).select('*').eq(headerIdKey, headerId);
    if (detailError) throw detailError;

    for (const detail of details || []) {
      const item = state.barang.find((row) => String(itemId(row)) === String(detail.id_barang));
      if (!item) continue;
      const quantity = qtyOf(detail);
      const currentItem = await getClient().from(TABLES.barang).select('stok').eq('id_barang', detail.id_barang).single();
      if (currentItem.error) throw currentItem.error;
      const current = Number(currentItem.data.stok) || 0;
      const restoredStock = isPurchase ? current - quantity : current + quantity;
      if (restoredStock < 0) throw new Error(`Stok ${itemName(item)} tidak cukup untuk membatalkan transaksi.`);
      await updateStock(item, restoredStock);
    }

    const reference = header[referenceColumn];
    if (reference) {
      const { error: journalError } = await getClient().from(TABLES.jurnal).delete().eq('no_bukti', reference);
      if (journalError) throw journalError;
    }
    const { error: deleteError } = await getClient().from(headerTable).delete().eq(headerIdKey, headerId);
    if (deleteError) throw deleteError;
    await renderData();
    showStatus(`Transaksi ${isPurchase ? 'pembelian' : 'penjualan'} berhasil dihapus.`, 'info');
    return true;
  } catch (error) {
    console.error('Transaction delete failed:', error);
    showStatus(`Gagal menghapus transaksi: ${error.message}`, 'error');
    return false;
  }
}

async function openTransactionEdit(kind, headerId) {
  const isPurchase = kind === 'pembelian';
  const headerTable = isPurchase ? TABLES.pembelian : TABLES.penjualan;
  const detailTable = isPurchase ? TABLES.detailPembelian : TABLES.detailPenjualan;
  const headerIdKey = isPurchase ? 'id_pembelian' : 'id_penjualan';
  const referenceColumn = isPurchase ? 'no_faktur' : 'no_nota';
  const partnerKey = isPurchase ? 'id_supplier' : 'id_pelanggan';
  try {
    const { data: headers, error: headerError } = await getClient().from(headerTable).select('*').eq(headerIdKey, headerId);
    if (headerError) throw headerError;
    const header = headers?.[0];
    if (!header) throw new Error('Transaksi tidak ditemukan.');
    const { data: details, error: detailError } = await getClient().from(detailTable).select('*').eq(headerIdKey, headerId);
    if (detailError) throw detailError;
    const detail = details?.[0];
    if (!detail) throw new Error('Detail transaksi tidak ditemukan.');

    transactionEditForm.dataset.kind = kind;
    transactionEditForm.dataset.id = headerId;
    transactionEditForm.dataset.partnerId = header[partnerKey];
    transactionEditForm.dataset.itemId = detail.id_barang;
    transactionEditForm.dataset.detailId = isPurchase ? detail.id_detail_beli : detail.id_detail_jual;
    transactionEditForm.dataset.oldQuantity = detail.jumlah;
    transactionEditTitle.textContent = `Edit Transaksi ${isPurchase ? 'Pembelian' : 'Penjualan'}`;
    const partnerOptions = (isPurchase ? state.supplier : state.pelanggan).map((partner) => {
      const selectedPartnerId = isPurchase ? partnerId(partner, 'supplier') : partnerId(partner, 'pelanggan');
      const name = isPurchase ? partnerName(partner, 'supplier') : partnerName(partner, 'pelanggan');
      return `<option value="${safe(selectedPartnerId)}">${safe(name)}</option>`;
    }).join('');
    const itemOptions = state.barang.map((item) => `<option value="${safe(itemId(item))}">${safe(itemCode(item))} · ${safe(itemName(item))}</option>`).join('');
    transactionEditFields.innerHTML = `
      <label class="form-field"><span>${isPurchase ? 'No Faktur' : 'No Nota'}</span><input name="reference" value="${safe(header[referenceColumn] || '')}" required /></label>
      <label class="form-field"><span>${isPurchase ? 'Supplier' : 'Pelanggan'}</span><select name="partner_id" required>${partnerOptions}</select></label>
      <label class="form-field"><span>Barang</span><select name="barang_id" required>${itemOptions}</select></label>
      <label class="form-field"><span>Jumlah</span><input name="jumlah" type="number" min="1" step="1" value="${safe(detail.jumlah)}" required /></label>
      <label class="form-field"><span>${isPurchase ? 'Harga Beli' : 'Harga Jual'} per Unit</span><input name="unit_price" type="number" min="0.01" step="0.01" value="${safe(detail.harga_satuan)}" required /></label>
    `;
    addDateField(transactionEditFields, null, header.tanggal || header.created_at);
    transactionEditFields.querySelector('[name="partner_id"]').value = String(header[partnerKey]);
    transactionEditFields.querySelector('[name="barang_id"]').value = String(detail.id_barang);
    transactionEditModal.hidden = false;
    transactionEditModal.setAttribute('aria-hidden', 'false');
    transactionEditModal.classList.add('active');
  } catch (error) {
    showStatus(`Gagal memuat transaksi: ${error.message}`, 'error');
  }
}

async function submitTransactionEdit(event) {
  event.preventDefault();
  const kind = transactionEditForm.dataset.kind;
  const headerId = transactionEditForm.dataset.id;
  if (!kind || !headerId) return;
  const isPurchase = kind === 'pembelian';
  const values = formValues(transactionEditForm);
  const quantity = Number(values.jumlah);
  const unitPrice = Number(values.unit_price);
  const item = state.barang.find((row) => String(itemId(row)) === String(values.barang_id));
  if (!item || !Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(unitPrice) || unitPrice <= 0) {
    showStatus('Lengkapi barang, jumlah, dan harga transaksi.', 'error');
    return;
  }

  const headerTable = isPurchase ? TABLES.pembelian : TABLES.penjualan;
  const detailTable = isPurchase ? TABLES.detailPembelian : TABLES.detailPenjualan;
  const headerIdKey = isPurchase ? 'id_pembelian' : 'id_penjualan';
  const detailIdKey = isPurchase ? 'id_detail_beli' : 'id_detail_jual';
  const detailId = transactionEditForm.dataset.detailId;
  const oldItemId = transactionEditForm.dataset.itemId;
  const oldQuantity = Number(transactionEditForm.dataset.oldQuantity);
  const referenceColumn = isPurchase ? 'no_faktur' : 'no_nota';
  const partnerKey = isPurchase ? 'id_supplier' : 'id_pelanggan';
  const createdAt = dateTimestamp(values.tanggal);
  try {
    const { data: oldHeaders, error: oldHeaderError } = await getClient().from(headerTable).select('*').eq(headerIdKey, headerId);
    if (oldHeaderError) throw oldHeaderError;
    const oldHeader = oldHeaders?.[0];
    const oldReference = oldHeader?.[referenceColumn] || '';

    const oldItem = state.barang.find((row) => String(itemId(row)) === String(oldItemId));
    if (oldItem) {
      const currentOldItem = await getClient().from(TABLES.barang).select('stok').eq('id_barang', oldItemId).single();
      if (currentOldItem.error) throw currentOldItem.error;
      const restoredStock = isPurchase
        ? Number(currentOldItem.data.stok) - oldQuantity
        : Number(currentOldItem.data.stok) + oldQuantity;
      if (restoredStock < 0) throw new Error(`Stok ${itemName(oldItem)} tidak cukup untuk proses edit.`);
      await updateStock(oldItem, restoredStock);
    }

    const currentItem = await getClient().from(TABLES.barang).select('stok,harga_pokok,harga_jual').eq('id_barang', itemId(item)).single();
    if (currentItem.error) throw currentItem.error;
    const targetStock = isPurchase
      ? Number(currentItem.data.stok) + quantity
      : Number(currentItem.data.stok) - quantity;
    if (targetStock < 0) throw new Error(`Stok ${itemName(item)} tidak cukup.`);
    await updateStock(item, targetStock);

    const total = quantity * unitPrice;
    await getClient().from(detailTable).update({ id_barang: itemId(item), jumlah: quantity, harga_satuan: unitPrice }).eq(detailIdKey, detailId);
    await updateRow(headerTable, headerIdKey, headerId, {
      [referenceColumn]: values.reference.trim(),
      [partnerKey]: Number(values.partner_id),
      total_bayar: total
    }, createdAt);

    const newReference = values.reference.trim();
    if (oldReference) {
      await getClient().from(TABLES.jurnal).delete().eq('no_bukti', oldReference);
    }
    const cogs = quantity * Number(valueOf(item, 'harga_pokok') || 0);
    const entries = isPurchase
      ? journalPair({ reference: newReference, description: `Pembelian ${itemName(item)}`, debitAccount: 'Persediaan Barang', creditAccount: 'Kas', amount: total, createdAt })
      : [...journalPair({ reference: newReference, description: `Penjualan ${itemName(item)}`, debitAccount: 'Kas', creditAccount: 'Pendapatan', amount: total, createdAt }), ...journalPair({ reference: newReference, description: `HPP ${itemName(item)}`, debitAccount: 'Beban Pokok Penjualan', creditAccount: 'Persediaan Barang', amount: cogs, createdAt })];
    await insertRows(TABLES.jurnal, entries, createdAt);

    closeTransactionEdit();
    await renderData();
    showStatus(`Transaksi ${isPurchase ? 'pembelian' : 'penjualan'} berhasil diperbarui.`, 'info');
  } catch (error) {
    console.error('Transaction edit failed:', error);
    showStatus(`Gagal memperbarui transaksi: ${error.message}`, 'error');
  }
}

document.querySelectorAll('[data-close-transaction]').forEach((button) => on(button, 'click', closeTransactionEdit));
on(transactionEditModal, 'click', (event) => { if (event.target === transactionEditModal) closeTransactionEdit(); });
on(transactionEditForm, 'submit', submitTransactionEdit);

on(document, 'click', (event) => {
  const button = event.target?.closest?.('[data-transaction-action]');
  if (!button) return;
  const kind = button.dataset.kind;
  const headerId = button.dataset.id;
  if (button.dataset.transactionAction === 'delete') deleteTransaction(kind, headerId);
  if (button.dataset.transactionAction === 'edit') openTransactionEdit(kind, headerId);
});

on(document.getElementById('ledger-account'), 'change', () => renderLedger());
on(document.getElementById('inventory-card-item'), 'change', () => renderInventoryCard());
on(document.getElementById('delete-master-button'), 'click', async () => {
  const kind = masterEditForm.dataset.kind;
  const id = masterEditForm.dataset.id;
  if (await deleteMaster(kind, id)) closeMasterEdit();
});
on(document.getElementById('delete-transaction-button'), 'click', async () => {
  const kind = transactionEditForm.dataset.kind;
  const id = transactionEditForm.dataset.id;
  if (await deleteTransaction(kind, id)) closeTransactionEdit();
});

const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const togglePassword = document.getElementById('toggle-password');
const appShell = document.querySelector('.app-shell');
const loginSessionKey = 'grammate-bookstore-session';
const defaultCredentials = { username: 'admin', password: 'buku123' };
const loginClockTime = document.getElementById('login-clock-time');
const loginClockDate = document.getElementById('login-clock-date');
const calendarDays = document.getElementById('login-calendar-days');
const calendarMonthLabel = document.getElementById('login-calendar-month');
const calendarSelection = document.getElementById('login-calendar-selection');
const loginCompanion = document.getElementById('login-companion');
const clockHourHand = document.querySelector('.clock-hour');
const clockMinuteHand = document.querySelector('.clock-minute');
const clockSecondHand = document.querySelector('.clock-second');
const idDateTime = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const idMonthYear = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
let calendarMonth = new Date();
let selectedCalendarDate = new Date();
selectedCalendarDate.setHours(0, 0, 0, 0);

function updateLoginClock() {
  const now = new Date();
  if (loginClockTime) loginClockTime.textContent = now.toLocaleTimeString('id-ID', { hour12: false });
  if (loginClockDate) loginClockDate.textContent = idDateTime.format(now);
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  if (clockSecondHand) clockSecondHand.style.transform = `rotate(${seconds * 6}deg)`;
  if (clockMinuteHand) clockMinuteHand.style.transform = `rotate(${minutes * 6}deg)`;
  if (clockHourHand) clockHourHand.style.transform = `rotate(${hours * 30}deg)`;
}

function renderLoginCalendar() {
  if (!calendarDays || !calendarMonthLabel || !calendarSelection) return;
  calendarMonthLabel.textContent = idMonthYear.format(calendarMonth);
  calendarDays.replaceChildren();
  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const offset = firstDay.getDay();
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let index = 0; index < offset; index += 1) {
    const blank = document.createElement('span');
    blank.className = 'calendar-empty';
    blank.setAttribute('aria-hidden', 'true');
    calendarDays.append(blank);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar-day';
    button.textContent = String(day);
    button.setAttribute('aria-label', idDateTime.format(date));
    if (date.getTime() === today.getTime()) button.classList.add('is-today');
    if (date.getTime() === selectedCalendarDate.getTime()) {
      button.classList.add('is-selected');
      button.setAttribute('aria-pressed', 'true');
    } else button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      selectedCalendarDate = date;
      renderLoginCalendar();
    });
    calendarDays.append(button);
  }
  calendarSelection.textContent = idDateTime.format(selectedCalendarDate);
}

document.querySelectorAll('[data-calendar-step]').forEach((button) => on(button, 'click', () => {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + Number(button.dataset.calendarStep), 1);
  renderLoginCalendar();
}));

const dragHandle = document.getElementById('companion-drag-handle');
if (loginCompanion && dragHandle) {
  dragHandle.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const rect = loginCompanion.getBoundingClientRect();
    const staysInFlow = window.getComputedStyle(loginCompanion).position !== 'fixed';
    if (!staysInFlow) {
      loginCompanion.style.left = `${rect.left}px`;
      loginCompanion.style.top = `${rect.top}px`;
      loginCompanion.style.right = 'auto';
      loginCompanion.style.bottom = 'auto';
    }
    loginCompanion.classList.add('is-dragging');
    dragHandle.setPointerCapture(event.pointerId);
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const move = (moveEvent) => {
      const maxLeft = Math.max(0, window.innerWidth - loginCompanion.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - loginCompanion.offsetHeight);
      const nextLeft = Math.max(0, Math.min(maxLeft, moveEvent.clientX - offsetX));
      const nextTop = Math.max(0, Math.min(maxTop, moveEvent.clientY - offsetY));
      const loginRect = loginForm?.getBoundingClientRect();
      const overlapsLogin = loginRect
        && nextLeft < loginRect.right
        && nextLeft + loginCompanion.offsetWidth > loginRect.left
        && nextTop < loginRect.bottom
        && nextTop + loginCompanion.offsetHeight > loginRect.top;
      if (overlapsLogin) return;
      if (staysInFlow) {
        loginCompanion.style.transform = `translate3d(${nextLeft - rect.left}px, ${nextTop - rect.top}px, 0)`;
      } else {
        loginCompanion.style.left = `${nextLeft}px`;
        loginCompanion.style.top = `${nextTop}px`;
      }
    };
    const finish = () => {
      loginCompanion.classList.remove('is-dragging');
      dragHandle.removeEventListener('pointermove', move);
      dragHandle.removeEventListener('pointerup', finish);
      dragHandle.removeEventListener('pointercancel', finish);
    };
    dragHandle.addEventListener('pointermove', move);
    dragHandle.addEventListener('pointerup', finish, { once: true });
    dragHandle.addEventListener('pointercancel', finish, { once: true });
  });
}
updateLoginClock();
window.setInterval(updateLoginClock, 1000);
renderLoginCalendar();

function enterDashboard() {
  authenticated = true;
  loginScreen.hidden = true;
  appShell.hidden = false;
  setPage(window.location.hash.slice(1) || 'dashboard');
  loadData();
}

on(togglePassword, 'click', () => {
  const showing = loginPassword.type === 'password';
  loginPassword.type = showing ? 'text' : 'password';
  togglePassword.setAttribute('aria-label', showing ? 'Sembunyikan password' : 'Tampilkan password');
  togglePassword.setAttribute('aria-pressed', String(showing));
  togglePassword.classList.toggle('is-visible', showing);
});

on(loginForm, 'submit', (event) => {
  event.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value;
  if (username !== defaultCredentials.username || password !== defaultCredentials.password) {
    loginError.textContent = 'Username atau password tidak sesuai. Silakan coba lagi.';
    loginError.hidden = false;
    loginPassword.select();
    return;
  }
  loginError.hidden = true;
  try { sessionStorage.setItem(loginSessionKey, 'true'); } catch (error) {
    console.warn('Sesi login tidak dapat disimpan:', error);
  }
  enterDashboard();
});

on(loginForm, 'input', () => {
  if (loginError) loginError.hidden = true;
});

on(document.getElementById('logout-button'), 'click', () => {
  authenticated = false;
  try { sessionStorage.removeItem(loginSessionKey); } catch (error) {
    console.warn('Sesi login tidak dapat dihapus:', error);
  }
  window.clearTimeout(refreshTimer);
  renderRequestId += 1;
  setDataLoading(false, true);
  if (realtimeChannel) {
    const channel = realtimeChannel;
    realtimeChannel = null;
    const client = getClient();
    if (client?.removeChannel) {
      client.removeChannel(channel).then(({ error }) => {
        if (error) console.warn('Supabase Realtime unsubscribe failed:', error);
      }).catch((error) => console.warn('Supabase Realtime unsubscribe failed:', error));
    }
  }
  appShell.hidden = true;
  loginScreen.hidden = false;
  loginForm.reset();
  loginPassword.type = 'password';
  togglePassword.setAttribute('aria-label', 'Tampilkan password');
  togglePassword.setAttribute('aria-pressed', 'false');
  togglePassword.classList.remove('is-visible');
  loginError.hidden = true;
  loginUsername.focus();
});

try {
  if (sessionStorage.getItem(loginSessionKey) === 'true') enterDashboard();
  else loginUsername.focus();
} catch (error) {
  console.warn('Status sesi login tidak dapat dibaca:', error);
  loginUsername.focus();
}
