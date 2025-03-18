import { extendTheme } from "@chakra-ui/react";

// Define your theme configuration with color mode
const theme = extendTheme({
  config: {
    initialColorMode: "light", // or "dark", depending on your preference
    useSystemColorMode: false, // Set this to true if you want to use the system's color mode
  },
  colors: {
    brand: {
      500: "#2D3748",
    },
  },
});

export default theme;

