import React, { useRef } from "react";
import Draggable from "react-draggable";
import { RouterInt } from "../types/bin";

export default function Router({
  onStop,
  onDrag,
  id,
  x,
  y,
  start,
  size,
  weight,
}: RouterInt) {
  const draggableRef = useRef<Draggable>(null);

  function stopMenu(
    e: React.MouseEvent<HTMLImageElement | HTMLParagraphElement, MouseEvent>
  ) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  return (
    <Draggable
      ref={draggableRef}
      allowAnyClick={true}
      onStart={start}
      onStop={onStop}
      onDrag={onDrag}
      bounds="#board"
      defaultPosition={{ x: 0, y: 0 }}
      handle=".router"
    >
      <div
        className="position-absolute d-inline-block router cursor-grab"
        style={{ transform: `translate(${x}px, ${y}px)`, width: size }}
        id={id.toString()}
        onContextMenu={stopMenu}
      >
        <img
          draggable={false}
          className="w-100"
          onClick={(e) => e.preventDefault()}
          src="../images/router.png"
          alt="Placeable Router"
        />
        <p className="text-sm text-center">Id: {id}</p>
        <p className="text-sm text-center">
          Weight: {weight == -1 ? "INF" : weight}
        </p>
      </div>
    </Draggable>
  );
}
