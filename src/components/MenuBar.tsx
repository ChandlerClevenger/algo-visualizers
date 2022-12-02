import { FormEvent, useCallback, useEffect, useState } from "react";
import { Algorithms } from "../types/bin";
export default function MenuBar({
  onRunAlgorithm,
  rootNodeId,
  clickedNodeId,
  isAnimated,
  onChangeIsAnimated,
  onAlgorithmChange,
}: any) {
  const [algorithm, setAlgorithm] = useState<Algorithms>(Algorithms.Dijkstra);
  useEffect(() => {
    onAlgorithmChange(algorithm);
  }, [algorithm]);
  return (
    <div
      id="menu-bar"
      className="position-absolute start-50 translate-middle-x row"
    >
      <div className="col-sm-6">
        <p>Currently Clicked: {clickedNodeId ?? "None"}</p>
      </div>
      <div className="col-sm-6">
        <p>Root Node: {rootNodeId}</p>
      </div>
      <div className="col-sm-4">
        <button className="" onClick={onRunAlgorithm}>
          RUN
        </button>
      </div>
      <div className="col sm-8">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            name="animate"
            id="animate-check"
            onChange={onChangeIsAnimated}
          />
          <label className="form-check-label" htmlFor="animate">
            {isAnimated
              ? "Toggle to cancel animation"
              : "Toggle to set animation on run"}
          </label>
        </div>
      </div>
      <div className="col-sm-6">
        <div className="btn-group">
          <input
            type="radio"
            className="btn-check"
            name="algorithms"
            id="dijkstra"
            value={Algorithms.Dijkstra}
            checked={algorithm === Algorithms.Dijkstra}
            onChange={() => {
              setAlgorithm(Algorithms.Dijkstra);
            }}
          />
          <label className="btn btn-secondary" htmlFor="dijkstra">
            Dijkstra's
          </label>

          <input
            type="radio"
            className="btn-check"
            name="algorithms"
            value={Algorithms.BellmenFord}
            id="bellmanford"
            checked={algorithm === Algorithms.BellmenFord}
            onChange={() => {
              setAlgorithm(Algorithms.BellmenFord);
            }}
          />
          <label className="btn btn-secondary" htmlFor="bellmanford">
            Bellman-Ford
          </label>
        </div>
      </div>
    </div>
  );
}
