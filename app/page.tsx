import { Button } from "@/components/ui/button";
import { requireAuth } from "@/module/auth/utils/auth-utils";
import Logout from "@/module/auth/components/logout";
import { redirect } from "next/navigation";

// Force dynamic rendering since we access cookies in requireAuth
export const dynamic = 'force-dynamic';

export default async function Home() {
  await requireAuth();
  return redirect("/dashboard");
  //Landing Page here
  // return (
  //   <div className="flex flex-col items-center justify-center h-screen">
  //     <Logout>
  //       <Button> Logout </Button>
  //     </Logout>
  //   </div>
  // );
}
