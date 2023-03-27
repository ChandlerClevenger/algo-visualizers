import {
  useRef,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
} from "react";
import { Algorithms, Edge, LinePos, Node, NodePos } from "../types/bin";
import Routers from "./Routers";
import Lines from "./Lines";
import MenuBar from "./MenuBar";
import Dijkstra from "../algs/Dijkstra";
import BellmanFord from "../algs/BellmanFord";

let routerIds = 0;
let edgesIds = 0;
export const NodeContext = createContext<{
  nodes: Node[];
  setNodes: Dispatch<SetStateAction<Node[]>>;
  deleteRouter: (n: number) => void;
  algorithm: Algorithms;
}>({
  nodes: [
    {
      id: routerIds,
      weight: Infinity,
      prevNode: undefined,
    },
  ],
  setNodes: (e) => {},
  deleteRouter: (n: number) => {},
  algorithm: Algorithms.Dijkstra,
});

export default function Board() {
  const Dijk = new Dijkstra();
  const Bellman = new BellmanFord();
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: routerIds,
      weight: Infinity,
      prevNode: undefined,
    },
  ]);

  const [linePositions, setLinePos] = useState<LinePos[]>([]);
  const [clickedNode, setClickedNode] = useState<Node | null>(null);
  const [rootNodeId, setRootNodeId] = useState<number>(0);
  const clickedNodePos = useRef<NodePos | null>(null);
  const [isAnimated, setIsAnimated] = useState<boolean>(false);
  const [algorithm, setAlgorithm] = useState<Algorithms>(Algorithms.Dijkstra);

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
        id: ++edgesIds,
        firstNode: node,
        secondNode: clickedNode,
        weight: 0,
      },
    ]);

    setLinePos((oldLinePos) => [
      ...oldLinePos,
      {
        id: edgesIds,
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

  function onChangeRouterWeight(routerId: number, newWeight: number) {
    setNodes((oldNodes) =>
      oldNodes.map((node) => {
        if (node.id === routerId) {
          return {
            ...node,
            weight: newWeight,
          };
        }
        return node;
      })
    );
  }

  function deleteRouter(nodeId: number) {
    // Filter out the node
    setNodes((oldNodes) =>
      oldNodes.filter((n) => {
        return n.id !== nodeId;
      })
    );
    // Remove its edges
    setEdges((oldEdges) =>
      oldEdges.filter((edge) => {
        return !(nodeId === edge.firstNode.id || nodeId === edge.secondNode.id);
      })
    );
    // Remove the lines
    setLinePos((old) =>
      old.filter((l) => {
        return !(
          nodeId === l.firstConnector.id || nodeId === l.secondConnector.id
        );
      })
    );
  }

  async function runAlgorithm(e: MouseEvent) {
    const rootNode = nodes.find((node) => {
      return node.id === rootNodeId;
    });
    if (!rootNode) return;
    if (isAnimated && algorithm === Algorithms.Dijkstra) {
      Dijk.animatedPerformDijkstra(
        edges,
        nodes,
        rootNode,
        onChangeRouterWeight
      ).then((res) => {
        if (!res) return;
        setNodes(res.nodes);
      });
      
    } else if (algorithm === Algorithms.Dijkstra) {
      const res = Dijk.performDijkstra(edges, nodes, rootNode);
      setNodes(res.nodes);

    } else if (algorithm === Algorithms.BellmenFord) {
      const res = await Bellman.performBellmanFord(
        { edges, nodes },
        setNodes,
        isAnimated
      );
      setNodes(res);
    }
  }

  return (
    <>
      <div
        id="board"
        className="w-100 h-100 bg-secondary position-relative"
        onContextMenu={(e) => {
          if (e.target === document.getElementById("lines")) return;
          e.preventDefault();
          e.stopPropagation();
          e.bubbles = false;
          return false;
        }}
      >
        <Lines
          linePositions={linePositions}
          onWeightChange={receiveWeightChange}
        ></Lines>
        <NodeContext.Provider
          value={{ nodes, setNodes, deleteRouter, algorithm }}
        >
          <Routers
            onSendRouterPos={receiveNodePos}
            onSendClickedRouterData={receiveClickedNodeData}
            onSendRootId={receiveRootNodeId}
          ></Routers>
        </NodeContext.Provider>

        <MenuBar
          onRunAlgorithm={runAlgorithm}
          onAlgorithmChange={(alg: Algorithms) => {
            setAlgorithm(alg);
          }}
          rootNodeId={rootNodeId}
          clickedNodeId={clickedNode?.id}
          isAnimated={isAnimated}
          onChangeIsAnimated={(e: MouseEvent) => {
            const checkbox = e.target as HTMLInputElement;
            setIsAnimated(checkbox.checked);
          }}
        ></MenuBar>
      </div>
    </>
  );
}
