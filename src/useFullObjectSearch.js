import { useState, useEffect } from "react";

let getInitialState = () => ({ indexes: [], matches: [] });

export default function useFullObjectSearch(query, o) {
  const [results, setResults] = useState(getInitialState());

  let recomputeResults = () => {
    let res = getInitialState();
    o.forEach((el, idx) => {
      for (let prop in el) {
        let val = el[prop];
        if (typeof val === "string") {
          let regexp = RegExp(escapeRegExp(query), "i");
          let m = regexp.exec(val);
          if (m) {
            let startIdx = m.index;
            let endIdx = m.index + m[0].length;
            res.indexes.push(idx);
            res.matches.push({
              propName: prop,
              matchRange: [startIdx, endIdx],
            });
            break;
          }
        }
      }
    });
    setResults(res);
  };

  useEffect(() => {
    if (query.length > 0) {
      recomputeResults();
    } else {
      setResults(getInitialState());
    }
  }, [query]);

  return results;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
