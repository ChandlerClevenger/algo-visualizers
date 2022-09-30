import { useEffect, useRef, useState } from "react";
import { DraggableData } from "react-draggable";
import { Node, NodePos, RouterInt } from "../types/bin";
import Router from "./DraggableRouter";
import { uuid } from "uuidv4";
const ROUTER_SIZE = 75;
const LINE_OFFSET = ROUTER_SIZE / 2;

export default function Routers({
  sendUpNodes,
  sendUpClickedNodeData,
  sendUpNodePos,
}: any) {
  const INITIAL_ROUTER: RouterInt = {
    id: 0,
    onDrag: drag,
    onStart: start,
    onStop: stop,
    prevNode: null,
    nextNode: null,
    size: ROUTER_SIZE,
    weight: Infinity,
  };

  const [routers, setRouters] = useState<RouterInt[]>([INITIAL_ROUTER]);
  let currentDraggedRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    sendUpNodes([...routers]);
  }, [routers]);

  function stop(e: MouseEvent, info: DraggableData) {
    const DRAGGED_ID = Number(info.node.id);
    const { x, y } = { ...info };
    // Must move at least 100 px out of start area
    if (x < 100 && y < 100) return;
    // Detect click
    if (currentDraggedRef.current.x == x && currentDraggedRef.current.y == y) {
      sendUpClickedNodeData(
        routers.find((r) => {
          return r.id == DRAGGED_ID;
        }),
        { id: DRAGGED_ID, x: info.x, y: info.y }
      );
      return;
    }
    if (DRAGGED_ID == routers.length - 1) {
      setRouters((oldR) => [
        ...oldR,
        {
          id: routers.length,
          onStart: start,
          onStop: stop,
          onDrag: drag,
          prevNode: null,
          nextNode: null,
          size: ROUTER_SIZE,
          weight: Infinity,
        },
      ]);
    }
  }

  function start(e: MouseEvent, info: DraggableData) {
    currentDraggedRef.current = { x: info.x, y: info.y };
  }

  function drag(e: MouseEvent, info: DraggableData) {
    sendUpNodePos({ id: Number(info.node.id), x: info.x, y: info.y });
  }

  function generateId(uid: string): number {
    return parseInt(uid.replace("-", ""), 16);
  }

  return (
    <>
      {routers.map((router, index) => (
        <Router
          key={index}
          id={router.id}
          onStart={start}
          onStop={stop}
          onDrag={drag}
          size={router.size}
          nextNode={router.nextNode}
          prevNode={router.prevNode}
          weight={router.weight}
        ></Router>
      ))}
    </>
  );
}
