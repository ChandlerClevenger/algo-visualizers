import Animation from "./Animation";

export class AnimationQueue {
  private _animationData: Animation[];
  private _isPlaying: boolean;
  private _skipCheckId: string;
  private _promises: Promise<globalThis.Animation>[];
  private _persistentAnimations: Animation[];

  constructor(skipCheckId: string) {
    this._animationData = [];
    this._isPlaying = false;
    this._skipCheckId = skipCheckId;
    this._promises = [];
    this._persistentAnimations = [];
  }

  async run(animationDatum: Animation) {
    if (!this.#is_wanting_played() || animationDatum.selector === "") {
      return;
    }
    if (animationDatum.isPersistent) {
      this._persistentAnimations.push(animationDatum);
    }
    const currentElements = document.querySelectorAll(animationDatum.selector);
    console.log(currentElements);
    currentElements.forEach((el) => {
      console.log(animationDatum.animation, animationDatum.options);
      el.animate(animationDatum.animation, animationDatum.options);
      this._promises.push(...el.getAnimations().map((e) => e.finished));
    });

    // await new Promise((res, rej) => {
    //   setTimeout(() => {
    //     res(1);
    //   }, animationDatum.options.duration);
    // });
    await Promise.allSettled(this._promises);

    this._promises = [];
  }

  add(animationDatum: Animation) {
    // Prevent empty animation selections and adding while playing
    if (
      animationDatum.selector === "" ||
      this._isPlaying ||
      !this.#is_wanting_played()
    ) {
      return;
    }
    console.log("Adding animation ", animationDatum);
    this._animationData.push(animationDatum);
  }

  #clear() {
    this._animationData = [];
  }

  async playAnimations() {
    if (!this.#is_wanting_played()) {
      return;
    }
    if (this._isPlaying) return; // Prevent multiple running at once
    this._isPlaying = true;

    for (const animation of this._animationData) {
      // Check for cancle animation
      await this.run(animation);
    }
    this.#clear();
    this._isPlaying = false;
  }

  #is_wanting_played(): boolean {
    const skipCheckBox = document.getElementById(
      this._skipCheckId
    ) as HTMLInputElement | null;

    return !!skipCheckBox?.checked;
  }

  cleanupPeristentAnimations() {
    for (const animation of this._persistentAnimations) {
      const persistentSet = document.querySelectorAll(animation.selector);
      // persistentSet.forEach((el) => {
      //   el.classList.remove(animation.animationName);
      // });
    }
    this._persistentAnimations = [];
  }
}
