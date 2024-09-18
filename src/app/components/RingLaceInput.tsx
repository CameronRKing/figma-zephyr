import * as React from 'react';
import {Text} from 'react-figma-plugin-ds';
import {RunCmdFn, cubits} from '../commands';

export default function RingLaceInput({
    onFinish,
    onCancel,
    runCmd,
}: {
    onFinish: (any) => void;
    onCancel: () => void;
    runCmd: RunCmdFn;
}) {
    const [numRings, setNumRings] = React.useState(1);
    const [cubit, setCubit] = React.useState(cubits[0]);
    const [numer, setNumer] = React.useState(1);
    const [denom, setDenom] = React.useState(4);
    const [hasRun, setHasRun] = React.useState(false);
    const [rotation, setRotation] = React.useState(0);
    const numRingsRef = React.useRef(null);

    // focus div on load
    React.useEffect(() => {
        numRingsRef?.current.focus();
    }, []);

    // delete & re-create lace every time a parameter changes
    React.useEffect(() => {
        if (hasRun) runCmd({bind: 'ds'}); // delete selection, if we know the current selection is a lace we've made
        else setHasRun(true);
        runCmd({bind: 'cl', payload: {numRings, cubit, fraction: `${numer}/${denom}`}});
    }, [hasRun, numRings, cubit, numer, denom]);

    const keybinds = React.useCallback(
        (evt: React.KeyboardEvent) => {
            const numerKey = evt.altKey;
            const denomKey = evt.metaKey;
            switch (evt.key) {
                case 'j':
                    setCubit(cubits[cubits.indexOf(cubit) + (1 % cubits.length)]);
                    break;
                case 'k':
                    if (cubits.indexOf(cubit) == 0) {
                        setCubit[cubits.length - 1];
                        break;
                    }
                    setCubit(cubits[cubits.indexOf(cubit) - 1]);
                    break;
                case 'ArrowUp':
                    if (numerKey) setNumer(numer + 1);
                    else if (denomKey) {
                        setDenom(denom * 2);
                        setNumer(numer * 2);
                    } else setNumRings(numRings + 1);
                    break;
                case 'ArrowDown':
                    if (numerKey) setNumer(numer == 1 ? 1 : numer - 1);
                    else if (denomKey) {
                        setDenom(denom / 2 < 1 ? 1 : denom / 2);
                        setNumer(denom / 2 < 1 ? numer : Math.ceil(numer / 2));
                    } else setNumRings(numRings - 1 || 1);
                    break;
                case 'Escape':
                    onCancel();
                    break;
                case 'Enter':
                    onFinish(null);
                    break;
            }
        },
        [numRings, cubit, numer, denom]
    );

    return (
        <div onKeyDown={keybinds}>
            <Text>
                <b className="label">Number of Rings</b>
            </Text>
            <input
                ref={numRingsRef}
                type="number"
                min={1}
                step={1}
                value={numRings}
                onChange={(evt) => setNumRings(+evt.target.value)}
            />

            <Text>
                <b className="label">Cubit</b>
            </Text>
            {cubits.map(({txt, len}) => (
                <div
                    key={txt}
                    style={{
                        background: cubit.txt == txt ? 'gray' : 'white',
                        color: cubit.txt == txt ? 'white' : 'gray',
                    }}
                >
                    {txt}: {len}"
                </div>
            ))}

            <Text>
                <b className="label">Fraction</b>
            </Text>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <input
                    type="number"
                    style={{width: 'fit-content'}}
                    min={1}
                    step={1}
                    value={numer}
                    onChange={(evt) => setNumer(+evt.target.value || 1)}
                />
                /
                <input
                    type="number"
                    style={{width: 'fit-content'}}
                    min={1}
                    step={1}
                    value={denom}
                    onChange={(evt) => setDenom(+evt.target.value || 1)}
                />
            </div>

            <Text>
                <b className="label">Rotation</b>
            </Text>
            <input type="number" value={rotation} onChange={(evt) => setRotation(+evt.target.value)} />
        </div>
    );
}
