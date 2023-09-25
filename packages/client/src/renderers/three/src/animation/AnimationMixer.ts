import { AnimationAction } from './AnimationAction.js';
import { EventDispatcher } from '../core/EventDispatcher.js';
import { PropertyBinding } from './PropertyBinding.js';
import { PropertyMixer } from './PropertyMixer.js';
import { AnimationClip } from './AnimationClip.js';
import { AnimationBlendMode, NormalAnimationBlendMode } from '../constants.js';
import { Interpolants } from '../math/interpolants/interpolants.js';
import { AnimationObjectGroup } from './AnimationObjectGroup.js';
import { Object3D } from '../core/Object3D.js';
import { Interpolant } from '../math/interpolants/Interpolant.js';

const _controlInterpolantsResultBuffer = new Float32Array(1);

type Root = Object3D | AnimationObjectGroup;
export class AnimationMixer extends EventDispatcher<AnimationMixer.Event['type'], AnimationMixer.Event> {
  _root: Root;
  _accuIndex: number;
  time: number;
  timeScale: number;
  _actionsByClip: Record<string, { knownActions: AnimationAction[]; actionByRoot: Record<string, AnimationAction> }>;
  _actions: AnimationAction[];
  _nActiveActions: number;
  _bindingsByRootAndName: Record<string, Record<string, any>>;
  _bindings: PropertyMixer[];
  _nActiveBindings: number;

  constructor(root: Root) {
    super();

    this._root = root;
    this._initMemoryManager();
    this._accuIndex = 0;
    this.time = 0;
    this.timeScale = 1.0;
  }
  clipAction(
    clip: AnimationClip | string,
    optionalRoot?: Root,
    blendMode?: AnimationBlendMode,
  ): AnimationAction | null {
    const root = optionalRoot || this._root;
    const rootUuid = root.uuid;

    let clipObject = typeof clip === 'string' ? AnimationClip.findByName(root as any, clip) : clip;

    const clipUuid = clipObject?.uuid ?? clip;

    const actionsForClip = this._actionsByClip[clipUuid as string];
    let prototypeAction = null;

    if (blendMode === undefined) {
      if (clipObject !== null) {
        blendMode = clipObject.blendMode;
      } else {
        blendMode = NormalAnimationBlendMode;
      }
    }

    if (actionsForClip !== undefined) {
      const existingAction = actionsForClip.actionByRoot[rootUuid];

      if (existingAction !== undefined && existingAction.blendMode === blendMode) {
        return existingAction;
      }

      // we know the clip, so we don't have to parse all
      // the bindings again but can just copy
      prototypeAction = actionsForClip.knownActions[0];

      // also, take the clip from the prototype action
      if (clipObject === null) clipObject = prototypeAction._clip;
    }

    if (clipObject === null) return null;
    const newAction = new AnimationAction(this, clipObject, optionalRoot as Object3D, blendMode);

    this._bindAction(newAction, prototypeAction!);
    this._addInactiveAction(newAction, clipUuid, rootUuid);
    return newAction;
  }
  existingAction(clip: string | AnimationClip, optionalRoot?: Root): AnimationAction | null {
    const root = optionalRoot || this._root,
      rootUuid = root.uuid,
      clipObject = typeof clip === 'string' ? AnimationClip.findByName(root as any, clip) : clip,
      clipUuid = clipObject ? clipObject.uuid : clip,
      actionsForClip = this._actionsByClip[clipUuid as string];

    if (actionsForClip !== undefined) {
      return actionsForClip.actionByRoot[rootUuid] || null;
    }

    return null;
  }
  stopAllAction(): AnimationMixer {
    const actions = this._actions,
      nActions = this._nActiveActions;

    for (let i = nActions - 1; i >= 0; --i) actions[i].stop();

    return this;
  }
  update(deltaTime: number): AnimationMixer {
    deltaTime *= this.timeScale;

    const actions = this._actions,
      nActions = this._nActiveActions,
      time = (this.time += deltaTime),
      timeDirection = Math.sign(deltaTime),
      accuIndex = (this._accuIndex ^= 1);

    // run active actions

    for (let i = 0; i !== nActions; ++i) {
      const action = actions[i];

      action._update(time, deltaTime, timeDirection, accuIndex);
    }

    // update scene graph

    const bindings = this._bindings,
      nBindings = this._nActiveBindings;

    for (let i = 0; i !== nBindings; ++i) {
      bindings[i].apply(accuIndex);
    }

    return this;
  }
  setTime(timeInSeconds: number): AnimationMixer {
    this.time = 0; // Zero out time attribute for AnimationMixer object;
    for (let i = 0; i < this._actions.length; i++) {
      this._actions[i].time = 0; // Zero out time attribute for all associated AnimationAction objects.
    }

    return this.update(timeInSeconds); // Update used to set exact time. Returns "this" AnimationMixer object.
  }
  getRoot(): Root {
    return this._root;
  }
  uncacheClip(clip: AnimationClip): void {
    const actions = this._actions,
      clipUuid = clip.uuid,
      actionsByClip = this._actionsByClip,
      actionsForClip = actionsByClip[clipUuid];

    if (actionsForClip !== undefined) {
      // note: just calling _removeInactiveAction would mess up the
      // iteration state and also require updating the state we can
      // just throw away

      const actionsToRemove = actionsForClip.knownActions;

      for (let i = 0, n = actionsToRemove.length; i !== n; ++i) {
        const action = actionsToRemove[i];

        this._deactivateAction(action);

        const cacheIndex = action._cacheIndex!,
          lastInactiveAction = actions[actions.length - 1];

        action._cacheIndex = null;
        action._byClipCacheIndex = null;

        lastInactiveAction._cacheIndex = cacheIndex;
        actions[cacheIndex] = lastInactiveAction;
        actions.pop();

        this._removeInactiveBindingsForAction(action);
      }

      delete actionsByClip[clipUuid];
    }
  }
  uncacheRoot(root: Root): void {
    const rootUuid = root.uuid,
      actionsByClip = this._actionsByClip;

    for (const clipUuid in actionsByClip) {
      const actionByRoot = actionsByClip[clipUuid].actionByRoot,
        action = actionByRoot[rootUuid];

      if (action !== undefined) {
        this._deactivateAction(action);
        this._removeInactiveAction(action);
      }
    }

    const bindingsByRoot = this._bindingsByRootAndName,
      bindingByName = bindingsByRoot[rootUuid];

    if (bindingByName !== undefined) {
      for (const trackName in bindingByName) {
        const binding = bindingByName[trackName];
        binding.restoreOriginalState();
        this._removeInactiveBinding(binding);
      }
    }
  }
  uncacheAction(clip: AnimationClip, optionalRoot?: Root): void {
    const action = this.existingAction(clip, optionalRoot);

    if (action !== null) {
      this._deactivateAction(action);
      this._removeInactiveAction(action);
    }
  }

