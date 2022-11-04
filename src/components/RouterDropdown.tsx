import { useEffect } from "react";
import { IRouterDropdown } from "../types/bin";
export default function RouterDropdown({
  event,
  nodeId,
  onCloseDropdown,
}: IRouterDropdown) {
  const width = 200;
  function handleMouseMove(e: MouseEvent) {
    const isOverDropdown = (e.target as HTMLElement).classList.contains(
      "list-group-item"
    );
    if (!isOverDropdown) {
      onCloseDropdown();
    }
  }

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  });

  return (
    <>
      <div
        className="position-absolute"
        style={{
          background: "white",
          top: event.clientY + "px",
          left: event.clientX - width / 2 + "px",
          width: width + "px",
        }}
      >
        <div className="list-group">
          <a
            href="#"
            className="list-group-item list-group-item-action text-center"
          >
            {nodeId}
          </a>
          <a href="#" className="list-group-item list-group-item-action">
            Cras justo odio
          </a>
        </div>
      </div>
    </>
  );
}
