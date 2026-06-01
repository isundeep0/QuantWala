import { motion } from "framer-motion";
import { colorFor } from "./palette.js";

// Renders a 2D DP table. grid: number[][]. states: { "r,c": stateKey }.
// rowHeaders / colHeaders optional label arrays. cornerLabel optional.
export default function GridView({
  grid = [],
  states = {},
  rowHeaders,
  colHeaders,
  cornerLabel = "",
  cell = 38,
}) {
  return (
    <div className="overflow-auto">
      <table className="border-separate" style={{ borderSpacing: 3 }}>
        {colHeaders && (
          <thead>
            <tr>
              <th style={{ width: cell, height: cell }} className="text-faint font-mono text-xs">
                {cornerLabel}
              </th>
              {colHeaders.map((h, c) => (
                <th key={c} style={{ width: cell, height: cell }} className="font-mono text-xs text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {grid.map((row, r) => (
            <tr key={r}>
              {rowHeaders && (
                <td style={{ width: cell, height: cell }} className="text-center font-mono text-xs text-muted">
                  {rowHeaders[r]}
                </td>
              )}
              {row.map((val, c) => {
                const cc = colorFor(states[`${r},${c}`] || "default");
                return (
                  <td key={c}>
                    <motion.div
                      animate={{ backgroundColor: cc.bg, color: cc.fg, borderColor: cc.border }}
                      className="grid place-items-center rounded-md border font-mono text-sm font-semibold"
                      style={{ width: cell, height: cell }}
                    >
                      {val === Infinity ? "∞" : val}
                    </motion.div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
