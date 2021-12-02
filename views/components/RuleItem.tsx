import { CustomTooltip } from "./CustomTooltip";

export default function RuleItem({ label, description }) {

  const bullet = /•|/;
  const descParts = description.split(bullet).map(part => (<p>{part}</p>));

  let content = description ?
    <CustomTooltip title={descParts} arrow enterTouchDelay={0} leaveTouchDelay={10000} onClick={e => e.stopPropagation()}>
      <span style={{ textDecoration: "underline", textDecorationStyle: "dashed", textDecorationColor: "#666", textUnderlineOffset: "4px" }}>{label}</span>
    </CustomTooltip>
    : <span>{label}</span>

  return content;
}
