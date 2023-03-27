/*
Liscence: GNU General Public License v2.0
Author: Chandler Clevenger
Date: 3/26/2023
*/

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
  prevNode: Node | undefined; //Initially will be unset
  weight: number;
  table?: Map<number, IDistance>; // Destination NodeId and Distance info
}

export interface IDistance {
  destination: number;
  distance: number;
  nextHop: number;
}

export interface IConnection {
  selfRouterId: number;
  otherRouterId: number;
  weight: number;
  lineId: number;
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

export interface IRouterDropdown {
  event: MouseEvent;
  nodeId: number;
  onCloseDropdown(): void;
  onChangeRootRouter(routerId: number): void;
}

export interface IRouters {
  onSendClickedRouterData(node: Node | undefined, { id, x, y }: NodePos): void;
  onSendRouterPos({ id, x, y }: NodePos): void;
  onSendRootId(routerId: number): void;
}

export enum Algorithms {
  BellmenFord,
  Dijkstra,
}
