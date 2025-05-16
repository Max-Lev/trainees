// custom-route-reuse-strategy.ts
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  // This map stores the detached route handles
  private storedHandles = new Map<string, DetachedRouteHandle>();

  // This function checks if the future route and the current route are the same
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // If the route configs of the future and current routes are the same, return true
    return future.routeConfig === curr.routeConfig;
  }

  // This function checks if the route should be detached
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // If the route data contains the 'reuseComponent' property and it is set to true, return true
    return route.data['reuseComponent'] === true;
  }

  // This function stores the detached route handle
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    // If the route data contains the 'reuseComponent' property and it is set to true, store the handle in the map
    if (route.data['reuseComponent']) {
      this.storedHandles.set(this.getPath(route), handle);
    }
  }

  // This function checks if the route should be attached
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // If the route is in the map and the route data contains the 'reuseComponent' property and it is set to true, return true
    return this.storedHandles.has(this.getPath(route)) && route.data['reuseComponent'] === true;
  }

  // This function retrieves the detached route handle
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // If the route is in the map, return the handle, otherwise return null
    return this.storedHandles.get(this.getPath(route)) || null;
  }

  // This function returns the path of the route
  private getPath(route: ActivatedRouteSnapshot): string {
    // Return the path of the route
    return route.pathFromRoot
      .filter(v => v.routeConfig)
      .map(v => v.routeConfig!.path)
      .join('/');
  }
}