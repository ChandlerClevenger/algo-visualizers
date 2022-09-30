import { useEffect, useRef, useState } from "react";
import { Edge, LinePos, Node, NodePos } from "../types/bin";
import Routers from "./Routers";
import Lines from "./Lines";
export default function Board() {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [linePositions, setLinePositions] = useState<LinePos[]>([]);
  const [clickedNode, setClickedNode] = useState<Node | null>(null);
  const [rootNodeId, setRootNodeId] = useState<number>(0);
  const clickedNodePos = useRef<NodePos | null>(null);

  function receiveNodes(listOfNodes: Node[]): void {
    setNodes(listOfNodes);
  }

  function receiveClickedNodeData(node: Node, nodePos: NodePos): void {
    if (!clickedNode || !nodePos || clickedNode.id === node.id) {
      setClickedNode(node);
      clickedNodePos.current = nodePos;
      return;
    }
    // Prevent duplicate connections
    for (const edge of edges) {
      const edgeNodeIds = [edge.firstNode.id, edge.secondNode.id];
      if (edgeNodeIds.includes(node.id) && edgeNodeIds.includes(clickedNode.id))
        return;
    }
    // Ensure firstConnector is not null
    const firstConnector = clickedNodePos.current;
    if (!firstConnector) return;
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
        firstConnector: firstConnector,
        secondConnector: nodePos,
        weight: 0,
      },
    ]);
    clickedNodePos.current = null;
    setClickedNode(null);
  }

  function receiveNodePos(nodePos: NodePos) {
    // Check if node has connection to prevent re-renders
    for (const edge of edges) {
      const edgeNodeIds = [edge.firstNode.id, edge.secondNode.id];
      if (edgeNodeIds.includes(nodePos.id)) {
        // Update linePositions on nodePos update
        setLinePositions((oldPos) =>
          oldPos.map((pos) => {
            if (pos.firstConnector.id === nodePos.id) {
              return {
                ...pos,
                firstConnector: nodePos,
              };
            } else if (pos.secondConnector.id === nodePos.id) {
              return {
                ...pos,
                secondConnector: nodePos,
              };
            }
            return pos;
          })
        );
      }
    }
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
        <svg id="lines" className="position-absolute w-100 h-100">
          <Lines linePositions={linePositions}></Lines>
        </svg>
        <Routers
          sendUpNodePos={receiveNodePos}
          sendUpNodes={receiveNodes}
          sendUpClickedNodeData={receiveClickedNodeData}
        ></Routers>
      </div>
    </>
  );
}