  _bindAction(action: AnimationAction, prototypeAction: AnimationAction) {
    const root = action._localRoot || this._root,
      tracks = action._clip.tracks,
      nTracks = tracks.length,
      bindings = action._propertyBindings,
      interpolants = action._interpolants,
      rootUuid = root.uuid,
      bindingsByRoot = this._bindingsByRootAndName;

    let bindingsByName = bindingsByRoot[rootUuid];

    if (bindingsByName === undefined) {
      bindingsByName = {};
      bindingsByRoot[rootUuid] = bindingsByName;
    }

    for (let i = 0; i !== nTracks; ++i) {
      const track = tracks[i],
        trackName = track.name;

      let binding = bindingsByName[trackName];

      if (binding !== undefined) {
        ++binding.referenceCount;
        bindings[i] = binding;
      } else {
        binding = bindings[i];

        if (binding !== undefined) {
          // existing binding, make sure the cache knows

          if (binding._cacheIndex === null) {
            ++binding.referenceCount;
            this._addInactiveBinding(binding, rootUuid, trackName);
          }

          continue;
        }

        const path = prototypeAction && prototypeAction._propertyBindings[i].binding.parsedPath;

        binding = new PropertyMixer(
          PropertyBinding.create(root, trackName, path),
          track.ValueTypeName,
          track.getValueSize(),
        );

        ++binding.referenceCount;
        this._addInactiveBinding(binding, rootUuid, trackName);

        bindings[i] = binding;
      }

      interpolants[i].result = binding.buffer;
    }
  }
  _activateAction(action: AnimationAction) {
    if (!this._isActiveAction(action)) {
      if (action._cacheIndex === null) {
        // this action has been forgotten by the cache, but the user
        // appears to be still using it -> rebind

        const rootUuid = (action._localRoot || this._root).uuid,
          clipUuid = action._clip.uuid,
          actionsForClip = this._actionsByClip[clipUuid];

        this._bindAction(action, actionsForClip && actionsForClip.knownActions[0]);

        this._addInactiveAction(action, clipUuid, rootUuid);
      }

      const bindings = action._propertyBindings;

      // increment reference counts / sort out state
      for (let i = 0, n = bindings.length; i !== n; ++i) {
        const binding = bindings[i];

        if (binding.useCount++ === 0) {
          this._lendBinding(binding);
          binding.saveOriginalState();
        }
      }

      this._lendAction(action);
    }
  }
  _deactivateAction(action: AnimationAction) {
    if (this._isActiveAction(action)) {
      const bindings = action._propertyBindings;

      // decrement reference counts / sort out state
      for (let i = 0, n = bindings.length; i !== n; ++i) {
        const binding = bindings[i];

        if (--binding.useCount === 0) {
          binding.restoreOriginalState();
          this._takeBackBinding(binding);
        }
      }

      this._takeBackAction(action);
    }
  }
  _initMemoryManager() {
    this._actions = []; // 'nActiveActions' followed by inactive ones
    this._nActiveActions = 0;

    this._actionsByClip = {};
    // inside:
    // {
    // 	knownActions: Array< AnimationAction > - used as prototypes
    // 	actionByRoot: AnimationAction - lookup
    // }

    this._bindings = []; // 'nActiveBindings' followed by inactive ones
    this._nActiveBindings = 0;

    this._bindingsByRootAndName = {}; // inside: Map< name, PropertyMixer >

    this._controlInterpolants = []; // same game as above
    this._nActiveControlInterpolants = 0;

    const scope = this;

    this.stats = {
      actions: {
        get total() {
          return scope._actions.length;
        },
        get inUse() {
          return scope._nActiveActions;
        },
      },
      bindings: {
        get total() {
          return scope._bindings.length;
        },
        get inUse() {
          return scope._nActiveBindings;
        },
      },
      controlInterpolants: {
        get total() {
          return scope._controlInterpolants.length;
        },
        get inUse() {
          return scope._nActiveControlInterpolants;
        },
      },
    };
  }
  _isActiveAction(action: AnimationAction) {
    const index = action._cacheIndex;
    return index !== null && index < this._nActiveActions;
  }
  _addInactiveAction(action: AnimationAction, clipUuid: string, rootUuid: string) {
    const actions = this._actions,
      actionsByClip = this._actionsByClip;

    let actionsForClip = actionsByClip[clipUuid];

    if (actionsForClip === undefined) {
      actionsForClip = {
        knownActions: [action],
        actionByRoot: {},
      };

      action._byClipCacheIndex = 0;

      actionsByClip[clipUuid] = actionsForClip;
    } else {
      const knownActions = actionsForClip.knownActions;

      action._byClipCacheIndex = knownActions.length;
      knownActions.push(action);
    }

    action._cacheIndex = actions.length;
    actions.push(action);

    actionsForClip.actionByRoot[rootUuid] = action;
  }
  _removeInactiveAction(action: AnimationAction) {
    const actions = this._actions,
      lastInactiveAction = actions[actions.length - 1],
      cacheIndex = action._cacheIndex;

    lastInactiveAction._cacheIndex = cacheIndex;
    actions[cacheIndex] = lastInactiveAction;
    actions.pop();

    action._cacheIndex = null;

    const clipUuid = action._clip.uuid,
      actionsByClip = this._actionsByClip,
      actionsForClip = actionsByClip[clipUuid],
      knownActionsForClip = actionsForClip.knownActions,
      lastKnownAction = knownActionsForClip[knownActionsForClip.length - 1],
      byClipCacheIndex = action._byClipCacheIndex;

    lastKnownAction._byClipCacheIndex = byClipCacheIndex;
    knownActionsForClip[byClipCacheIndex] = lastKnownAction;
    knownActionsForClip.pop();

    action._byClipCacheIndex = null;

    const actionByRoot = actionsForClip.actionByRoot,
      rootUuid = (action._localRoot || this._root).uuid;

    delete actionByRoot[rootUuid];

    if (knownActionsForClip.length === 0) {
      delete actionsByClip[clipUuid];
    }

    this._removeInactiveBindingsForAction(action);
  }
  _removeInactiveBindingsForAction(action: AnimationAction) {
    const bindings = action._propertyBindings;

    for (let i = 0, n = bindings.length; i !== n; ++i) {
      const binding = bindings[i];

      if (--binding.referenceCount === 0) {
        this._removeInactiveBinding(binding);
      }
    }
  }
  _lendAction(action: AnimationAction) {
    // [ active actions |  inactive actions  ]
    // [  active actions >| inactive actions ]
    //                 s        a
    //                  <-swap->
    //                 a        s

    const actions = this._actions,
      prevIndex = action._cacheIndex,
      lastActiveIndex = this._nActiveActions++,
      firstInactiveAction = actions[lastActiveIndex];

    action._cacheIndex = lastActiveIndex;
    actions[lastActiveIndex] = action;

    firstInactiveAction._cacheIndex = prevIndex;
    actions[prevIndex] = firstInactiveAction;
  }
  _takeBackAction(action: AnimationAction) {
    // [  active actions  | inactive actions ]
    // [ active actions |< inactive actions  ]
    //        a        s
    //         <-swap->
    //        s        a

    const actions = this._actions,
      prevIndex = action._cacheIndex,
      firstInactiveIndex = --this._nActiveActions,
      lastActiveAction = actions[firstInactiveIndex];

    action._cacheIndex = firstInactiveIndex;
    actions[firstInactiveIndex] = action;

    lastActiveAction._cacheIndex = prevIndex;
    actions[prevIndex] = lastActiveAction;
  }
  _addInactiveBinding(binding: PropertyBinding, rootUuid: string, trackName: string) {
    const bindingsByRoot = this._bindingsByRootAndName,
      bindings = this._bindings;

    let bindingByName = bindingsByRoot[rootUuid];

    if (bindingByName === undefined) {
      bindingByName = {};
      bindingsByRoot[rootUuid] = bindingByName;
    }

    bindingByName[trackName] = binding;

    binding._cacheIndex = bindings.length;
    bindings.push(binding);
  }
  _removeInactiveBinding(binding: PropertyBinding) {
    const bindings = this._bindings,
      propBinding = binding.binding,
      rootUuid = propBinding.rootNode.uuid,
      trackName = propBinding.path,
      bindingsByRoot = this._bindingsByRootAndName,
      bindingByName = bindingsByRoot[rootUuid],
      lastInactiveBinding = bindings[bindings.length - 1],
      cacheIndex = binding._cacheIndex;

    lastInactiveBinding._cacheIndex = cacheIndex;
    bindings[cacheIndex] = lastInactiveBinding;
    bindings.pop();

    delete bindingByName[trackName];

    if (Object.keys(bindingByName).length === 0) {
      delete bindingsByRoot[rootUuid];
    }
  }
  _lendBinding(binding: PropertyBinding) {
    const bindings = this._bindings,
      prevIndex = binding._cacheIndex,
      lastActiveIndex = this._nActiveBindings++,
      firstInactiveBinding = bindings[lastActiveIndex];

    binding._cacheIndex = lastActiveIndex;
    bindings[lastActiveIndex] = binding;

    firstInactiveBinding._cacheIndex = prevIndex;
    bindings[prevIndex] = firstInactiveBinding;
  }
  _takeBackBinding(binding: PropertyBinding) {
    const bindings = this._bindings,
      prevIndex = binding._cacheIndex,
      firstInactiveIndex = --this._nActiveBindings,
      lastActiveBinding = bindings[firstInactiveIndex];

    binding._cacheIndex = firstInactiveIndex;
    bindings[firstInactiveIndex] = binding;

    lastActiveBinding._cacheIndex = prevIndex;
    bindings[prevIndex] = lastActiveBinding;
  }
  _lendControlInterpolant() {
    const interpolants = this._controlInterpolants,
      lastActiveIndex = this._nActiveControlInterpolants++;

    let interpolant = interpolants[lastActiveIndex];

    if (interpolant === undefined) {
      interpolant = Interpolants.linear({
        samples: new Float32Array(2),
        positions: new Float32Array(2),
        stride: 1,
        result: _controlInterpolantsResultBuffer,
        index: lastActiveIndex,
      });
      interpolants[lastActiveIndex] = interpolant;
    }

    return interpolant;
  }
  _takeBackControlInterpolant(interpolant: Interpolant) {
    const interpolants = this._controlInterpolants,
      prevIndex = interpolant.__cacheIndex,
      firstInactiveIndex = --this._nActiveControlInterpolants,
      lastActiveInterpolant = interpolants[firstInactiveIndex];

    interpolant.__cacheIndex = firstInactiveIndex;
    interpolants[firstInactiveIndex] = interpolant;

    lastActiveInterpolant.__cacheIndex = prevIndex;
    interpolants[prevIndex] = lastActiveInterpolant;
  }
}

export namespace AnimationMixer {
  export interface ProgressEvent extends EventDispatcher.Event<'finished', AnimationMixer> {
    action: AnimationAction;
    direction: -1 | 1;
  }

  export interface LoopEvent extends EventDispatcher.Event<'loop', AnimationMixer> {
    action: AnimationAction;
    loopDelta: number;
  }

  export type Event = ProgressEvent | LoopEvent;
}
