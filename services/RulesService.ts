import { ISpecialRule } from "../data/interfaces";

export default class RulesService {
  public static displayName(rule: ISpecialRule, count: number = null) {

    return (count > 1 ? `${count}x ` : "")
      + rule.name
      + ((!(rule.rating == null || rule.rating == "")) ? `(${(rule.name === "Defense" || rule.modify ? "+" : "") + rule.rating})` : "")
      + (rule.condition ? ` ${rule.condition}` : "");
  }
}