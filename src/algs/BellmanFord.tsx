import { Graph, Edge, Node } from "../types/bin";

export default class BellmanFord {
    
    performBellmanFord(G: Graph) {
        let edges = G.edges;
        let nodes = G.nodes;

        // Create routers and their initial table
        let routers = this.#initilizeRouters(edges, nodes);

        let hasChanges = true; // True initially so while loop runs
        while (hasChanges) {
            hasChanges = false; // Easier to set this false each loop since it starts true
            // Loop through all Routers and share table with neighbors that are not next hop on weight value
            // Set hasChanged to true if any tables are updated
            for (const router of routers){
                // Get routers connections
                const conns = this.#getConnections(router.id, edges);
                for (const con of conns) {
                    let localHasChanged = false;
                    [routers, localHasChanged] = this.#optimizeTable(con, routers)
                    hasChanges = (localHasChanged || hasChanges ) // Keeps true if any localHasChanged return true once
                }
            }
        }
        console.log(routers)
    }

    #optimizeTable(connection: IConnection, routers: IRouter[]): [IRouter[], boolean] {
        const toRouter = routers.find(r => connection.otherRouterId === r.id); // Router to optimize 
        const fromRouter = routers.find(r => connection.selfRouterId === r.id);
        if (!toRouter || !fromRouter) throw new Error("Error, check connections.")
        let hasChanged = false;
        for (const [routerId, distanceInfo] of fromRouter.table.entries()) {
            if (distanceInfo.nextHop === toRouter.id) continue; // Dont 'send' optimize route to nextHop already in path

            let selfRouterCon = fromRouter.table.get(routerId);
            if (!selfRouterCon) throw new Error("No selfRouter eerr");
            const selfRouterDistance = selfRouterCon?.distance;

            if (!toRouter.table.has(routerId)) { // If not set routerId then add newly found Router
                toRouter.table.set((routerId), {
                    nextHop: fromRouter.id,
                    destination: routerId,
                    distance: connection.weight + distanceInfo.distance
                })
                hasChanged = true;
            } // Otherwise, If distance is shorter, add new path & dist
            else if (toRouter.table.has(routerId) && connection.weight + distanceInfo.distance < selfRouterDistance) { 
                toRouter.table.set(routerId, {
                    nextHop: fromRouter.id,
                    destination: routerId,
                    distance: connection.weight + distanceInfo.distance
                })
                hasChanged = true;
            }
          }
            // Remember to replace selfRouter before return
            routers.map(r => { // Replace router with new state
                if (r.id === toRouter.id) {
                    return toRouter;
                }
                else {
                    return r;
                }
              })
          return [routers, hasChanged]
    }

    #initilizeRouters(edges: Edge[], nodes: Node[]): IRouter[] {
        let routers: IRouter[] = [];
        for (const node of nodes) {
            const connections = this.#getConnections(node.id, edges);
            const router = this.#initilizeRouterTable(node, connections);
            routers.push(router);
        }
        return routers;
    }

    #getConnections(nodeId: number, edges: Edge[]): IConnection[] {
        const connectedEdges: IConnection[] = [];
        for (const edge of edges) {
            if (edge.firstNode.id === nodeId || edge.secondNode.id === nodeId) {
                const otherId = edge.firstNode.id === nodeId ? edge.secondNode.id :  edge.firstNode.id;
                connectedEdges.push({
                    selfRouterId: nodeId,
                    otherRouterId: otherId,
                    weight: edge.weight,
                })
            }
        }
        return connectedEdges;
    }

    #initilizeRouterTable(node: Node, connections: IConnection[]): IRouter {
        const table = new Map<number, IDistance>();
        // Populate table based on connections
        for (const conn of connections) {
            table.set(conn.otherRouterId, {
                destination: conn.otherRouterId,
                distance: conn.weight,
                nextHop: conn.otherRouterId
            } as IDistance)
        }
        return {
            ...node,
            table: table
        }
    }
}
interface IDistance {
    destination: number;
    distance: number;
    nextHop: number;
}
interface IRouter extends Node {
    table: Map<number, IDistance>; // Destination NodeId and Distance info
}
interface IConnection {
    selfRouterId: number;
    otherRouterId: number;
    weight: number;
}