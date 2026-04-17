import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[85vh] w-full">
      <div className="flex flex-col items-center">
         <SignIn routing="hash" />
      </div>
    </div>
  );
}
