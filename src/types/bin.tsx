export interface RouterInt extends Node {
  onStop: any;
  start: any;
  onDrag: any;
  x: number;
  y: number;
  size: number;
}

export interface LinePos {
  id: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface Node {
  id: number;
  prevNode: Node | null;
  nextNode: Node | null;
  weight: number;
}

export interface Edge {
  id: number;
  firstNode: Node;
  secondNode: Node;
  weight: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}
