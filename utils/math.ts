import { MathUtils } from 'three';
import { CONFIG } from '../constants';

// Generate a random point inside a sphere
export const getRandomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

// Generate a point on a cone surface (Tree)
// Uses rejection sampling or spiral logic for even distribution
export const getTreePoint = (height: number, maxRadius: number, ratio: number): [number, number, number] => {
  // y goes from -height/2 to height/2
  const y = (ratio - 0.5) * height; 
  
  // Radius at this height (linear taper)
  // At bottom (ratio=0), radius is maxRadius. At top (ratio=1), radius is 0.
  const currentRadius = maxRadius * (1 - ratio);
  
  const angle = Math.random() * Math.PI * 2;
  // Push points slightly inward randomly for volume
  const r = currentRadius * Math.sqrt(Math.random()); 

  return [
    Math.cos(angle) * r,
    y,
    Math.sin(angle) * r
  ];
};