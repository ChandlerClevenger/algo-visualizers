export interface RouterInt extends Node {
  onDrag: any;
  onStart: any;
  onStop: any;
  size: number;
}

export interface LinePos {
  id: number;
  firstConnector: NodePos;
  secondConnector: NodePos;
  weight: number;
}

export interface NodePos {
  id: number; // Id of Node
  x: number;
  y: number;
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

export interface BoardData {
  graph: Graph;
  clickedRouterId: number;
  rootRouterId: number;
}
