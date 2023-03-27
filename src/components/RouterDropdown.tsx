/*
Liscence: GNU General Public License v2.0
Author: Chandler Clevenger
Date: 3/26/2023
*/

import { useContext, useEffect } from "react";
import { IRouterDropdown } from "../types/bin";
import { NodeContext } from "./Board";
export default function RouterDropdown({
  event,
  nodeId,
  onCloseDropdown,
  onChangeRootRouter,
}: IRouterDropdown) {
  const WIDTH = 125;

  const { deleteRouter } = useContext(NodeContext);
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
              deleteRouter(nodeId);
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
