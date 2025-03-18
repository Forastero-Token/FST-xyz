import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AppConfig, showConnect, UserSession } from "@stacks/connect";

const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSession = new UserSession({ appConfig });

interface HiroWallet {
  isWalletOpen: boolean;
  isWalletConnected: boolean;
  testnetAddress: string | null;
  mainnetAddress: string | null;
  authenticate: () => void;
  disconnect: () => void;
}

const HiroWalletContext = createContext<HiroWallet>({
  isWalletOpen: false,
  isWalletConnected: false,
  testnetAddress: null,
  mainnetAddress: null,
  authenticate: () => {},
  disconnect: () => {},
});
export default HiroWalletContext;

interface ProviderProps {
  children: ReactNode | ReactNode[];
}

export const HiroWalletProvider: FC<ProviderProps> = ({ children }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // Use useEffect to ensure this logic runs only on the client
  useEffect(() => {
    // Check if user is signed in on the client-side (window is available)
    if (typeof window !== "undefined") {
      setIsWalletConnected(userSession.isUserSignedIn());
    }
  }, []);

  const authenticate = useCallback(() => {
    setIsWalletOpen(true);
    if (typeof window !== "undefined") {
      showConnect({
        appDetails: {
          name: "Hiro",
          icon: `${window.location.origin}/logo512.png`,
        },
        redirectTo: "/",
        onFinish: async () => {
          setIsWalletOpen(false);
          setIsWalletConnected(userSession.isUserSignedIn());
        },
        onCancel: () => {
          setIsWalletOpen(false);
        },
        userSession,
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    if (typeof window !== "undefined") {
      userSession.signUserOut(window.location?.toString());
    }
  }, []);

  const testnetAddress = isWalletConnected
    ? userSession.loadUserData().profile.stxAddress.testnet
    : null;
  const mainnetAddress = isWalletConnected
    ? userSession.loadUserData().profile.stxAddress.mainnet
    : null;

  const hiroWalletContext = useMemo(
    () => ({
      authenticate,
      disconnect,
      isWalletOpen,
      isWalletConnected,
      testnetAddress,
      mainnetAddress,
    }),
    [
      authenticate,
      disconnect,
      isWalletOpen,
      isWalletConnected,
      mainnetAddress,
      testnetAddress,
    ]
  );

  return (
    <HiroWalletContext.Provider value={hiroWalletContext}>
      {children}
    </HiroWalletContext.Provider>
  );
};

