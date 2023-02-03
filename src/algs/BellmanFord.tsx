import { Graph, Edge, Node, IConnection, IDistance } from "../types/bin";
import { movePacket, lineBlinkGreen } from "../utils/BellmanFordAnimations";
import { AnimationQueue } from "../utils/Animator";
const animationQ = new AnimationQueue("animate-check");

export default class BellmanFord {
  async performBellmanFord(G: Graph, isAnimated = false): Promise<Node[]> {
    let edges = G.edges;
    let nodes = G.nodes;

    // Create routers and their initial table
    let routers = await this.#initilizeRouters(edges, nodes, isAnimated).then(
      (res) => {
        return res;
      }
    );
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
            isAnimated
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
    isAnimated: boolean
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
        // Animate newly found router
        //console.log(this.#getLineIds(routers, connection, routerId));
        if (isAnimated)
          await animationQ.run(lineBlinkGreen(`#line-${connection.lineId}`));
        // If not set routerId then add newly found Router
        toRouter.table.set(routerId, {
          nextHop: fromRouter.id,
          destination: routerId,
          distance: connection.weight + distanceInfo.distance,
        });
        hasChanged = true;
      } // Otherwise, If distance is shorter, add new path & dist exists
      if (!currentDistance) continue;

      if (connection.weight + distanceInfo.distance < currentDistance) {
        toRouter.table.set(routerId, {
          nextHop: fromRouter.id,
          destination: routerId,
          distance: connection.weight + distanceInfo.distance,
        });
        hasChanged = true;
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

  async #initilizeRouters(
    edges: Edge[],
    nodes: Node[],
    isAnimated: boolean
  ): Promise<Node[]> {
    let routers: Node[] = [];
    for (const node of nodes) {
      const connections = this.#getConnections(node.id, edges); // Get immediate neighbors
      await this.#initilizeRouterTable(node, connections, isAnimated).then(
        (res) => routers.push(res)
      );
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

  async #initilizeRouterTable(
    node: Node,
    connections: IConnection[],
    isAnimated: boolean
  ): Promise<Node> {
    const table = new Map<number, IDistance>();
    // Populate table based on connections
    for (const conn of connections) {
      table.set(conn.otherRouterId, {
        destination: conn.otherRouterId,
        distance: conn.weight,
        nextHop: conn.otherRouterId,
      } as IDistance);
      // Animate sending of data
      if (isAnimated)
        await movePacket(`${conn.selfRouterId}`, `${conn.otherRouterId}`);

      // Animate newly found router
      if (isAnimated)
        await animationQ.run(lineBlinkGreen(`#line-${conn.lineId}`));
    }
    table.set(node.id, {
      destination: node.id,
      distance: 0,
      nextHop: node.id,
    });
    return {
      ...node,
      table: table,
    };
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
    console.log(routers);
    return [`#line-${connection.lineId}`];
  }

  #getRouterById(routers: Node[], id: number) {
    for (let router of routers) {
      if (router.id === id) {
        return router;
      }
    }
  }
}
