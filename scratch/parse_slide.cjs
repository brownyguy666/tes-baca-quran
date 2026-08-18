const fs = require('fs');
const path = require('path');

const presXml = fs.readFileSync('d:/tes-baca-quran/scratch/pptx_extracted/ppt/presentation.xml', 'utf8');
const slideXml = fs.readFileSync('d:/tes-baca-quran/scratch/pptx_extracted/ppt/slides/slide1.xml', 'utf8');

// Parse slide size in presentation.xml
const sldSzMatch = presXml.match(/<p:sldSz\s+cx="(\d+)"\s+cy="(\d+)"/);
const slideWidthEMU = sldSzMatch ? parseInt(sldSzMatch[1]) : 9144000;
const slideHeightEMU = sldSzMatch ? parseInt(sldSzMatch[2]) : 6858000;

console.log(`Slide Dimensions (EMU): ${slideWidthEMU} x ${slideHeightEMU}`);
console.log(`Aspect Ratio: ${(slideWidthEMU / slideHeightEMU).toFixed(4)}`);

// Parse all text boxes & shapes in slide1.xml
const shapes = [];

const spRegex = /<p:sp>([\s\S]*?)<\/p:sp>/g;
let match;
while ((match = spRegex.exec(slideXml)) !== null) {
  const spContent = match[1];
  
  const nameMatch = spContent.match(/<p:cNvPr[^>]*name="([^"]*)"/);
  const name = nameMatch ? nameMatch[1] : '';

  const offMatch = spContent.match(/<a:off\s+x="(\d+)"\s+y="(\d+)"/);
  const extMatch = spContent.match(/<a:ext\s+cx="(\d+)"\s+cy="(\d+)"/);

  const x = offMatch ? parseInt(offMatch[1]) : 0;
  const actualY = offMatch ? parseInt(offMatch[2]) : 0;
  const cx = extMatch ? parseInt(extMatch[1]) : 0;
  const cy = extMatch ? parseInt(extMatch[2]) : 0;

  const textRuns = [];
  const tRegex = /<a:t>([^<]*)<\/a:t>/g;
  let tMatch;
  while ((tMatch = tRegex.exec(spContent)) !== null) {
    textRuns.push(tMatch[1]);
  }

  shapes.push({
    name,
    x,
    y: actualY,
    cx,
    cy,
    pctX: (x / slideWidthEMU * 100).toFixed(2) + '%',
    pctY: (actualY / slideHeightEMU * 100).toFixed(2) + '%',
    pctW: (cx / slideWidthEMU * 100).toFixed(2) + '%',
    pctH: (cy / slideHeightEMU * 100).toFixed(2) + '%',
    text: textRuns.join(' ')
  });
}

// Find graphicFrames (tables)
const gfRegex = /<p:graphicFrame>([\s\S]*?)<\/p:graphicFrame>/g;
while ((match = gfRegex.exec(slideXml)) !== null) {
  const gfContent = match[1];
  const nameMatch = gfContent.match(/<p:cNvPr[^>]*name="([^"]*)"/);
  const name = nameMatch ? nameMatch[1] : 'GraphicFrame';

  const offMatch = gfContent.match(/<a:off\s+x="(\d+)"\s+y="(\d+)"/);
  const extMatch = gfContent.match(/<a:ext\s+cx="(\d+)"\s+cy="(\d+)"/);
  const x = offMatch ? parseInt(offMatch[1]) : 0;
  const actualY = offMatch ? parseInt(offMatch[2]) : 0;
  const cx = extMatch ? parseInt(extMatch[1]) : 0;
  const cy = extMatch ? parseInt(extMatch[2]) : 0;

  const textRuns = [];
  const tRegex = /<a:t>([^<]*)<\/a:t>/g;
  let tMatch;
  while ((tMatch = tRegex.exec(gfContent)) !== null) {
    textRuns.push(tMatch[1]);
  }

  shapes.push({
    name,
    x,
    y: actualY,
    cx,
    cy,
    pctX: (x / slideWidthEMU * 100).toFixed(2) + '%',
    pctY: (actualY / slideHeightEMU * 100).toFixed(2) + '%',
    pctW: (cx / slideWidthEMU * 100).toFixed(2) + '%',
    pctH: (cy / slideHeightEMU * 100).toFixed(2) + '%',
    text: textRuns.join(' | ')
  });
}

// Check picture shapes
const picRegex = /<p:pic>([\s\S]*?)<\/p:pic>/g;
while ((match = picRegex.exec(slideXml)) !== null) {
  const picContent = match[1];
  const nameMatch = picContent.match(/<p:cNvPr[^>]*name="([^"]*)"/);
  const name = nameMatch ? nameMatch[1] : 'Picture';

  const offMatch = picContent.match(/<a:off\s+x="(\d+)"\s+y="(\d+)"/);
  const extMatch = picContent.match(/<a:ext\s+cx="(\d+)"\s+cy="(\d+)"/);
  const x = offMatch ? parseInt(offMatch[1]) : 0;
  const actualY = offMatch ? parseInt(offMatch[2]) : 0;
  const cx = extMatch ? parseInt(extMatch[1]) : 0;
  const cy = extMatch ? parseInt(extMatch[2]) : 0;

  shapes.push({
    name: 'PIC: ' + name,
    x,
    y: actualY,
    cx,
    cy,
    pctX: (x / slideWidthEMU * 100).toFixed(2) + '%',
    pctY: (actualY / slideHeightEMU * 100).toFixed(2) + '%',
    pctW: (cx / slideWidthEMU * 100).toFixed(2) + '%',
    pctH: (cy / slideHeightEMU * 100).toFixed(2) + '%',
    text: '[IMAGE]'
  });
}

console.log(JSON.stringify(shapes, null, 2));
