/** Joins the truthy class names; lets conditional CSS Module classes read as a list. */
export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
