import { Container, Graphics, Sprite, Text, Texture, InteractionEvent } from "pixi.js";

const COMPONENT_WIDTH = 300; // TODO: make configurable
const COMPONENT_HEIGHT = COMPONENT_WIDTH / 3;
const OFFSET_BORDER = 0.08 * COMPONENT_HEIGHT;
const ICON_WIDTH = 0.32 * COMPONENT_HEIGHT;
const ICON_HEIGHT = 0.32 * COMPONENT_HEIGHT;
const CIRCLE_RADIUS = 0.14 * COMPONENT_HEIGHT;
const LINE_WIDTH = COMPONENT_WIDTH - 4 * OFFSET_BORDER - ICON_WIDTH - CIRCLE_RADIUS;
const SLIDER_HEIGHT = COMPONENT_HEIGHT - 2 * OFFSET_BORDER - CIRCLE_RADIUS;

export default class Slider extends Container {
    private dragging = false;
    private forceMuted = false;
    private storedValue = 1;
    private volumeUpIconTexture = Texture.from("./assets/volume-up.png");
    private volumeDownIconTexture = Texture.from("./assets/volume-down.png");
    private volumeOffIconTexture = Texture.from("./assets/mute.png");
    private iconSprite: Sprite = new Sprite(this.volumeOffIconTexture);
    private linePlaceholder: Graphics = new Graphics();
    private lineValue: Graphics = new Graphics();
    private valueCircle: Graphics = new Graphics();
    private labelText: Text = new Text("", {
        font: "bold 12px",
        fill: "#ffffff",
        align: "left",
        strokeThickness: 7,
    });
    private percentText: Text = new Text("", {
        font: "bold 12px",
        fill: "#ffffff",
        align: "left",
        strokeThickness: 7,
    });

    constructor(
        private text: string = "",
        private value: number = 0,
        private maxValue: number = 100,
        private uom: string = "%"
    ) {
        super();

        this.width = COMPONENT_HEIGHT;
        this.height = COMPONENT_WIDTH;

        this.initialRender();
    }

    initialRender(): void {
        const background = new Graphics();
        background.beginFill(0x000000);
        background.drawRect(0, 0, COMPONENT_WIDTH, COMPONENT_HEIGHT);
        this.addChild(background);

        this.drawIcon();
        this.drawLabel();
        this.drawPercentText();
        this.drawLinePlaceholder();
        this.drawLineValue();
        this.drawValueCircle();

        this.addChild(this.iconSprite);
        this.addChild(this.labelText);
        this.addChild(this.percentText);
        this.addChild(this.linePlaceholder);
        this.addChild(this.lineValue);
        this.addChild(this.valueCircle);

        this.valueCircle.interactive = true;
        this.valueCircle.cursor = "pointer";
        this.valueCircle
            .on("mousedown", this.onDragStart, this)
            .on("touchstart", this.onDragStart, this)
            .on("mouseup", this.onDragEnd, this)
            .on("mouseupoutside", this.onDragEnd, this)
            .on("touchend", this.onDragEnd, this)
            .on("touchendoutside", this.onDragEnd, this)
            .on("mousemove", this.onDragMove, this)
            .on("touchmove", this.onDragMove, this);

        this.iconSprite.interactive = true;
        this.iconSprite.cursor = "pointer";
        this.iconSprite.on("mousedown", this.onMuteToggle, this);
        this.iconSprite.on("touchstart", this.onMuteToggle, this);
    }

    drawIcon(): void {
        this.iconSprite.texture =
            this.value > 0
                ? this.value < this.maxValue / 2
                    ? this.volumeDownIconTexture
                    : this.volumeUpIconTexture
                : this.volumeOffIconTexture;
        this.iconSprite.width = ICON_WIDTH;
        this.iconSprite.height = ICON_HEIGHT;
        this.iconSprite.anchor.set(0.5);
        this.iconSprite.position.x = OFFSET_BORDER + ICON_WIDTH / 2;
        this.iconSprite.position.y = (COMPONENT_HEIGHT + ICON_HEIGHT) / 2;
    }

