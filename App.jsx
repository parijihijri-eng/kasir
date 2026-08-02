import React, { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, Package, History,
  Sparkles, X, AlertTriangle, Receipt, Edit2, Send,
  Printer, CheckCircle2, Wallet, QrCode, CreditCard, BookOpen,
  Camera, ScanLine, Settings, RefreshCw, MessageCircle, ShieldAlert, Store, Image as ImageIcon, Download, Upload, User, Lock, Phone, Mail, LogOut, TrendingUp, TrendingDown, LayoutGrid, List, Eye, EyeOff, HelpCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* ---------------------------------- tokens ---------------------------------- */
const C = {
  bg: "#F5F6F2",
  surface: "#FFFFFF",
  ink: "#1B2B22",
  inkSoft: "#63736A",
  primary: "#0BA34C",
  primaryDark: "#087A38",
  primarySoft: "#E6F5EB",
  accent: "#E0983B",
  accentSoft: "#FBF0DF",
  danger: "#C1443C",
  dangerSoft: "#FAEAE8",
  line: "#DDE3DA",
};
const FONT_DISPLAY = "'Sora', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const fmt = (n) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");
const fmtNumInput = (v) => {
  const clean = String(v || "").replace(/[^0-9]/g, "");
  if (!clean) return "";
  return Number(clean).toLocaleString("id-ID");
};
const parseNumInput = (v) => {
  if (!v) return 0;
  return Number(String(v).replace(/[^0-9]/g, "")) || 0;
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* ---------------------------------- sound effects ---------------------------------- */
function playBeepSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    /* ignore */
  }
}

/* ---------------------------------- App Logo SVG ---------------------------------- */
function AppLogo({ className = "" }) {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
        <rect width="100" height="100" rx="22" fill="#0BB752" />
        <path d="M38 36V24C38 16 62 16 62 24V36" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
        <polygon points="26,82 43,82 49,36 32,36" fill="white" />
        <polygon points="46,58 68,32 82,32 58,64" fill="white" />
        <path d="M51 58L71 58C74.5 58 76 59.5 76 63L76 86L72 83L68 86L64 83L60 86L56 83L52 86L48 83L47 58Z" fill="white" />
        <line x1="55" y1="65" x2="68" y2="65" stroke="#0BB752" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="55" y1="71" x2="68" y2="71" stroke="#0BB752" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="55" y1="77" x2="68" y2="77" stroke="#0BB752" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="mt-3 flex items-center justify-center gap-[1px]" style={{ color: '#045E28', fontFamily: 'Arial, sans-serif' }}>
        <span className="text-[2rem] font-black tracking-tight">K</span>
        <div className="relative flex items-center justify-center mx-[1px]">
          <span className="text-[2rem] font-black tracking-tight">A</span>
          <div className="absolute bottom-[33%] w-0 h-0 border-l-[5px] border-r-[5px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#0BB752]"></div>
        </div>
        <span className="text-[2rem] font-black tracking-tight">SIR</span>
        <span className="text-[2rem] font-black tracking-tight ml-2">KU</span>
      </div>
    </div>
  );
}

/* ---------------------------------- seed data ---------------------------------- */
const SEED_PRODUCTS = [
  { id: "p1", name: "Indomie Goreng", category: "Makanan", price: 3500, cost: 2800, stock: 50, minStock: 10, unit: "pcs", sku: "8998888251211", icon: "🍜" },
  { id: "p2", name: "Aqua 600ml", category: "Minuman", price: 4000, cost: 3000, stock: 40, minStock: 10, unit: "botol", sku: "8996001234567", icon: "💧" },
  { id: "p3", name: "Teh Botol Sosro", category: "Minuman", price: 5000, cost: 3800, stock: 30, minStock: 8, unit: "botol", sku: "8991234567890", icon: "🧃" },
  { id: "p4", name: "Chitato 68g", category: "Snack", price: 12000, cost: 9500, stock: 20, minStock: 5, unit: "pcs", sku: "8999999112233", icon: "🥔" },
  { id: "p5", name: "Beras 5kg", category: "Sembako", price: 65000, cost: 58000, stock: 15, minStock: 5, unit: "karung", sku: "BRS-5", icon: "🌾" },
  { id: "p6", name: "Telur Ayam", category: "Sembako", price: 28000, cost: 24000, stock: 25, minStock: 5, unit: "kg", sku: "TLR-1", icon: "🥚" },
  { id: "p7", name: "Kopi Kapal Api", category: "Minuman", price: 1500, cost: 1100, stock: 100, minStock: 20, unit: "sachet", sku: "KKA-1", icon: "☕" },
  { id: "p8", name: "Sampoerna Mild", category: "Rokok", price: 32000, cost: 29000, stock: 30, minStock: 10, unit: "bungkus", sku: "SPM-1", icon: "🚬" },
];

const DEFAULT_STORE = {
  name: "Toko Anda",
  address: "Jl. Contoh Alamat No. 123, Kota",
  phone: "08123456789",
  footer: "Terima kasih atas kunjungan Anda 🙏",
};

/* ---------------------------------- storage helpers ---------------------------------- */
const memoryStore = {};
let localStorageAvailable = null;
function checkLocalStorage() {
  if (localStorageAvailable !== null) return localStorageAvailable;
  try {
    const testKey = "__pos_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    localStorageAvailable = true;
  } catch {
    localStorageAvailable = false;
  }
  return localStorageAvailable;
}
function safeGet(key) {
  try {
    if (checkLocalStorage()) {
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : null;
    }
  } catch {
    /* jatuh ke memori */
  }
  return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
}
function safeSet(key, value) {
  memoryStore[key] = value;
  try {
    if (checkLocalStorage()) {
      const str = JSON.stringify(value);
      localStorage.setItem(key, str);
    }
  } catch {
    /* sudah aman tersimpan di memori */
  }
}
function safeDelete(key) {
  delete memoryStore[key];
  try {
    if (checkLocalStorage()) {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

/* ---------------------------------- script loader ---------------------------------- */
const scriptCache = {};
function loadScript(src) {
  if (scriptCache[src]) return scriptCache[src];
  scriptCache[src] = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") resolve(true);
      else existing.addEventListener("load", () => resolve(true));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => { s.dataset.loaded = "1"; resolve(true); };
    s.onerror = () => reject(new Error("Gagal memuat pustaka: " + src));
    document.body.appendChild(s);
  });
  return scriptCache[src];
}

async function ensureJsPdf() {
  if (!window.jspdf) {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  }
  return window.jspdf.jsPDF || window.jspdf;
}

async function ensureHtml5QrcodeLib() {
  if (!window.Html5Qrcode) {
    await loadScript("https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js");
  }
  if (!window.Html5Qrcode) {
    throw new Error("Pustaka pemindai gagal dimuat");
  }
  return window.Html5Qrcode;
}

/* ---------------------------------- receipt builders ---------------------------------- */
function buildReceiptText(tx, store) {
  const lines = [];
  lines.push(store.name || "Toko Anda");
  if (store.address) lines.push(store.address);
  lines.push(`${fmtDate(tx.date)} ${fmtTime(tx.date)}`);
  lines.push("--------------------------------");
  tx.items.forEach((it) => {
    lines.push(it.name);
    lines.push(`  ${it.qty} x ${fmt(it.price)} = ${fmt(it.qty * it.price)}`);
  });
  lines.push("--------------------------------");
  lines.push(`Subtotal: ${fmt(tx.subtotal)}`);
  if (tx.discountAmt > 0) lines.push(`Diskon ${tx.discountPct}%: -${fmt(tx.discountAmt)}`);
  if (tx.tax > 0) lines.push(`PPN 11%: ${fmt(tx.tax)}`);
  lines.push(`TOTAL: ${fmt(tx.total)}`);
  lines.push(`Bayar (${tx.payMethod}): ${fmt(tx.cashReceived)}`);
  lines.push(`Kembali: ${fmt(tx.change)}`);
  lines.push("--------------------------------");
  lines.push(store.footer || "Terima kasih atas kunjungan Anda 🙏");
  return lines.join("\n");
}

function buildBillText(bill, store) {
  const lines = [];
  lines.push("NOTA PEMBELIAN STOK");
  lines.push(store.name || "Toko Anda");
  lines.push(`${fmtDate(bill.date)} ${fmtTime(bill.date)}`);
  if (bill.supplier) lines.push(`Supplier: ${bill.supplier}`);
  lines.push("--------------------------------");
  lines.push(bill.productName);
  lines.push(`  ${bill.qty} ${bill.unit} x ${fmt(bill.unitCost)} = ${fmt(bill.amount)}`);
  lines.push("--------------------------------");
  lines.push(`TOTAL DIBAYAR: ${fmt(bill.amount)}`);
  if (bill.note) lines.push(`Catatan: ${bill.note}`);
  return lines.join("\n");
}

async function downloadPdfReceipt(tx, store, receiptLogo) {
  try {
    const JsPDF = await ensureJsPdf();
    const text = buildReceiptText(tx, store);
    
    const dummy = new JsPDF({ unit: "mm", format: [80, 100] });
    dummy.setFont("courier", "normal");
    dummy.setFontSize(9);
    
    let totalLines = 0;
    text.split("\n").forEach((line) => {
      const wrapped = dummy.splitTextToSize(line, 70);
      totalLines += wrapped.length;
    });

    let startY = 8;
    if (receiptLogo) startY += 24;
    const dynamicHeight = startY + (totalLines * 4.2) + 12;

    const doc = new JsPDF({ unit: "mm", format: [80, Math.max(100, dynamicHeight)] });
    
    if (receiptLogo) {
      try {
        doc.addImage(receiptLogo, "JPEG", 30, 8, 20, 20);
      } catch {
        /* ignore */
      }
    }

    doc.setFont("courier", "normal");
    doc.setFontSize(9);

    let yPos = startY;
    text.split("\n").forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 70);
      wrapped.forEach((w) => {
        doc.text(w, 5, yPos);
        yPos += 4.2;
      });
    });

    doc.save(`Struk_${tx.id}.pdf`);
    return true;
  } catch (err) {
    console.error("PDF error:", err);
    return false;
  }
}

