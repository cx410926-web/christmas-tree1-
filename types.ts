export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface DualPosition {
  x: number;
  y: number;
  z: number;
}

export interface OrnamentData {
  id: number;
  scatterPos: [number, number, number];
  treePos: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  color: string;
  type: 'gift' | 'bauble';
  speedFactor: number; // For varying movement speeds
}