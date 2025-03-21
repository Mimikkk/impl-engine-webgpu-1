import Listener = EventDispatcher.Listener;
import Event = EventDispatcher.Event;

export class EventDispatcher<T extends string, E extends Event<T, unknown> = Event<T, any>> {
  listeners: Record<T, EventDispatcher.Listener<T, this>[]> = {} as Record<T, Listener<T, this>[]>;

  addEventListener(type: T, listener: Listener<T, this>): void {
    if (!this.listeners[type]) this.listeners[type] = [];
    if (this.listeners[type].indexOf(listener) !== -1) return;
    this.listeners[type].push(listener);
  }

  hasEventListener(type: T, listener: Listener<T, this>): boolean {
    return (this.listeners[type]?.indexOf(listener) ?? -1) !== -1;
  }

  removeEventListener(type: T, listener: Listener<T, this>): void {
    const index = this.listeners[type]?.indexOf(listener) ?? -1;

    if (index !== -1) this.listeners[type].splice(index, 1);
  }

  dispatchEvent<Event extends E = E>(event: Omit<Event, 'target'>): void {
    const listeners = this.listeners[event.type];
    if (!listeners) return;

    (event as Event).target = this;
    listeners.slice().forEach(listener => listener.call(this, event));
    (event as Event).target = null;
  }
}

export namespace EventDispatcher {
  export interface Event<T extends string, U> {
    type: T;
    target: U;
  }

  export interface Listener<T extends string, U> {
    (event: Event<T, U>): void;
  }
}
