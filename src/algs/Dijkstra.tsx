import { Edge, Graph, Node } from "../types/bin";
export default class Dijkstra {
  performDijkstra(edges: Edge[], nodes: Node[], startingNode: Node): Graph {
    let failsafe = 0;
    let unVisitedNodeIds: number[] = [
      ...nodes.map((n) => {
        return n.id;
      }),
    ];
    // Set startingNode distance to 0 and mark as visited
    nodes = this._setNodeData(nodes, startingNode, 0, startingNode);
    let currentNode = nodes.find((n) => {
      return n.id === startingNode.id;
    });
    if (!currentNode) throw Error("Invalid starting node");

    unVisitedNodeIds = this._setNodeVisited(unVisitedNodeIds, currentNode.id);

    while (unVisitedNodeIds.length) {
      console.log("\n\nFailsafe ", failsafe);
      if (failsafe > 1000) break;
      failsafe += 1;
      // Collect Neighbors and filter
      let consideredEdges = this._getNodesEdges(edges, currentNode);
      consideredEdges = consideredEdges.filter((e) => {
        if (!currentNode) throw Error("No Current Node");
        const nonCurrentNode = this._getNonCurrentNodeFromEdge(e, currentNode);
        if (unVisitedNodeIds.includes(nonCurrentNode.id)) {
          return e;
        }
      });

      // Update neighbors
      for (const edge of consideredEdges) {
        const nonCurrentNode = this._getNonCurrentNodeFromEdge(
          edge,
          currentNode
        );
        if (!unVisitedNodeIds.includes(nonCurrentNode.id)) continue;

        if (nonCurrentNode.weight > currentNode.weight + edge.weight) {
          nodes = this._setNodeData(
            nodes,
            nonCurrentNode,
            currentNode.weight + edge.weight,
            currentNode
          );
        }
      }
      // Mark node as visites
      unVisitedNodeIds = this._setNodeVisited(unVisitedNodeIds, currentNode.id);
      if (!unVisitedNodeIds.length) continue;
      // Pick new node from unVisited nodes
      const pickedNode: Node = this._pickBestNode(nodes, unVisitedNodeIds);
      currentNode = pickedNode;
    }

    return { edges: edges, nodes: nodes };
  }

  _pickBestNode(nodes: Node[], currentVisitedIds: number[]): Node {
    // Greedily pick non-visited, lowest-weight node
    let nodesLeft = nodes.filter((n) => {
      return currentVisitedIds.includes(n.id);
    });
    return nodesLeft.reduce((prev, cur) => {
      return prev.weight > cur.weight ? cur : prev;
    });
  }

  _setNodeData(nodes: Node[], node: Node, weight: number, prevNode: Node) {
    return nodes.map((n) => {
      if (n.id === node.id) {
        return {
          ...n,
          weight: weight,
          prevNode: prevNode,
        };
      }
      return n;
    });
  }

  _getNodesEdges(edges: Edge[], currentNode: Node): Edge[] {
    return edges.filter((e) => {
      if (
        e.firstNode.id === currentNode.id ||
        e.secondNode.id === currentNode.id
      ) {
        return e;
      }
    });
  }

  _setNodeVisited(unVisitedNodeIds: number[], nodeId: number) {
    return unVisitedNodeIds.filter((n) => {
      return n !== nodeId;
    });
  }

  _getNonCurrentNodeFromEdge(edge: Edge, currentNode: Node): Node {
    return edge.firstNode.id === currentNode.id
      ? edge.secondNode
      : edge.firstNode;
  }
}
