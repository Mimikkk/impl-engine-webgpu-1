import { CCDIKSolver } from './CCDIKSolver.js';
import { MMDPhysics } from './MMDPhysics.js';
import { Camera } from '../cameras/Camera.js';
import { Object3D } from '../core/Object3D.js';
import { AnimationClip } from './AnimationClip.js';
import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { Bone } from '../objects/Bone.js';
import { SkinnedMesh } from '../objects/SkinnedMesh.js';
import { Audio } from '../audio/Audio.js';
import { AnimationMixer } from './AnimationMixer.js';
import LoopEvent = AnimationMixer.LoopEvent;

export class MMDAnimationHelper {
  meshes: SkinnedMesh[];
  camera: Camera | null;
  cameraTarget: Object3D;
  audio: any;
  audioManager: AudioManager | null;
  objects: WeakMap<Object3D, any>;
  configuration: {
    sync: boolean;
    afterglow: number;
    resetPhysicsOnLoop: boolean;
    pmxAnimation: boolean;
  };
  enabled: {
    animation: boolean;
    ik: boolean;
    grant: boolean;
    physics: boolean;
    cameraAnimation: boolean;
  };
  onBeforePhysics: Function;
  sharedPhysics: boolean;
  masterPhysics: any;

  constructor(
    params: {
      sync?: boolean;
      afterglow?: number;
      resetPhysicsOnLoop?: boolean;
      pmxAnimation?: boolean;
    } = {},
  ) {
    this.meshes = [];

    this.camera = null;
    this.cameraTarget = new Object3D();
    this.cameraTarget.name = 'target';

    this.audio = null;
    this.audioManager = null;

    this.objects = new WeakMap();

    this.configuration = {
      sync: params.sync !== undefined ? params.sync : true,
      afterglow: params.afterglow !== undefined ? params.afterglow : 0.0,
      resetPhysicsOnLoop: params.resetPhysicsOnLoop !== undefined ? params.resetPhysicsOnLoop : true,
      pmxAnimation: params.pmxAnimation !== undefined ? params.pmxAnimation : false,
    };

    this.enabled = {
      animation: true,
      ik: true,
      grant: true,
      physics: true,
      cameraAnimation: true,
    };

    this.onBeforePhysics = function (/* mesh */) {};

    // experimental
    this.sharedPhysics = false;
    this.masterPhysics = null;
  }

  /**
   * Adds an Three.js Object to helper and setups animation.
   * The anmation durations of added objects are synched
   * if this.configuration.sync is true.
   *
   * @param {THREE.SkinnedMesh|THREE.Camera|THREE.Audio} object
   * @param {Object} params - (optional)
   * @param {THREE.AnimationClip|Array<THREE.AnimationClip>} params.animation - Only for THREE.SkinnedMesh and THREE.Camera. Default is undefined.
   * @param {boolean} params.physics - Only for THREE.SkinnedMesh. Default is true.
   * @param {Integer} params.warmup - Only for THREE.SkinnedMesh and physics is true. Default is 60.
   * @param {Number} params.unitStep - Only for THREE.SkinnedMesh and physics is true. Default is 1 / 65.
   * @param {Integer} params.maxStepNum - Only for THREE.SkinnedMesh and physics is true. Default is 3.
   * @param {Vector3} params.gravity - Only for THREE.SkinnedMesh and physics is true. Default ( 0, - 9.8 * 10, 0 ).
   * @param {Number} params.delayTime - Only for THREE.Audio. Default is 0.0.
   * @return {MMDAnimationHelper}
   */
  add(
    object: Object3D,
    params: {
      animation?: AnimationClip;
      physics?: boolean;
      warmup?: number;
      unitStep?: number;
      maxStepNum?: number;
      gravity?: Vector3;
      delayTime?: number;
    } = {},
  ) {
    //@ts-expect-error
    if (object.isSkinnedMesh) {
      //@ts-expect-error
      this._addMesh(object, params);
      //@ts-expect-error
    } else if (object.isCamera) {
      //@ts-expect-error
      this._setupCamera(object, params);
    } else if (object.type === 'Audio') {
      //@ts-expect-error
      this._setupAudio(object, params);
    } else {
      throw new Error(
        'THREE.MMDAnimationHelper.add: ' +
          'accepts only ' +
          'THREE.SkinnedMesh or ' +
          'THREE.Camera or ' +
          'THREE.Audio instance.',
      );
    }

    if (this.configuration.sync) this._syncDuration();

    return this;
  }

