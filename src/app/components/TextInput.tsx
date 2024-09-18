import * as React from 'react';
import {Text} from 'react-figma-plugin-ds';

export default (props) => {
    if (!props) return;

    const [val, setVal] = React.useState(typeof props.prefill === 'string' ? props.prefill : '');

    React.useEffect(() => {
        if (typeof props.prefill === 'function') {
            // convert to promise in case it doesn't return one
            Promise.resolve(props.prefill(props.runCmd)).then(setVal);
        }
    }, []);

    // end input when user presses spacebar twice
    React.useEffect(() => {
        val.endsWith('  ') ? props.onFinish(val.slice(0, -2)) : null;
    }, [val]);

    return (
        <>
            {props.label ? (
                <Text>
                    <b className="label">{props.label}</b>
                </Text>
            ) : (
                <></>
            )}
            <input
                type="text"
                value={val}
                onChange={(evt) => setVal(evt.target.value)}
                onKeyDown={(evt) => (evt.key === 'Escape' ? props.onCancel() : null)}
                autoFocus
            />
        </>
    );
};
