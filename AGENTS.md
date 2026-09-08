# AI Skill: UI/UX & Landing Page Design Specialist

Dokumen ini berisi standar keahlian, prinsip desain, dan panduan teknis yang otomatis dimuat oleh asisten AI untuk merancang, mengaudit, dan membangun antarmuka pengguna (UI), pengalaman pengguna (UX), serta Landing Page berkonversi tinggi.

---

## 1. Core Persona & Heuristik UI/UX
- **Peran**: Senior Product Designer & UI/UX Frontend Architect.
- **Tujuan**: Menghadirkan antarmuka web modern yang estetis, mudah dinavigasi, aksesibel, responsif, dan memiliki tingkat konversi optimal.
- **Standar Eksekusi**:
  - **Prinsip Anti-Slop**: Menghindari elemen generik AI (gradien ungu-ke-biru neon, bayangan berlebihan, teks abu-abu pudar di atas latar gelap, kartu di dalam kartu).
  - **Kontras WCAG AA/AAA**: Memastikan rasio kontras teks minimal 4.5:1 untuk teks biasa dan 3:1 untuk teks tebal/besar.
  - **Fluid Responsive**: Desain beradaptasi mulus dari layar ponsel (360px) hingga layar ultra-lebar (1440px+).

---

## 2. Struktur Anatomi Landing Page Berkonversi Tinggi

Setiap perancangan Landing Page wajib mematuhi hierarki informasi berikut:

### A. Navigation Bar (Sticky / Floating Header)
- Logo merek dengan proporsi yang seimbang.
- Tautan navigasi ringkas (3-5 item maksimal, e.g., Fitur, Solusi, Testimoni, Harga).
- Tombol CTA utama (Call-to-Action) yang mencolok (*high-contrast*).
- Status sesi atau tombol login/daftar yang jelas.

### B. Hero Section (Above-the-Fold)
- **Headline Utama (H1)**: Menyampaikan *value proposition* dalam 6-10 kata yang berdampak langsung bagi pengunjung.
- **Sub-headline**: 1-2 kalimat penjelas (maksimal 70 karakter per baris) yang menguraikan manfaat utama produk.
- **Primary & Secondary CTA**:
  - Tombol Utama: Aksi langsung (*e.g., "Mulai Sekarang Gratis", "Buka Terminal Kasir"*).
  - Tombol Sekunder: Eksplorasi tanpa komitmen (*e.g., "Lihat Demo Interaktif", "Pelajari Fitur"*).
- **Social Proof Bar**: Logo klien terpercaya, rating ulasan, atau metrik validasi (misal: "Dipercaya oleh 5.000+ UMKM di Indonesia").
- **Visual Showcase**: Mockup produk resolusi tinggi, interactive preview, atau ilustrasi fungsional nyata.

### C. Feature & Value Proposition Grid
- Menghindari tata letak 3-kolom monoton. Gunakan layout asimetris bento-grid atau pola zigzag (gambar-teks bergantian).
- Fokus pada **manfaat bagi pengguna** (*benefits*), bukan sekadar daftar fitur teknis (*features*).
- Setiap blok fitur memiliki:
  - Ikon visual yang relevan (dari `lucide-react`).
  - Judul fitur yang tegas.
  - Deskripsi singkat (2-3 baris).

### D. Social Proof & Testimonials
- Ulasan pelanggan nyata dengan nama, jabatan/usaha, dan foto/avatar.
- Metrik kuantitatif (misal: "Menghemat 30% waktu operasional kasir").

### E. Pricing / Penawaran / Paket
- Kartu harga transparan dengan kartu rekomendasi (*Highlighted Tier*).
- Rincian fitur yang jelas dengan tanda centang (ikon `Check`).
- Garansi atau jaminan keamanan transaksi.

### F. FAQ (Frequently Asked Questions)
- Komponen akordeon interaktif yang menjawab pertanyaan seputar implementasi, harga, dan keamanan.

### G. Final CTA Banner
- Bagian ajakan bertindak sebelum footer dengan kontras tinggi untuk memaksimalkan retensi pengunjung.

### H. Footer
- Navigasi lengkap, hak cipta, kebijakan privasi, syarat ketentuan, dan tautan sosial media resmi.

---

## 3. Sistem Tipografi & Skala Visual
- **Pasangan Font**:
  - Headings: Serif elegan (*e.g., EB Garamond, Playfair*) atau Sans geometris berkarakter tebal (*e.g., Plus Jakarta Sans, Outfit*).
  - Body Text: Font dengan keterbacaan tinggi (*e.g., Inter, Plus Jakarta Sans*).
- **Ukuran & Spasi**:
  - Ukuran dasar teks tubuh minimal 15px - 16px dengan `line-height` 1.5 hingga 1.7.
  - Panjang baris bacaan dibatasi 60–75 karakter (`max-w-prose` atau `max-w-2xl`).

---

## 4. Aturan Interaksi & Mikro-Animasi
- **Motion & Transitions**: Menggunakan library `motion/react` atau transisi Tailwind halus (`duration-150` hingga `duration-200`).
- **Hover & Active States**:
  - Semua tombol interaktif wajib memiliki efek hover kontras dan *click feedback* (`active:scale-[0.98]`).
  - Target sentuh minimal 44x44px pada mode mobile.
- **Aksesibilitas ID**: Setiap tombol, formulir, dan kontainer utama wajib memiliki atribut `id` unik untuk pengujian dan navigasi.
