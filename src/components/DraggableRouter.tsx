import React, { useRef } from "react";
import Draggable from "react-draggable";
import { RouterInt } from "../types/bin";

export default function Router({
  id,
  onStart,
  onStop,
  onDrag,
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
      onStart={onStart}
      onStop={onStop}
      onDrag={onDrag}
      bounds="#board"
      defaultPosition={{ x: 0, y: 0 }}
      handle=".router"
    >
      <div
        className="position-absolute d-inline-block router"
        style={{ width: size }}
        id={id.toString()}
        onContextMenu={stopMenu}
      >
        <img
          id={`router-img-${id}`}
          draggable={false}
          className="w-100"
          onClick={(e) => e.preventDefault()}
          src="../images/router.png"
          alt="Placeable Router"
        />
        <p className="text-center m-0">Id: {id}</p>
        <p className="text-center">Weight: {weight}</p>
      </div>
    </Draggable>
  );
}
