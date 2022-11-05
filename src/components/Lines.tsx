import $ from "jquery";
import regex from "../utils/my_regex";
import { LineData } from "../types/bin";
import Line from "./Line";

const my_regex = new regex();
export default function Lines({ linePositions, onWeightChange }: any) {
  function clicked(e: React.MouseEvent<SVGLineElement | SVGTextElement>): void {
    const w = prompt("Enter a number: ");
    if (!w || (w && isNaN(Number(w)))) {
      throw TypeError("NAN or nothing entered.");
    }
    const id = $(e.target).attr("id");
    if (!id) {
      throw TypeError("Failure to get id of line");
    }
    onWeightChange(Number(my_regex.getNumbersOnly(id)), Number(w));
  }

  return (
    <svg id="lines" className="position-absolute w-100 h-100">
      {linePositions.map((linePos: LineData, index: number) => (
        <Line
          key={linePos.id}
          id={linePos.id}
          clicked={clicked}
          firstConnector={linePos.firstConnector}
          secondConnector={linePos.secondConnector}
          weight={linePos.weight}
        ></Line>
      ))}
    </svg>
  );
}
