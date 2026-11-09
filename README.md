# Sidang Nalar

Game belajar teks diskusi untuk kelas VIII (Fase D, Kurikulum Merdeka). Pemain jadi pengacara yang menguji argumen di ruang sidang bergaya game jadul. Semua karakter dan tampilan dibuat sendiri, tidak memakai karakter dari game lain.

Isi game mengikuti Modul Ajar Teks Diskusi: struktur teks, tiga pertanyaan uji, konjungsi pertentangan, sanggahan yang santun, dan lima tahap menyusun teks diskusi.

## Isi folder

```
sidang-nalar/
  index.html              halaman utama
  css/style.css           tampilan
  js/game.js              alur game, soal, dan dialog
  sw.js                   penyimpanan offline
  manifest.webmanifest    pengaturan aplikasi yang bisa dipasang
  icons/                  ikon aplikasi
  fonts/                  font Pixelify Sans dan Press Start 2P (lisensi OFL)
  .github/workflows/      otomatis menerbitkan ke GitHub Pages
```

Tidak ada proses build. Semua berkas langsung dipakai apa adanya.

## Menerbitkan lewat GitHub Pages

1. Buat repositori baru di GitHub, misalnya `sidang-nalar`.
2. Unggah seluruh isi folder ini ke cabang `main`. Pastikan folder `.github` ikut terunggah.
3. Buka Settings, lalu Pages, lalu pada Source pilih **GitHub Actions**.
4. Tunggu proses di tab Actions selesai. Alamatnya akan berbentuk `https://username.github.io/sidang-nalar/`.

Setiap kali ada perubahan yang di-push ke `main`, situs diperbarui otomatis.

## Memasang seperti aplikasi

Buka alamat Pages di HP.

1. Android (Chrome): menu titik tiga, lalu **Instal aplikasi** atau **Tambahkan ke layar utama**.
2. iPhone (Safari): tombol Bagikan, lalu **Tambah ke Layar Utama**.
3. Laptop (Chrome atau Edge): klik ikon pasang di ujung kanan kolom alamat.

Setelah dibuka sekali dengan internet, game bisa dimainkan tanpa internet.

## Mencoba di komputer sendiri

Service worker hanya jalan lewat `https` atau `localhost`, jadi jangan buka dengan klik dua kali pada `index.html`. Jalankan server lokal dari dalam folder ini:

```
python3 -m http.server 8080
```

Lalu buka `http://localhost:8080`.

## Mengubah isi soal

Semua teks ada di `js/game.js`:

1. `PARAS` berisi sembilan paragraf teks diskusi, dengan kunci jawaban di `PA` dan penjelasan di `PEX` serta `PH`.
2. `DINDA` dan `RAKA` berisi kesaksian tiap saksi. Isi `flaw` dengan `alasan`, `cek`, atau `umum` untuk argumen yang lemah, dan kosongkan untuk argumen yang kuat.
3. `CONJ` berisi kalimat latihan konjungsi.

Setelah mengubah berkas apa pun, naikkan angka `VERSI` di `sw.js` (misalnya dari `v1` ke `v2`) supaya pengguna yang sudah memasang aplikasi menerima pembaruan.

## Lisensi font

Pixelify Sans dan Press Start 2P memakai SIL Open Font License. Berkas lisensinya ada di folder `fonts`.
