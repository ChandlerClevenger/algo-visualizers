import React from "react";

export interface RouterInt extends Node {
  onDrag: any;
  onStart: any;
  onStop: any;
  size: number;
}

export interface LinePos {
  id: number; // Id of Edge
  firstConnector: NodePos;
  secondConnector: NodePos;
  weight: number;
}

export type LineData = LinePos & {
  clicked(event: React.MouseEvent<SVGLineElement | SVGTextElement>): void; // Updates weight of line
};

export interface NodePos {
  id: number; // Id of Node
  x: number;
  y: number;
}

export interface Node {
  id: number;
  prevNode?: Node; //Initially will be undefined
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
