import { Badge } from "@components/badges/badge";

type Props = {
  visibility: string;
};

const VisibilityBadge = ({ visibility }: Props) => {
  return <Badge variant={"outline"}>{visibility}</Badge>;
};

export default VisibilityBadge;
