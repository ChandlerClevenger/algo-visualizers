import Animation from "./Animation";

type point = {
  x: number;
  y: number;
};
export async function movePacket(idSelectorOne: string, idSelectorTwo: string) {
  // Get coords for both selectors
  const el1Point = getPoint(idSelectorOne);
  const el2Point = getPoint(idSelectorTwo);
  // Initial config of img
  var svg = document.createElement("img");
  svg.src = "../images/database.svg";
  svg.style.setProperty("height", "40px");
  svg.style.setProperty("width", "40px");
  svg.style.setProperty("position", "absolute");
  svg.style.left = `${el1Point.x}px`;
  svg.style.top = `${el1Point.y}px`;
  // Set img animation
  let anim = svg.animate(
    {
      translate: `${el2Point.x - el1Point.x}px ${el2Point.y - el1Point.y}px`,
    },
    {
      duration: 500,
      fill: "forwards",
    }
  );
  // Display and start animation
  document.body.appendChild(svg);
  // Await for animation to finish
  await anim.finished;
  // Remove the image when it has completed animation
  svg.remove();
}
export function lineBlinkGreen(selector: string | string[]) {
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
export function lineBlinkOrange(selector: string | string[]) {
  return new Animation(
    selector,
    [
      {},
      {
        stroke: "#DC6601",
      },
      {},
    ],
    {
      duration: 2000,
      iterations: 1,
    }
  );
}
export function routerBlink(selector: string | string[]) {
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
      duration: 2000,
      iterations: 1,
    }
  );
}

function getPoint(idSelector: string): point {
  const el = document.getElementById(idSelector);
  if (!el) throw Error("Check selector");
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
  } as point;
}