  remove(object: SkinnedMesh | Camera | Audio) {
    //@ts-expect-error
    if (object.isSkinnedMesh) {
      //@ts-expect-error
      this._removeMesh(object);
      //@ts-expect-error
    } else if (object.isCamera) {
      //@ts-expect-error
      this._clearCamera(object);
    } else if (object.type === 'Audio') {
      //@ts-expect-error
      this._clearAudio(object);
    } else {
      throw new Error(
        'THREE.MMDAnimationHelper.remove: ' +
          'accepts only ' +
          'THREE.SkinnedMesh or ' +
          'THREE.Camera or ' +
          'THREE.Audio instance.',
      );
    }

    if (this.configuration.sync) this._syncDuration();

    return this;
  }

  update(delta: number) {
    if (this.audioManager !== null) this.audioManager.control(delta);

    for (let i = 0; i < this.meshes.length; i++) {
      this._animateMesh(this.meshes[i], delta);
    }

    if (this.sharedPhysics) this._updateSharedPhysics(delta);

    if (this.camera !== null) this._animateCamera(this.camera, delta);

    return this;
  }

  /**
   * Changes the pose of SkinnedMesh as VPD specifies.
   *
   * @param {THREE.SkinnedMesh} mesh
   * @param {Object} vpd - VPD content parsed MMDParser
   * @param {Object} params - (optional)
   * @param {boolean} params.resetPose - Default is true.
   * @param {boolean} params.ik - Default is true.
   * @param {boolean} params.grant - Default is true.
   * @return {MMDAnimationHelper}
   */
  pose(
    mesh: SkinnedMesh,
    vpd: any,
    params: {
      resetPose?: boolean;
      ik?: boolean;
      grant?: boolean;
    } = {},
  ) {
    if (params.resetPose !== false) mesh.pose();

    const bones = mesh.skeleton.bones;
    const boneParams = vpd.bones;

    const boneNameDictionary: Record<string, number> = {};

    for (let i = 0, il = bones.length; i < il; i++) {
      boneNameDictionary[bones[i].name] = i;
    }

    const vector = new Vector3();
    const quaternion = new Quaternion();

    for (let i = 0, il = boneParams.length; i < il; i++) {
      const boneParam = boneParams[i];
      const boneIndex = boneNameDictionary[boneParam.name];

      if (boneIndex === undefined) continue;

      const bone = bones[boneIndex];
      bone.position.add(vector.fromArray(boneParam.translation));
      bone.quaternion.multiply(quaternion.fromArray(boneParam.quaternion));
    }

    mesh.updateMatrixWorld(true);

    // PMX animation system special path
    //@ts-expect-error
    if (this.configuration.pmxAnimation && mesh.geometry.userData.MMD && mesh.geometry.userData.MMD.format === 'pmx') {
      //@ts-expect-error
      const sortedBonesData = this._sortBoneDataArray(mesh.geometry.userData.MMD.bones.slice());
      const ikSolver = params.ik !== false ? this._createCCDIKSolver(mesh) : null;
      const grantSolver = params.grant !== false ? this.createGrantSolver(mesh) : null;
      this._animatePMXMesh(mesh, sortedBonesData, ikSolver!, grantSolver!);
    } else {
      if (params.ik !== false) {
        this._createCCDIKSolver(mesh).update();
      }

      if (params.grant !== false) {
        this.createGrantSolver(mesh).update();
      }
    }

    return this;
  }

  /**
   * Enabes/Disables an animation feature.
   *
   * @param {string} key
   * @param {boolean} enabled
   * @return {MMDAnimationHelper}
   */
  enable(key: keyof typeof this.enabled, enabled: boolean) {
    if (this.enabled[key] === undefined) {
      throw new Error('THREE.MMDAnimationHelper.enable: ' + 'unknown key ' + key);
    }

    this.enabled[key] = enabled;

    if (key === 'physics') {
      for (let i = 0, il = this.meshes.length; i < il; i++) {
        this._optimizeIK(this.meshes[i], enabled);
      }
    }

    return this;
  }

