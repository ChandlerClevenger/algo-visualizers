/*
Liscence: GNU General Public License v2.0
Author: Chandler Clevenger
Date: 3/26/2023
Purpose: Dijkstra Algorithm implementation for visualization
*/

import { Edge, Graph, Node } from "../types/bin";
import { AnimationQueue } from "../utils/Animator";
import * as animations from "../utils/DijkstraAnimations";
const animationQ = new AnimationQueue("animate-check");

export default class Dijkstra {
  async animatedPerformDijkstra(
    edges: Edge[],
    nodes: Node[],
    startingNode: Node,
    onChangeRouterWeight: (routerId: number, newWeight: number) => void
  ) {
    if (animationQ.isPlaying) {
      throw Error("Animation is already playing!");
    }
    let failsafe = 0;
    let unVisitedNodeIds: number[] = [
      ...nodes.map((n) => {
        return n.id;
      }),
    ];
    let lastNodeInUnVisited = unVisitedNodeIds.pop();
    if (!lastNodeInUnVisited) {
      return;
    }
    // Remove animations that persist
    animationQ.cleanupPeristentAnimations();
    // Set all distances to infinity
    for (const node of nodes) {
      onChangeRouterWeight(node.id, Infinity);
    }
    // Set last node to visited as it is not in play
    // This is an artifact of how we consider nodes
    unVisitedNodeIds = this.#setNodeVisited(
      unVisitedNodeIds,
      lastNodeInUnVisited
    );
    // Set startingNode distance to 0 and mark as visited
    nodes = this.#setNodeData(nodes, startingNode, 0, undefined);
    onChangeRouterWeight(startingNode.id, 0);
    // Assume Inf distance of all nonStartingNodes and reset prevNodes
    for (const node of nodes) {
      if (node.id === startingNode.id) continue;
      nodes = this.#setNodeData(nodes, node, Infinity, undefined);
    }
    let currentNode = nodes.find((n) => {
      return n.id === startingNode.id;
    });
    if (!currentNode) throw Error("Invalid starting node");

    while (unVisitedNodeIds.length) {
      if (failsafe > 1000) break;
      failsafe += 1;
      // Animate current Node
      await animationQ.run(
        animations.animateRouterConsidered(`#router-img-${currentNode.id}`)
      );
      // Collect Neighbors and filter
      let consideredEdges = this.#getNodesEdges(edges, currentNode);
      consideredEdges = consideredEdges.filter((e) => {
        if (!currentNode) throw Error("No Current Node");
        const nonCurrentNode = this.#getNonCurrentNodeFromEdge(
          nodes,
          e,
          currentNode
        );
        if (unVisitedNodeIds.includes(nonCurrentNode.id)) {
          return e;
        }
      });

      // Animate the currently considered edges
      await animationQ.run(
        animations.animateLineBlinkRed(
          consideredEdges.map((e) => {
            return `#line-${e.id}`;
          })
        )
      );

