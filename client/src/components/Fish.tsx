import LottieImport from "lottie-react";
import animation from "@/assets/fish-animation.json";

interface FishProps {
  setPlay: (val: React.SetStateAction<boolean>) => void;
}
const Lottie = (LottieImport as any).default ?? LottieImport;
export default function Fish({ setPlay }: FishProps) {
  return (
    <Lottie
      animationData={animation}
      loop={false}
      onComplete={() => setPlay(false)}
    />
  );
}