  /**
   * Creates an GrantSolver instance.
   *
   * @param {THREE.SkinnedMesh} mesh
   * @return {GrantSolver}
   */
  createGrantSolver(mesh: SkinnedMesh) {
    //@ts-expect-error
    return new GrantSolver(mesh, mesh.geometry.userData.MMD.grants);
  }

  // private methods

  _addMesh(
    mesh: SkinnedMesh,
    params: {
      animation?: AnimationClip;
      physics?: boolean;
      warmup?: number;
      unitStep?: number;
      maxStepNum?: number;
      gravity?: Vector3;
    },
  ) {
    if (this.meshes.indexOf(mesh) >= 0) {
      throw new Error(
        'THREE.MMDAnimationHelper._addMesh: ' + "SkinnedMesh '" + mesh.name + "' has already been added.",
      );
    }

    this.meshes.push(mesh);
    this.objects.set(mesh, { looped: false });

    //@ts-expect-error
    this._setupMeshAnimation(mesh, params.animation);

    if (params.physics !== false) {
      this._setupMeshPhysics(mesh, params);
    }

    return this;
  }

  _setupCamera(
    camera: Camera,
    params: {
      animation?: AnimationClip;
    },
  ) {
    if (this.camera === camera) {
      throw new Error('THREE.MMDAnimationHelper._setupCamera: ' + "Camera '" + camera.name + "' has already been set.");
    }

    //@ts-expect-error
    if (this.camera) this.clearCamera(this.camera);

    this.camera = camera;

    camera.add(this.cameraTarget);

    this.objects.set(camera, {});

    if (params.animation !== undefined) {
      this._setupCameraAnimation(camera, params.animation);
    }

    return this;
  }

  _setupAudio(
    audio: Audio,
    params: {
      delayTime?: number;
    },
  ) {
    if (this.audio === audio) {
      throw new Error('THREE.MMDAnimationHelper._setupAudio: ' + "Audio '" + audio.name + "' has already been set.");
    }

    //@ts-expect-error
    if (this.audio) this.clearAudio(this.audio);

    this.audio = audio;
    this.audioManager = new AudioManager(audio, params);

    //@ts-expect-error
    this.objects.set(this.audioManager, {
      duration: this.audioManager.duration,
    });

    return this;
  }

  _removeMesh(mesh: SkinnedMesh) {
    let found = false;
    let writeIndex = 0;

    for (let i = 0, il = this.meshes.length; i < il; i++) {
      if (this.meshes[i] === mesh) {
        this.objects.delete(mesh);
        found = true;

        continue;
      }

      this.meshes[writeIndex++] = this.meshes[i];
    }

    if (!found) {
      throw new Error(
        'THREE.MMDAnimationHelper._removeMesh: ' + "SkinnedMesh '" + mesh.name + "' has not been added yet.",
      );
    }

    this.meshes.length = writeIndex;

    return this;
  }

  _clearCamera(camera: Camera) {
    if (camera !== this.camera) {
      throw new Error('THREE.MMDAnimationHelper._clearCamera: ' + "Camera '" + camera.name + "' has not been set yet.");
    }

    this.camera.remove(this.cameraTarget);

    this.objects.delete(this.camera);
    this.camera = null;

    return this;
  }

  _clearAudio(audio: Audio) {
    if (audio !== this.audio) {
      throw new Error('THREE.MMDAnimationHelper._clearAudio: ' + "Audio '" + audio.name + "' has not been set yet.");
    }

    this.objects.delete(this.audioManager as any);

    this.audio = null;
    this.audioManager = null;

    return this;
  }

  _setupMeshAnimation(mesh: SkinnedMesh, animation: AnimationClip) {
    const objects = this.objects.get(mesh);

    if (animation !== undefined) {
      const animations = Array.isArray(animation) ? animation : [animation];

      objects.mixer = new AnimationMixer(mesh);

      for (let i = 0, il = animations.length; i < il; i++) {
        objects.mixer.clipAction(animations[i]).play();
      }

      // TODO: find a workaround not to access ._clip looking like a private property
      objects.mixer.addEventListener('loop', function (event: LoopEvent) {
        const tracks = event.action._clip.tracks;

        if (tracks.length > 0 && tracks[0].name.slice(0, 6) !== '.bones') return;

        objects.looped = true;
      });
    }

    objects.ikSolver = this._createCCDIKSolver(mesh);
    objects.grantSolver = this.createGrantSolver(mesh);

    return this;
  }

