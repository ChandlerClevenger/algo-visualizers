export class Animation {
  private _animationName: string;
  private _selector: string;

  constructor(selector: string | string[], animationName: string) {
    if (Array.isArray(selector)) {
      this._selector = selector.join(", ");
    } else {
      this._selector = selector;
    }
    this._animationName = animationName;
  }
  get selector() {
    return this._selector;
  }

  get animationName() {
    return this._animationName;
  }
}

export class AnimationQueue {
  private _animationData: Animation[];
  private _isPlaying: boolean;
  private _skipCheckId: string;

  constructor(skipCheckId: string) {
    this._animationData = [];
    this._isPlaying = false;
    this._skipCheckId = skipCheckId;
  }

  async run(animationDatum: Animation) {
    if (!this.#is_wanting_played() || animationDatum.selector === "") {
      return;
    }
    // First, reset animations
    document.querySelectorAll(animationDatum.animationName).forEach((el) => {
      el.classList.remove(animationDatum.animationName);
    });

    const currentElements = document.querySelectorAll(animationDatum.selector);
    currentElements.forEach((el) => {
      el.classList.add(animationDatum.animationName);
    });
    console.log("Current elms", currentElements);
    console.log(currentElements.item(0).getAnimations()[0]);
    await currentElements
      .item(0)
      .getAnimations()[0]
      .finished.then((res) => {
        currentElements.forEach((el) => {
          el.classList.remove(animationDatum.animationName);
        });
      });
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
}
