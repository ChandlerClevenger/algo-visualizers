import { useState } from "react";
import { DraggableData } from "react-draggable";
import { Edge, RouterInt } from "../types/bin";
import Router from "./DraggableRouter";

export default function Routers({ sendUpEdges }: any) {
  const ROUTER_SIZE = 75;
  const LINE_OFFSET = ROUTER_SIZE / 2;
  const INITIAL_ROUTER: RouterInt = {
    onStop: drop,
    start: start,
    onDrag: drag,
    id: 0,
    x: 0,
    y: 0,
    prevNode: null,
    nextNode: null,
    size: ROUTER_SIZE,
    weight: -1,
  };
  const [routers, setRouters] = useState<RouterInt[]>([INITIAL_ROUTER]);
  function updateEdges(edges: Edge[]): void {
    sendUpEdges(edges);
  }

  function drag(e: MouseEvent, info: DraggableData): void {}

  // Set draggables current position to check if click or drag
  // This is checked in the drop function
  function start(e: MouseEvent, info: DraggableData): void {}

  function drop(e: MouseEvent, info: DraggableData): void {}

  return (
    <>
      {routers.map((router, index) => (
        <Router key={index} {...router}></Router>
      ))}
    </>
  );
}
