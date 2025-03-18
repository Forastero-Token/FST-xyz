import useTransactionExecuter from "@/hooks/useTransactionExecuter";
import { getInitializeTx } from "@/lib/campaign-utils";
import { isDevnetEnvironment, isTestnetEnvironment } from "@/lib/contract-utils";
import { Alert, AlertDescription, AlertTitle, Box, Button, Flex, NumberInput, NumberInputField, Spinner } from "@chakra-ui/react";
import { useContext, useState } from "react";
import HiroWalletContext from "./HiroWalletProvider";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { getStacksNetworkString } from "@/lib/stacks-api";

// Define prop type for the component
interface CampaignAdminControlsProps {
  campaignIsUninitialized: boolean;
  campaignIsExpired: boolean;
  campaignIsCancelled: boolean;
  campaignIsWithdrawn: boolean;
}

const CampaignAdminControls: React.FC<CampaignAdminControlsProps> = ({
  campaignIsUninitialized,
  campaignIsExpired,
  campaignIsCancelled,
  campaignIsWithdrawn,
}) => {
  const { mainnetAddress, testnetAddress } = useContext(HiroWalletContext);
  const { currentWallet: devnetWallet } = useDevnetWallet();
  const currentWalletAddress = isDevnetEnvironment()
    ? devnetWallet?.stxAddress
    : isTestnetEnvironment()
    ? testnetAddress
    : mainnetAddress;

  const [isInitializingCampaign, setIsInitializingCampaign] = useState(false);
  const [goal, setGoal] = useState<string>("");
  const executeTx = useTransactionExecuter();

  const handleGoalChange = (value: string) => {
    setGoal(value);
  };

  const handleInitializeCampaign = async () => {
    if (!goal || isNaN(Number(goal)) || Number(goal) <= 0) {
      // If the goal is invalid (not a positive number), return early
      alert("Please enter a valid positive number for the goal.");
      return;
    }

    const txOptions = getInitializeTx(
      getStacksNetworkString(),
      currentWalletAddress || "",
      Number(goal)
    );

    setIsInitializingCampaign(true);

    try {
      await executeTx(
        txOptions,
        devnetWallet,
        "Campaign was initialized",
        "Campaign was not initialized"
      );
      setGoal(""); // Clear goal input
    } catch (error) {
      console.error("Transaction failed", error);
      alert("There was an error initializing the campaign. Please try again.");
    } finally {
      setIsInitializingCampaign(false);
    }
  };

  return (
    <>
      <Alert mb="4" colorScheme="gray">
        <Box>
          <AlertTitle mb="2">Own your Forastero Token today!</AlertTitle>
          <AlertDescription>
            <Flex direction="column" gap="2">
              {campaignIsUninitialized ? (
                isInitializingCampaign ? (
                  <Box>
                    <Flex align="center" gap="2">
                      <Spinner size="sm" />
                      <Box>Your payment is being initialized. Please wait for it to be confirmed on-chain...</Box>
                    </Flex>
                  </Box>
                ) : (
                  <>
                    <Box mb="1">
                      Ready to purchase your Forastero Token now? 
                      The pre-sale will remain open until all 4 million Forastero Tokens are sold out.
                    </Box>
                    <NumberInput
                      bg="white"
                      min={1}
                      value={goal}
                      onChange={handleGoalChange}
                      isDisabled={isInitializingCampaign} // Disable input while initializing
                    >
                      <NumberInputField
                        placeholder="Enter your budget in USD (Goal)"
                        textAlign="center"
                        fontSize="lg"
                      />
                    </NumberInput>
                    <Button
                      colorScheme="green"
                      onClick={handleInitializeCampaign}
                      isDisabled={!goal || isInitializingCampaign || isNaN(Number(goal)) || Number(goal) <= 0}
                    >
                      Buy Forastero tokens for ${Number(goal).toLocaleString()}
                    </Button>
                  </>
                )
              ) : (
                <Box>Your Forastero order is already initialized.</Box>
              )}
            </Flex>
            <Flex direction="column" gap="2" mt="4">
              {campaignIsExpired && <Box>The campaign has expired.</Box>}
              {campaignIsCancelled && <Box>The campaign has been cancelled.</Box>}
              {campaignIsWithdrawn && <Box>The campaign has been withdrawn.</Box>}
            </Flex>
          </AlertDescription>
        </Box>
      </Alert>
    </>
  );
};

export default CampaignAdminControls;

