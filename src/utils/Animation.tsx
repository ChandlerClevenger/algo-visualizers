/*
Liscence: GNU General Public License v2.0
Author: Chandler Clevenger
Date: 3/26/2023
*/

export default class Animation {
  private _animation: Keyframe[] | PropertyIndexedKeyframes;
  private _selector: string;
  private _options: KeyframeAnimationOptions;

  constructor(
    selector: string | string[],
    animation: Keyframe[] | PropertyIndexedKeyframes,
    options: KeyframeAnimationOptions
  ) {
    if (Array.isArray(selector)) {
      this._selector = selector.join(", ");
    } else {
      this._selector = selector;
    }
    this._animation = animation;
    this._options = options;
  }
  get selector() {
    return this._selector;
  }

  get animation() {
    return this._animation;
  }

  get options() {
    return this._options;
  }
}
