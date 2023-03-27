/*
Liscence: GNU General Public License v2.0
Author: Chandler Clevenger
Date: 3/26/2023
*/

import React, { useRef, useContext } from "react";
import Draggable from "react-draggable";
import { Algorithms, RouterInt } from "../types/bin";
import { NodeContext } from "./Board";

export default function Router({
  id,
  onStart,
  onStop,
  onDrag,
  size,
  weight,
  table,
}: RouterInt) {
  const draggableRef = useRef<Draggable>(null);
  const { algorithm } = useContext(NodeContext);
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
        {algorithm === Algorithms.Dijkstra ? (
          <p className="text-center">Weight: {weight}</p>
        ) : null}
        {algorithm === Algorithms.BellmenFord ? (
          <>
            <table className="table table-dark table-hover table-responsive style-3 bellmantable">
              <thead>
                <tr>
                  <th scope="col">Dest</th>
                  <th scope="col">Dist</th>
                  <th scope="col">nextHop</th>
                </tr>
              </thead>
              <tbody>
                {[...(table?.values() ?? [])].map((e) => {
                  return (
                    <tr>
                      <td>{e.destination}</td>
                      <td>{e.distance}</td>
                      <td>{e.nextHop}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : null}
      </div>
    </Draggable>
  );
}
