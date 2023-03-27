import { Graph, Edge, Node, IConnection, IDistance } from "../types/bin";
import {
  movePacket,
  lineBlinkGreen,
  lineBlinkOrange,
  routerBlink,
} from "../utils/BellmanFordAnimations";
import { AnimationQueue } from "../utils/Animator";
import { Dispatch, SetStateAction } from "react";
import Animation from "../utils/Animation";
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
    let routers = this.#initilizeRouters(nodes, edges);

    // Show tables after initialized
    if (isAnimated) setNodes(routers);

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
          let animations = [];
          [routers, localHasChanged, animations] = await this.#optimizeTable(
            con,
            routers,
            isAnimated,
            setNodes,
            edges
          );
          hasChanges = localHasChanged || hasChanges; // Keeps true if any localHasChanged return true once
               // Animate sending of data
          if (isAnimated && hasChanges) {
            await movePacket(`${con.selfRouterId}`, `${con.otherRouterId}`);
            let awaitList = [];
            for (const animation of animations) {
              awaitList.push(animationQ.run(animation));
            }
            await Promise.all(awaitList);
          }
        }
      }
    }
    return routers;
  }

  async #optimizeTable(
    connection: IConnection,
    routers: Node[],
    isAnimated: boolean,
    setNodes: Dispatch<SetStateAction<Node[]>>,
    edges: Edge[]
  ): Promise<[Node[], boolean, Animation[]]> {
    const toRouter = routers.find((r) => connection.otherRouterId === r.id); // Router to optimize
    const fromRouter = routers.find((r) => connection.selfRouterId === r.id);
    let animations = [] as Animation[];
    if (!toRouter || !fromRouter || !toRouter.table || !fromRouter.table)
      throw new Error("Error, check connections.");

    let hasChanged = false; // Assume no changes
    for (const [routerId, distanceInfo] of fromRouter.table.entries()) {
      if (distanceInfo.nextHop === toRouter.id) continue; // Dont 'send' optimize route to nextHop already in path

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
          animations = this.#getNewlyFoundRouterAnimation(
            this.#getLineIds(routers, connection, routerId, edges),
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
          animations = this.#animateNewlyShortestPath(
            this.#getLineIds(routers, connection, routerId, edges),
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
    return [routers, hasChanged, animations];
  }

  #initilizeRouters(nodes: Node[], edges: Edge[]): Node[] {
    let routers: Node[] = [];
    for (const node of nodes) {
      const table = new Map<number, IDistance>();

      table.set(node.id, {
        destination: node.id,
        distance: 0,
        nextHop: node.id,
      });

      for (const neighboringCon of this.#getConnections(node.id, edges)) {
        const otherId = neighboringCon.otherRouterId;
        table.set(otherId, {
          destination: otherId, 
          nextHop: otherId, 
          distance: neighboringCon.weight
        } as IDistance)
      }

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

  #getNewlyFoundRouterAnimation(
    lineIds: string | string[],
    routerId: string | string[]
  ) {
    return [lineBlinkGreen(lineIds), routerBlink(routerId)];
  }

  #animateNewlyShortestPath(
    lineIds: string | string[],
    routerId: string | string[]
  ) {
    return [lineBlinkOrange(lineIds), routerBlink(routerId)];
  }

  #getLineIds(
    routers: Node[],
    connection: IConnection,
    targetRouterId: number,
    edges: Edge[]
  ): string | string[] {
    let lines: string[] = [];
    let failsafe = 100;
    lines.push(`#line-${connection.lineId}`)
    let currentRouterId: number = connection.selfRouterId;
    while (currentRouterId !== targetRouterId && failsafe) {
      const r = this.#getRouterById(routers, currentRouterId);
      const rConns = this.#getConnections(currentRouterId, edges);
      const nRHop = r?.table?.get(targetRouterId)?.nextHop;
      const c = rConns.find(c => c.otherRouterId === nRHop)
      lines.push(`#line-${c?.lineId}`);
      if (c === undefined) throw Error ("Failure to find currentRouter");
      currentRouterId = c.otherRouterId;
      failsafe--;
    }
    return lines;
  }
 
  #getRouterById(routers: Node[], id: number) {
    for (let router of routers) {
      if (router.id === id) {
        return router;
      }
    }
  }
}
