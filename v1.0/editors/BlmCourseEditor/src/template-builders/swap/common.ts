import { BaseComponent } from "types";

export function copyDeletableComponent<T>(source: BaseComponent<T>, destination: BaseComponent<T>) {
  if (source.isDeletable && destination.isDeletable) {
    destination.isDeactivated = source.isDeactivated;
  }
}
