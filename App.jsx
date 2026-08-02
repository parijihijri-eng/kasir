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
              onPurchaseBill={(bill) => setPurchas
