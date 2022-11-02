import Animation from "./Animation";

export function animateRouterConsidered(selector: string | string[]) {
  return new Animation(
    selector,
    [
      {
        opacity: "100%",
      },
      {
        opacity: "0%",
      },
      {
        opacity: "100%",
        filter: "sepia(70%) hue-rotate(-90deg)",
      },
    ],
    {
      duration: 2000,
      iterations: 1,
      fill: "forwards",
    }
  );
}

export function animateRouterBlink(selector: string | string[]) {
  return new Animation(
    selector,
    [
      {
        opacity: "100%",
      },
      {
        opacity: "0%",
      },
      {
        opacity: "100%",
      },
    ],
    {
      duration: 1000,
      iterations: 2,
    }
  );
}

export function animateLineBlinkGreen(selector: string | string[]) {
  return new Animation(
    selector,
    [
      {},
      {
        stroke: "#0F0",
      },
      {},
    ],
    {
      duration: 2000,
      iterations: 1,
    }
  );
}

export function animateLineBlinkRed(selector: string | string[]) {
  return new Animation(
    selector,
    [
      {},
      {
        stroke: "#F00",
      },
    ],
    {
      duration: 1000,
      iterations: 2,
    }
  );
}
