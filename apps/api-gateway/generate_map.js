const fs = require('fs');
const svg = fs.readFileSync('C:/Users/ikour/Projects/souvera/map/Caribbean/map.svg', 'utf8');

let reactSvg = svg
  .replace(/<!--[\s\S]*?-->/g, '') // remove HTML comments
  // remove string styling entirely, we'll style with CSS
  .replace(/style="[^"]+"/g, '')
  .replace(/xmlns:svg="[^"]+"/g, '')
  .replace(/xmlns="[^"]+"/g, '')
  .replace('<svg ', '<svg {...props} ');

const componentStr = `import React from 'react';

export function CaribbeanMapSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    ${reactSvg}
  );
}
`;

fs.writeFileSync('src/components/map/caribbean-map-svg.tsx', componentStr);
console.log('Removed style tags from SVG!');