    drawLabel(): void {
        this.labelText.text = this.text;
        this.labelText.position.x = 2 * OFFSET_BORDER + ICON_WIDTH;
        this.labelText.position.y = OFFSET_BORDER;
        //this.labelText.updateText();
    }

    drawPercentText(): void {
        this.percentText.text = `${this.value}${this.uom}`;
        this.percentText.anchor.set(1, 0);
        this.percentText.position.x = COMPONENT_WIDTH - OFFSET_BORDER;
        this.percentText.position.y = OFFSET_BORDER;
    }

    drawLinePlaceholder(): void {
        this.linePlaceholder.clear();

        this.linePlaceholder.beginFill(0xffffff);

        this.linePlaceholder.drawRoundedRect(
            OFFSET_BORDER * 3 + ICON_WIDTH,
            SLIDER_HEIGHT,
            LINE_WIDTH,
            5,
            2 * LINE_WIDTH
        );
    }

    drawLineValue(): void {
        this.lineValue.clear();

        this.lineValue.beginFill(0xffa500);

        this.lineValue.drawRoundedRect(
            OFFSET_BORDER * 3 + ICON_WIDTH,
            SLIDER_HEIGHT,
            (LINE_WIDTH * this.value) / this.maxValue,
            5,
            2 * LINE_WIDTH
        );
    }

    drawValueCircle(): void {
        this.valueCircle.clear();

        this.valueCircle.beginFill(0xffa500);

        this.valueCircle.drawCircle(
            OFFSET_BORDER * 3 + ICON_WIDTH + (LINE_WIDTH * this.value) / this.maxValue,
            SLIDER_HEIGHT,
            CIRCLE_RADIUS
        );

        this.valueCircle.beginFill(0x000000);

        this.valueCircle.drawCircle(
            OFFSET_BORDER * 3 + ICON_WIDTH + (LINE_WIDTH * this.value) / this.maxValue,
            SLIDER_HEIGHT,
            CIRCLE_RADIUS / 3
        );
    }

    onDragStart(): void {
        this.valueCircle.alpha = 0.95;
        this.dragging = true;
    }

    onDragEnd(event: InteractionEvent): void {
        const endPoint = event.data.getLocalPosition(this);
        let resultX = OFFSET_BORDER * 2 + ICON_WIDTH;
        if (endPoint.x > resultX) {
            resultX = endPoint.x;
        }

        if (resultX > OFFSET_BORDER * 2 + ICON_WIDTH + LINE_WIDTH) {
            resultX = OFFSET_BORDER * 2 + ICON_WIDTH + LINE_WIDTH;
        }

        const percentValue = (resultX - OFFSET_BORDER * 2 - ICON_WIDTH) / LINE_WIDTH;

        this.updateValue(percentValue * this.maxValue);
        this.valueCircle.alpha = 1;
        this.dragging = false;
    }

    onDragMove(event: InteractionEvent): void {
        if (this.dragging) {
            const endPoint = event.data.getLocalPosition(this);
            let resultX = OFFSET_BORDER * 2 + ICON_WIDTH;
            if (endPoint.x > resultX) {
                resultX = endPoint.x;
            }

            if (resultX > OFFSET_BORDER * 2 + ICON_WIDTH + LINE_WIDTH) {
                resultX = OFFSET_BORDER * 2 + ICON_WIDTH + LINE_WIDTH;
            }

            const percentValue = (resultX - OFFSET_BORDER * 2 - ICON_WIDTH) / LINE_WIDTH;

            this.updateValue(percentValue * this.maxValue);
        }
    }

    onMuteToggle(): void {
        if (this.forceMuted) {
            this.forceMuted = false;
            this.updateValue(this.storedValue);
        } else {
            if (this.value > 0) {
                this.storedValue = this.value;
                this.forceMuted = true;

                this.updateValue(0);
            } else {
                this.updateValue(this.storedValue || 1);
            }
        }
        this.storedValue;
    }

    updateValue(newValue: number): void {
        this.value = Math.ceil(newValue);
        this.drawIcon();
        this.drawPercentText();
        this.drawLineValue();
        this.drawValueCircle();
        this.emit("update", this.value);
    }
}
