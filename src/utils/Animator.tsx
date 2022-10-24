export class Animation {
  private _animationName: string;
  private _selector: string;
  private _persistent: boolean;

  constructor(
    selector: string | string[],
    animationName: string,
    persistent = false
  ) {
    if (Array.isArray(selector)) {
      this._selector = selector.join(", ");
    } else {
      this._selector = selector;
    }
    this._animationName = animationName;
    this._persistent = persistent;
  }
  get selector() {
    return this._selector;
  }

  get animationName() {
    return this._animationName;
  }

  get isPersistent() {
    return this._persistent;
  }
}

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
    if (this._promises.length !== 0) {
      await Promise.all(this._promises);
    }
    if (!this.#is_wanting_played() || animationDatum.selector === "") {
      return;
    }
    if (animationDatum.isPersistent) {
      this._persistentAnimations.push(animationDatum);
    }
    const currentElements = document.querySelectorAll(animationDatum.selector);
    currentElements.forEach((el) => {
      el.classList.add(animationDatum.animationName);
      this._promises.push(...el.getAnimations().map((e) => e.finished));
    });

    await Promise.all(this._promises);
    currentElements.forEach((el) => {
      if (animationDatum.isPersistent) return;
      el.classList.remove(animationDatum.animationName);
    });
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
      if (!this.#is_wanting_played()) {
        break;
      }
      const currentElements = document.querySelectorAll(animation.selector);
      currentElements.forEach((el) => {
        el.classList.add(animation.animationName);
      });
      await currentElements.item(0).getAnimations()[0].finished;
      currentElements.forEach((el) => {
        el.classList.remove(animation.animationName);
      });
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
      persistentSet.forEach((el) => {
        el.classList.remove(animation.animationName);
      });
    }
    this._persistentAnimations = [];
  }
}