  _setupCameraAnimation(camera: Camera, animation: AnimationClip) {
    const animations = Array.isArray(animation) ? animation : [animation];

    const objects = this.objects.get(camera);

    objects.mixer = new AnimationMixer(camera);

    for (let i = 0, il = animations.length; i < il; i++) {
      objects.mixer.clipAction(animations[i]).play();
    }
  }

  _setupMeshPhysics(
    mesh: SkinnedMesh,
    params: {
      warmup?: number;
      unitStep?: number;
      maxStepNum?: number;
      gravity?: Vector3;
      world?: any;
    },
  ) {
    const objects = this.objects.get(mesh);

    // shared physics is experimental

    if (params.world === undefined && this.sharedPhysics) {
      const masterPhysics = this._getMasterPhysics();

      //@ts-expect-error
      if (masterPhysics !== null) world = masterPhysics.world; // eslint-disable-line no-undef
    }

    objects.physics = this._createMMDPhysics(mesh, params);

    //@ts-expect-error
    if (objects.mixer && params.animationWarmup !== false) {
      this._animateMesh(mesh, 0);
      objects.physics.reset();
    }

    objects.physics.warmup(params.warmup !== undefined ? params.warmup : 60);

    this._optimizeIK(mesh, true);
  }

  _animateMesh(mesh: SkinnedMesh, delta: number) {
    const objects = this.objects.get(mesh);

    const mixer = objects.mixer;
    const ikSolver = objects.ikSolver;
    const grantSolver = objects.grantSolver;
    const physics = objects.physics;
    const looped = objects.looped;

    if (mixer && this.enabled.animation) {
      // alternate solution to save/restore bones but less performant?
      //mesh.pose();
      //this._updatePropertyMixersBuffer( mesh );

      this._restoreBones(mesh);

      mixer.update(delta);

      this._saveBones(mesh);

      // PMX animation system special path
      if (
        this.configuration.pmxAnimation &&
        //@ts-expect-error
        mesh.geometry.userData.MMD &&
        //@ts-expect-error
        mesh.geometry.userData.MMD.format === 'pmx'
      ) {
        if (!objects.sortedBonesData)
          //@ts-expect-error
          objects.sortedBonesData = this._sortBoneDataArray(mesh.geometry.userData.MMD.bones.slice());

        this._animatePMXMesh(
          mesh,
          objects.sortedBonesData,
          ikSolver && this.enabled.ik ? ikSolver : null,
          grantSolver && this.enabled.grant ? grantSolver : null,
        );
      } else {
        if (ikSolver && this.enabled.ik) {
          mesh.updateMatrixWorld(true);
          ikSolver.update();
        }

        if (grantSolver && this.enabled.grant) {
          grantSolver.update();
        }
      }
    }

    if (looped === true && this.enabled.physics) {
      if (physics && this.configuration.resetPhysicsOnLoop) physics.reset();

      objects.looped = false;
    }

    if (physics && this.enabled.physics && !this.sharedPhysics) {
      this.onBeforePhysics(mesh);
      physics.update(delta);
    }
  }

  // Sort bones in order by 1. transformationClass and 2. bone index.
  // In PMX animation system, bone transformations should be processed
  // in this order.
  _sortBoneDataArray(boneDataArray: Bone[]) {
    return boneDataArray.sort(function (a, b) {
      //@ts-expect-error
      if (a.transformationClass !== b.transformationClass) {
        //@ts-expect-error
        return a.transformationClass - b.transformationClass;
      } else {
        //@ts-expect-error
        return a.index - b.index;
      }
    });
  }

