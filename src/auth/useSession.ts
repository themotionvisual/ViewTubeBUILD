import { useSimpleAuth } from "./AuthProvider";

export const useSession = () => useSimpleAuth().session;
