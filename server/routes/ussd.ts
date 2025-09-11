import { Router } from "express";
import { Request, Response } from "express";
import { logger } from "../lib/logger.js";
import { db } from "../db.js";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/africas-talking", async (req: Request, res: Response) => {
  try {
    logger.info("USSD request received", req.body);

    // Extract data from Africa's Talking webhook
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    // Handle the USSD request

    const response = await handleUSSDRequest({
      sessionId,
      serviceCode,
      phoneNumber,
      text: text || "",
    });

    // Send the response back to Africa's Talking
    res.set("Content-Type", "text/plain");
    res.send(response);
  } catch (error) {
    logger.error("Error processing USSD request", error);
    res.set("Content-Type", "text/plain");
    res.send("END Service is currently unavailable. Please try again later.");
  }
});

// Main function to handle USSD request
async function handleUSSDRequest({
  sessionId: _sessionId,
  serviceCode: _serviceCode,
  phoneNumber,
  text,
}: {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}): Promise<string> {
  const inputs = text ? text.split("*").slice(1) : [];
  const level = inputs.length;

  logger.info(
    `USSD request received - Level: ${level}, phoneNumber: ${phoneNumber}, Options: ${inputs.join(
      ", "
    )}`
  );
  try {
    switch (level) {
      case 0:
        // first time user dials *384*92007#
        return showMainMenu();
      case 1:
        // User has selected main menu option
        return await handleMainMenuSelection(inputs[0], phoneNumber);
      case 2:
        // User has selected sub menu option
        return await handleSubMenuSelection(inputs, phoneNumber);
      default:
        // Invalid level
        return "END Invalid USSD request";
    }
  } catch (error) {
    logger.error("Error processing USSD request", error);
    return "END Service is currently unavailable. Please try again later.";
  }
}

// Show main menu
function showMainMenu(): string {
  return (
    "CON Welcome to Greenupp!" +
    "\n1. Weather Forecast" +
    "\n2. Market Prices" +
    "\n3. My Account" +
    "\n4. Pest Alert" +
    "\n5. Help & Support" +
    "\n0. Exit"
  );
}

// Handle main menu selection
async function handleMainMenuSelection(
  inputs: string,
  phoneNumber: string
): Promise<string> {
  const mainChoice = inputs[0];
  const subChoice = inputs[1];
  switch (mainChoice) {
    case "1":
      return await handleWeatherSubMenu(subChoice, phoneNumber);
    case "2":
      return await handleMarketSubMenu(subChoice, phoneNumber);
    case "5":
      return await handleHelpSubMenu(subChoice);
    default:
      return "END Thank you for using Greenupp! Goodbye!";
  }
}

// Handle sub-menu selections (when user goes deeper)
async function handleSubMenuSelection(
  inputs: string[],
  phoneNumber: string
): Promise<string> {
  const mainChoice = inputs[0];
  const subChoice = inputs[1];

  switch (mainChoice) {
    case "1": // Weather sub-menu
      return await handleWeatherSubMenu(subChoice, phoneNumber);

    case "2": // Market prices sub-menu
      return await handleMarketSubMenu(subChoice, phoneNumber);

    case "5": // Help sub-menu
      return handleHelpSubMenu(subChoice);

    default:
      return "END Invalid selection. Please try again.";
  }
}

// Show weather forecast submenu
async function _showWeatherForecast(
  subChoice: string,
  phoneNumber: string
): Promise<string> {
  try {
    // clean phone number (remove + and spaces)
    const cleanedPhoneNumber = phoneNumber.replace(/[+\s]/g, "");

    // Find user by phone number
    const user = await findUserByPhone(cleanedPhoneNumber);

    if (!user) {
      return (
        "END 📱 Phone not registered!" +
        "\nPlease register at: greenupp.com" +
        "\nOr SMS 'REGISTER' to +260XXX" +
        "\nThank you! 🌾"
      );
    }

    // Get weather data
    const weather = await getWeatherData(user.location || "Lusaka");
    if (!weather) {
      return (
        "END 🌤️ Weather service unavailable" +
        "\nFor weather updates:" +
        "\n📱 SMS 'WEATHER' to +260XXX" +
        "\n🌐 Visit greenupp.com" +
        "\nSorry for the inconvenience!"
      );
    }

    return (
      `CON 🌤️ Weather - ${user.location || "Lusaka"}\n` +
      `\n` +
      `Today: ${weather.today}\n` +
      `Temp: ${weather.minTemp}°C - ${weather.maxTemp}°C` +
      `\n` +
      `Rain: ${weather.rainChance}%` +
      `\n` +
      `1. Tomorrow's forecast` +
      `2. 3-day forecast` +
      `3. Planting advice` +
      `0. Back to main menu`
    );
  } catch (error) {
    logger.error("Weather forecast error:", error);
    return "END Weather service unavailable. Please try again later.";
  }
}

