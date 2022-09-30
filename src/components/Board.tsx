import { useEffect, useState } from "react";
import { Edge, LinePos, Node, NodePos } from "../types/bin";
import Routers from "./Routers";
import Lines from "./Lines";
export default function Board() {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [linePositions, setLinePositions] = useState<LinePos[]>([]);
  const [clickedNode, setClickedNode] = useState<Node | null>(null);
  const [clickedNodePos, setClickedNodePos] = useState<NodePos | null>(null);
  const [rootNodeId, setRootNodeId] = useState<number>(0);

  function receiveNodes(listOfNodes: Node[]): void {
    setNodes(listOfNodes);
  }

  function receiveClickedNodeData(node: Node, nodePos: NodePos): void {
    if (
      !clickedNode ||
      !clickedNodePos ||
      !nodePos ||
      clickedNode.id === node.id
    ) {
      setClickedNode(node);
      setClickedNodePos(nodePos);
      return;
    }
    setEdges((oldEdges) => [
      ...oldEdges,
      {
        id: edges.length,
        firstNode: node,
        secondNode: clickedNode,
        weight: 0,
      },
    ]);
    setLinePositions((oldPos) => [
      ...oldPos,
      {
        id: edges.length,
        firstConnector: clickedNodePos,
        secondConnector: nodePos,
        weight: 0,
      },
    ]);
    setClickedNodePos(null);
    setClickedNode(null);
  }

  function receiveNodePos(nodePos: any) {
    // Update linePositions on nodePos update
    setLinePositions((oldPos) =>
      oldPos.map((pos) => {
        if (nodePos.id in [pos.firstConnector.id, pos.secondConnector.id]) {
          return nodePos.id === pos.firstConnector.id
            ? {
                ...pos,
                firstConnector: nodePos,
              }
            : {
                ...pos,
                secondConnector: nodePos,
              };
        }
        return pos;
      })
    );
  }

  useEffect(() => {
    console.log("rendering ", linePositions);
  });

  return (
    <>
      <div id="board" className="w-100 h-100 bg-secondary">
        <p className="position-absolute end-50">
          Currently Clicked: {clickedNode?.id ?? "None"}
          &nbsp; Root Node: {rootNodeId}
        </p>
        <Lines {...linePositions}></Lines>
        <Routers
          sendUpNodePos={receiveNodePos}
          sendUpNodes={receiveNodes}
          sendUpClickedNodeData={receiveClickedNodeData}
        ></Routers>
      </div>
    </>
  );
}
