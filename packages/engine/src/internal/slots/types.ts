export interface Slots {
  toggleAt(item: string | GPUBuffer, at: GPU, index?: number): void;
  get next(): number;
  get max(): number;
  map: Map<number, GPUBuffer>;
}
