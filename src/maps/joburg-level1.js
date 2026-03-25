export const joburgLevel1 = {

  worldWidth: 3200,
  worldHeight: 500,

  // Background buildings (decorative, no physics)
  buildings: [
    { x: 100,  y: 300, w: 60,  h: 160 },
    { x: 200,  y: 260, w: 80,  h: 200 },
    { x: 320,  y: 220, w: 50,  h: 240 }, // Ponte Tower vibe
    { x: 420,  y: 280, w: 90,  h: 180 },
    { x: 560,  y: 240, w: 70,  h: 220 },
    { x: 680,  y: 200, w: 55,  h: 260 }, // Hillbrow Tower vibe
    { x: 780,  y: 270, w: 100, h: 190 },
    { x: 930,  y: 230, w: 65,  h: 230 },
    { x: 1050, y: 250, w: 80,  h: 210 },
    { x: 1180, y: 210, w: 60,  h: 250 },
    { x: 1400, y: 240, w: 70,  h: 220 },
    { x: 1600, y: 200, w: 90,  h: 260 },
    { x: 1800, y: 230, w: 65,  h: 230 },
    { x: 2000, y: 250, w: 80,  h: 210 },
    { x: 2200, y: 220, w: 70,  h: 240 },
    { x: 2500, y: 200, w: 100, h: 260 },
    { x: 2800, y: 240, w: 80,  h: 220 },
    { x: 3000, y: 210, w: 60,  h: 250 },
  ],

  // Platforms (collideable rooftops + ground)
  platforms: [
    { x: 0,    y: 460, w: 400,  h: 20, label: 'ground-start' },
    { x: 450,  y: 420, w: 160,  h: 20, label: 'rooftop-1' },
    { x: 680,  y: 380, w: 140,  h: 20, label: 'rooftop-2' },
    { x: 900,  y: 340, w: 180,  h: 20, label: 'rooftop-3' },
    { x: 1160, y: 370, w: 160,  h: 20, label: 'rooftop-4' },
    { x: 1400, y: 320, w: 200,  h: 20, label: 'rooftop-5' },
    { x: 1680, y: 350, w: 180,  h: 20, label: 'rooftop-6' },
    { x: 1940, y: 300, w: 200,  h: 20, label: 'rooftop-7' },
    { x: 2220, y: 330, w: 160,  h: 20, label: 'rooftop-8' },
    { x: 2460, y: 280, w: 220,  h: 20, label: 'rooftop-9' },
    { x: 2760, y: 310, w: 180,  h: 20, label: 'rooftop-10' },
    { x: 3000, y: 460, w: 200,  h: 20, label: 'ground-end' },
  ],

  // Obstacles (touch = death)
  obstacles: [
    { x: 580,  y: 400, w: 20, h: 40, type: 'spike' },
    { x: 820,  y: 360, w: 20, h: 40, type: 'spike' },
    { x: 1080, y: 350, w: 20, h: 40, type: 'spike' },
    { x: 1340, y: 300, w: 20, h: 40, type: 'spike' },
    { x: 1620, y: 330, w: 20, h: 40, type: 'spike' },
    { x: 1880, y: 280, w: 20, h: 40, type: 'spike' },
    { x: 2160, y: 310, w: 20, h: 40, type: 'spike' },
    { x: 2700, y: 290, w: 20, h: 40, type: 'spike' },
  ],

  // Player start position
  playerStart: { x: 80, y: 400 },

  // Win condition: reach this x position
  goalX: 3100,
};