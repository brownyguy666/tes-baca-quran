const fs = require('fs');
const buffer = fs.readFileSync('d:/tes-baca-quran/scratch/pptx_extracted/ppt/media/image1.png');
const width = buffer.readUInt32BE(16);
const height = buffer.readUInt32BE(20);
console.log(`image1.png dimensions: ${width} x ${height} px`);
console.log(`image1.png aspect ratio: ${(width / height).toFixed(4)}`);