      let changedWeightNodes = [];
      // Update neighbors
      for (const edge of consideredEdges) {
        const nonCurrentNode = this.#getNonCurrentNodeFromEdge(
          nodes,
          edge,
          currentNode
        );
        const newWeight = currentNode.weight + edge.weight;
        if (nonCurrentNode.weight > newWeight) {
          onChangeRouterWeight(nonCurrentNode.id, newWeight);
          nodes = this.#setNodeData(
            nodes,
            nonCurrentNode,
            newWeight,
            currentNode
          );
          changedWeightNodes.push(
            nodes.find((n) => n.id === nonCurrentNode.id)
          );
        }
      }

      await animationQ.run(
        animations.animateRouterBlink(
          changedWeightNodes.map((e) => {
            if (!e) return "";
            return `#router-img-${e.id}`;
          })
        )
      );
      for (const currNode of changedWeightNodes) {
        let n: Node | undefined = currNode;
        if (n === undefined) continue;
        let edgesTaken = [];
        do {
          const edge = this.#getNodesEdges(edges, n).find((e) => {
            if (n?.prevNode === undefined) return;
            return (
              [e.firstNode.id, e.secondNode.id].includes(n?.prevNode?.id) ?? e
            );
          });
          edgesTaken.push(edge);
          n = n.prevNode;
        } while (n);

        console.log(edgesTaken);
        await animationQ.run(
          animations.animateLineBlinkGreen(
            edgesTaken.map((e) => {
              return `#line-${e?.id}`;
            })
          )
        );
      }

      // Mark node as visites
      unVisitedNodeIds = this.#setNodeVisited(unVisitedNodeIds, currentNode.id);
      if (!unVisitedNodeIds.length) continue;
      // Pick new node from unVisited nodes
      const pickedNode: Node = this.#pickBestNode(nodes, unVisitedNodeIds);
      currentNode = pickedNode;
    }

    return { edges: edges, nodes: nodes };
  }

  performDijkstra(edges: Edge[], nodes: Node[], startingNode: Node): Graph {
    let failsafe = 0;
    let unVisitedNodeIds: number[] = [
      ...nodes.map((n) => {
        return n.id;
      }),
    ];
    // Set startingNode distance to 0 and mark as visited
    nodes = this.#setNodeData(nodes, startingNode, 0, startingNode);
    // Assume Inf distance of all nonStartingNodes and reset prevNodes
    for (const node of nodes) {
      if (node.id === startingNode.id) continue;
      nodes = this.#setNodeData(nodes, node, Infinity, undefined);
    }
    let currentNode = nodes.find((n) => {
      return n.id === startingNode.id;
    });
    if (!currentNode) throw Error("Invalid starting node");

    while (unVisitedNodeIds.length) {
      if (failsafe > 1000) break;
      failsafe += 1;

      // Collect Neighbors and filter
      let consideredEdges = this.#getNodesEdges(edges, currentNode);
      consideredEdges = consideredEdges.filter((e) => {
        if (!currentNode) throw Error("No Current Node");
        const nonCurrentNode = this.#getNonCurrentNodeFromEdge(
          nodes,
          e,
          currentNode
        );
        if (unVisitedNodeIds.includes(nonCurrentNode.id)) {
          return e;
        }
      });

      // Update neighbors
      for (const edge of consideredEdges) {
        const nonCurrentNode = this.#getNonCurrentNodeFromEdge(
          nodes,
          edge,
          currentNode
        );
        if (nonCurrentNode.weight > currentNode.weight + edge.weight) {
          nodes = this.#setNodeData(
            nodes,
            nonCurrentNode,
            currentNode.weight + edge.weight,
            currentNode
          );
        }
      }
      // Mark node as visites
      unVisitedNodeIds = this.#setNodeVisited(unVisitedNodeIds, currentNode.id);
      if (!unVisitedNodeIds.length) continue;
      // Pick new node from unVisited nodes
      const pickedNode: Node = this.#pickBestNode(nodes, unVisitedNodeIds);
      currentNode = pickedNode;
    }

    return { edges: edges, nodes: nodes };
  }

  #pickBestNode(nodes: Node[], currentVisitedIds: number[]): Node {
    // Greedily pick non-visited, lowest-weight node
    let nodesLeft = nodes.filter((n) => {
      return currentVisitedIds.includes(n.id);
    });
    return nodesLeft.reduce((prev, cur) => {
      return prev.weight > cur.weight ? cur : prev;
    });
  }

  #setNodeData(
    nodes: Node[],
    node: Node,
    weight: number,
    prevNode: Node | undefined
  ) {
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

  #getNodesEdges(edges: Edge[], currentNode: Node): Edge[] {
    return edges.filter((e) => {
      if (
        e.firstNode.id === currentNode.id ||
        e.secondNode.id === currentNode.id
      ) {
        return e;
      }
    });
  }

  #setNodeVisited(unVisitedNodeIds: number[], nodeId: number) {
    if (isNaN(nodeId)) throw TypeError("nodeId is of type number");
    return unVisitedNodeIds.filter((n) => {
      return n !== nodeId;
    });
  }

  #getNonCurrentNodeFromEdge(
    nodes: Node[],
    edge: Edge,
    currentNode: Node
  ): Node {
    // Find which node is not the current
    let nonCurrent: Node | undefined =
      edge.firstNode.id === currentNode.id ? edge.secondNode : edge.firstNode;
    // Return the nonCurrent node from nodes as it has live values
    nonCurrent = nodes.find((n) => {
      return nonCurrent && n.id === nonCurrent.id;
    });
    if (!nonCurrent) {
      throw Error(`Can not find currentNode`);
    }
    return nonCurrent;
  }
}
