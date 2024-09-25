export const DPI = 114; // weird number, I know, but that's what experimentation shows

// https://gist.github.com/JeremyJaydan/f7ba5f40574841b97d745f8f4ef88c07
export function setRotation(node, angle) {
    let { x, y, width, height, rotation } = node;

    const theta = angle * (Math.PI / 180);
    const originTheta = rotation * (Math.PI / 180);
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const originX =
        -Math.cos(originTheta) * x +
        y * -Math.sin(originTheta) -
        centerY * -Math.sin(originTheta) -
        centerX * -Math.cos(originTheta) +
        centerX -
        width;
    const originY =
        Math.sin(originTheta) * x +
        centerX * -Math.sin(originTheta) +
        y * -Math.cos(originTheta) -
        centerY * -Math.cos(originTheta) +
        centerY -
        height;

    const originCenterX = originX + width / 2;
    const originCenterY = originY + height / 2;

    const newX =
        Math.cos(theta) * originX +
        originY * Math.sin(theta) -
        originCenterY * Math.sin(theta) -
        originCenterX * Math.cos(theta) +
        originCenterX;
    const newY =
        -Math.sin(theta) * originX +
        originCenterX * Math.sin(theta) +
        originY * Math.cos(theta) -
        originCenterY * Math.cos(theta) +
        originCenterY;

    const transform = [
        [Math.cos(theta), Math.sin(theta), newX],
        [-Math.sin(theta), Math.cos(theta), newY],
    ];

    node.relativeTransform = transform;
}

export const move = (node, dist, angle) => {
    angle = angle % 360; // just in case
    const rad = (Math.PI * angle) / 180;
    node.x += dist * Math.cos(rad);
    node.y += dist * Math.sin(rad);
    return node;
};

export const numerifyFraction = (str) => {
    const [numer, denom] = str.split('/');
    return Number(numer) / Number(denom);
};

export const centerInViewport = (node) => {
    const { x, y } = figma.viewport.center;
    node.x = x - node.width / 2;
    node.y = y - node.height / 2;
};

// https://www.figma.com/plugin-docs/editing-properties/
export function clone(val, overrides = {}) {
    return Object.assign(JSON.parse(JSON.stringify(val)), overrides);
}

export function setFillScaleMode(node: RectangleNode, mode: ImagePaint['scaleMode']) {
    const fills = clone(node.fills);
    fills[0].scaleMode = mode;
    node.fills = fills;
}

export const curr = () => figma.currentPage.selection;

export const preloadSelectedFonts = () =>
    Promise.all(
        curr()
            .filter((node) => node.type === 'TEXT')
            .map((node: TextNode) =>
                Promise.all(node.getRangeAllFontNames(0, node.characters.length).map(figma.loadFontAsync))
            )
    );

// doesn't seem to work in practice--the plugin won't open when I add this call to startup
export const preloadAllFonts = async () =>
    Promise.all(
        await figma
            .listAvailableFontsAsync()
            .then((fonts) => fonts.map(({ fontName }) => figma.loadFontAsync(fontName)))
    );
