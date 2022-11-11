import Animation from "./Animation";

export class AnimationQueue {
  private _animationData: Animation[];
  private _isPlaying: boolean;
  private _skipCheckId: string;
  private _promises: Promise<globalThis.Animation>[];
  private _persistentAnimations: globalThis.Animation[];

  constructor(skipCheckId: string) {
    this._animationData = [];
    this._isPlaying = false;
    this._skipCheckId = skipCheckId;
    this._promises = [];
    this._persistentAnimations = [];
  }

  get isPlaying() {
    return this._isPlaying;
  }

  async run(animationDatum: Animation) {
    if (
      !this.#is_wanting_played() ||
      animationDatum.selector === "" ||
      this._isPlaying
    ) {
      if (!this.#is_wanting_played()) {
        this.cleanupPeristentAnimations();
      }
      return;
    }
    this._isPlaying = true;

    const currentElements = document.querySelectorAll(animationDatum.selector);
    currentElements.forEach((el) => {
      const anim = el.animate(animationDatum.animation, animationDatum.options);
      if (animationDatum.options?.fill == "forwards") {
        this._persistentAnimations.push(anim);
      }
      this._promises.push(anim.finished);
    });
    await Promise.allSettled(this._promises);
    this._isPlaying = false;
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
      animation.cancel();
    }
    this._persistentAnimations = [];
  }
}
