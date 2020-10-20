export type StopRouteCacheType = {
    stop: { id: string, routeDirection: string, sequence: number },
    variant: {
        route: { number: string, bound: number },
        serviceType: number,
        origin: string,
        destination: string,
        description: string,
    },
    sequence: number
}[];