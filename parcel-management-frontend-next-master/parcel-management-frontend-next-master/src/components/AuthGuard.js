import { useRouter } from "next/router";
import { useEffect } from "react";
import { useGlobalContext } from "@/context/GlobalContext";

export default function AuthGuard({ children, allowedRoles }) {
  const { isLoggedIn, role } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/user/log");
    } else if (allowedRoles && !allowedRoles.includes(role)) {
      router.replace("/403");
    }
  }, [isLoggedIn, role, allowedRoles, router]);

  if (!isLoggedIn) return null;
  if (allowedRoles && !allowedRoles.includes(role)) return null;

  return children;
}
