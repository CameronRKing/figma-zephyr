import * as React from 'react';
import {RunCmdFn} from '../commands';
import {Text} from 'react-figma-plugin-ds';

interface Props {
    label: string;
    prop: string;
    onFinish: (any) => void;
    onCancel: () => void;
    runCmd: RunCmdFn;
}

export default function LiveNumber({label, prop, onFinish, onCancel, runCmd}: Props) {
    // there's a couple ways I could set this up
    // the prefill & update could be handled by consumers as function parameters
    // but since they'll all follow the same patter (or so I believe), why repeat myself?
    // so it's better to have generic commands for getting & setting simple Node properties,
    // then have the consumer of this component indicate only which property to look up

    const [initialVal, setInitialVal] = React.useState(0);
    const [currVal, setCurrVal] = React.useState(0);

    React.useEffect(() => {
        runCmd({bind: 'getprop', payload: {prop}}).then((val) => {
            console.log('received', prop, val);
            setInitialVal(val);
            setCurrVal(val);
        });
    }, [prop]);

    const broadcastChange = React.useCallback((val) => {
        runCmd({bind: 'setprop', payload: {prop, val}});
        setCurrVal(val);
    }, []);

    const handleKeyCmd = React.useCallback(
        (evt) => {
            switch (evt.key) {
                case 'Escape':
                    runCmd({bind: 'setprop', payload: {prop, val: initialVal}}).then(() => onCancel());
                    break;
                case ' ':
                case 'Enter':
                    onFinish(currVal);
                    break;
                case 'j':
                    broadcastChange(currVal + 1);
                    break;
                case 'k':
                    broadcastChange(currVal - 1);
                    break;
                default:
                // do nothing
            }
        },
        [initialVal, currVal]
    );

    return (
        <>
            {label ? (
                <Text>
                    <b className="label">{label}</b>
                </Text>
            ) : (
                <></>
            )}

            <input
                autoFocus
                type="number"
                step="1"
                value={currVal}
                onChange={(evt) => broadcastChange(evt.target.value)}
                onKeyDown={handleKeyCmd}
            />
        </>
    );
}