  // PMX Animation system is a bit too complex and doesn't great match to
  // Three.js Animation system. This method attempts to simulate it as much as
  // possible but doesn't perfectly simulate.
  // This method is more costly than the regular one so
  // you are recommended to set constructor parameter "pmxAnimation: true"
  // only if your PMX model animation doesn't work well.
  // If you need better method you would be required to write your own.
  _animatePMXMesh(mesh: SkinnedMesh, sortedBonesData: Bone[], ikSolver: CCDIKSolver, grantSolver: GrantSolver) {
    _quaternionIndex = 0;
    _grantResultMap.clear();

    for (let i = 0, il = sortedBonesData.length; i < il; i++) {
      //@ts-expect-error
      updateOne(mesh, sortedBonesData[i].index, ikSolver, grantSolver);
    }

    mesh.updateMatrixWorld(true);
    return this;
  }

  _animateCamera(camera: Camera, delta: number) {
    const mixer = this.objects.get(camera).mixer;

    if (mixer && this.enabled.cameraAnimation) {
      mixer.update(delta);

      //@ts-expect-error
      camera.updateProjectionMatrix();

      camera.up.set(0, 1, 0);
      camera.up.applyQuaternion(camera.quaternion);
      camera.lookAt(this.cameraTarget.position);
    }
  }

  _optimizeIK(mesh: SkinnedMesh, physicsEnabled: boolean) {
    //@ts-expect-error
    const iks = mesh.geometry.userData.MMD.iks;
    //@ts-expect-error
    const bones = mesh.geometry.userData.MMD.bones;

    for (let i = 0, il = iks.length; i < il; i++) {
      const ik = iks[i];
      const links = ik.links;

      for (let j = 0, jl = links.length; j < jl; j++) {
        const link = links[j];

        if (physicsEnabled === true) {
          // disable IK of the bone the corresponding rigidBody type of which is 1 or 2
          // because its rotation will be overriden by physics
          link.enabled = bones[link.index].rigidBodyType > 0 ? false : true;
        } else {
          link.enabled = true;
        }
      }
    }
  }

  _createCCDIKSolver(mesh: SkinnedMesh) {
    if (CCDIKSolver === undefined) {
      throw new Error('THREE.MMDAnimationHelper: Import CCDIKSolver.');
    }

    //@ts-expect-error
    return new CCDIKSolver(mesh, mesh.geometry.userData.MMD.iks);
  }

  _createMMDPhysics(
    mesh: SkinnedMesh,
    params: {
      unitStep?: number;
      maxStepNum?: number;
      gravity?: Vector3;
      world?: any;
    },
  ) {
    if (MMDPhysics === undefined) {
      throw new Error('THREE.MMDPhysics: Import MMDPhysics.');
    }

    //@ts-expect-error
    return new MMDPhysics(mesh, mesh.geometry.userData.MMD.rigidBodies, mesh.geometry.userData.MMD.constraints, params);
  }

  /*
   * Detects the longest duration and then sets it to them to sync.
   * TODO: Not to access private properties ( ._actions and ._clip )
   */
  _syncDuration() {
    let max = 0.0;

    const objects = this.objects;
    const meshes = this.meshes;
    const camera = this.camera;
    const audioManager = this.audioManager;

    // get the longest duration

    for (let i = 0, il = meshes.length; i < il; i++) {
      const mixer = this.objects.get(meshes[i]).mixer;

      if (mixer === undefined) continue;

      for (let j = 0; j < mixer._actions.length; j++) {
        const clip = mixer._actions[j]._clip;

        if (!objects.has(clip)) {
          objects.set(clip, {
            duration: clip.duration,
          });
        }

        max = Math.max(max, objects.get(clip).duration);
      }
    }

    if (camera !== null) {
      const mixer = this.objects.get(camera).mixer;

      if (mixer !== undefined) {
        for (let i = 0, il = mixer._actions.length; i < il; i++) {
          const clip = mixer._actions[i]._clip;

          if (!objects.has(clip)) {
            objects.set(clip, {
              duration: clip.duration,
            });
          }

          max = Math.max(max, objects.get(clip).duration);
        }
      }
    }

    if (audioManager !== null) {
      //@ts-expect-error
      max = Math.max(max, objects.get(audioManager).duration);
    }

    max += this.configuration.afterglow;

    // update the duration

    for (let i = 0, il = this.meshes.length; i < il; i++) {
      const mixer = this.objects.get(this.meshes[i]).mixer;

      if (mixer === undefined) continue;

      for (let j = 0, jl = mixer._actions.length; j < jl; j++) {
        mixer._actions[j]._clip.duration = max;
      }
    }

    if (camera !== null) {
      const mixer = this.objects.get(camera).mixer;

      if (mixer !== undefined) {
        for (let i = 0, il = mixer._actions.length; i < il; i++) {
          mixer._actions[i]._clip.duration = max;
        }
      }
    }

    if (audioManager !== null) {
      audioManager.duration = max;
    }
  }

