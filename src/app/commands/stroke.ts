import { CmdGroup } from '../commands';
import { curr } from '../utils';

type Strokeable =
    | BooleanOperationNode
    | ComponentNode
    | ComponentSetNode
    | ConnectorNode
    | EllipseNode
    | FrameNode
    | HighlightNode
    | InstanceNode
    | LineNode
    | PolygonNode
    | RectangleNode
    | ShapeWithTextNode
    | StampNode
    | StarNode
    | TextNode
    | VectorNode
    | WashiTapeNode;

type StrokeCapable =
    | BooleanOperationNode
    | ComponentNode
    | ComponentSetNode
    | EllipseNode
    | FrameNode
    | HighlightNode
    | InstanceNode
    | LineNode
    | PolygonNode
    | RectangleNode
    | StampNode
    | StarNode
    | TextNode
    | VectorNode
    | WashiTapeNode;

const isStrokeable = (node: SceneNode): node is Strokeable => {
    return [
        'BOOLEAN_OPERATION',
        'COMPONENT',
        'COMPONENT_SET',
        'CONNECTOR',
        'ELLIPSE',
        'FRAME',
        'HIGHLIGHT',
        'INSTANCE',
        'LINE',
        'POLYGON',
        'RECTANGLE',
        'SHAPE_WITH_TEXT',
        'STAMP',
        'STAR',
        'TEXT',
        'VECTOR',
        'WASHI_TAPE',
    ].includes(node.type);
};

const isStrokeCapable = (node: SceneNode): node is StrokeCapable => {
    return [
        'BOOLEAN_OPERATION',
        'COMPONENT',
        'COMPONENT_SET',
        'ELLIPSE',
        'FRAME',
        'HIGHLIGHT',
        'INSTANCE',
        'LINE',
        'POLYGON',
        'RECTANGLE',
        'STAMP',
        'STAR',
        'TEXT',
        'VECTOR',
        'WASHI_TAPE',
    ].includes(node.type);
};

const currStrokeable = () => curr().filter(isStrokeable);
const currStrokeCapable = () => curr().filter(isStrokeCapable);

export default {
    s: {
        // issue: Figma will allow you to set the stroke on a group (which is unstrokeable),
        // then automagically apply that stroke to the first applicable descendants
        label: 'Stroke',
        children: {
            w: {
                id: 'stroke.weight',
                label: 'Weight',
                args: [{ name: 'strokeWeight', type: 'livenumber', label: 'Stroke Weight', prop: 'strokeWeight' }],
                exec: ({ strokeWeight }) => {
                    currStrokeable().forEach((node) => (node.strokeWeight = strokeWeight));
                },
            },
            a: {
                label: 'Align',
                children: {
                    i: {
                        id: 'stroke.align.inside',
                        label: 'Inside',
                        exec: () => {
                            currStrokeable().forEach((node) => (node.strokeAlign = 'INSIDE'));
                        },
                    },
                    c: {
                        id: 'stroke.align.center',
                        label: 'Center',
                        exec: () => {
                            currStrokeable().forEach((node) => (node.strokeAlign = 'CENTER'));
                        },
                    },
                    o: {
                        id: 'stroke.align.outside',
                        label: 'Outside',
                        exec: () => {
                            currStrokeable().forEach((node) => (node.strokeAlign = 'OUTSIDE'));
                        },
                    },
                },
            },
            j: {
                label: 'Join',
                children: {
                    m: {
                        id: 'stroke.join.miter',
                        label: 'Miter',
                        exec: () => {
                            currStrokeable().forEach((node) => (node.strokeJoin = 'MITER'));
                        },
                    },
                    b: {
                        id: 'stroke.join.bevel',
                        label: 'Bevel',
                        exec: () => {
                            currStrokeable().forEach((node) => (node.strokeJoin = 'BEVEL'));
                        },
                    },
                    r: {
                        id: 'stroke.join.round',
                        label: 'Round',
                        exec: () => {
                            currStrokeable().forEach((node) => (node.strokeJoin = 'ROUND'));
                        },
                    },
                },
            },
            c: {
                label: 'Cap',
                children: {
                    n: {
                        id: 'stroke.cap.none',
                        label: 'None',
                        exec: () => {
                            currStrokeCapable().forEach((node) => (node.strokeCap = 'NONE'));
                        },
                    },
                    r: {
                        id: 'stroke.cap.round',
                        label: 'Round',
                        exec: () => {
                            currStrokeCapable().forEach((node) => (node.strokeCap = 'ROUND'));
                        },
                    },
                    q: {
                        id: 'stroke.cap.square',
                        label: 'Square',
                        exec: () => {
                            currStrokeCapable().forEach((node) => (node.strokeCap = 'SQUARE'));
                        },
                    },
                    la: {
                        id: 'stroke.cap.line_arrow',
                        label: 'Line Arrow',
                        exec: () => {
                            currStrokeCapable().forEach((node) => (node.strokeCap = 'ARROW_LINES'));
                        },
                    },
                    ta: {
                        id: 'stroke.cap.line_arrow',
                        label: 'Triangle Arrow',
                        exec: () => {
                            currStrokeCapable().forEach((node) => (node.strokeCap = 'ARROW_EQUILATERAL'));
                        },
                    },
                },
            },
        },
    },
} as CmdGroup;
