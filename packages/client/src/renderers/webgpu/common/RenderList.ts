import { lights } from 'three/examples/jsm/nodes/Nodes.js';

function painterSortStable(a: any, b: any) {
  if (a.groupOrder !== b.groupOrder) return a.groupOrder - b.groupOrder;
  if (a.renderOrder !== b.renderOrder) return a.renderOrder - b.renderOrder;
  if (a.material.id !== b.material.id) return a.material.id - b.material.id;
  if (a.z !== b.z) return a.z - b.z;
  return a.id - b.id;
}

function reversePainterSortStable(a: any, b: any) {
  if (a.groupOrder !== b.groupOrder) return a.groupOrder - b.groupOrder;
  if (a.renderOrder !== b.renderOrder) return a.renderOrder - b.renderOrder;
  if (a.z !== b.z) return b.z - a.z;
  return a.id - b.id;
}

class RenderList {
  renderItems: any[];
  renderItemsIndex: number;
  opaque: any[];
  transparent: any[];
  lightsNode: any;
  lightsArray: any[];

  constructor() {
    this.renderItems = [];
    this.renderItemsIndex = 0;

    this.opaque = [];
    this.transparent = [];

    this.lightsNode = lights([]);
    this.lightsArray = [];
  }

  init() {
    this.renderItemsIndex = 0;

    this.opaque.length = 0;
    this.transparent.length = 0;
    this.lightsArray.length = 0;

    return this;
  }

  getNextRenderItem(object: any, geometry: any, material: any, groupOrder: any, z: any, group: any) {
    let renderItem = this.renderItems[this.renderItemsIndex];

    if (renderItem === undefined) {
      renderItem = {
        id: object.id,
        object: object,
        geometry: geometry,
        material: material,
        groupOrder: groupOrder,
        renderOrder: object.renderOrder,
        z: z,
        group: group,
      };

      this.renderItems[this.renderItemsIndex] = renderItem;
    } else {
      renderItem.id = object.id;
      renderItem.object = object;
      renderItem.geometry = geometry;
      renderItem.material = material;
      renderItem.groupOrder = groupOrder;
      renderItem.renderOrder = object.renderOrder;
      renderItem.z = z;
      renderItem.group = group;
    }

    this.renderItemsIndex++;

    return renderItem;
  }

  push(object: any, geometry: any, material: any, groupOrder: any, z: any, group: any) {
    const renderItem = this.getNextRenderItem(object, geometry, material, groupOrder, z, group);

    (material.transparent === true ? this.transparent : this.opaque).push(renderItem);
  }

  unshift(object: any, geometry: any, material: any, groupOrder: any, z: any, group: any) {
    const renderItem = this.getNextRenderItem(object, geometry, material, groupOrder, z, group);

    (material.transparent === true ? this.transparent : this.opaque).unshift(renderItem);
  }

  pushLight(light: any) {
    this.lightsArray.push(light);
  }

  sort(customOpaqueSort: any, customTransparentSort: any) {
    if (this.opaque.length > 1) this.opaque.sort(customOpaqueSort || painterSortStable);
    if (this.transparent.length > 1) this.transparent.sort(customTransparentSort || reversePainterSortStable);
  }

  finish() {
    // update lights
    this.lightsNode.fromLights(this.lightsArray);

    // Clear references from inactive renderItems in the list
    for (let i = this.renderItemsIndex, il = this.renderItems.length; i < il; i++) {
      const renderItem = this.renderItems[i];

      if (renderItem.id === null) break;

      renderItem.id = null;
      renderItem.object = null;
      renderItem.geometry = null;
      renderItem.material = null;
      renderItem.program = null;
      renderItem.group = null;
    }
  }
}

export default RenderList;
