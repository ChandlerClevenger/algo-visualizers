import { LinePos } from "../types/bin";
import Line from "./Line";

export default function Lines({ linePositions }: any) {
  return (
    <svg id="lines" className="position-absolute w-100 h-100">
      {linePositions.map((linePos: LinePos, index: number) => (
        <Line
          key={index}
          id={linePos.id}
          firstConnector={linePos.firstConnector}
          secondConnector={linePos.secondConnector}
          weight={linePos.weight}
        ></Line>
      ))}
    </svg>
  );
}