  // workaround

  /*
   * Avoiding these two issues by restore/save bones before/after mixer animation.
   *
   * 1. PropertyMixer used by AnimationMixer holds cache value in .buffer.
   *    Calculating IK, Grant, and Physics after mixer animation can break
   *    the cache coherency.
   *
   * 2. Applying Grant two or more times without reset the posing breaks model.
   */
  _saveBones(mesh: SkinnedMesh) {
    const objects = this.objects.get(mesh);

    const bones = mesh.skeleton.bones;

    let backupBones = objects.backupBones;

    if (backupBones === undefined) {
      backupBones = new Float32Array(bones.length * 7);
      objects.backupBones = backupBones;
    }

    for (let i = 0, il = bones.length; i < il; i++) {
      const bone = bones[i];
      bone.position.toArray(backupBones, i * 7);
      bone.quaternion.toArray(backupBones, i * 7 + 3);
    }
  }

  _restoreBones(mesh: SkinnedMesh) {
    const objects = this.objects.get(mesh);

    const backupBones = objects.backupBones;

    if (backupBones === undefined) return;

    const bones = mesh.skeleton.bones;

    for (let i = 0, il = bones.length; i < il; i++) {
      const bone = bones[i];
      bone.position.fromArray(backupBones, i * 7);
      bone.quaternion.fromArray(backupBones, i * 7 + 3);
    }
  }

  // experimental

  _getMasterPhysics() {
    if (this.masterPhysics !== null) return this.masterPhysics;

    for (let i = 0, il = this.meshes.length; i < il; i++) {
      //@ts-expect-error
      const physics = this.meshes[i].physics;

      if (physics !== undefined && physics !== null) {
        this.masterPhysics = physics;
        return this.masterPhysics;
      }
    }

    return null;
  }

  _updateSharedPhysics(delta: number) {
    if (this.meshes.length === 0 || !this.enabled.physics || !this.sharedPhysics) return;

    const physics = this._getMasterPhysics();

    if (physics === null) return;

    for (let i = 0, il = this.meshes.length; i < il; i++) {
      //@ts-expect-error
      const p = this.meshes[i].physics;

      if (p !== null && p !== undefined) {
        p.updateRigidBodies();
      }
    }

    physics.stepSimulation(delta);

    for (let i = 0, il = this.meshes.length; i < il; i++) {
      //@ts-expect-error
      const p = this.meshes[i].physics;

      if (p !== null && p !== undefined) {
        p.updateBones();
      }
    }
  }
}

// Keep working quaternions for less GC
const _quaternions: Quaternion[] = [];
let _quaternionIndex = 0;

function getQuaternion() {
  if (_quaternionIndex >= _quaternions.length) {
    _quaternions.push(new Quaternion());
  }

  return _quaternions[_quaternionIndex++];
}

const _grantResultMap = new Map();

