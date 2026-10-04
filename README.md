# Bot GetContact Telegram (Cloudflare Workers)

Bot Telegram untuk melakukan pencarian profil dan daftar tag nomor telepon GetContact secara instan — lengkap dengan enkripsi request native (AES-256-ECB & HMAC-SHA256), monitoring kuota otomatis, pemecah captcha buka blokir, manajemen multi-akun, dan sistem donasi QRIS.

Berjalan di atas **Cloudflare Workers** (serverless) & **Cloudflare KV**. Sangat cepat, hemat sumber daya, dan gratis untuk penggunaan pribadi tanpa perlu mengelola server (VPS).

[![Repository](https://img.shields.io/badge/GitHub-getcontact--bot-0088cc?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mhdhfzz/getcontact-bot)
[![Demo Bot](https://img.shields.io/badge/Telegram_Bot-@VexGetContact__bot-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/VexGetContact_bot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

> 🤖 **Demo Bot Langsung:** Coba bot yang sudah aktif di Telegram: [@VexGetContact_bot](https://t.me/VexGetContact_bot)

---

## Fitur Utama

- **🔍 Pencarian Profil Instan**: Menampilkan nama pemilik kontak (*display name*), nomor format E.164, email (jika tersedia), serta jumlah total tag tersimpan.
- **🏷️ Daftar Tag Lengkap**: Menampilkan daftar nama yang disimpan oleh kontak orang lain, lengkap dengan frekuensi kemunculannya.
- **🌐 Guest Mode (Grup & Chat Mana Pun Tanpa Harus Join)**:
  - Bot dapat dipanggil di grup mana pun tanpa ribet.
  - Cukup kirim pesan mention `@namabot 081234567890` atau **reply** ke pesan bot mana pun.
- **📊 Statistik Penggunaan Admin (`/stats`)**:
  - Pantau analitik bot secara *real-time*: jumlah pengguna unik, grup unik yang menggunakan Guest Mode, total pencarian profil/tag, dan captcha yang berhasil diselesaikan.
  - Dilengkapi ringkasan kuota akun GetContact aktif dan tombol interaktif `[ 🔄 Refresh Statistik ]`.
- **📊 Sisa Kuota Otomatis**: Setiap hasil pencarian profil maupun tag otomatis menyertakan informasi sisa kuota pencarian akun secara *real-time*.
- **🔓 Buka Blokir / Solusi Captcha Otomatis**: Saat akun dibatasi (HTTP 403), bot otomatis memunculkan tombol buka blokir dan mengirimkan gambar captcha ke chat. Anda cukup mengetik teks captcha untuk membuka blokir akun secara instan.
- **☕ Sistem Donasi QRIS**:
  - Tombol donasi terpasang otomatis di bawah setiap hasil pencarian kontak.
  - Admin dapat mengunggah gambar QRIS langsung lewat chat Telegram dengan `/setqris`.
  - Membantu penggalangan dana perpanjangan akun GetContact Premium agar kuota tetap tersedia.
- **👥 Multi-Akun Admin (`/accounts`)**:
  - Admin dapat menyimpan beberapa akun GetContact (`/addacc`).
  - Ganti akun aktif kapan saja dengan `/useacc <nama>`.
  - Hapus akun yang sudah tidak terpakai dengan `/delacc <nama>`.
- **🔘 Navigasi Interaktif (Inline Keyboard)**: Cukup tekan tombol `[ 🏷️ Lihat Tags ]`, `[ 👤 Lihat Profil ]`, `[ ☕ Donasi ]`, atau `[ 🔄 Refresh ]` dalam satu ketukan.
- **⚡ 100% Serverless & Zero External Dependencies**: Berjalan di *edge runtime* Cloudflare Workers global tanpa modul eksternal (AES-256-ECB & WebCrypto HMAC sudah tertanam langsung), sehingga dapat langsung di-copy-paste ke Cloudflare Dashboard Quick Edit maupun di-deploy via CLI. Ukuran bundle sangat ringkas (~16.6 KiB gzipped).

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
2. Salin dan tempel daftar perintah ringkas berikut:
   ```text
   start - Mulai bot & panduan penggunaan
   search - Cari identitas pemilik nomor HP
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

### 6. Mengaktifkan Fitur Guest Mode di @BotFather

Fitur **Guest Mode** memungkinkan bot dapat digunakan di grup, supergroup, channel, atau obrolan mana pun **TANPA PERLU bot join atau ditambahkan sebagai anggota grup!**

> 💡 **Apa itu Guest Mode?**
> Fitur resmi Telegram Bot API yang memungkinkan bot dipanggil ke dalam obrolan luar via mention (`@namabot nomor`) tanpa harus menjadi member di sana. Bot tidak perlu di-invite oleh admin grup, tidak butuh hak akses admin, dan hanya merespons pesan spesifik yang me-mention bot.

**Langkah Mengaktifkan di @BotFather:**
1. Buka [@BotFather](https://t.me/BotFather) di Telegram.
2. Kirim perintah `/mybots`, lalu pilih bot Anda.
3. Masuk ke menu **Bot Settings**.
4. Pilih menu **Guest Mode** (atau buka menu pengaturan via BotFather Mini App).
5. Klik tombol **Turn Guest Mode ON** (Aktifkan Guest Mode).

Setelah aktif, pengguna di grup mana pun dapat langsung memanggil bot tanpa repot menambahkan bot ke grup.

---

## Cara Penggunaan & Daftar Perintah

Bot ini dirancang sangat praktis dan dapat digunakan baik di **Chat Pribadi** maupun di **Grup / Channel (Guest Mode)**:

### 1. Chat Pribadi (Direct Message)
Cukup kirimkan nomor HP target langsung ke chat bot tanpa format rumit:
- Contoh: `081234567890` atau `+6281234567890`
- Atau gunakan perintah `/search 081234567890`

---

### 2. Guest Mode (Di Grup / Chat Mana Pun Tanpa Harus Bot Join Khusus)

Bot dapat merespons pencarian nomor di grup mana pun dengan sangat fleksibel:

> 🔄 **Perbedaan Cara Pakai:**
> - ❌ **Dulu (inline mode)**: ketik `@namabot nomor` di kolom input chat, pilih hasil dari daftar popup.
> - ✅ **Sekarang (guest mode)**: kirim pesan biasa berisi mention bot (`@namabot nomor`) ATAU **reply** ke pesan bot mana pun dengan nomor di teks/reply tersebut.

**Cara Penggunaan di Grup:**
1. **Mention Langsung:** Kirim pesan mention bot beserta nomor target.
   ```text
   @VexGetContact_bot 081234567890
   ```
2. **Reply Pesan Berisi Nomor:** Balas (*reply*) pesan siapa pun di grup yang berisi nomor telepon, lalu ketik mention bot:
   ```text
   @VexGetContact_bot
   ```
3. **Reply Pesan Bot:** Balas (*reply*) pesan apa pun dari bot dengan mengetik nomor telepon yang ingin dicari.
4. **Perintah Grup:** Ketik `/search 081234567890` atau `/search@VexGetContact_bot 081234567890`.

---

### Perintah Pengguna

| Input / Perintah | Keterangan |
| :--- | :--- |
| `081234567890` | Cukup kirim nomor telepon langsung di chat pribadi untuk melihat profil & sisa kuota |
| `@namabot <nomor>` | **Guest Mode**: Mention bot di grup untuk melakukan pencarian instan |
| `/search <nomor>` | Alternatif pencarian menggunakan perintah (contoh: `/search 081234567890`) |
| `/start` atau `/help` | Menampilkan panduan dan petunjuk singkat penggunaan bot |

> 💡 **Navigasi 100% Berbasis Tombol:**
> - **🏷️ Lihat Tags:** Tekan tombol `[ 🏷️ Lihat Tags (N) ]` pada hasil pencarian profil untuk membuka seluruh daftar tag.
> - **📊 Sisa Kuota:** Otomatis disertakan secara *real-time* di bagian bawah setiap kartu hasil pencarian.
> - **☕ Donasi:** Tekan tombol `[ ☕ Donasi ]` di bawah hasil pencarian untuk melihat QRIS dukungan perpanjangan akun Premium.
> - **🔓 Buka Blokir (Captcha):** Tombol `[ 🔓 Selesaikan Captcha Sekarang ]` dan `[ 🔄 Refresh Gambar Captcha ]` otomatis muncul jika akun terkena pembatasan (HTTP 403).

---

### Perintah Khusus Admin

Perintah berikut hanya dapat dijalankan oleh akun Telegram yang ID-nya terdaftar pada variabel `ADMIN_CHAT_ID`:

| Perintah Admin | Keterangan |
| :--- | :--- |
| `/admin` atau `/adminhelp` | **Menu Admin**: Menampilkan panduan dan daftar lengkap seluruh perintah khusus Admin |
| `/stats` | **Statistik Bot**: Menampilkan analitik pengguna unik, grup unik (Guest Mode), total pencarian profil & tag, captcha terselesaikan, status akun aktif & sisa kuota, serta status donasi QRIS (dilengkapi tombol refresh interaktif) |
| `/accounts` atau `/listacc` | Melihat daftar seluruh akun GetContact tersimpan |
| `/useacc <nama>` | Mengganti akun GetContact yang sedang aktif digunakan |
| `/addacc <nama> <token> <finalKey> <deviceId>` | Menambahkan akun GetContact baru ke database KV |
| `/delacc <nama>` | Menghapus akun GetContact dari daftar |
| `/broadcast <pesan>` atau `/bc <pesan>` | **Broadcast Pengumuman**: Mengirimkan pesan status/pengumuman resmi ke seluruh pengguna chat pribadi |
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
