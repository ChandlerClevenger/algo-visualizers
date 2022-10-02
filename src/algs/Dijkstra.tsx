import { Edge, Node } from "../types/bin";
export default class Dijkstra {
  performDijkstra(edges: Edge[], nodes: number[], startingNode: number) {
    let dontBreakCounter = 0;
    const visitedNodes: number[] | undefined = [];
    let currentNode: number | undefined = startingNode;
    let finalConnections = this._initializeFinalConnections(
      edges,
      nodes,
      currentNode
    );
    visitedNodes.push(currentNode);

    while (visitedNodes.length != nodes.length) {
      dontBreakCounter += 1;
      if (dontBreakCounter > 1000) break;
      currentNode = this._pickBestNode(finalConnections, nodes, visitedNodes);
      if (!currentNode) continue;
      visitedNodes.push(currentNode);

      finalConnections = this._updateConnections(
        finalConnections,
        edges,
        currentNode
      );
    }
    const finalConnectionsList = [];
    for (const [key, value] of Object.entries(finalConnections)) {
      finalConnectionsList.push(value);
    }
    return finalConnectionsList;
  }

  _updateConnections(
    finalConnections: any,
    edges: Edge[],
    currentNode: number
  ) {
    for (const edge of edges) {
      if (
        edge.firstNode.id == currentNode ||
        edge.secondNode.id == currentNode
      ) {
        const notCurrent =
          edge.firstNode.id == currentNode ? edge.secondNode : edge.firstNode;
        const currNode =
          edge.firstNode == notCurrent ? edge.secondNode : edge.firstNode;
        if (
          finalConnections[currNode.id].weight + edge.weight <
          finalConnections[notCurrent.id].weight
        ) {
          finalConnections[notCurrent.id] = {
            weight: finalConnections[currNode.id].weight + edge.weight,
            prevNode: currNode,
          };
        }
      }
    }
    return finalConnections;
  }

  _initializeFinalConnections(
    edges: Edge[],
    nodes: number[],
    currentNode: number
  ) {
    const initCons: any = {};
    initCons[currentNode] = { weight: 0, prevNode: currentNode };

    for (const edge of edges) {
      if (
        edge.firstNode.id == currentNode ||
        edge.secondNode.id == currentNode
      ) {
        const notCurrent =
          edge.firstNode.id == currentNode ? edge.secondNode : edge.firstNode;
        const prevNode =
          edge.firstNode == notCurrent ? edge.secondNode : edge.firstNode;
        initCons[notCurrent.id] = { weight: edge.weight, prevNode: prevNode };
      }
    }

    for (const node of nodes) {
      if (!initCons[node]) {
        initCons[node] = { weight: Infinity, prevNode: null };
      }
    }
    return initCons;
  }

  _pickBestNode(
    finalConnections: any,
    nodes: number[],
    visitedNodes: number[]
  ): number | undefined {
    const nodesToVisit = nodes.filter((node) => !visitedNodes.includes(node));
    let minNode = nodesToVisit[0];
    for (const node of nodesToVisit) {
      if (!minNode) continue;
      if (finalConnections[node].weight < finalConnections[minNode].weight) {
        minNode = node;
      }
    }
    return minNode;
  }
}
