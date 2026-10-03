# Bot GetContact Telegram (Cloudflare Workers)

Bot Telegram untuk melakukan pencarian profil dan daftar tag nomor telepon GetContact secara instan — lengkap dengan enkripsi request native (AES-256-ECB & HMAC-SHA256), monitoring kuota otomatis, pemecah captcha buka blokir, manajemen multi-akun, dan sistem donasi QRIS.

Berjalan di atas **Cloudflare Workers** (serverless) & **Cloudflare KV**. Sangat cepat, hemat sumber daya, dan gratis untuk penggunaan pribadi tanpa perlu mengelola server (VPS).

[![Repository](https://img.shields.io/badge/GitHub-getcontact--bot-0088cc?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mhdhfzz/getcontact-bot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

---

## Fitur Utama

- **🔍 Pencarian Profil Instan**: Menampilkan nama pemilik kontak (*display name*), nomor format E.164, email (jika tersedia), serta jumlah total tag tersimpan.
- **🏷️ Daftar Tag Lengkap**: Menampilkan daftar nama yang disimpan oleh kontak orang lain, lengkap dengan frekuensi kemunculannya.
- **📊 Sisa Kuota Otomatis**: Setiap hasil pencarian profil maupun tag otomatis menyertakan informasi sisa kuota pencarian akun secara *real-time*.
- **🔓 Buka Blokir / Solusi Captcha (`/captcha`)**: Saat akun dibatasi (HTTP 403), bot otomatis mengirimkan gambar captcha ke chat Telegram. Anda cukup mengetik teks captcha untuk membuka blokir akun secara instan.
- **☕ Sistem Donasi QRIS (`/setqris` & `/donasi`)**:
  - Tombol donasi terpasang otomatis di bawah setiap hasil pencarian kontak.
  - Admin dapat mengunggah gambar QRIS langsung lewat chat Telegram dengan `/setqris`.
  - Membantu penggalangan dana perpanjangan akun GetContact Premium agar kuota tetap tersedia.
- **👥 Multi-Akun Admin (`/accounts`)**:
  - Admin dapat menyimpan beberapa akun GetContact (`/addacc`).
  - Ganti akun aktif kapan saja dengan `/useacc <nama>`.
  - Hapus akun yang sudah tidak terpakai dengan `/delacc <nama>`.
- **🔘 Navigasi Interaktif (Inline Keyboard)**: Cukup tekan tombol `[ 🏷️ Lihat Tags ]`, `[ 👤 Lihat Profil ]`, atau `[ ☕ Donasi ]` dalam satu ketukan.
- **⚡ 100% Serverless & Zero External Dependencies**: Berjalan di *edge runtime* Cloudflare Workers global tanpa modul eksternal (AES-256-ECB & WebCrypto HMAC sudah tertanam langsung), sehingga dapat langsung di-copy-paste ke Cloudflare Dashboard Quick Edit maupun di-deploy via CLI. Ukuran bundle sangat ringkas (~14.9 KiB gzipped).

---

## Prasyarat Sebelum Mulai

1. **Token Bot Telegram**:
   - Dapatkan dari [@BotFather](https://t.me/BotFather) di Telegram via `/newbot`.
2. **Kredensial GetContact**:
   - Dapatkan `token`, `finalKey`, dan `clientDeviceId` dari file `credentials.json` lokal atau dari CLI `python gtc.py generate <nomor>`.
3. **Akun Cloudflare**:
   - Akun gratis di [cloudflare.com](https://cloudflare.com).
4. **Node.js**:
   - Node.js versi 18+ terpasang di komputer Anda.

---

## Pilihan Deployment

### Opsi 1: Lewat Terminal / Wrangler CLI (Direkomendasikan)

1. **Clone repository dan install dependensi:**
   ```bash
   git clone https://github.com/mhdhfzz/getcontact-bot.git
   cd getcontact-bot
   npm install
   ```

2. **Buat Cloudflare KV Namespace:**
   Jalankan perintah ini untuk membuat database penyimpanan KV:
   ```bash
   npx wrangler kv:namespace create GTC_KV
   ```
   Salin nilai `id` yang tampil di terminal, lalu buka file `wrangler.toml` dan masukkan ID tersebut:
   ```toml
   [[kv_namespaces]]
   binding = "GTC_KV"
   id = "<PASTE_KV_ID_DI_SINI>"
   ```

3. **Simpan kredensial rahasia ke Cloudflare:**
   Jalankan satu per satu di terminal dan masukkan nilainya saat diminta:
   ```bash
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put GTC_TOKEN
   npx wrangler secret put GTC_FINAL_KEY
   npx wrangler secret put GTC_DEVICE_ID
   ```
   *(Opsional) Isi ID Telegram Anda pada `ADMIN_CHAT_ID = "ID_TELEGRAM_ANDA"` di file `wrangler.toml`.*

4. **Deploy worker:**
   ```bash
   npm run deploy
   ```
   Setelah selesai, Cloudflare akan memberikan URL publik worker Anda, misalnya:
   `https://getcontact-bot.<subdomain>.workers.dev`

5. **Sambungkan Webhook Telegram:**
   Buka URL berikut di browser Anda:
   ```text
   https://<url-worker-anda>/setup
   ```
   Muncul konfirmasi berhasil, dan bot Telegram langsung aktif!

---

### Opsi 2: Lewat Dashboard Cloudflare (Tanpa CLI)

1. **Buat KV Namespace:**
   - Masuk ke **Cloudflare Dashboard** > **Workers & Pages** > **KV**.
   - Klik **Create a namespace**, beri nama `GTC_KV`, lalu klik **Add**.
2. **Buat Worker:**
   - Masuk ke **Workers & Pages** > **Overview** > **Create application** > **Create Worker**.
   - Beri nama worker (misalnya `getcontact-bot`), lalu klik **Deploy**.
3. **Masukkan Kode:**
   - Klik **Edit code**, hapus kode bawaan, lalu salin seluruh isi file [`getcontact-bot.js`](./getcontact-bot.js) dan klik **Deploy**. Kode sepenuhnya *standalone* tanpa modul npm eksternal, sehingga tidak akan memicu error `No such module`.
4. **Hubungkan KV Namespace:**
   - Masuk ke tab **Settings** > **Variables and KV** (atau **Bindings**).
   - Di bagian **KV Namespace Bindings**, klik **Add binding**:
     - Variable name: `GTC_KV`
     - KV namespace: Pilih `GTC_KV` yang baru dibuat.
5. **Tambahkan Variables & Secrets:**
   - Di tab yang sama (**Settings** > **Variables and Secrets**), tambahkan 4 Secrets:
     - `TELEGRAM_BOT_TOKEN`
     - `GTC_TOKEN`
     - `GTC_FINAL_KEY`
     - `GTC_DEVICE_ID`
   - Tambahkan Environment Variable:
     - `ADMIN_CHAT_ID` (ID Telegram Admin Anda)
   - Klik **Deploy changes**.
6. **Aktifkan Webhook:**
   - Buka `https://<url-worker-anda>/setup` di browser.


---

## Konfigurasi Bot di BotFather

Agar bot Anda memiliki tampilan profesional, menu perintah yang muncul otomatis saat pengguna mengetik `/`, serta deskripsi yang informatif:

### 1. Membuat Bot & Mengambil Token
1. Buka [@BotFather](https://t.me/BotFather) di Telegram.
2. Kirim perintah `/newbot`.
3. Masukkan nama tampilan bot Anda (contoh: `GetContact Lookup Bot`).
4. Masukkan username bot yang berakhiran `_bot` (contoh: `VexGetcontact_bot`).
5. Simpan **HTTP API Token** yang diberikan (gunakan untuk variabel `TELEGRAM_BOT_TOKEN`).

### 2. Mengatur Menu Perintah Cepat (`/setcommands`)
1. Kirim perintah `/setcommands` ke [@BotFather], lalu pilih bot Anda.
2. Salin dan tempel daftar perintah berikut:
   ```text
   search - Cari profil nama pemilik nomor HP
   tags - Lihat daftar tag kontak tersimpan
   quota - Cek sisa kuota pencarian akun
   captcha - Buka blokir captcha jika terkena limit
   donasi - Dukung perpanjangan akun GetContact Premium
   help - Bantuan & panduan penggunaan bot
   ```

### 3. Mengatur Deskripsi Awal (`/setdescription`)
Teks ini akan muncul di layar awal chat sebelum pengguna menekan tombol **Start**:
1. Kirim `/setdescription` ke [@BotFather], pilih bot Anda.
2. Kirimkan teks berikut:
   ```text
   ⚡ Bot Telegram untuk mencari profil dan daftar tag nomor telepon GetContact secara instan.
   ```

### 4. Mengatur Informasi Profil (`/setabouttext`)
Teks singkat yang muncul pada profil bot:
1. Kirim `/setabouttext` ke [@BotFather], pilih bot Anda.
2. Kirimkan teks berikut:
   ```text
   Cek nama kontak, daftar tag, dan sisa kuota GetContact secara instan.
   ```

### 5. Mengatur Foto Profil Bot (`/setuserpic`)
1. Kirim `/setuserpic` ke [@BotFather], pilih bot Anda.
2. Kirimkan gambar atau logo yang ingin Anda gunakan sebagai avatar bot.

---

## Daftar Perintah Bot

| Perintah / Input | Keterangan |
| :--- | :--- |
| `/start` atau `/help` | Menampilkan panduan penggunaan dan menu bot |
| `081234567890` | Kirim nomor telepon langsung untuk mencari profil & tag |
| `/search <nomor>` | Mencari data profil dan nama pemilik nomor telepon |
| `/tags <nomor>` | Mencari daftar tag yang disimpan kontak orang lain |
| `/quota` | Mengecek sisa kuota pencarian akun GetContact aktif |
| `/captcha` | Membuka gambar captcha jika akun terkena limit (403) |
| `/donasi` | Menampilkan info QRIS donasi perpanjangan akun Premium |

### Perintah Khusus Admin

Perintah berikut hanya dapat dijalankan oleh akun Telegram yang ID-nya terdaftar pada variabel `ADMIN_CHAT_ID`:

| Perintah Admin | Keterangan |
| :--- | :--- |
| `/accounts` atau `/listacc` | Melihat daftar seluruh akun GetContact tersimpan |
| `/useacc <nama>` | Mengganti akun GetContact yang sedang aktif digunakan |
| `/addacc <nama> <token> <finalKey> <deviceId>` | Menambahkan akun GetContact baru ke database KV |
| `/delacc <nama>` | Menghapus akun GetContact dari daftar |
| `/setqris` | Mengatur / mengunggah gambar QRIS donasi langsung dari chat |


## Detail Teknis

- **Klien GetContact**: Meniru komunikasi native Android GetContact v8.4.0.
- **Kriptografi**:
  - Request body dienkripsi menggunakan **AES-256-ECB** (PKCS#7 padding) dengan `finalKey` akun.
  - Header tanda tangan `x-req-signature` menggunakan **HMAC-SHA256** dari `<timestamp>-<raw_payload>`.
  - Respons didekripsi kembali secara lokal sebelum diteruskan ke Telegram.
- **CLI Lokal**: Script Python original [`gtc.py`](./gtc.py) tetap tersedia di folder ini untuk scripting lokal atau pendaftaran akun baru via WhatsApp VerifyKit.

---

## ⚠️ Disclaimer

Project ini dibuat untuk **tujuan riset dan edukasi**. Patuhi aturan perlindungan data pribadi yang berlaku dan syarat ketentuan layanan terkait. Pengguna bertanggung jawab penuh atas penggunaan bot ini. #DWYOR
