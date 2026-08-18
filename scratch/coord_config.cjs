const fs = require('fs');

// We want to calculate the exact percentage and pixel coordinates on an 1122x794 canvas or 1492x1054 canvas.
// The background image is 1492 x 1054.
// Let's create an exact mapping helper.

const config = {
  canvasWidth: 1492,
  canvasHeight: 1054,
  fields: {
    nomorSertifikat: { x: 145, y: 110, w: 275, h: 42, align: 'center', fontSize: 13, fontWeight: 'bold' },
    tanggalTerbit:   { x: 1095, y: 110, w: 255, h: 42, align: 'center', fontSize: 14, fontWeight: 'bold' },
    banyuwangiDate:  { x: 1205, y: 168, w: 130, h: 20, align: 'left', fontSize: 11, fontWeight: '600' },
    
    namaSiswa:       { x: 520, y: 433, w: 630, h: 28, align: 'left', fontSize: 18, fontWeight: '900', color: '#14532d' },
    kelas:           { x: 520, y: 468, w: 290, h: 24, align: 'left', fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
    nisn:            { x: 940, y: 468, w: 210, h: 24, align: 'left', fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
    
    materiUjian:     { x: 520, y: 532, w: 630, h: 26, align: 'left', fontSize: 16, fontWeight: 'bold', color: '#14532d' },
    
    skorMakhraj:     { x: 694, y: 633, w: 120, h: 24, align: 'center', fontSize: 15, fontWeight: '900', fontFamily: 'monospace' },
    skorTajwid:      { x: 694, y: 660, w: 120, h: 24, align: 'center', fontSize: 15, fontWeight: '900', fontFamily: 'monospace' },
    skorKelancaran:  { x: 694, y: 686, w: 120, h: 24, align: 'center', fontSize: 15, fontWeight: '900', fontFamily: 'monospace' },
    skorTotal:       { x: 694, y: 712, w: 120, h: 24, align: 'center', fontSize: 17, fontWeight: '900', color: '#14532d', fontFamily: 'monospace' },
    
    // Checkboxes (x: 860, y coordinates)
    boxMumtaz:       { x: 860, y: 614, w: 18, h: 18 },
    boxMahir:        { x: 860, y: 641, w: 18, h: 18 },
    boxMenengah:     { x: 860, y: 666, w: 18, h: 18 },
    boxDasar:        { x: 860, y: 692, w: 18, h: 18 },
    boxRemidi:       { x: 860, y: 718, w: 18, h: 18 },
    
    catatanGuru:     { x: 325, y: 782, w: 840, h: 48, align: 'left', fontSize: 12.5, fontWeight: '600', color: '#1e293b' },
    
    stempelSekolah:  { x: 255, y: 865, w: 125, h: 125 },
    namaPenguji:     { x: 875, y: 955, w: 245, h: 24, align: 'center', fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  }
};

console.log(JSON.stringify(config, null, 2));
