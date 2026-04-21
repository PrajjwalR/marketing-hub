/**
 * Categorized vector shape library for the designer.
 * Contains SVG path data for primitives, UI icons, and abstract decorations.
 */

export interface ShapeItem {
  id: string;
  name: string;
  path: string;
}

export interface ShapeCategory {
  id: string;
  name: string;
  items: ShapeItem[];
}

export const SHAPE_LIBRARY: ShapeCategory[] = [
  {
    id: 'basics',
    name: 'Essentials',
    items: [
      { id: 'rect', name: 'Rectangle', path: 'M 0 0 H 100 V 100 H 0 Z' },
      { id: 'circle', name: 'Circle', path: 'M 50 0 A 50 50 0 1 1 50 100 A 50 50 0 1 1 50 0' },
      { id: 'triangle', name: 'Triangle', path: 'M 50 0 L 100 100 L 0 100 Z' },
      { id: 'hexagon', name: 'Hexagon', path: 'M 25 0 L 75 0 L 100 50 L 75 100 L 25 100 L 0 50 Z' },
      { id: 'star_5', name: '5-Point Star', path: 'M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z' },
      { id: 'pill', name: 'Pill', path: 'M 30 0 H 70 A 30 30 0 0 1 70 60 H 30 A 30 30 0 0 1 30 0' },
    ]
  },
  {
    id: 'abstract',
    name: 'Abstract',
    items: [
      { id: 'blob_1', name: 'Organic Blob', path: 'M45,-57.2C58.1,-48.4,68.2,-33.5,72.4,-17.1C76.5,-0.8,74.7,16.9,67.1,32.2C59.5,47.4,46.1,60.1,30.5,66.6C14.9,73.1,-2.9,73.4,-18.8,67.8C-34.6,62.1,-48.4,50.6,-58.5,36.4C-68.5,22.2,-74.8,5.4,-72.1,-11C-69.4,-27.4,-57.8,-43.3,-43.3,-51.8C-28.8,-60.2,-11.4,-61.2,3.3,-65.1C18,-69,32,-75.9,45,-57.2Z' },
      { id: 'wave_1', name: 'Soft Wave', path: 'M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,138.7C960,117,1056,107,1152,117.3C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z' },
      { id: 'splash', name: 'Dynamic Splash', path: 'M37.5,1.4C51,-1.5,61.9,13.8,70,27.3C78.1,40.8,83.5,52.5,78.2,63.1C72.9,73.7,56.9,83.2,43.4,85.6C29.9,88.1,18.8,83.5,6.2,76.5C-6.4,69.5,-20.5,60.1,-26.2,47.9C-31.9,35.6,-29.2,20.5,-21.5,8C-13.8,-4.5,-1.1,-14.3,13.5,-13C28.2,-11.7,35,-4,37.5,1.4Z' },
      { id: 'corner_accent', name: 'Corner Edge', path: 'M 0 0 L 100 0 L 100 10 L 10 10 L 10 100 L 0 100 Z' },
    ]
  },
  {
    id: 'ui_social',
    name: 'Social & UI',
    items: [
      { id: 'heart', name: 'Heart', path: 'M 50 100 L 45 95 C 20 70 0 50 0 30 A 25 25 0 0 1 50 25 A 25 25 0 0 1 100 30 C 100 50 80 70 55 95 Z' },
      { id: 'chat_bubble', name: 'Chat Bubble', path: 'M 10 0 H 90 C 95.5 0 100 4.5 100 10 V 70 C 100 75.5 95.5 80 90 80 H 40 L 10 100 V 80 H 10 C 4.5 80 0 75.5 0 70 V 10 C 0 4.5 4.5 0 10 0 Z' },
      { id: 'search', name: 'Search Icon', path: 'M 40 0 A 40 40 0 1 0 40 80 A 40 40 0 0 0 70 70 L 100 100 L 110 90 L 80 60 A 40 40 0 0 0 40 0 Z M 40 10 A 30 30 0 1 1 40 70 A 30 30 0 0 1 40 10 Z' },
      { id: 'like', name: 'Like Hand', path: 'M 20 100 V 40 H 40 L 50 0 H 70 L 70 40 H 100 V 100 Z' },
      { id: 'cursor', name: 'Cursor Pointer', path: 'M 0 0 L 40 100 L 50 60 L 90 50 Z' },
      { id: 'location', name: 'Pin Marker', path: 'M 50 0 C 30 0 15 15 15 35 C 15 55 50 100 50 100 C 50 100 85 55 85 35 C 85 15 70 0 50 0 Z M 50 20 A 15 15 0 1 1 50 50 A 15 15 0 0 1 50 20 Z' },
    ]
  }
];
