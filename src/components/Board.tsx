import { useState } from "react";
import { Edge } from "../types/bin";
import Routers from "./Routers";
import Lines from "./Lines";
export default function Board() {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);

  function receiveNodes(listOfNodes: Node[]): void {
    setNodes(listOfNodes);
  }

  function receiveEdges(listOfEdges: Edge[]): void {
    setEdges(listOfEdges);
  }

  return (
    <div id="board" className="w-100 h-100 bg-secondary">
      <Lines sendUpEdges={receiveEdges}></Lines>
      <Routers sendUpNodes={receiveNodes}></Routers>
    </div>
  );
}
