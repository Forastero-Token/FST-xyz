"use client";

import { Box, Container, Flex, Link, Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { isDevnetEnvironment } from "@/lib/contract-utils";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { DevnetWalletButton } from "./DevnetWalletButton";
import { ConnectWalletButton } from "./ConnectWallet";

export const Navbar = () => {
  const [isClient, setIsClient] = useState(false);

  // Set `isClient` to true after the component mounts on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { currentWallet, wallets, setCurrentWallet } = useDevnetWallet();

  // Render nothing during SSR or before client is ready
  if (!isClient) {
    return null;
  }

  return (
    <Box as="nav" bg="white" boxShadow="sm">
      <Container maxW="container.xl">
        <Flex justify="space-between" h={16} align="center">
          <Flex align="center">
            <Image
              src="/images/vite.svg"
              alt="FST Logo"
              width="40px"
              height="40px"
            />
            <Link href="https://forastero.xyz/" textDecoration="none">
              <Box fontSize="lg" fontWeight="bold" color="gray.900" ml={4}>
                FORASTERO
              </Box>
            </Link>
          </Flex>
          <Flex align="center" gap={4}>
            {isDevnetEnvironment() ? (
              <DevnetWalletButton
                currentWallet={currentWallet}
                wallets={wallets}
                onWalletSelect={setCurrentWallet}
              />
            ) : (
              <ConnectWalletButton />
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

