import { Graph, Edge, Node, IConnection, IDistance } from "../types/bin";
import {
  movePacket,
  lineBlinkGreen,
  lineBlinkOrange,
  routerBlink,
} from "../utils/BellmanFordAnimations";
import { AnimationQueue } from "../utils/Animator";
import { Dispatch, SetStateAction } from "react";
const animationQ = new AnimationQueue("animate-check");

export default class BellmanFord {
  async performBellmanFord(
    G: Graph,
    setNodes: Dispatch<SetStateAction<Node[]>>,
    isAnimated = false
  ): Promise<Node[]> {
    let edges = G.edges;
    let nodes = G.nodes;

    // Visually reset router tables
    if (isAnimated)
      setNodes((prevNodes) => {
        return prevNodes.map((e) => {
          delete e.table;
          return e;
        });
      });

    // Create routers and their initial table
    let routers = this.#initilizeRouters(nodes);

    // Show tables after initialized
    if (isAnimated) setNodes(routers);

    console.log(routers);
    let hasChanges = true; // True initially so while loop runs
    while (hasChanges) {
      hasChanges = false; // Easier to set this false each loop since it starts true
      // Loop through all Routers and share table with neighbors that are not next hop on connection information
      // Set hasChanged to true if any tables are updated
      for (const router of routers) {
        // Get routers connections
        const conns = this.#getConnections(router.id, edges);
        for (const con of conns) {
          let localHasChanged = false;
          [routers, localHasChanged] = await this.#optimizeTable(
            con,
            routers,
            isAnimated,
            setNodes
          );
          hasChanges = localHasChanged || hasChanges; // Keeps true if any localHasChanged return true once
        }
      }
    }
    return routers;
  }

  async #optimizeTable(
    connection: IConnection,
    routers: Node[],
    isAnimated: boolean,
    setNodes: Dispatch<SetStateAction<Node[]>>
  ): Promise<[Node[], boolean]> {
    const toRouter = routers.find((r) => connection.otherRouterId === r.id); // Router to optimize
    const fromRouter = routers.find((r) => connection.selfRouterId === r.id);
    if (!toRouter || !fromRouter || !toRouter.table || !fromRouter.table)
      throw new Error("Error, check connections.");

    let hasChanged = false; // Assume no changes
    for (const [routerId, distanceInfo] of fromRouter.table.entries()) {
      if (distanceInfo.nextHop === toRouter.id) continue; // Dont 'send' optimize route to nextHop already in path

      // Animate sending of data
      if (isAnimated) await movePacket(`${fromRouter.id}`, `${toRouter.id}`);

      const currentDistance = toRouter.table.get(routerId)?.distance;
      if (!toRouter.table.has(routerId)) {
        // If not set routerId then add newly found Router
        toRouter.table.set(routerId, {
          nextHop: fromRouter.id,
          destination: routerId,
          distance: connection.weight + distanceInfo.distance,
        });
        hasChanged = true;

        // Animate newly found router
        if (isAnimated) {
          // Update router table display
          setNodes((prevNodes) => {
            return prevNodes.map((e) => {
              if (e.id === fromRouter.id) return fromRouter;
              return e;
            });
          });

          await this.#animateNewlyFoundRouter(
            `#line-${connection.lineId}`,
            `#router-img-${routerId}`
          );
        }
      } // Otherwise, If distance is shorter, add new path & dist exists
      if (!currentDistance) continue;

      if (connection.weight + distanceInfo.distance < currentDistance) {
        toRouter.table.set(routerId, {
          nextHop: fromRouter.id,
          destination: routerId,
          distance: connection.weight + distanceInfo.distance,
        });
        hasChanged = true;

        // Animate new shortest path
        if (isAnimated) {
          // Visually update table
          setNodes((prevNodes) =>
            prevNodes.map((n) => {
              if (n.id === toRouter.id) return toRouter;
              return n;
            })
          );
          await this.#animateNewlyShortestPath(
            `#line-${connection.lineId}`,
            `#router-img-${routerId}`
          );
        }
      }
    }
    routers = routers.map((r) => {
      // Replace router with new state
      if (r.id === toRouter.id) {
        return toRouter;
      } else {
        return r;
      }
    });
    return [routers, hasChanged];
  }

  #initilizeRouters(nodes: Node[]): Node[] {
    let routers: Node[] = [];
    for (const node of nodes) {
      const table = new Map<number, IDistance>();

      table.set(node.id, {
        destination: node.id,
        distance: 0,
        nextHop: node.id,
      });

      routers.push({
        ...node,
        table: table,
      });
    }

    return routers;
  }

  #getConnections(nodeId: number, edges: Edge[]): IConnection[] {
    const connectedEdges: IConnection[] = [];
    for (const edge of edges) {
      if (edge.firstNode.id === nodeId || edge.secondNode.id === nodeId) {
        const otherId =
          edge.firstNode.id === nodeId ? edge.secondNode.id : edge.firstNode.id;
        connectedEdges.push({
          selfRouterId: nodeId,
          otherRouterId: otherId,
          weight: edge.weight,
          lineId: edge.id,
        });
      }
    }
    return connectedEdges;
  }

  async #animateNewlyFoundRouter(
    lineIds: string | string[],
    routerId: string | string[]
  ) {
    const linePromise = animationQ.run(lineBlinkGreen(lineIds));
    const routerPromise = animationQ.run(routerBlink(routerId));
    await Promise.allSettled([linePromise, routerPromise]);
  }

  async #animateNewlyShortestPath(
    lineIds: string | string[],
    routerId: string | string[]
  ) {
    const linePromise = animationQ.run(lineBlinkOrange(lineIds));
    const routerPromise = animationQ.run(routerBlink(routerId));
    await Promise.allSettled([linePromise, routerPromise]);
  }

  #getLineIds(
    routers: Node[],
    connection: IConnection,
    targetRouterId: number
  ): string | string[] {
    let lines: string[] = [];
    if (connection.otherRouterId === targetRouterId)
      return [...lines, `#line-${connection.otherRouterId}`];
    console.log(
      `${connection.otherRouterId} is learning of router ${targetRouterId} from router ${connection.selfRouterId}`
    );

    // query table of other router..
    return this.#getLineIds(routers, connection, targetRouterId); // need to replace connection
    // console.log(routers);
    // return [`#line-${connection.lineId}`];
  }

  #getRouterById(routers: Node[], id: number) {
    for (let router of routers) {
      if (router.id === id) {
        return router;
      }
    }
  }
}
