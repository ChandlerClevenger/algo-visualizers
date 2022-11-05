import { useEffect } from "react";
import { IRouterDropdown } from "../types/bin";
export default function RouterDropdown({
  event,
  nodeId,
  onCloseDropdown,
  onChangeRootRouter,
  onDeleteRouter,
}: IRouterDropdown) {
  const WIDTH = 125;

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
        id="router-dropdown"
        className="position-absolute"
        style={{
          background: "white",
          top: event.clientY + "px",
          left: event.clientX - WIDTH / 2 + "px",
          width: WIDTH + "px",
        }}
      >
        <div className="list-group">
          <a
            onClick={() => {
              onChangeRootRouter(nodeId);
              onCloseDropdown();
            }}
            href="#"
            className="list-group-item list-group-item-action"
          >
            make root
          </a>
          <a
            onClick={() => {
              onDeleteRouter(nodeId);
              onCloseDropdown();
            }}
            href="#"
            className="list-group-item list-group-item-action"
          >
            delete router
          </a>
        </div>
      </div>
    </>
  );
}
