import { CustomTooltip } from "./CustomTooltip";

export default function RuleItem({ label, description }) {

  const bullet = /•|/;
  const descParts = description.split(bullet).map(part => (<p key={part}>{part}</p>));

  let content = description ?
    <CustomTooltip title={descParts} arrow enterTouchDelay={1500} leaveTouchDelay={3000} onClick={e => e.stopPropagation()}>
      <span style={{ textDecoration: "underline", textDecorationStyle: "dashed", textDecorationColor: "#666", textUnderlineOffset: "4px" }}>{label}</span>
    </CustomTooltip>
    : <span>{label}</span>

  return content;
}