function updateOne(mesh: SkinnedMesh, boneIndex: number, ikSolver: CCDIKSolver, grantSolver: GrantSolver) {
  const bones = mesh.skeleton.bones;
  //@ts-expect-error
  const bonesData = mesh.geometry.userData.MMD.bones;
  const boneData = bonesData[boneIndex];
  const bone = bones[boneIndex];

  // Return if already updated by being referred as a grant parent.
  if (_grantResultMap.has(boneIndex)) return;

  const quaternion = getQuaternion();

  // Initialize grant result here to prevent infinite loop.
  // If it's referred before updating with actual result later
  // result without applyting IK or grant is gotten
  // but better than composing of infinite loop.
  _grantResultMap.set(boneIndex, quaternion.copy(bone.quaternion));

  // @TODO: Support global grant and grant position
  if (grantSolver && boneData.grant && !boneData.grant.isLocal && boneData.grant.affectRotation) {
    const parentIndex = boneData.grant.parentIndex;
    const ratio = boneData.grant.ratio;

    if (!_grantResultMap.has(parentIndex)) {
      updateOne(mesh, parentIndex, ikSolver, grantSolver);
    }

    grantSolver.addGrantRotation(bone, _grantResultMap.get(parentIndex), ratio);
  }

  if (ikSolver && boneData.ik) {
    // @TODO: Updating world matrices every time solving an IK bone is
    // costly. Optimize if possible.
    mesh.updateMatrixWorld(true);
    ikSolver.updateOne(boneData.ik);

    // No confident, but it seems the grant results with ik links should be updated?
    const links = boneData.ik.links;

    for (let i = 0, il = links.length; i < il; i++) {
      const link = links[i];

      if (link.enabled === false) continue;

      const linkIndex = link.index;

      if (_grantResultMap.has(linkIndex)) {
        _grantResultMap.set(linkIndex, _grantResultMap.get(linkIndex).copy(bones[linkIndex].quaternion));
      }
    }
  }

  // Update with the actual result here
  quaternion.copy(bone.quaternion);
}

//

class AudioManager {
  audio: Audio;
  elapsedTime: number;
  currentTime: number;
  delayTime: number;
  audioDuration: number;
  duration: number;
  elapsed: number;

  constructor(
    audio: Audio,
    params: {
      delayTime?: number;
    } = {},
  ) {
    this.audio = audio;

    this.elapsedTime = 0.0;
    this.currentTime = 0.0;
    this.delayTime = params.delayTime !== undefined ? params.delayTime : 0.0;

    this.audioDuration = this.audio.buffer!.duration;
    this.duration = this.audioDuration + this.delayTime;
  }

  /**
   * @param {Number} delta
   * @return {AudioManager}
   */
  control(delta: number) {
    this.elapsed += delta;
    this.currentTime += delta;

    if (this._shouldStopAudio()) this.audio.stop();
    if (this._shouldStartAudio()) this.audio.play();

    return this;
  }

  // private methods

  _shouldStartAudio() {
    if (this.audio.isPlaying) return false;

    while (this.currentTime >= this.duration) {
      this.currentTime -= this.duration;
    }

    if (this.currentTime < this.delayTime) return false;

    // 'duration' can be bigger than 'audioDuration + delayTime' because of sync configuration
    if (this.currentTime - this.delayTime > this.audioDuration) return false;

    return true;
  }

  _shouldStopAudio() {
    return this.audio.isPlaying && this.currentTime >= this.duration;
  }
}

const _q = new Quaternion();

/**
 * Solver for Grant (Fuyo in Japanese. I just google translated because
 * Fuyo may be MMD specific term and may not be common word in 3D CG terms.)
 * Grant propagates a bone's transform to other bones transforms even if
 * they are not children.
 * @param {THREE.SkinnedMesh} mesh
 * @param {Array<Object>} grants
 */
class GrantSolver {
  mesh: SkinnedMesh;
  grants: any[];

  constructor(mesh: SkinnedMesh, grants = []) {
    this.mesh = mesh;
    this.grants = grants;
  }

  /**
   * Solve all the grant bones
   * @return {GrantSolver}
   */
  update() {
    const grants = this.grants;

    for (let i = 0, il = grants.length; i < il; i++) {
      this.updateOne(grants[i]);
    }

    return this;
  }

  /**
   * Solve a grant bone
   * @param {Object} grant - grant parameter
   * @return {GrantSolver}
   */
  updateOne(grant: any) {
    const bones = this.mesh.skeleton.bones;
    const bone = bones[grant.index];
    const parentBone = bones[grant.parentIndex];

    if (grant.isLocal) {
      // TODO: implement
      if (grant.affectPosition) {
      }

      // TODO: implement
      if (grant.affectRotation) {
      }
    } else {
      // TODO: implement
      if (grant.affectPosition) {
      }

      if (grant.affectRotation) {
        this.addGrantRotation(bone, parentBone.quaternion, grant.ratio);
      }
    }

    return this;
  }

  addGrantRotation(bone: Bone, q: Quaternion, ratio: number) {
    _q.set(0, 0, 0, 1);
    _q.slerp(q, ratio);
    bone.quaternion.multiply(_q);

    return this;
  }
}