async function downloadPdfBill(bill, store) {
  try {
    const JsPDF = await ensureJsPdf();
    const doc = new JsPDF({ unit: "mm", format: [80, 150] }); 
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    const text = buildBillText(bill, store);
    let y = 8;
    text.split("\n").forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 70);
      wrapped.forEach((w) => {
        doc.text(w, 5, y);
        y += 4.2;
      });
    });
    doc.save(`NotaStok_${Date.now()}.pdf`);
    return true;
  } catch (err) {
    console.error("PDF error:", err);
    return false;
  }
}

function sendViaWhatsAppDirect(text) {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

/* ---------------------------------- error boundary ---------------------------------- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("KasirKu crash:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: C.bg, fontFamily: FONT_BODY }} className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
            <AlertTriangle size={40} className="mx-auto text-red-500 mb-3" />
            <h2 className="font-bold text-lg text-gray-800 mb-1">Terjadi Kesalahan</h2>
            <p className="text-sm text-gray-500 mb-5">Sesuatu berjalan tidak semestinya. Data Anda tetap aman dan tersimpan.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{ background: C.primary }}
              className="w-full py-3 rounded-xl text-white font-bold"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------------------------- root app ---------------------------------- */
function AppRoot() {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => safeGet("pos:currentUser"));

  const [products, setProducts] = useState(() => safeGet("pos:products") || SEED_PRODUCTS);
  const [transactions, setTransactions] = useState(() => safeGet("pos:transactions") || []);
  const [ledger, setLedger] = useState(() => safeGet("pos:ledger") || []);
  const [store, setStore] = useState(() => safeGet("pos:store") || DEFAULT_STORE);
  const [storeLogo, setStoreLogo] = useState(() => safeGet("pos:storeLogo"));
  const [receiptLogo, setReceiptLogo] = useState(() => safeGet("pos:receiptLogo"));

  const [tab, setTab] = useState("kasir");
  const [cart, setCart] = useState([]);
  const [receiptTx, setReceiptTx] = useState(null);
  const [purchaseBill, setPurchaseBill] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState("cart"); 
  const [scannerCallback, setScannerCallback] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setReady(true);
  }, []);

  const persistCurrentUser = (user) => {
    setCurrentUser(user);
    if (user) safeSet("pos:currentUser", user);
    else safeDelete("pos:currentUser");
  };
  const persistProducts = (next) => {
    setProducts(next);
    safeSet("pos:products", next);
  };
  const persistTransactions = (next) => {
    setTransactions(next);
    safeSet("pos:transactions", next);
  };
  const persistLedger = (next) => {
    setLedger(next);
    safeSet("pos:ledger", next);
  };
  const persistStore = (next) => {
    setStore(next);
    safeSet("pos:store", next);
  };
  const persistStoreLogo = (val) => {
    setStoreLogo(val);
    safeSet("pos:storeLogo", val);
  };
  const persistReceiptLogo = (val) => {
    setReceiptLogo(val);
    safeSet("pos:receiptLogo", val);
  };

  const showToast = (msg, kind = "ok") => {
    setToast({ msg, kind, id: uid() });
    setTimeout(() => setToast((cur) => (cur && cur.msg === msg ? null : cur)), 2500);
  };

  const handleResetSystem = async () => {
    safeDelete("pos:products");
    safeDelete("pos:transactions");
    safeDelete("pos:ledger");
    safeDelete("pos:store");
    safeDelete("pos:storeLogo");
    safeDelete("pos:receiptLogo");
    safeDelete("pos:currentUser");

    setProducts(SEED_PRODUCTS);
    setTransactions([]);
    setLedger([]);
    setStore(DEFAULT_STORE);
    setStoreLogo(null);
    setReceiptLogo(null);
    setCart([]);
    setCurrentUser(null);
    setSettingsOpen(false);
    showToast("Sistem berhasil di-reset ke pengaturan awal!");
  };

  const handleImportData = (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.products) persistProducts(parsed.products);
      if (parsed.transactions) persistTransactions(parsed.transactions);
      if (parsed.ledger) persistLedger(parsed.ledger);
      if (parsed.store) persistStore(parsed.store);
      if (parsed.storeLogo) persistStoreLogo(parsed.storeLogo);
      if (parsed.receiptLogo) persistReceiptLogo(parsed.receiptLogo);
      showToast("Data berhasil dipulihkan!");
    } catch {
      showToast("Format file JSON tidak valid", "err");
    }
  };

  const handleBarcodeScanned = (skuOrCode) => {
    playBeepSound();
    if (scannerMode === "addProduct" && scannerCallback) {
      scannerCallback(skuOrCode);
      setScannerOpen(false);
      return;
    }

    const found = products.find((p) => p.sku.toLowerCase() === skuOrCode.toLowerCase());
    if (found) {
      if (found.stock <= 0) {
        showToast(`Stok "${found.name}" habis!`, "err");
        return;
      }
      setCart((cur) => {
        const existing = cur.find((c) => c.id === found.id);
        if (existing) {
          if (existing.qty >= found.stock) return cur;
          return cur.map((c) => (c.id === found.id ? { ...c, qty: c.qty + 1 } : c));
        }
        return [...cur, { id: found.id, qty: 1 }];
      });
      showToast(`Ditambahkan: ${found.name}`);
    } else {
      showToast(`Barcode "${skuOrCode}" tidak terdaftar`, "err");
    }
  };

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  if (!ready) {
    return (
      <div style={{ background: C.bg, fontFamily: FONT_BODY }} className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <AppLogo />
          <div style={{ color: C.primary }} className="text-sm font-medium mt-4">Memuat Data...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={(u) => { persistCurrentUser(u); showToast(`Selamat datang, ${u.username}!`); }} showToast={showToast} />;
  }

  return (
    <div style={{ background: C.bg, fontFamily: FONT_BODY, color: C.ink }} className="min-h-screen pb-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 8px; }
      `}</style>

      <Header
        storeName={store.name}
        lowStockCount={lowStockCount}
        storeLogo={storeLogo}
        currentUser={currentUser}
        onLogout={() => persistCurrentUser(null)}
        onOpenScanner={() => { setScannerMode("cart"); setScannerOpen(true); }}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <TabBar tab={tab} setTab={setTab} cartCount={cart.reduce((s, i) => s + i.qty, 0)} />

        <div className="mt-6">
          {tab === "kasir" && (
            <KasirTab
              products={products}
              cart={cart}
              setCart={setCart}
              ledger={ledger}
              setLedger={persistLedger}
              onCheckout={(tx, updatedProducts) => {
                persistProducts(updatedProducts);
                persistTransactions([tx, ...transactions]);
                setReceiptTx(tx);
                setCart([]);
                showToast("Transaksi berhasil disimpan");
              }}
              onOpenScanner={() => { setScannerMode("cart"); setScannerOpen(true); }}
              showToast={showToast}
            />
          )}

          {tab === "produk" && (
            <ProdukTab
              products={products}
              setProducts={persistProducts}
              ledger={ledger}
              setLedger={persistLedger}
              showToast={showToast}
              onPurchaseBill={(bill) => setPurchaseBill(bill)}
              onOpenBarcodeScanner={(cb) => {
                setScannerMode("addProduct");
                setScannerCallback(() => cb);
                setScannerOpen(true);
              }}
            />
          )}

          {tab === "riwayat" && (
            <RiwayatTab
              transactions={transactions}
              onViewReceipt={(tx) => setReceiptTx(tx)}
            />
          )}

          {tab === "keuangan" && (
            <KeuanganTab
              transactions={transactions}
              ledger={ledger}
              setLedger={persistLedger}
              showToast={showToast}
            />
          )}

          {tab === "ai" && <AiTab products={products} transactions={transactions} ledger={ledger} />}
        </div>
      </div>

      {receiptTx && (
        <ReceiptModal
          tx={receiptTx}
          store={store}
          receiptLogo={receiptLogo}
          onClose={() => setReceiptTx(null)}
          showToast={showToast}
        />
      )}
      {purchaseBill && (
        <PurchaseBillModal
          bill={purchaseBill}
          store={store}
          onClose={() => setPurchaseBill(null)}
          showToast={showToast}
        />
      )}
      {scannerOpen && (
        <BarcodeScannerModal
          onClose={() => setScannerOpen(false)}
          onScan={(sku) => handleBarcodeScanned(sku)}
        />
      )}
      {settingsOpen && (
        <SettingsModal
          currentUser={currentUser}
          store={store}
          onUpdateStore={persistStore}
          storeLogo={storeLogo}
          onUpdateLogo={persistStoreLogo}
          receiptLogo={receiptLogo}
          onUpdateReceiptLogo={persistReceiptLogo}
          onClose={() => setSettingsOpen(false)}
          onReset={handleResetSystem}
          onImport={handleImportData}
          allData={{ products, transactions, ledger, store, storeLogo, receiptLogo }}
          showToast={showToast}
        />
      )}
      {toast && <Toast toast={toast} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoot />
    </ErrorBoundary>
  );
}

/* ---------------------------------- AUTH SCREEN ---------------------------------- */
function AuthScreen({ onLoginSuccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [animState, setAnimState] = useState("idle");
  const shakeTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  const triggerShake = () => {
    setAnimState("shake");
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    shakeTimeoutRef.current = setTimeout(() => setAnimState("idle"), 550);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    try {
      if (!username || !password) {
        showToast("Username dan password wajib diisi!", "err");
        triggerShake();
        return;
      }

      const registeredUsers = safeGet("pos:users") || [];

      if (isRegister) {
        if (!email || !phone) {
          showToast("Email dan telepon wajib diisi untuk daftar!", "err");
          triggerShake();
          return;
        }

        const pwdRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!pwdRegex.test(password)) {
          showToast("Password min 8 karakter, wajib ada 1 huruf kapital & 1 angka!", "err");
          triggerShake();
          return;
        }

        const existing = registeredUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
        if (existing) {
          showToast("Username sudah terdaftar!", "err");
          triggerShake();
          return;
        }
        const newUser = { username, password, email, phone };
        registeredUsers.push(newUser);
        safeSet("pos:users", registeredUsers);

        showToast("Pendaftaran berhasil! Silakan Login.");
        setIsRegister(false);
        setPassword("");
      } else {
        const existing = registeredUsers.find((u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (existing) {
          setAnimState("success");
          setTimeout(() => {
            try {
              onLoginSuccess(existing);
            } catch (err) {
              setAnimState("idle");
              showToast("Gagal masuk ke aplikasi: " + (err?.message || "kesalahan tidak dikenal"), "err");
              triggerShake();
            }
          }, 850);
        } else {
          showToast("Username atau password salah!", "err");
          triggerShake();
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      showToast("Terjadi kesalahan: " + (err?.message || "tidak dikenal"), "err");
      triggerShake();
    }
  };

  return (
    <div style={{ background: C.primarySoft, fontFamily: FONT_BODY }} className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <style>{`
        @keyframes authShake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        .auth-shake { animation: authShake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes successPop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes successRingDraw {
          from { stroke-dashoffset: 166; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes successCheckDraw {
          from { stroke-dashoffset: 48; }
          to { stroke-dashoffset: 0; }
        }
        .success-pop { animation: successPop 0.45s cubic-bezier(.36,.07,.19,.97) both; }
        .success-ring { stroke-dasharray: 166; stroke-dashoffset: 166; animation: successRingDraw 0.5s ease-out forwards 0.05s; }
        .success-check { stroke-dasharray: 48; stroke-dashoffset: 48; animation: successCheckDraw 0.35s ease-out forwards 0.45s; }
      `}</style>
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>

      {animState === "success" && (
        <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="success-pop">
            <svg width="88" height="88" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" fill="none" stroke={C.primary} strokeWidth="4" strokeLinecap="round" className="success-ring" />
              <path d="M18 31 L26 39 L42 21" fill="none" stroke={C.primary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="success-check" />
            </svg>
          </div>
          <p style={{ color: C.primaryDark }} className="font-bold text-lg">Login Berhasil!</p>
          <p className="text-gray-400 text-sm">Menyiapkan aplikasi Anda…</p>
        </div>
      )}

      <div className={`bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative z-10 ${animState === "shake" ? "auth-shake" : ""}`}>
        <div className="mb-8 w-full flex justify-center">
          <AppLogo />
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-gray-500 font-semibold text-sm">{isRegister ? "Buat Akun Baru" : "Masuk ke Akun Anda"}</h2>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Username</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 bg-gray-50/50 rounded-xl focus:bg-white focus:outline-none focus:border-green-500 text-sm font-medium" placeholder="Masukkan username" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full pl-10 pr-10 py-3 border-2 border-gray-100 bg-gray-50/50 rounded-xl focus:bg-white focus:outline-none focus:border-green-500 text-sm font-medium" 
                placeholder="Masukkan password" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isRegister && <p className="text-xs text-gray-500 mt-2 ml-1">Minimal 8 huruf, mengandung 1 Kapital & 1 Angka.</p>}
          </div>
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 bg-gray-50/50 rounded-xl focus:bg-white focus:outline-none focus:border-green-500 text-sm font-medium" placeholder="contoh@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">No. Telepon</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 bg-gray-50/50 rounded-xl focus:bg-white focus:outline-none focus:border-green-500 text-sm font-medium" placeholder="0812xxxxxx" />
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={animState === "success"} style={{ background: C.primary }} className="w-full text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/30 mt-6 hover:bg-green-600 transition disabled:opacity-70">
            {isRegister ? "Daftar Sekarang" : "Masuk"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t text-center text-sm font-medium text-gray-500">
          <span>{isRegister ? "Sudah punya akun?" : "Belum punya akun?"}</span>{" "}
          <button onClick={() => { setIsRegister(!isRegister); setPassword(""); setAnimState("idle"); }} style={{ color: C.primary }} className="font-bold hover:underline focus:outline-none">
            {isRegister ? "Masuk di sini" : "Daftar sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- HEADER & TABS ---------------------------------- */
function Header({ storeName, lowStockCount, storeLogo, currentUser, onLogout, onOpenScanner, onOpenSettings }) {
  return (
    <header className="bg-white sticky top-0 z-40 border-b shadow-sm" style={{ borderColor: C.line }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {storeLogo ? (
            <img src={storeLogo} alt="Logo Toko" className="w-10 h-10 object-cover rounded-lg border shadow-sm" />
          ) : (
            <div style={{ background: C.primarySoft, color: C.primary }} className="w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm border-green-100">
              <Store size={22} />
            </div>
          )}
          <div>
            <h1 style={{ fontFamily: FONT_DISPLAY, color: C.primaryDark }} className="font-bold text-lg leading-tight truncate max-w-[140px] sm:max-w-xs">
              {storeName}
            </h1>
            <p className="text-xs font-medium" style={{ color: C.inkSoft }}>Hai, {currentUser?.username || "Kasir"}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {lowStockCount > 0 && (
            <div style={{ background: C.dangerSoft, color: C.danger }} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mr-2 shadow-sm border border-red-100">
              <AlertTriangle size={14} />
              {lowStockCount} Stok Menipis
            </div>
          )}
          <button onClick={onOpenScanner} className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 transition relative" style={{ color: C.inkSoft }}>
            <ScanLine size={22} />
          </button>
          <button onClick={onOpenSettings} className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 transition" style={{ color: C.inkSoft }}>
            <Settings size={22} />
          </button>
          <button onClick={onLogout} className="p-2 sm:p-2.5 rounded-full hover:bg-red-50 text-red-500 transition sm:ml-1" title="Keluar">
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}

function TabBar({ tab, setTab, cartCount }) {
  const tabs = [
    { id: "kasir", label: "Kasir", icon: ShoppingCart, badge: cartCount },
    { id: "produk", label: "Produk", icon: Package },
    { id: "riwayat", label: "Riwayat", icon: History },
    { id: "keuangan", label: "Keuangan", icon: Wallet },
    { id: "ai", label: "AI Insights", icon: Sparkles },
  ];

  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1.5 bg-white rounded-xl shadow-sm border" style={{ borderColor: C.line }}>
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center min-w-[110px] gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${active ? "shadow-sm" : "hover:bg-gray-50"}`}
            style={{
              background: active ? C.primary : "transparent",
              color: active ? "#FFF" : C.inkSoft,
            }}
          >
            <t.icon size={18} className={active ? "text-white" : ""} />
            {t.label}
            {t.badge > 0 && (
              <span className="ml-1 bg-white text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ color: C.primary, minWidth: "20px" }}>
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------- KASIR TAB ---------------------------------- */
function KasirTab({ products, cart, setCart, ledger, setLedger, onCheckout, onOpenScanner, showToast }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Semua");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const categories = ["Semua", ...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    if (cat !== "Semua" && p.category !== cat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const cartTotal = cart.reduce((sum, item) => {
    const p = products.find(p => p.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  const addToCart = (p) => {
    if (p.stock <= 0) {
      showToast(`Stok "${p.name}" habis!`, "err");
      return;
    }
    playBeepSound();
    setCart(cur => {
      const ex = cur.find(c => c.id === p.id);
      if (ex) {
        if (ex.qty >= p.stock) { showToast(`Maksimal stok ${p.stock}`, "err"); return cur; }
        return cur.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...cur, { id: p.id, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(cur => {
      return cur.map(c => {
        if (c.id === id) {
          const p = products.find(prod => prod.id === id);
          const newQty = c.qty + delta;
          if (newQty > p.stock) { showToast(`Maksimal stok ${p.stock}`, "err"); return c; }
          if (newQty < 1) return null;
          return { ...c, qty: newQty };
        }
        return c;
      }).filter(Boolean);
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex flex-col min-h-[60vh]">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari produk atau scan barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
              style={{ borderColor: C.line }}
            />
          </div>
          <button onClick={onOpenScanner} className="px-4 py-3 bg-white border rounded-xl hover:bg-gray-50 text-gray-600 transition flex items-center gap-2 shadow-sm" style={{ borderColor: C.line }}>
            <ScanLine size={20} /> <span className="hidden sm:inline font-medium text-sm">Scan</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${cat === c ? 'text-white border-transparent shadow-md' : 'bg-white hover:bg-gray-50'}`}
              style={{
                background: cat === c ? C.primary : "white",
                color: cat === c ? "white" : C.inkSoft,
                borderColor: cat === c ? "transparent" : C.line
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 content-start">
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white p-3 rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition relative overflow-hidden flex flex-col group"
              style={{ borderColor: C.line, opacity: p.stock > 0 ? 1 : 0.5 }}
            >
              <div className="text-4xl mb-3 text-center bg-gray-50 rounded-xl py-5 group-hover:bg-green-50 transition">{p.icon || "📦"}</div>
              <div className="flex-1 px-1">
                <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{p.name}</h3>
                <p className="text-xs mt-1.5 font-medium" style={{ color: C.inkSoft }}>Stok: {p.stock} {p.unit}</p>
              </div>
              <div className="mt-2 px-1 font-bold text-sm" style={{ color: C.primaryDark }}>{fmt(p.price)}</div>
              {p.stock <= 0 && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">HABIS</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[380px] bg-white border rounded-2xl shadow-sm flex flex-col h-[75vh] lg:sticky lg:top-24" style={{ borderColor: C.line }}>
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50 rounded-t-2xl" style={{ borderColor: C.line }}>
          <h2 className="font-bold text-lg flex items-center gap-2"><ShoppingCart size={20} /> Keranjang</h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs text-red-500 font-bold hover:underline">Kosongkan</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
              <ShoppingCart size={48} className="opacity-20" />
              <p className="font-medium">Keranjang masih kosong</p>
            </div>
          ) : (
            cart.map(c => {
              const p = products.find(prod => prod.id === c.id);
              if (!p) return null;
              return (
                <div key={c.id} className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border shadow-sm">
                  <div className="text-2xl bg-gray-50 p-2 rounded-lg">{p.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{p.name}</h4>
                    <p className="text-xs text-green-700 font-bold mt-0.5">{fmt(p.price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg border px-1 py-1">
                    <button onClick={() => updateCartQty(c.id, -1)} className="p-1 hover:bg-white rounded text-gray-600"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-6 text-center">{c.qty}</span>
                    <button onClick={() => updateCartQty(c.id, 1)} className="p-1 hover:bg-white rounded text-gray-600"><Plus size={14} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t bg-gray-50/50 rounded-b-2xl" style={{ borderColor: C.line }}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-semibold">Subtotal</span>
            <span className="font-black text-xl">{fmt(cartTotal)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => setCheckoutModalOpen(true)}
            className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg"
            style={{ background: C.primary }}
          >
            Bayar Sekarang <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{cart.length} item</span>
          </button>
        </div>
      </div>

      {checkoutModalOpen && (
        <CheckoutModal
          cart={cart}
          products={products}
          totalAmount={cartTotal}
          onClose={() => setCheckoutModalOpen(false)}
          onSuccess={(txData) => {
            const newProducts = products.map(p => {
              const inCart = cart.find(c => c.id === p.id);
              if (inCart) return { ...p, stock: p.stock - inCart.qty };
              return p;
            });
            const newLedgerEntry = {
              id: "l_" + uid(),
              date: txData.date,
              type: "income",
              amount: txData.total,
              desc: `Penjualan Kasir #${txData.id}`,
            };
            setLedger([newLedgerEntry, ...ledger]);
            onCheckout(txData, newProducts);
            setCheckoutModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CheckoutModal({ cart, products, totalAmount, onClose, onSuccess }) {
  const [cash, setCash] = useState("");
  const [method, setMethod] = useState("Cash");
  const [discount, setDiscount] = useState("");
  const [tax, setTax] = useState(false);

  const discPct = parseNumInput(discount) || 0;
  const discAmt = totalAmount * (discPct / 100);
  const afterDisc = totalAmount - discAmt;
  const taxAmt = tax ? afterDisc * 0.11 : 0;
  const finalTotal = afterDisc + taxAmt;

  const cashVal = method === "Cash" ? parseNumInput(cash) : finalTotal;
  const change = cashVal - finalTotal;
  const isValid = cashVal >= finalTotal;

  const handlePay = () => {
    if (!isValid) return;
    const tx = {
      id: "INV-" + uid().toUpperCase(),
      date: new Date().toISOString(),
      items: cart.map(c => {
        const p = products.find(x => x.id === c.id);
        return { id: p.id, name: p.name, price: p.price, qty: c.qty, cost: p.cost };
      }),
      subtotal: totalAmount,
      discountPct: discPct,
      discountAmt: discAmt,
      tax: taxAmt,
      total: finalTotal,
      cashReceived: cashVal,
      change: change,
      payMethod: method,
    };
    onSuccess(tx);
  };

  const quickAmounts = [10000, 20000, 50000, 100000];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg">Pembayaran</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="text-center p-5 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
            <p className="text-sm text-gray-500 mb-1 font-semibold">Total Tagihan</p>
            <p className="text-4xl font-black tracking-tight" style={{ color: C.primaryDark }}>{fmt(finalTotal)}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["Cash", "QRIS", "Transfer"].map(m => (
              <button
                key={m}
                onClick={() => { setMethod(m); if (m !== "Cash") setCash(fmtNumInput(finalTotal)); else setCash(""); }}
                className={`py-3 px-3 border-2 rounded-xl text-sm font-bold flex flex-col items-center gap-1.5 transition ${method === m ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
              >
                {m === "Cash" ? <Wallet size={20} /> : m === "QRIS" ? <QrCode size={20} /> : <CreditCard size={20} />}
                {m}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Diskon (%)</label>
              <input
                type="number"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                placeholder="0"
                min="0" max="100"
                className="w-full border-2 border-gray-100 bg-gray-50/50 p-3 rounded-xl focus:bg-white focus:border-green-500 outline-none text-sm font-medium"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Pajak (PPN 11%)</label>
              <button
                onClick={() => setTax(!tax)}
                className={`w-full border-2 p-3 rounded-xl text-sm font-bold transition ${tax ? 'bg-green-500 text-white border-green-500' : 'bg-gray-50/50 text-gray-500 border-gray-100'}`}
              >
                {tax ? "Termasuk PPN" : "Tanpa PPN"}
              </button>
            </div>
          </div>

          {method === "Cash" && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Uang Diterima</label>
              <input
                type="text"
                value={cash}
                onChange={e => setCash(fmtNumInput(e.target.value))}
                className="w-full text-2xl font-black p-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none text-center"
                placeholder="Rp 0"
              />
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <button onClick={() => setCash(fmtNumInput(finalTotal))} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 text-sm font-bold rounded-lg hover:bg-green-100">Uang Pas</button>
                {quickAmounts.map(amt => (
                  <button key={amt} onClick={() => setCash(fmtNumInput(amt))} className="px-4 py-2 bg-gray-100 text-gray-600 border border-gray-200 text-sm font-bold rounded-lg hover:bg-gray-200">
                    {fmt(amt)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {method === "Cash" && cashVal > 0 && (
            <div className={`p-4 rounded-xl flex justify-between items-center border-2 ${change < 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-700'}`}>
              <span className="font-bold">{change < 0 ? 'Kurang Bayar' : 'Kembalian'}</span>
              <span className="font-black text-xl">{fmt(Math.abs(change))}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white">
          <button
            onClick={handlePay}
            disabled={!isValid}
            className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition shadow-lg"
            style={{ background: isValid ? C.primary : "#cbd5e1" }}
          >
            <CheckCircle2 size={24} /> Selesaikan Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- PRODUK TAB ---------------------------------- */
function ProdukTab({ products, setProducts, ledger, setLedger, showToast, onPurchaseBill, onOpenBarcodeScanner }) {
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [restockModalData, setRestockModalData] = useState(null);
  const [editData, setEditData] = useState(null);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id) => {
    if (window.confirm("Hapus produk ini secara permanen?")) {
      setProducts(products.filter(p => p.id !== id));
      showToast("Produk dihapus");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6" style={{ borderColor: C.line }}>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold" style={{ color: C.primaryDark }}>Manajemen Produk</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari SKU / Nama..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 font-medium"
            />
          </div>
          <button onClick={() => { setEditData(null); setAddModalOpen(true); }} className="px-4 py-2 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:opacity-90 shadow-sm" style={{ background: C.primary }}>
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl" style={{ borderColor: C.line }}>
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-4 font-bold text-gray-500">Produk</th>
              <th className="px-5 py-4 font-bold text-gray-500">Kategori</th>
              <th className="px-5 py-4 font-bold text-gray-500">SKU/Barcode</th>
              <th className="px-5 py-4 font-bold text-gray-500">Harga Jual</th>
              <th className="px-5 py-4 font-bold text-gray-500">Stok</th>
              <th className="px-5 py-4 font-bold text-gray-500 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ divideColor: C.line }}>
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-gray-100 p-2 rounded-lg border">{p.icon}</span>
                    <span className="font-bold text-gray-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-medium text-gray-600">{p.category}</td>
                <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-500 bg-gray-50 rounded border px-1.5 py-0.5">{p.sku}</td>
                <td className="px-5 py-3 font-bold text-gray-800">{fmt(p.price)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold px-2.5 py-1 rounded-lg border ${p.stock <= p.minStock ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {p.stock} {p.unit}
                    </span>
                    {p.stock <= p.minStock && <AlertTriangle size={16} className="text-red-500" />}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setRestockModalData(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Restock">
                      <RefreshCw size={16} />
                    </button>
                    <button onClick={() => { setEditData(p); setAddModalOpen(true); }} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Hapus">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(addModalOpen || editData) && (
        <ProductFormModal
          initialData={editData}
          onClose={() => { setAddModalOpen(false); setEditData(null); }}
          onSave={(data) => {
            if (editData) {
              setProducts(products.map(p => p.id === editData.id ? { ...p, ...data } : p));
              showToast("Produk diperbarui");
            } else {
              setProducts([{ ...data, id: "p_" + uid() }, ...products]);
              showToast("Produk ditambahkan");
            }
            setAddModalOpen(false);
            setEditData(null);
          }}
          onOpenBarcodeScanner={onOpenBarcodeScanner}
        />
      )}

      {restockModalData && (
        <RestockModal
          product={restockModalData}
          onClose={() => setRestockModalData(null)}
          onSuccess={(qty, cost, supplier) => {
            const amount = qty * cost;
            setProducts(products.map(p => p.id === restockModalData.id ? { ...p, stock: p.stock + qty, cost: cost } : p));
            
            const newLedger = {
              id: "l_" + uid(),
              date: new Date().toISOString(),
              type: "expense",
              amount: amount,
              desc: `Restock ${qty}${restockModalData.unit} ${restockModalData.name}`,
            };
            setLedger([newLedger, ...ledger]);
            showToast("Stok berhasil ditambahkan");
            
            const bill = {
              id: "B-" + uid().toUpperCase(),
              date: new Date().toISOString(),
              productName: restockModalData.name,
              qty, unit: restockModalData.unit,
              unitCost: cost, amount, supplier
            };
            onPurchaseBill(bill);
            setRestockModalData(null);
          }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ initialData, onClose, onSave, onOpenBarcodeScanner }) {
  const [form, setForm] = useState(initialData || {
    name: "", category: "Umum", sku: "", price: "", cost: "", stock: "", minStock: "5", unit: "pcs", icon: "📦"
  });

  const costVal = parseNumInput(form.cost);
  const priceVal = parseNumInput(form.price);

  const recMin = Math.ceil((costVal * 1.15) / 500) * 500;
  const recIdeal = Math.ceil((costVal * 1.25) / 500) * 500; 
  const recMax = Math.ceil((costVal * 1.35) / 500) * 500; 

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applyRecommendation = (val) => {
    setForm({ ...form, price: String(val) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    onSave({
      ...form,
      price: parseNumInput(form.price),
      cost: parseNumInput(form.cost),
      stock: parseInt(form.stock) || 0,
      minStock: parseInt(form.minStock) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg">{initialData ? "Edit Produk" : "Tambah Produk Baru"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama Produk *</label>
              <input required name="name" value={form.name} onChange={handleChange} className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:border-green-500 font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">SKU / Barcode</label>
              <div className="flex gap-2">
                <input name="sku" value={form.sku} onChange={handleChange} className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:border-green-500 font-mono" />
                <button type="button" onClick={() => onOpenBarcodeScanner((code) => setForm(f => ({ ...f, sku: code })))} className="px-3 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 text-gray-700">
                  <ScanLine size={18} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Kategori</label>
              <input name="category" value={form.category} onChange={handleChange} className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:border-green-500 font-medium" placeholder="Minuman, Snack" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Harga Modal (Beli)</label>
              <input type="text" name="cost" value={form.cost ? fmtNumInput(form.cost) : ""} onChange={handleChange} className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:border-green-500 font-bold" placeholder="Rp 0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Harga Jual *</label>
              <input required type="text" name="price" value={form.price ? fmtNumInput(form.price) : ""} onChange={handleChange} className="w-full border-2 border-gray-100 bg-green-50/30 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:border-green-500 font-black text-green-700" placeholder="Rp 0" />
            </div>

            {costVal > 0 && (
              <div className="col-span-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-black">
                  <Sparkles size={14} className="text-emerald-600" /> REKOMENDASI HARGA JUAL AMAN & TEPAT:
                </div>
                <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                  Berdasarkan harga modal <strong>{fmt(costVal)}</strong>, pilih rekomendasi di bawah agar tidak rugi dan tetap bersaing:
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button type="button" onClick={() => applyRecommendation(recMin)} className="bg-white hover:bg-emerald-100 border border-emerald-300 p-2 rounded-lg text-center transition">
                    <div className="text-[10px] text-gray-500 font-bold">Minimum (15%)</div>
                    <div className="text-xs font-black text-emerald-900">{fmt(recMin)}</div>
                  </button>
                  <button type="button" onClick={() => applyRecommendation(recIdeal)} className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 p-2 rounded-lg text-center transition shadow-sm">
                    <div className="text-[10px] text-emerald-100 font-bold">Ideal (25%)</div>
                    <div className="text-xs font-black">{fmt(recIdeal)}</div>
                  </button>
                  <button type="button" onClick={() => applyRecommendation(recMax)} className="bg-white hover:bg-emerald-100 border border-emerald-300 p-2 rounded-lg text-center transition">
                    <div className="text-[10px] text-gray-500 font-bold">Maksimal (35%)</div>
                    <div className="text-xs font-black text-emerald-900">{fmt(recMax)}</div>
                  </button>
                </div>
              </div>
            )}

            {priceVal > 0 && priceVal < costVal && (
              <div className="col-span-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-bold flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600 shrink-0" />
                <span>Peringatan: Harga jual lebih rendah dari modal! Anda akan mengalami kerugian.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Stok Awal</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:border-green-500 font-bold" disabled={!!initialData} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Unit</label>
                <input name="unit" value={form.unit} onChange={handleChange} className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:border-green-500 font-medium" placeholder="pcs" />
              </div>
              <div className="w-16">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Ikon</label>
                <input name="icon" value={form.icon} onChange={handleChange} className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5 text-lg text-center" />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Peringatan Stok Minimum</label>
              <input type="number" name="minStock" value={form.minStock} onChange={handleChange} className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:border-green-500 font-medium" />
            </div>
          </div>
          <div className="pt-5 border-t mt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600">Batal</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg" style={{ background: C.primary }}>
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RestockModal({ product, onClose, onSuccess }) {
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState(product.cost || 0);
  const [supplier, setSupplier] = useState("");

  const handleSave = () => {
    const q = parseInt(qty);
    if (!q || q <= 0) return;
    onSuccess(q, parseNumInput(cost), supplier);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2"><RefreshCw size={18} /> Tambah Stok</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-center mb-4 p-4 border-2 rounded-xl bg-gray-50/50">
            <div className="text-4xl mb-2">{product.icon}</div>
            <div className="font-black text-lg text-gray-800">{product.name}</div>
            <div className="text-sm font-bold text-gray-500 mt-1">Stok saat ini: <span className="text-gray-900">{product.stock} {product.unit}</span></div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Jumlah Tambah ({product.unit}) *</label>
            <input autoFocus type="number" value={qty} onChange={e => setQty(e.target.value)} className="w-full text-xl border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 text-center font-black" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Harga Modal per {product.unit}</label>
            <input type="text" value={cost ? fmtNumInput(cost) : ""} onChange={e => setCost(parseNumInput(e.target.value))} className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-3 py-3 focus:bg-white focus:border-green-500 font-bold" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Supplier (Opsional)</label>
            <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-3 py-3 focus:bg-white focus:border-green-500 font-medium" placeholder="Nama supplier" />
          </div>
          
          <div className="bg-blue-50/80 p-3.5 rounded-xl text-sm text-blue-900 border border-blue-100 mt-5 font-medium">
            Total biaya <strong className="text-blue-700 text-base">{fmt((parseInt(qty)||0) * (cost||0))}</strong> akan dicatat sebagai pengeluaran di kas.
          </div>

          <button onClick={handleSave} disabled={!qty || qty <= 0} className="w-full py-4 mt-2 rounded-xl text-white font-bold disabled:opacity-50 shadow-lg text-lg" style={{ background: C.primary }}>
            Simpan & Catat Kas
          </button>
        </div>
      </div>
    </div>
  )
}

function RiwayatTab({ transactions, onViewReceipt }) {
  const [filterDate, setFilterDate] = useState("");

  const filtered = transactions.filter(t => {
    if (filterDate) {
      return t.date.startsWith(filterDate);
    }
    return true;
  });

  const totalRevenue = filtered.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 min-h-[60vh]" style={{ borderColor: C.line }}>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 items-center">
        <h2 className="text-xl font-bold" style={{ color: C.primaryDark }}>Riwayat Transaksi</h2>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-green-500" 
          />
          {filterDate && (
            <button onClick={() => setFilterDate("")} className="text-xs font-black text-red-500 hover:underline">Clear</button>
          )}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="mb-6 bg-gray-50 p-5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-inner">
          <span className="text-sm font-bold text-gray-600 uppercase">Total Penjualan:</span>
          <span className="text-2xl font-black text-green-700">{fmt(totalRevenue)}</span>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map(tx => (
          <div key={tx.id} className="border-2 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center hover:border-green-300 transition bg-white" style={{ borderColor: C.line }}>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="bg-green-50 text-green-600 p-3.5 rounded-xl border border-green-100 hidden sm:block">
                <Receipt size={24} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-lg">{tx.id}</div>
                <div className="text-xs font-bold text-gray-500 flex gap-2 mt-0.5">
                  <span>{fmtDate(tx.date)} {fmtTime(tx.date)}</span>
                  <span>•</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{tx.payMethod}</span>
                </div>
                <div className="text-sm mt-2 font-medium text-gray-600 line-clamp-1">
                  {tx.items.map(i => `${i.qty}x ${i.name}`).join(", ")}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
              <div className="text-xl font-black" style={{ color: C.primaryDark }}>{fmt(tx.total)}</div>
              <button 
                onClick={() => onViewReceipt(tx)}
                className="px-4 py-2.5 border-2 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2 text-gray-700 shadow-sm"
              >
                <Printer size={16} /> <span className="hidden sm:inline">Lihat Struk</span>
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 font-bold">
            <History size={48} className="mx-auto opacity-20 mb-3" />
            <p>Tidak ada transaksi ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function KeuanganTab({ transactions, ledger, setLedger, showToast }) {
  const [manualModalOpen, setManualModalOpen] = useState(false);

  const totalIncome = ledger.filter(l => l.type === "income").reduce((s, l) => s + l.amount, 0);
  const totalExpense = ledger.filter(l => l.type === "expense").reduce((s, l) => s + l.amount, 0);
  const balance = totalIncome - totalExpense;

  const last7Days = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayLedger = ledger.filter(l => l.date.startsWith(date));
    const income = dayLedger.filter(l => l.type === "income").reduce((s, l) => s + l.amount, 0);
    const expense = dayLedger.filter(l => l.type === "expense").reduce((s, l) => s + l.amount, 0);
    return {
      name: new Date(date).toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric' }),
      Pemasukan: income,
      Pengeluaran: expense
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: C.line }}>
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100"><Wallet size={20} /></div>
            <span className="text-xs font-bold text-gray-400">SALDO KAS</span>
          </div>
          <div className="text-3xl font-black text-gray-800">{fmt(balance)}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: C.line }}>
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl border border-green-100"><TrendingUp size={20} /></div>
            <span className="text-xs font-bold text-gray-400">PEMASUKAN</span>
          </div>
          <div className="text-3xl font-black text-green-600">{fmt(totalIncome)}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: C.line }}>
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100"><TrendingDown size={20} /></div>
            <span className="text-xs font-bold text-gray-400">PENGELUARAN</span>
          </div>
          <div className="text-3xl font-black text-red-600">{fmt(totalExpense)}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: C.line }}>
        <h3 className="font-bold mb-6 text-gray-800 text-lg">Grafik 7 Hari Terakhir</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }} tickFormatter={(val) => `Rp${val/1000}k`} />
              <Tooltip formatter={(value) => fmt(value)} cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="Pemasukan" fill={C.primary} radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Pengeluaran" fill="#F87171" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: C.line }}>
        <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-lg">Buku Kas (Ledger)</h3>
          <button onClick={() => setManualModalOpen(true)} className="px-4 py-2 bg-white border-2 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm">
            <Plus size={16} /> Catat Kas
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-4 font-bold text-gray-500">Tanggal</th>
                <th className="px-5 py-4 font-bold text-gray-500">Keterangan</th>
                <th className="px-5 py-4 font-bold text-gray-500 text-right">Pemasukan</th>
                <th className="px-5 py-4 font-bold text-gray-500 text-right">Pengeluaran</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: C.line }}>
              {ledger.slice(0, 50).map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3 text-gray-500 font-bold">{fmtDate(l.date)} {fmtTime(l.date)}</td>
                  <td className="px-5 py-3 font-bold text-gray-800">{l.desc}</td>
                  <td className="px-5 py-3 text-right font-black text-green-600">{l.type === "income" ? fmt(l.amount) : "-"}</td>
                  <td className="px-5 py-3 text-right font-black text-red-600">{l.type === "expense" ? fmt(l.amount) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg">Catat Transaksi Kas</h2>
              <button onClick={() => setManualModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const amount = parseNumInput(fd.get("amount"));
              if (!amount) return;
              const newEntry = {
                id: "l_" + uid(),
                date: new Date().toISOString(),
                type: fd.get("type"),
                amount: amount,
                desc: fd.get("desc"),
              };
              setLedger([newEntry, ...ledger]);
              showToast("Catatan kas disimpan");
              setManualModalOpen(false);
            }} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Jenis Kas</label>
                <div className="flex gap-2">
                  <label className="flex-1 border-2 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-gray-50 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 has-[:checked]:text-green-700 font-bold text-gray-500">
                    <input type="radio" name="type" value="income" defaultChecked className="hidden" />
                    <TrendingUp size={18} /> Pemasukan
                  </label>
                  <label className="flex-1 border-2 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-gray-50 has-[:checked]:border-red-500 has-[:checked]:bg-red-50 has-[:checked]:text-red-700 font-bold text-gray-500">
                    <input type="radio" name="type" value="expense" className="hidden" />
                    <TrendingDown size={18} /> Pengeluaran
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Keterangan *</label>
                <input required name="desc" type="text" className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 focus:bg-white focus:border-green-500 font-medium" placeholder="Contoh: Bayar listrik..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Jumlah (Rp) *</label>
                <input required name="amount" type="text" onChange={(e) => e.target.value = fmtNumInput(e.target.value)} className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-xl font-black focus:bg-white focus:border-green-500" placeholder="0" />
              </div>
              <button type="submit" className="w-full py-4 mt-2 rounded-xl text-white font-bold shadow-lg text-lg" style={{ background: C.primary }}>
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AiTab({ products, transactions, ledger }) {
  const lowStock = products.filter(p => p.stock <= p.minStock);
  const bestSellers = [...products].sort((a,b) => {
    const qtyA = transactions.reduce((s,t) => s + (t.items.find(i=>i.id===a.id)?.qty||0), 0);
    const qtyB = transactions.reduce((s,t) => s + (t.items.find(i=>i.id===b.id)?.qty||0), 0);
    return qtyB - qtyA;
  }).slice(0, 3);

  const totalRevenue = transactions.reduce((s, t) => s + t.total, 0);
  const totalCost = transactions.reduce((s, t) => s + t.items.reduce((sum, i) => sum + (i.cost * i.qty), 0), 0);
  const estProfit = totalRevenue - totalCost;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-green-600 to-teal-800 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
        <Sparkles className="absolute right-[-20px] top-[-20px] text-white/10 w-64 h-64 animate-pulse" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner border border-white/20">
            <Sparkles size={36} />
          </div>
          <div>
            <h2 className="text-3xl font-black mb-2 tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>AI Assistant Insight</h2>
            <p className="text-green-100 font-medium">Analisa pintar otomatis dari data toko Anda saat ini.</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg"><TrendingUp size={20} /></div> Analisa Profit
          </div>
          <p className="text-sm font-medium text-gray-500 mb-4">Estimasi keuntungan kotor Anda sejauh ini:</p>
          <div className="text-4xl font-black text-green-600">{fmt(estProfit)}</div>
          <div className="text-xs font-bold text-gray-400 mt-3 bg-gray-50 inline-block px-3 py-1.5 rounded-lg border">Margin: {totalRevenue > 0 ? Math.round((estProfit/totalRevenue)*100) : 0}%</div>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg"><AlertTriangle size={20} /></div> Rekomendasi Stok
          </div>
          {lowStock.length > 0 ? (
            <ul className="space-y-3">
              {lowStock.slice(0,3).map(p => (
                <li key={p.id} className="text-sm font-bold flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border">
                  <span>{p.icon} {p.name}</span>
                  <span className="text-red-600 bg-red-100 px-2 py-1 rounded-md">Sisa {p.stock}</span>
                </li>
              ))}
            </ul>
          ) : (
             <div className="h-full flex flex-col justify-center items-center text-gray-400 pb-4">
                <CheckCircle2 size={40} className="text-green-300 mb-3" />
                <p className="text-sm font-bold">Stok produk Anda aman.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ tx, store, receiptLogo, onClose, showToast }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const ok = await downloadPdfReceipt(tx, store, receiptLogo);
    setLoading(false);
    if (ok) showToast("Struk PDF berhasil diunduh");
    else showToast("Gagal membuat PDF", "err");
  };

  const handleWA = () => {
    const text = buildReceiptText(tx, store);
    sendViaWhatsAppDirect(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg flex items-center gap-2"><Receipt size={18} /> Struk Transaksi</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={18} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-gray-100 flex-1 flex justify-center">
          <div className="bg-white p-6 shadow-md font-mono text-sm w-full relative border border-gray-200" style={{ minHeight: '300px' }}>
            <div className="text-center mb-5">
              {receiptLogo ? (
                <img src={receiptLogo} alt="Logo" className="w-14 mx-auto mb-3 mix-blend-multiply" />
              ) : (
                <div className="flex justify-center mb-3 text-gray-300"><Store size={48} /></div>
              )}
              <div className="font-bold text-base tracking-wide">{store.name}</div>
              <div className="text-xs text-gray-500 mt-1">{store.address}</div>
            </div>
            <div className="text-xs mb-3 border-b-2 border-dashed pb-3 border-gray-300 flex justify-between text-gray-600">
              <div>
                <div className="font-bold">{fmtDate(tx.date)}</div>
                <div className="font-bold">{fmtTime(tx.date)}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">ID</div>
                <div className="font-bold">{tx.id}</div>
              </div>
            </div>
            
            <div className="space-y-2.5 py-2">
              {tx.items.map(it => (
                <div key={it.id}>
                  <div className="font-semibold">{it.name}</div>
                  <div className="flex justify-between text-gray-600 mt-0.5">
                    <span>{it.qty} x {fmt(it.price)}</span>
                    <span className="font-bold text-gray-800">{fmt(it.qty * it.price)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-dashed border-gray-300 pt-3 mt-3 space-y-1.5">
              <div className="flex justify-between font-bold"><span>Subtotal:</span><span>{fmt(tx.subtotal)}</span></div>
              {tx.discountAmt > 0 && <div className="flex justify-between text-red-500 font-bold"><span>Diskon:</span><span>-{fmt(tx.discountAmt)}</span></div>}
              {tx.tax > 0 && <div className="flex justify-between font-bold"><span>PPN:</span><span>{fmt(tx.tax)}</span></div>}
              <div className="flex justify-between font-black text-lg pt-2 mt-1 border-t border-gray-200"><span>TOTAL:</span><span>{fmt(tx.total)}</span></div>
              <div className="flex justify-between font-bold pt-2"><span>Bayar:</span><span>{fmt(tx.cashReceived)}</span></div>
              <div className="flex justify-between font-bold"><span>Kembali:</span><span>{fmt(tx.change)}</span></div>
            </div>
            
            <div className="text-center mt-8 text-xs font-bold text-gray-400 italic">
              {store.footer}
            </div>
            <div className="absolute left-0 right-0 bottom-[-8px] h-4 w-full bg-[radial-gradient(circle_at_4px_0px,transparent_4px,#ffffff_5px)] bg-[length:10px_10px]"></div>
          </div>
        </div>

        <div className="p-4 bg-white border-t flex gap-3 shadow-lg">
          <button onClick={handleWA} className="flex-1 py-3.5 rounded-xl border-2 border-green-500 text-green-600 font-bold flex items-center justify-center gap-2 hover:bg-green-50">
            <MessageCircle size={18} /> WhatsApp
          </button>
          <button onClick={handleDownload} disabled={loading} className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 shadow-md">
            {loading ? <RefreshCw className="animate-spin" size={18}/> : <Printer size={18} />} Cetak PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function PurchaseBillModal({ bill, store, onClose, showToast }) {
  const handleDownload = async () => {
    const ok = await downloadPdfBill(bill, store);
    if (ok) showToast("Nota berhasil diunduh");
    else showToast("Gagal membuat PDF", "err");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-blue-50 text-blue-900">
          <h2 className="font-bold text-lg flex items-center gap-2"><BookOpen size={18} /> Nota Pembelian Stok</h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-full"><X size={18} /></button>
        </div>
        <div className="p-6 bg-gray-100 flex-1 flex justify-center">
          <div className="bg-white p-6 shadow-sm font-mono text-sm w-full border border-gray-200">
            <div className="text-center font-bold mb-4 border-b-2 border-black pb-2 text-base">NOTA STOK MASUK</div>
            <div className="font-bold">{store.name}</div>
            <div className="font-bold">Tgl: {fmtDate(bill.date)}</div>
            <div className="border-t-2 border-b-2 border-dashed py-3 my-3 border-gray-400 space-y-1">
              <div className="font-bold text-base">{bill.productName}</div>
              <div className="flex justify-between text-gray-600">
                <span className="font-bold">{bill.qty} {bill.unit} x {fmt(bill.unitCost)}</span>
                <span className="font-bold text-gray-800">{fmt(bill.amount)}</span>
              </div>
            </div>
            <div className="flex justify-between font-black text-lg pt-1">
              <span>TOTAL:</span>
              <span>{fmt(bill.amount)}</span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border-t">
          <button onClick={handleDownload} className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg">
            <Download size={18} /> Unduh PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function BarcodeScannerModal({ onClose, onScan }) {
  const [manualCode, setManualCode] = useState("");
  const [useCamera, setUseCamera] = useState(false);
  const [initErr, setInitErr] = useState("");
  const [camStatus, setCamStatus] = useState("idle");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [cameraIndex, setCameraIndex] = useState(0);
  const scannerRef = useRef(null);
  const startTokenRef = useRef(0);

  const stopScanner = async () => {
    const inst = scannerRef.current;
    if (!inst) return;
    try {
      if (inst.isScanning) await inst.stop();
      inst.clear();
    } catch {
      /* ignore */
    }
    scannerRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;
    const myToken = ++startTokenRef.current;

    if (!useCamera) return () => {};

    setCamStatus("requesting");
    setInitErr("");

    (async () => {
      try {
        const Html5Qrcode = await ensureHtml5QrcodeLib();
        if (cancelled || myToken !== startTokenRef.current) return;

        let devices = [];
        try {
          devices = await Html5Qrcode.getCameras();
        } catch {
          /* ignore */
        }
        if (cancelled || myToken !== startTokenRef.current) return;
        setCameras(devices || []);

        const inst = new Html5Qrcode("reader", { verbose: false });
        scannerRef.current = inst;

        const cameraTarget =
          devices && devices.length > 0
            ? devices[Math.min(cameraIndex, devices.length - 1)].id
            : { facingMode: "environment" };

        await inst.start(
          cameraTarget,
          {
            fps: 15,
            qrbox: (viewfinderW, viewfinderH) => {
              const size = Math.floor(Math.min(viewfinderW, viewfinderH) * 0.7);
              return { width: size, height: Math.floor(size * 0.55) };
            },
            aspectRatio: 1.777,
            disableFlip: false,
          },
          (decodedText) => {
            if (cancelled || myToken !== startTokenRef.current) return;
            playBeepSound();
            if (navigator.vibrate) navigator.vibrate(80);
            stopScanner().finally(() => onScan(decodedText));
          },
          () => {
            /* ignore */
          }
        );

        if (cancelled || myToken !== startTokenRef.current) {
          stopScanner();
          return;
        }

        setCamStatus("active");

        try {
          const capabilities = inst.getRunningTrackCapabilities?.();
          setTorchSupported(!!capabilities?.torch);
        } catch {
          setTorchSupported(false);
        }
      } catch (err) {
        if (cancelled || myToken !== startTokenRef.current) return;
        const name = err && (err.name || err.message || "");
        if (String(name).toLowerCase().includes("notallowed") || String(name).toLowerCase().includes("permission")) {
          setCamStatus("denied");
          setInitErr("Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser lalu coba lagi.");
        } else {
          setCamStatus("error");
          setInitErr("Kamera tidak dapat diaktifkan. Gunakan input SKU manual di bawah.");
        }
      }
    })();

    return () => {
      cancelled = true;
      stopScanner();
      setTorchOn(false);
    };
  }, [useCamera, cameraIndex]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const toggleTorch = async () => {
    const inst = scannerRef.current;
    if (!inst) return;
    try {
      await inst.applyVideoConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn((t) => !t);
    } catch {
      setTorchSupported(false);
    }
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      stopScanner().finally(() => onScan(manualCode.trim()));
    }
  };

  const switchCamera = () => {
    if (cameras.length < 2) return;
    setCamStatus("requesting");
    setCameraIndex((i) => (i + 1) % cameras.length);
  };

  const sampleSkus = [
    { name: "Indomie Goreng", code: "8998888251211", icon: "🍜" },
    { name: "Aqua 600ml", code: "8996001234567", icon: "💧" },
    { name: "Teh Botol Sosro", code: "8991234567890", icon: "🧃" },
    { name: "Chitato 68g", code: "8999999112233", icon: "🥔" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <style>{`
        @keyframes scanline { 0% { top: 6%; } 50% { top: 94%; } 100% { top: 6%; } }
        .scanline-anim { animation: scanline 2.2s ease-in-out infinite; }
      `}</style>
      <button onClick={handleClose} className="absolute top-6 right-6 text-white bg-white/20 p-3 rounded-full backdrop-blur z-50 hover:bg-white/30">
        <X size={24} />
      </button>

      <div className="w-full max-w-sm bg-white rounded-[2rem] overflow-hidden relative shadow-2xl flex flex-col p-6">
        <div className="text-center mb-4">
          <h3 className="text-gray-800 font-black text-lg">Scan / Input Barcode</h3>
          <p className="text-xs text-gray-500 mt-1">Pilih metode pemindaian produk dengan cepat</p>
        </div>

        {!useCamera ? (
          <div className="space-y-4">
            <button
              onClick={() => setUseCamera(true)}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition"
            >
              <Camera size={20} /> Aktifkan Kamera Scanner
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold">ATAU PILIH CONTOH</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {sampleSkus.map(s => (
                <button
                  key={s.code}
                  onClick={() => onScan(s.code)}
                  className="p-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl text-left transition flex items-center gap-2"
                >
                  <span className="text-xl">{s.icon}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs truncate text-gray-800">{s.name}</div>
                    <div className="text-[10px] font-mono text-gray-500">{s.code}</div>
                  </div>
                </button>
              ))}
            </div>

            <form onSubmit={handleManualSubmit} className="mt-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Ketik SKU / Barcode Manual:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: 8998888251211"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 bg-gray-50 border-2 border-gray-200 text-gray-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-green-500 font-mono font-bold"
                />
                <button type="submit" className="bg-gray-900 hover:bg-black text-white font-bold px-4 rounded-xl text-sm">
                  Kirim
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-full h-64 bg-black rounded-xl overflow-hidden relative">
              <div id="reader" className="w-full h-full [&>video]:!w-full [&>video]:!h-full [&>video]:!object-cover"></div>

              {camStatus === "requesting" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-white">
                  <RefreshCw size={28} className="animate-spin" />
                  <p className="text-xs font-semibold">Meminta izin & menyalakan kamera…</p>
                </div>
              )}

              {camStatus === "active" && (
                <>
                  <div className="absolute left-[15%] right-[15%] h-0.5 bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.8)] scanline-anim"></div>
                  <div className="absolute inset-6 border-2 border-white/60 rounded-xl pointer-events-none"></div>
                </>
              )}

              {(camStatus === "denied" || camStatus === "error") && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 text-white px-4 text-center">
                  <AlertTriangle size={26} className="text-red-400" />
                  <p className="text-xs font-semibold">{initErr}</p>
                  <button
                    onClick={() => { setCamStatus("requesting"); setCameraIndex((i) => i); setUseCamera(false); setTimeout(() => setUseCamera(true), 0); }}
                    className="mt-1 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>

            {camStatus === "active" && (
              <div className="flex items-center justify-center gap-3">
                {torchSupported && (
                  <button
                    onClick={toggleTorch}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border transition ${torchOn ? "bg-yellow-100 border-yellow-300 text-yellow-800" : "bg-gray-50 border-gray-200 text-gray-600"}`}
                  >
                    {torchOn ? "Matikan Flash" : "Nyalakan Flash"}
                  </button>
                )}
                {cameras.length > 1 && (
                  <button
                    onClick={switchCamera}
                    className="text-xs font-bold px-3 py-2 rounded-xl border bg-gray-50 border-gray-200 text-gray-600"
                  >
                    Ganti Kamera
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => setUseCamera(false)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm"
            >
              Kembali ke Menu Input / Contoh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsModal({ currentUser, store, onUpdateStore, storeLogo, onUpdateLogo, receiptLogo, onUpdateReceiptLogo, onClose, onReset, onImport, allData, showToast }) {
  const [activeTab, setActiveTab] = useState("store");
  const [form, setForm] = useState(store);
  const [resetPromptOpen, setResetPromptOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => callback(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(allData);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `Backup_KasirKu_${new Date().toISOString().slice(0,10)}.json`);
    linkElement.click();
  };

  const importFileRef = useRef(null);

  const handleConfirmReset = () => {
    if (resetPassword === currentUser?.password) {
      onReset();
      setResetPromptOpen(false);
    } else {
      showToast("Password akun Anda salah!", "err");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg flex items-center gap-2"><Settings size={18} /> Pengaturan</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={18} /></button>
        </div>

        <div className="flex border-b text-sm" style={{ borderColor: C.line }}>
          <button onClick={()=>setActiveTab("store")} className={`flex-1 py-3.5 font-bold border-b-2 transition ${activeTab === 'store' ? 'text-primary border-primary bg-primary/5' : 'text-gray-500 border-transparent'}`}>Profil Toko</button>
          <button onClick={()=>setActiveTab("data")} className={`flex-1 py-3.5 font-bold border-b-2 transition ${activeTab === 'data' ? 'text-primary border-primary bg-primary/5' : 'text-gray-500 border-transparent'}`}>Data & Backup</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "store" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Toko</label>
                <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-3 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Alamat</label>
                <textarea value={form.address} onChange={e=>setForm({...form, address: e.target.value})} className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-3 font-medium" rows="2" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Telepon</label>
                <input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-3 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Footer Struk</label>
                <input value={form.footer} onChange={e=>setForm({...form, footer: e.target.value})} className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-3 font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2 border-t pt-5">
                <div className="bg-gray-50 p-3 rounded-xl border">
                  <label className="block text-xs font-bold text-gray-500 mb-3 text-center">Logo Toko (Header)</label>
                  <div className="flex flex-col gap-3 items-center">
                    {storeLogo ? <img src={storeLogo} alt="Logo" className="w-16 h-16 object-cover rounded-xl border" /> : <div className="w-16 h-16 bg-white border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400"><Store size={24}/></div>}
                    <label className="cursor-pointer text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg border">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, onUpdateLogo)} />
                    </label>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border">
                  <label className="block text-xs font-bold text-gray-500 mb-3 text-center">Logo Struk (PDF)</label>
                  <div className="flex flex-col gap-3 items-center">
                    {receiptLogo ? <img src={receiptLogo} alt="Logo Struk" className="w-16 h-16 object-contain bg-white border rounded-xl" /> : <div className="w-16 h-16 bg-white border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400"><ImageIcon size={24}/></div>}
                    <label className="cursor-pointer text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg border">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, onUpdateReceiptLogo)} />
                    </label>
                  </div>
                </div>
              </div>

              <button onClick={() => { onUpdateStore(form); onClose(); }} className="w-full py-4 mt-5 rounded-xl text-white font-bold shadow-lg text-lg" style={{ background: C.primary }}>
                Simpan Profil
              </button>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-5">
              <div className="bg-blue-50/50 p-5 rounded-2xl border-2 border-blue-100">
                <h3 className="font-black text-blue-900 mb-2 flex items-center gap-2 text-lg"><Download size={20}/> Export Data</h3>
                <button onClick={handleExport} className="w-full py-3 bg-white text-blue-700 font-bold rounded-xl border-2 border-blue-200 shadow-sm">
                  Unduh Backup JSON
                </button>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-200">
                <h3 className="font-black text-gray-800 mb-2 flex items-center gap-2 text-lg"><Upload size={20}/> Import Data</h3>
                <input type="file" accept=".json" className="hidden" ref={importFileRef} onChange={(e) => {
                  const f = e.target.files[0];
                  if(f) {
                    const r = new FileReader();
                    r.onload = (evt) => onImport(evt.target.result);
                    r.readAsText(f);
                  }
                }} />
                <button onClick={() => importFileRef.current.click()} className="w-full py-3 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 shadow-sm">
                  Pilih File Backup JSON
                </button>
              </div>

              <div className="bg-red-50 p-5 rounded-2xl border-2 border-red-100 mt-6">
                <h3 className="font-black text-red-700 mb-2 flex items-center gap-2 text-lg"><ShieldAlert size={20}/> Reset Sistem</h3>
                {!resetPromptOpen ? (
                  <button onClick={() => setResetPromptOpen(true)} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">
                    Reset Semua Data
                  </button>
                ) : (
                  <div className="mt-4 p-4 bg-white rounded-xl border-2 border-red-200 shadow-md">
                    <label className="block text-sm font-bold text-gray-800 mb-2">Konfirmasi Password Akun:</label>
                    <div className="relative mb-4">
                      <input 
                        type={showResetPassword ? "text" : "password"} 
                        value={resetPassword} 
                        onChange={e => setResetPassword(e.target.value)} 
                        className="w-full border-2 bg-gray-50 p-3 rounded-xl text-sm font-bold outline-none pr-10" 
                        placeholder="Password akun"
                        autoFocus
                      />
                      <button type="button" onClick={() => setShowResetPassword(!showResetPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400">
                        {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => {setResetPromptOpen(false); setResetPassword("");}} className="flex-1 py-2.5 border-2 rounded-xl text-sm font-bold bg-white text-gray-600">Batal</button>
                      <button onClick={handleConfirmReset} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold">Reset</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  const isErr = toast.kind === "err";
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
      <div className={`px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm text-white ${isErr ? 'bg-red-600' : 'bg-gray-900 border border-gray-700'}`}>
        {isErr ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} className="text-green-400" />}
        {toast.msg}
      </div>
    </div>
  );
}
