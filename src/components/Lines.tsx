import { useState } from "react";
import { Edge, LinePos } from "../types/bin";
import Line from "./Line";

export default function Lines({ sendUpEdges }: any) {
  const [linePositions, setLinePositions] = useState<LinePos[]>([]);

  function updateLines(edges: Edge[]) {
    sendUpEdges(edges);
  }

  return (
    <>
      {linePositions.map((pos) => (
        <Line {...pos}></Line>
      ))}
    </>
  );
}
