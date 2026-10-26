import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  intensity?: number;
};

export const ParallaxCard = ({ children, className = "" }: Props) => {
  return <div className={className}>{children}</div>;
};
