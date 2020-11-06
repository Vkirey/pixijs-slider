import * as PIXI from "pixi.js";
import Slider from "./slider";

// CODE BELOW IS USED FOR DEBUG & DEMO ONLY
// CAN BE SWITCHED WITH SOMETHING LIKE:
// export default { ...PIXI, Slider };
// and used as an extended PIXI library

const gameWidth = 300;
const gameHeight = 100;

PIXI.Container;

const app = new PIXI.Application({
    backgroundColor: 0xd3d3d3,
    width: gameWidth,
    height: gameHeight,
});

const stage = app.stage;

window.onload = (): void => {
    document.body.appendChild(app.view);

    const slider = new Slider("Volume");

    slider.on("update", (value: number) => console.log(`slider value is: ${value}`));

    stage.addChild(slider);
};