// Handle weather sub-menu
async function handleWeatherSubMenu(
  choice: string,
  phoneNumber: string
): Promise<string> {
  const cleanPhone = phoneNumber.replace(/[\s+]/g, "");
  const user = await findUserByPhone(cleanPhone);

  if (!user) {
    return "END Please register first at greenupp.com";
  }

  switch (choice) {
    case "1": {
      const tomorrow = await getTomorrowWeather(user.location);
      return `END 🌅 Tomorrow's Weather
  
  ${tomorrow.summary}
  Temp: ${tomorrow.minTemp}°C - ${tomorrow.maxTemp}°C
  Rain: ${tomorrow.rainChance}%
  
  Have a great day farming! 🌾`;
    }

    case "2":
      return `END 📅 3-Day Forecast
  
  For detailed 3-day forecast:
  📱 SMS 'FORECAST' to +260XXX
  🌐 Visit greenupp.com/weather
  
  Thank you! 🌤️`;

    case "3": {
      const advice = await getPlantingAdvice(user.location);
      return `END 🌱 Planting Advice
  
  ${advice}
  
  For more farming tips:
  🌐 greenupp.com/tips
  
  Happy farming! 🚜`;
    }

    case "0":
      return showMainMenu();

    default:
      return "END Invalid choice. Please try again.";
  }
}

// Helper function to find user by phone
async function findUserByPhone(phoneNumber: string): Promise<any> {
  try {
    // Try different phone number formats
    const phoneVariations = [
      phoneNumber,
      `+${phoneNumber}`,
      `+260${phoneNumber.slice(-9)}`, // Zambian format
      phoneNumber.startsWith("260") ? phoneNumber.slice(3) : phoneNumber,
    ];

    for (const phone of phoneVariations) {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      if (result.length > 0) {
        return result[0];
      }
    }

    return null;
  } catch (error) {
    logger.error("Error finding user by phone:", error);
    return null;
  }
}

// Mock weather function (replace with your actual weather API)
async function getWeatherData(location: string): Promise<any> {
  // TODO: Replace with your actual weather API call
  // For now, return mock data
  return {
    today: "Partly cloudy",
    minTemp: 18,
    maxTemp: 28,
    rainChance: 30,
    location,
  };
}

async function getTomorrowWeather(_location: string): Promise<any> {
  return {
    summary: "Sunny with light clouds",
    minTemp: 16,
    maxTemp: 30,
    rainChance: 15,
  };
}

async function getPlantingAdvice(_location: string): Promise<string> {
  return "Good conditions for planting maize. Soil moisture adequate. Consider planting in next 2-3 days.";
}

// Show market prices
async function _showMarketPrices(phoneNumber: string): Promise<string> {
  try {
    const cleanPhone = phoneNumber.replace(/[\s+]/g, "");
    const user = await findUserByPhone(cleanPhone);

    const location = user?.location || "Lusaka";
    const prices = await getMarketPrices(location);

    if (!prices || prices.length === 0) {
      return `END 💰 Market Prices
  
  Prices unavailable right now.
  
  For current prices:
  📱 SMS 'PRICES' to +260XXX
  🌐 greenupp.com/marketplace
  
  Thank you! 🛒`;
    }

    // Show top 4 prices to fit in USSD message
    const priceText = prices
      .slice(0, 4)
      .map((p) => `${p.crop}: K${p.price}/${p.unit}`)
      .join("\n");

    return `CON 💰 Market Prices - ${location}
  
  ${priceText}
  
  1. More crops
  2. Other markets
  3. Sell your crops
  0. Back to main menu`;
  } catch (error) {
    logger.error("Market prices error:", error);
    return "END Market prices unavailable. Please try again later.";
  }
}

// Handle market prices sub-menu
async function handleMarketSubMenu(
  choice: string,
  phoneNumber: string
): Promise<string> {
  const cleanPhone = phoneNumber.replace(/[\s+]/g, "");
  const user = await findUserByPhone(cleanPhone);

  switch (choice) {
    case "1": {
      const morePrices = await getMoreMarketPrices(user?.location);
      return `END 💰 More Prices
  
  ${morePrices}
  
  For all prices:
  🌐 greenupp.com/marketplace
  
  Happy selling! 🛒`;
    }

    case "2":
      return `END 🏪 Other Markets
  
  Kabwe: Maize K85/bag
  Ndola: Maize K90/bag  
  Kitwe: Maize K88/bag
  
  For more markets:
  🌐 greenupp.com/markets`;

    case "3":
      return `END 🌾 Sell Your Crops
  
  List your crops for sale:
  📱 SMS 'SELL [CROP] [QUANTITY]' to +260XXX
  🌐 greenupp.com/sell
  
  Good luck with your sales! 💰`;

    case "0":
      return showMainMenu();

    default:
      return "END Invalid choice. Please try again.";
  }
}

