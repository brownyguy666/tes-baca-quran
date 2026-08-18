// Let's measure the exact pixel coordinates on the 1492 x 1054 image
// 1492 px width, 1054 px height

// 1. Top Left Pill (Nomor Sertifikat):
// Box: x: 145 to 420 (w: 275), y: 104 to 150 (h: 46) -> center x: 282.5 (18.93%), center y: 127 (12.05%)
// In %: left: 9.72%, top: 9.87%, width: 18.43%, height: 4.36%

// 2. Top Right Pill (Tanggal Terbit):
// Box: x: 1094 to 1350 (w: 256), y: 104 to 150 (h: 46) -> center x: 1222 (81.9%), center y: 127 (12.05%)
// In %: left: 73.32%, top: 9.87%, width: 17.16%, height: 4.36%

// 3. Banyuwangi line:
// "Banyuwangi, _________" -> text starts around x: 1210 (81.1%), y: 162 (15.37%)

// 4. Identitas Siswa:
// - Nama Lengkap Siswa line: y is at 440px -> baseline text at y: 418px (top: 39.66%)
// - Kelas line: y is at 478px -> baseline text at y: 456px (top: 43.26%)
// - NISN line: y is at 478px -> baseline text at y: 456px (top: 43.26%)

// 5. Materi Ujian:
// - Surat & Ayat line: y is at 545px -> baseline text at y: 522px (top: 49.53%)

// 6. Rincian Skor Table (Table column Skor is from x: 694 to 814, width 120px):
// - Header (SKOR (0-100)): y: 570px to 596px
// - Row 1 (Makharijul Huruf): y: 597px to 625px (center y: 611px -> 57.97%)
// - Row 2 (Kaidah Tajwid): y: 626px to 653px (center y: 639.5px -> 60.67%)
// - Row 3 (Kelancaran & Adab): y: 654px to 682px (center y: 668px -> 63.38%)
// - Row 4 (TOTAL SKOR AKHIR): y: 683px to 710px (center y: 696.5px -> 66.08%)

// 7. Checkbox square boxes (in image, x: 860px to 876px -> left: 57.64%, width: 16px -> 1.07%):
// - Mumtaz square: y: 610px to 626px (top: 57.87%)
// - Mahir square: y: 636px to 652px (top: 60.34%)
// - Menengah square: y: 663px to 679px (top: 62.90%)
// - Dasar square: y: 689px to 705px (top: 65.37%)
// - Remidi square: y: 715px to 731px (top: 67.84%)

// 8. Catatan Bimbingan / Evaluasi Guru:
// Dotted lines start at y: 785px (74.48%)

// 9. Nama Guru Penguji:
// Line is at y: 940px (89.18%) -> text sits above line at y: 914px (86.72%)

console.log('Coordinates calculated.');
