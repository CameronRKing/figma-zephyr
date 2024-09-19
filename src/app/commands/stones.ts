import { curr, setFillScaleMode } from "../utils";

const BASE_GRID_SIZE = 250; // todo: link usage of this constant to a variable in the workspace instead

export default {
    gv: {
        bind: 'gv',
        name: '(Make) Grid Variation',
        args: [],
        exec: async () => {
            const node = curr()[0];
            if (node.type !== 'INSTANCE') return;
            const dupe = node.clone();
            node.parent.appendChild(dupe);
            // assumes there are only two properties
            // will have to adjust for swapping support components in larger grids
            // )but that can wait till we're actually doing it)
            const oldVals = Object.entries(node.componentProperties).filter(
                ([propName]) => propName.startsWith('inner') || propName.startsWith('outer')
            );
            dupe.setProperties({
                [oldVals[0][0]]: oldVals[1][1].value,
                [oldVals[1][0]]: oldVals[0][1].value,
            });
        },
    },
    pgc: {
        bind: 'pgc',
        name: '(Make/Update) Project Grid Component',
        args: [],
        exec: async () => {
            const curr = figma.currentPage.selection[0];
            if (!curr || curr.type !== 'INSTANCE') return;

            let gridName = '';
            if (curr.name.startsWith('prj/')) {
                // we're creating a component for the top-level project grid
                gridName = curr.name;
            } else {
                let recur = curr.parent;
                while (!recur.name.startsWith('prj/')) {
                    if (!recur.parent) throw new Error('Did not find a parent frame that starts with `prj/`');
                    recur = recur.parent;
                }
                gridName = `${recur.name}/${curr.name}`;
            }

            const gridFrame = figma.currentPage.findOne(
                (node) => node.name === 'grids' && node.type === 'FRAME'
            ) as FrameNode;
            let gridCmp = gridFrame.findOne((node) => node.name === gridName) as ComponentNode;

            if (!gridCmp) {
                gridCmp = figma.createComponent();
                gridCmp.name = gridName;
                gridCmp.resize(BASE_GRID_SIZE, BASE_GRID_SIZE);
                gridFrame.appendChild(gridCmp);
            }

            // these are the default arguments, made explicit for documentation
            const bytes = await curr.exportAsync({
                format: 'PNG',
                constraint: {type: 'SCALE', value: 1},
            });
            const img = figma.createImage(bytes);

            gridCmp.fills = [
                {
                    imageHash: img.hash,
                    scaleMode: 'FILL',
                    scalingFactor: 1,
                    type: 'IMAGE',
                },
            ];
        },
    },
    gc: {
        bind: 'gc',
        name: '(Make Global) Grid Component',
        args: [],
        exec: async () => {
            const curr = figma.currentPage.selection[0];
            if (!curr || curr.type !== 'INSTANCE') return;
            const propNames = Object.entries(curr.componentProperties)
                .filter(([propName]) => propName.toLowerCase() !== 'type')
                .sort((l, r) => (l[0] < r[0] ? -1 : 1)) // sort by prop name, alphabetic ascending (in practice: center, inner, outer)
                .map(([_, {value}]) => value)
                .map((id) => figma.currentPage.findOne((node) => node.id == id).name) // this does hiccup & could be optimized, but it's fine as-is for now
                .map((name) => name.split('/')[1]) // remove 'stone/' prefix
                .join('-');

            const node = figma.createFrame();
            node.name = `grid/${curr.name}/${propNames}`;
            node.resize(BASE_GRID_SIZE, BASE_GRID_SIZE);
            // these are the default arguments, made explicit for documentation
            const bytes = await curr.exportAsync({
                format: 'PNG',
                constraint: {type: 'SCALE', value: 1},
            });
            const img = figma.createImage(bytes);

            node.fills = [
                {
                    imageHash: img.hash,
                    scaleMode: 'FILL',
                    scalingFactor: 1,
                    type: 'IMAGE',
                },
            ];

            const cmp = figma.createComponentFromNode(node);

            const gridFrame = figma.currentPage.findOne(
                (node) => node.name === 'grids' && node.type === 'FRAME'
            ) as FrameNode;
            gridFrame.appendChild(cmp);
        },
    },
    ses: {
        bind: 'ses',
        name: 'Start Expanding Stone (Picture)',
        args: [],
        exec: () => {
            const curr = figma.currentPage.selection[0];
            if (curr.type !== 'COMPONENT') return;
            const newCmp = curr.clone();
            curr.parent.insertChild(curr.parent.children.indexOf(curr) + 1, newCmp);
            newCmp.name = newCmp.name.replace(/\/\w+$/, '/closeup');
            const img = newCmp.children[0];
            if (img.type !== 'RECTANGLE') return;
            setFillScaleMode(img, 'CROP');
            figma.currentPage.selection = [img];
            figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);
        },
    },
    es: {
        bind: 'es',
        name: 'Expand Stone (Picture)',
        args: [],
        exec: () => {
            const curr = figma.currentPage.selection[0];
            if (curr.type !== 'RECTANGLE') return;
            curr.x = 0;
            curr.y = 0;
            curr.constrainProportions = false;
            curr.resize(BASE_GRID_SIZE, BASE_GRID_SIZE);
        },
    },
}