// Mock market prices function (replace with your actual marketplace API)
async function getMarketPrices(_location: string): Promise<any[]> {
  // TODO: Replace with your actual marketplace API call
  return [
    { crop: "Maize", price: 85, unit: "50kg bag" },
    { crop: "Groundnuts", price: 12, unit: "kg" },
    { crop: "Beans", price: 15, unit: "kg" },
    { crop: "Sweet Potato", price: 8, unit: "kg" },
  ];
}

async function getMoreMarketPrices(_location: string): Promise<string> {
  return `Tomatoes: K25/box
  Cabbage: K18/head
  Onions: K22/kg
  Carrots: K15/kg`;
}

// Show account information
async function _showAccountInfo(phoneNumber: string): Promise<string> {
  try {
    const cleanPhone = phoneNumber.replace(/[\s+]/g, "");
    const user = await findUserByPhone(cleanPhone);

    if (!user) {
      return `END 📱 Account Not Found
  
  Register your account:
  🌐 greenupp.com/register
  
  Or SMS 'REGISTER' to +260XXX
  
  Welcome to GreenUpp! 🌾`;
    }

    // TODO: Get actual subscription status and usage
    const accountInfo = await getUserAccountInfo(user.id);

    return `END 👤 Account Info
  
  Name: ${user.firstName} ${user.lastName}
  Phone: ${phoneNumber}
  Plan: ${accountInfo.plan}
  Status: ${accountInfo.status}
  Expires: ${accountInfo.expiryDate}
  
  Manage account:
  🌐 greenupp.com/account 📱`;
  } catch (error) {
    logger.error("Account info error:", error);
    return "END Account information unavailable. Please try again later.";
  }
}

// Show pest alert menu
function _showPestAlert(): string {
  return `END 🐛 Pest Alert
  
  Report crop problems:
  📱 SMS 'PEST [PROBLEM]' to +260XXX
  
  Take photo and send via WhatsApp:
  📱 +260XXX
  
  AI diagnosis available at:
  🌐 greenupp.com/diagnosis
  
  Get help fast! 🚨`;
}

// Show help menu
function _showHelpMenu(): string {
  return `CON ❓ Help & Support
  
  1. How to use USSD
  2. Contact support
  3. Pricing info
  4. Technical help
  5. Farming tips
  0. Back to main menu`;
}

// Handle help sub-menu
function handleHelpSubMenu(choice: string): string {
  switch (choice) {
    case "1":
      return `END 📖 How to Use
  
  Dial: *384*92007#
  Navigate with numbers
  Press * to go back
  
  Features:
  • Weather forecasts
  • Market prices
  • Account info
  • Pest alerts
  
  Easy farming! 🌾`;

    case "2":
      return `END 📞 Contact Support
  
  Call: +260XXX
  WhatsApp: +260XXX
  Email: support@greenupp.com
  
  Office Hours:
  Mon-Fri: 8AM-5PM
  Sat: 8AM-12PM
  
  We're here to help! 🤝`;

    case "3":
      return `END 💳 Pricing
  
  Basic Plan: K50/month
  • Weather alerts
  • Market prices
  • Pest diagnosis
  
  Premium Plan: K150/month  
  • Everything in Basic
  • AI recommendations
  • Priority support
  
  Sign up: greenupp.com 🌟`;

    case "4":
      return `END 🔧 Technical Help
  
  USSD not working?
  1. Check network signal
  2. Try again in 5 minutes
  3. Restart your phone
  
  Still problems?
  📱 Call +260XXX
  
  We'll fix it! ⚡`;

    case "5":
      return `END 🌱 Farming Tips
  
  Daily tips via SMS:
  📱 Send 'TIPS' to +260XXX
  
  Visit our blog:
  🌐 greenupp.com/blog
  
  Follow us on social media
  for daily farming advice! 📚`;

    case "0":
      return showMainMenu();

    default:
      return "END Invalid choice. Please try again.";
  }
}

// Mock function for account info
async function getUserAccountInfo(_userId: number): Promise<any> {
  // TODO: Replace with actual account/subscription logic
  return {
    plan: "Basic",
    status: "Active",
    expiryDate: "March 2025",
  };
}

export default router;
