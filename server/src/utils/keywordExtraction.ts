// server/src/utils/keywordExtraction.ts

// Define keyword arrays for various product attributes
const colorKeywords: string[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'pink',
  'black',
  'white',
  'gold',
  'silver',
  'multi',
  'turquoise',
  'opal',
  'amber',
  'marbled',
  'teal',
  'coral',
  'navy',
  'lavender',
  'peach',
  'mint',
  'rose gold',
  'charcoal',
  'ivory',
  'bronze',
  'pastel',
  'neon',
  'metallic',
  'aquamarine',
  'garnet',
  'citrine',
  'peridot',
  'magenta',
  'olive',
  'mauve',
  'tan',
  'indigo',
  'violet',
  'fuchsia',
  'champagne',
  'sapphire',
  'ruby',
  'emerald',
  'topaz',
  'onyx',
  'pearl',
  'gunmetal',
  'platinum',
  'burgundy',
  'lime',
  'chocolate',
];

const materialKeywords: string[] = [
  'bead',
  'metal',
  'glass',
  'crystal',
  'wood',
  'leather',
  'stone',
  'plastic',
  'fabric',
  'rhinestone',
  'sequin',
  'enamel',
  'lace',
  'mesh',
  'faux fur',
  'velvet',
];

const looksKeywords: string[] = [
  'pearl',
  'oil spill',
  'iridescent',
  'pearlescent',
  'glittered',
  'foil',
];

const styleKeywords: string[] = [
  'mermaid',
  'fringe',
  'tassel',
  'heart',
  'butterfly',
  'mandala',
  'shell',
  'crackle',
  'lightweight',
  'sapphire',
  'ruby',
  'emerald',
  'marquise',
  'hoop',
  'jacket',
  'cuff',
  'bangle',
  'stretch',
  'coil',
  'metallic',
  'crawler',
];

interface ExtractedKeywords {
  colors: string[];
  materials: string[];
  looks: string[];
  styles: string[];
}

// Function to extract keywords from a given description
export function extractKeywordsFromDescription(
  description: string
): ExtractedKeywords {
  const lowerDescription = description.toLowerCase();

  const colors = colorKeywords.filter((keyword) =>
    lowerDescription.includes(keyword)
  );
  const materials = materialKeywords.filter((keyword) =>
    lowerDescription.includes(keyword)
  );
  const looks = looksKeywords.filter((keyword) =>
    lowerDescription.includes(keyword)
  );
  const styles = styleKeywords.filter((keyword) =>
    lowerDescription.includes(keyword)
  );

  return { colors, materials, looks, styles };
}
