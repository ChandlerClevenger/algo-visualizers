import { useEffect, useRef, useState } from "react";
import { Edge, LinePos, Node, NodePos, RouterInt } from "../types/bin";
import Routers from "./Routers";
import Lines from "./Lines";
import Dijkstra from "../algs/Dijkstra";
export default function Board() {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodes, setNodes] = useState<Node[]>([{ id: 0, weight: Infinity }]);
  const [linePositions, setLinePos] = useState<LinePos[]>([]);
  const [clickedNode, setClickedNode] = useState<Node | null>(null);
  const [rootNodeId, setRootNodeId] = useState<number>(0);
  const clickedNodePos = useRef<NodePos | null>(null);

  function addNewNode(): void {
    setNodes((oldNodes) => [
      ...oldNodes,
      {
        id: nodes.length,
        weight: Infinity,
      },
    ]);
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

    setLinePos((oldLinePos) => [
      ...oldLinePos,
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
        setLinePos((oldLinePos) =>
          oldLinePos.map((linePos) => {
            if (linePos.firstConnector.id === nodePos.id) {
              return {
                ...linePos,
                firstConnector: nodePos,
              };
            } else if (linePos.secondConnector.id === nodePos.id) {
              return {
                ...linePos,
                secondConnector: nodePos,
              };
            }
            return linePos;
          })
        );
      } else if (
        clickedNodePos.current &&
        nodePos.id === clickedNodePos.current.id
      ) {
        clickedNodePos.current = nodePos;
      }
    }
  }

  function receiveRootNodeId(nodeId: number) {
    setRootNodeId(nodeId);
  }

  function receiveWeightChange(lineId: number, weight: number) {
    console.log(`LineId: ${lineId}| Weight: ${weight}`);
    // Update edges
    setEdges((oldEdges) =>
      oldEdges.map((e) => {
        if (e.id === lineId) {
          return {
            ...e,
            weight: weight,
          };
        }
        return e;
      })
    );

    // Update Lines
    setLinePos((oldLinePos) =>
      oldLinePos.map((l) => {
        if (l.id === lineId) {
          return {
            ...l,
            weight: weight,
          };
        }
        return l;
      })
    );
  }

  useEffect(() => {
    console.log("rendering ", linePositions);
  });

  return (
    <>
      <div id="board" className="w-100 h-100 bg-secondary position-relative">
        <Lines
          linePositions={linePositions}
          onWeightChange={receiveWeightChange}
        ></Lines>
        <Routers
          nodes={nodes}
          onSendRouterPos={receiveNodePos}
          onAddNewRouter={addNewNode}
          onSendClickedRouterData={receiveClickedNodeData}
          onSendRootId={receiveRootNodeId}
        ></Routers>
        <p className="position-absolute start-50 translate-middle-x">
          Currently Clicked: {clickedNode?.id ?? "None"}
          &nbsp; Root Node: {rootNodeId}
          &nbsp;
          <button
            onClick={(e) => {
              const Dijk = new Dijkstra();
              const rootNode = nodes.find((node) => {
                return node.id === rootNodeId;
              });
              if (!rootNode) return;
              const res = Dijk.performDijkstra(edges, nodes, rootNode);
              setNodes(res.nodes);
              console.log(res);
            }}
          >
            RUN
          </button>
        </p>
      </div>
    </>
  );
}
