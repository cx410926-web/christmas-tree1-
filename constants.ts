import { Color } from 'three';

// Colors
export const COLORS = {
  // Richer, deeper Emerald for the main body - slightly lifted for visibility
  EMERALD_DEEP: new Color('#043b22'), // Brighter deep green
  EMERALD_LIGHT: new Color('#10b966'), // Very vibrant jewel-tone green
  
  // High polished gold - pushed towards a very bright, almost white-gold highlight
  GOLD_METALLIC: new Color('#FFD700'), 
  GOLD_DARK: new Color('#EDAA00'), // Warmer amber gold
  
  // Christmas Red
  RED_VELVET: new Color('#c91414'), // Slightly brighter red base
  
  WHITE_WARM: new Color('#FFF9E8'),
};

// Tree Configuration
export const CONFIG = {
  FOLIAGE_COUNT: 10000, 
  ORNAMENT_COUNT: 250, 
  TREE_HEIGHT: 15,
  TREE_RADIUS: 6.5, // Increased from 6 to 6.5 for a fuller look
  SCATTER_RADIUS: 30,
};