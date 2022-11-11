export default function MenuBar({
  onRunAlgorithm,
  rootNodeId,
  clickedNodeId,
  isAnimated,
  onChangeIsAnimated,
}: any) {
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
    </div>
  );
}
