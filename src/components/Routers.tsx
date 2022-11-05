import { useRef, useState } from "react";
import { DraggableData } from "react-draggable";
import { Node, IRouterDropdown } from "../types/bin";
import Router from "./DraggableRouter";
import RouterDropdown from "./RouterDropdown";
const ROUTER_SIZE = 75;
const CENTER_OFFSET = ROUTER_SIZE / 2;

export default function Routers({
  nodes,
  onAddNewRouter,
  onSendClickedRouterData,
  onSendRouterPos,
  onSendRootId,
  onSendDeleteRouter,
}: any) {
  let currentDraggedRef = useRef({ x: 0, y: 0 });
  let [dropdownData, setDropdownData] = useState<IRouterDropdown | null>(null);

  function stop(e: MouseEvent, info: DraggableData) {
    const DRAGGED_ID = Number(info.node.id);
    const { x, y } = { ...info };
    // Must move at least 100 px out of start area
    if (x < 100 && y < 100) return;
    // Detect click
    if (currentDraggedRef.current.x == x && currentDraggedRef.current.y == y) {
      switch (e.button) {
        case 0:
          handleLeftClick(info);
          break;
        case 2:
          handleRightClick(e, DRAGGED_ID);
          break;
        default:
          break;
      }
      return;
    }
    if (DRAGGED_ID == nodes.length - 1) {
      // Tell Board to make new node
      onAddNewRouter();
    }
  }

  function start(e: MouseEvent, info: DraggableData) {
    currentDraggedRef.current = { x: info.x, y: info.y };
  }

  function drag(e: MouseEvent, info: DraggableData) {
    onSendRouterPos({
      id: Number(info.node.id),
      x: info.x + CENTER_OFFSET,
      y: info.y + CENTER_OFFSET,
    });
  }

  function generateId(uid: string): number {
    return parseInt(uid.replace("-", ""), 16);
  }

  function handleRightClick(event: MouseEvent, nodeId: number) {
    setDropdownData({
      event: event,
      nodeId: nodeId,
      onCloseDropdown: () => {
        setDropdownData(null);
      },
      onChangeRootRouter: (routerId) => {
        onSendRootId(routerId);
      },
      onDeleteRouter: (routerId) => {
        onSendDeleteRouter(routerId);
      },
    });
  }

  function handleLeftClick(info: DraggableData) {
    onSendClickedRouterData(
      nodes.find((r: Node) => {
        return r.id == Number(info.node.id);
      }),
      {
        id: Number(info.node.id),
        x: info.x + CENTER_OFFSET,
        y: info.y + CENTER_OFFSET,
      }
    );
  }
  return (
    <>
      <>
        {nodes.map((router: Node, index: number) => (
          <Router
            key={index}
            id={router.id}
            onStart={start}
            onStop={stop}
            onDrag={drag}
            size={75}
            prevNode={router.prevNode}
            weight={router.weight}
          ></Router>
        ))}
      </>
      <>
        {dropdownData ? (
          <RouterDropdown {...dropdownData}></RouterDropdown>
        ) : null}
      </>
    </>
  );
}
