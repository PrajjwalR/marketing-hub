export const PRESET_TEMPLATES = [
  {
    id: '70s-retro-sale',
    name: '70s Retro Sale',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80',
    json_data: {
      version: '5.3.0',
      objects: [
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#ff6b6b', selectable: false },
        { type: 'circle', left: 540, top: 540, radius: 400, fill: '#f8c291', originX: 'center', originY: 'center' },
        { type: 'i-text', left: 540, top: 350, text: 'RETRO', fontSize: 180, fontWeight: '900', fill: '#6d214f', originX: 'center', fontFamily: 'Inter', charSpacing: 100 },
        { type: 'i-text', left: 540, top: 550, text: 'SALE', fontSize: 240, fontWeight: '900', fill: '#ffffff', originX: 'center', fontFamily: 'Inter', stroke: '#6d214f', strokeWidth: 5 },
        { type: 'i-text', left: 540, top: 850, text: 'LIMITED TIME ONLY', fontSize: 40, fontWeight: 'bold', fill: '#6d214f', originX: 'center', fontFamily: 'Inter', backgroundColor: '#ffffff', padding: 20 }
      ]
    }
  },
  {
    id: 'cozy-fashion',
    name: 'Cozy Fashion',
    thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b493021fe?auto=format&fit=crop&w=400&q=80',
    json_data: {
      version: '5.3.0',
      objects: [
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#f5f5f5', selectable: false },
        { type: 'rect', left: 100, top: 100, width: 880, height: 880, fill: '#ffffff', shadow: { color: 'rgba(0,0,0,0.05)', blur: 30, offsetX: 0, offsetY: 10 } },
        { type: 'i-text', left: 540, top: 200, text: 'COZY', fontSize: 80, fill: '#333333', originX: 'center', fontFamily: 'Inter', fontWeight: '300' },
        { type: 'i-text', left: 540, top: 300, text: 'COLLECTION', fontSize: 120, fill: '#333333', originX: 'center', fontFamily: 'Inter', fontWeight: 'bold' },
        { type: 'rect', left: 540, top: 500, width: 400, height: 400, fill: '#e0e0e0', originX: 'center' },
        { type: 'i-text', left: 540, top: 920, text: 'WWW.COZYSTYLE.COM', fontSize: 24, fill: '#999999', originX: 'center', fontFamily: 'Inter' }
      ]
    }
  },
  {
    id: 'fashion-promo',
    name: 'Fashion Promo',
    thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
    json_data: {
      version: '5.3.0',
      objects: [
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#000000', selectable: false },
        { type: 'i-text', left: 540, top: 150, text: 'NEW SEASON', fontSize: 60, fill: '#ffffff', originX: 'center', fontFamily: 'Inter' },
        { type: 'rect', left: 0, top: 300, width: 1080, height: 480, fill: '#1a1a1a' },
        { type: 'i-text', left: 100, top: 850, text: 'UP TO\n70% OFF', fontSize: 100, fontWeight: '900', fill: '#f2d412', fontFamily: 'Inter' },
        { type: 'i-text', left: 980, top: 850, text: 'SHOP NOW', fontSize: 40, fill: '#ffffff', originX: 'right', fontFamily: 'Inter', underline: true }
      ]
    }
  },
  {
    id: 'anniversary-promo',
    name: 'Anniversary Promo',
    thumbnail: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80',
    json_data: {
      version: '5.3.0',
      objects: [
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#fffbf2', selectable: false },
        { type: 'path', left: 540, top: 540, path: 'M 0 0 L 100 0 L 50 86 Z', fill: '#d4af37', scaleX: 10, scaleY: 10, originX: 'center', originY: 'center', opacity: 0.1 },
        { type: 'i-text', left: 540, top: 400, text: '10 YEARS', fontSize: 130, fontWeight: '900', fill: '#d4af37', originX: 'center', fontFamily: 'Inter' },
        { type: 'i-text', left: 540, top: 550, text: 'OF EXCELLENCE', fontSize: 50, fill: '#333333', originX: 'center', fontFamily: 'Inter', charSpacing: 200 },
        { type: 'rect', left: 440, top: 650, width: 200, height: 4, fill: '#d4af37' },
        { type: 'i-text', left: 540, top: 750, text: 'THANK YOU FOR BEING WITH US', fontSize: 30, fill: '#666666', originX: 'center', fontFamily: 'Inter' }
      ]
    }
  },
  {
    id: 'happy-holidays',
    name: 'Happy Holidays',
    thumbnail: 'https://images.unsplash.com/photo-1543589077-d652934a6ae0?auto=format&fit=crop&w=400&q=80',
    json_data: {
      version: '5.3.0',
      objects: [
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#2c3e50', selectable: false },
        { type: 'i-text', left: 540, top: 300, text: 'HAPPY', fontSize: 100, fill: '#ecf0f1', originX: 'center', fontFamily: 'Inter', fontWeight: 'light' },
        { type: 'i-text', left: 540, top: 450, text: 'HOLIDAYS', fontSize: 180, fill: '#e74c3c', originX: 'center', fontFamily: 'Inter', fontWeight: 'bold' },
        { type: 'circle', left: 200, top: 200, radius: 20, fill: '#ffffff', opacity: 0.5 },
        { type: 'circle', left: 800, top: 300, radius: 15, fill: '#ffffff', opacity: 0.3 },
        { type: 'circle', left: 400, top: 800, radius: 25, fill: '#ffffff', opacity: 0.4 },
        { type: 'i-text', left: 540, top: 700, text: 'WARM WISHES TO YOU & YOURS', fontSize: 36, fill: '#ecf0f1', originX: 'center', fontFamily: 'Inter' }
      ]
    }
  },
  {
    id: 'brunch-promo',
    name: 'Brunch Promo',
    thumbnail: 'https://images.unsplash.com/photo-1513442542250-854d436a73f2?auto=format&fit=crop&w=400&q=80',
    json_data: {
      version: '5.3.0',
      objects: [
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#fdfcf0', selectable: false },
        { type: 'i-text', left: 540, top: 250, text: 'SUNDAY', fontSize: 80, fill: '#f39c12', originX: 'center', fontFamily: 'Inter', fontStyle: 'italic' },
        { type: 'i-text', left: 540, top: 400, text: 'BRUNCH', fontSize: 200, fill: '#2c3e50', originX: 'center', fontFamily: 'Inter', fontWeight: '900' },
        { type: 'i-text', left: 540, top: 600, text: '10 AM - 2 PM', fontSize: 50, fill: '#7f8c8d', originX: 'center', fontFamily: 'Inter' },
        { type: 'rect', left: 340, top: 750, width: 400, height: 80, fill: '#2c3e50', rx: 40, ry: 40 },
        { type: 'i-text', left: 540, top: 790, text: 'RESERVE NOW', fontSize: 30, fill: '#ffffff', originX: 'center', originY: 'center', fontFamily: 'Inter', fontWeight: 'bold' }
      ]
    }
  },
  {
    id: 'anniversary-celebration',
    name: 'Celebration',
    thumbnail: 'https://images.unsplash.com/photo-1471967183320-ee018f6e114a?auto=format&fit=crop&w=400&q=80',
    json_data: {
      version: '5.3.0',
      objects: [
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#6c5ce7', selectable: false },
        { type: 'triangle', left: 100, top: 100, width: 200, height: 200, fill: '#a29bfe', opacity: 0.5 },
        { type: 'i-text', left: 540, top: 400, text: 'JOIN THE', fontSize: 80, fill: '#ffffff', originX: 'center', fontFamily: 'Inter' },
        { type: 'i-text', left: 540, top: 550, text: 'PARTY', fontSize: 220, fill: '#fdcb6e', originX: 'center', fontFamily: 'Inter', fontWeight: '900' },
        { type: 'i-text', left: 540, top: 800, text: 'FRIDAY, OCT 24TH | 8 PM', fontSize: 40, fill: '#ffffff', originX: 'center', fontFamily: 'Inter', fontWeight: 'bold' }
      ]
    }
  },
  {
    id: 'winter-party',
    name: 'Winter Party',
    thumbnail: 'https://images.unsplash.com/photo-1542601039-29adde6144e1?auto=format&fit=crop&w=400&q=80',
    json_data: {
      version: '5.3.0',
      objects: [
        { type: 'rect', left: 0, top: 0, width: 1080, height: 1080, fill: '#0a3d62', selectable: false },
        { type: 'rect', left: 0, top: 800, width: 1080, height: 280, fill: '#3c6382' },
        { type: 'i-text', left: 100, top: 200, text: 'WINTER', fontSize: 150, fill: '#ffffff', fontFamily: 'Inter', fontWeight: '900' },
        { type: 'i-text', left: 100, top: 380, text: 'WONDERLAND', fontSize: 80, fill: '#82ccdd', fontFamily: 'Inter', fontWeight: 'bold' },
        { type: 'circle', left: 900, top: 100, radius: 150, fill: '#ffffff', opacity: 0.1 },
        { type: 'i-text', left: 540, top: 940, text: 'GET TICKETS AT WINTERCOOL.COM', fontSize: 36, fill: '#ffffff', originX: 'center', fontFamily: 'Inter' }
      ]
    }
  }
];
