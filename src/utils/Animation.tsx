export default class Animation {
  private _animation: Keyframe[] | PropertyIndexedKeyframes;
  private _selector: string;
  private _persistent: boolean;
  private _options: KeyframeAnimationOptions;

  constructor(
    selector: string | string[],
    animation: Keyframe[] | PropertyIndexedKeyframes,
    options: KeyframeAnimationOptions,
    persistent = false
  ) {
    if (Array.isArray(selector)) {
      this._selector = selector.join(", ");
    } else {
      this._selector = selector;
    }
    this._animation = animation;
    this._options = options;
    this._persistent = persistent;
  }
  get selector() {
    return this._selector;
  }

  get animation() {
    return this._animation;
  }

  get isPersistent() {
    return this._persistent;
  }

  get options() {
    return this._options;
  }
}
