// Tiny classnames helper — joins truthy class fragments.
export function cn(...args) {
  return args
    .flat()
    .filter((x) => typeof x === "string" && x.length > 0)
    .join(" ");
}
