const fs = require('fs');

const slideXml = fs.readFileSync('d:/tes-baca-quran/scratch/pptx_extracted/ppt/slides/slide1.xml', 'utf8');
const commentXml = fs.readFileSync('d:/tes-baca-quran/scratch/pptx_extracted/ppt/comments/comment1.xml', 'utf8');

// Parse comments
const comments = [];
const cmRegex = /<p:cm\s+authorId="(\d+)"\s+idx="(\d+)"[^>]*><p:pos\s+x="(\d+)"\s+y="(\d+)"\/><p:text>([^<]*)<\/p:text><\/p:cm>/g;
let cmMatch;
while ((cmMatch = cmRegex.exec(commentXml)) !== null) {
  comments.push({
    idx: cmMatch[2],
    x: parseInt(cmMatch[3]),
    y: parseInt(cmMatch[4]),
    text: cmMatch[5]
  });
}

console.log('Comments from user:');
console.log(comments);

// Check image1.png resolution
console.log('\nChecking image1.png...');
const imgStats = fs.statSync('d:/tes-baca-quran/scratch/pptx_extracted/ppt/media/image1.png');
console.log('image1.png size in bytes:', imgStats.size);
