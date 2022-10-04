import { LineData } from "../types/bin";

export default function Line({
  id,
  firstConnector,
  secondConnector,
  clicked,
  weight,
}: LineData) {
  return (
    <>
      <line
        onClick={clicked}
        className="line"
        id={`line-${id}`}
        x1={firstConnector.x}
        y1={firstConnector.y}
        x2={secondConnector.x}
        y2={secondConnector.y}
        strokeWidth={3}
        stroke={"yellow"}
      />
      <text
        id={`line-weight-${id}`}
        onClick={clicked}
        strokeWidth={1}
        y={(firstConnector.y + secondConnector.y + 30) / 2}
        x={(firstConnector.x + secondConnector.x) / 2}
      >
        {weight}
      </text>
    </>
  );
}
