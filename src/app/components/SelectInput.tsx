import * as React from 'react';
import FuzzySearcher from 'fuzzy-search';
// import { Text } from 'react-figma-plugin-ds';

const possiblyPreset = (val, def) => (val && typeof val !== 'function' ? val : def);

export default (props) => {
    if (!props) return;
    const {options, prefill, runCmd, label} = props;

    const [opts, setOpts] = React.useState(possiblyPreset(options, []));
    const [search, setSearch] = React.useState('');
    const [searcher, setSearcher] = React.useState<FuzzySearcher>();
    const [matches, setMatches] = React.useState(opts);
    const [selected, setSelected] = React.useState(possiblyPreset(prefill, matches[0]));

    React.useEffect(() => {
        if (options && typeof options === 'function') {
            Promise.resolve(options(runCmd)).then((val) => {
                setOpts(val);
                setMatches(val);
                setSelected(val[0]);
            });
        }
        if (prefill && typeof prefill === 'function') {
            Promise.resolve(prefill(runCmd)).then(setSelected);
        }
    }, []);

    React.useEffect(() => {
        if (opts.length == 0) return;
        setSearcher(new FuzzySearcher(opts, [opts[0].txt ? 'txt' : null]));
    }, [opts]);

    React.useEffect(() => {
        if (search.endsWith('  ')) {
            props.onFinish(selected);
            return;
        }
        const res = ['', ' '].includes(search) ? opts : searcher.search(search);
        if (res === matches) return;
        setMatches(res);
        setSelected(res[0]);
    }, [search]);

    // Enter: select current value
    // may want to set to double space for consistency with TextInput
    // or add Enter exitpoint to TextInput
    // or both!
    // Meta+j: select next value
    // Meta+k: select prev value

    const next = React.useCallback(() => {
        const idx = matches.indexOf(selected);
        const isAtEnd = idx === matches.length - 1;
        const newIdx = matches[isAtEnd ? 0 : idx + 1];
        setSelected(newIdx);
    }, [selected, matches]);

    const prev = React.useCallback(() => {
        const idx = matches.indexOf(selected);
        const isAtStart = idx === 0;
        const end = matches.length - 1;
        const newIdx = matches[isAtStart ? end : idx - 1];
        setSelected(newIdx);
    }, [selected, matches]);

    const onKeydown = React.useCallback(
        (evt: React.KeyboardEvent) => {
            if (evt.key === 'Escape') {
                props.onCancel();
            }
            if (evt.key === 'Enter') {
                props.onFinish(selected);
                return;
            }
            if (!evt.metaKey) return;
            switch (evt.key) {
                case 'j':
                    next();
                    break;
                case 'k':
                    prev();
                    break;
                default:
                // do nothing
            }
        },
        [selected, prev, next]
    );

    return (
        <div className="dfc ais mx2">
            <div className="df jb px1">
                <span className="caption">
                    Ⅹ <b>Esc</b>
                </span>
                <span className="caption">
                    <b>Enter</b> ✔
                </span>
            </div>
            {label ? <b className="label">{label}</b> : <></>}
            <input
                type="text"
                value={search}
                onChange={(evt) => setSearch(evt.target.value)}
                onKeyDown={onKeydown}
                autoFocus
            />
            <div className="df jb px1">
                <span className="caption">
                    ← prev (<b>Meta+k</b>)
                </span>
                <span className="caption">
                    (<b>Meta+k</b>) next →
                </span>
            </div>
            {matches.map((opt) => {
                const text = typeof opt === 'string' ? opt : opt.txt;
                return (
                    <div
                        onClick={() => props.onFinish(opt)}
                        style={{
                            background: selected === opt ? 'gray' : 'white',
                            color: selected === opt ? 'white' : 'gray',
                        }}
                        key={text}
                    >
                        {text}
                    </div>
                );
            })}
        </div>
    );
};
