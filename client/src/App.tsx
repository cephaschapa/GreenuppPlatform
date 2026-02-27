import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage";
import DashboardPage from "@/pages/dashboard-page";
import ProfileCreationPage from "@/pages/profile-creation-page";
import PublicMarketplacePage from "@/pages/PublicMarketplacePage";
import PublicListingDetailPage from "@/pages/PublicListingDetailPage";
import PublicSellersPage from "@/pages/PublicSellersPage";
import PublicSellerProfilePage from "@/pages/PublicSellerProfilePage";
import PublicTraceVerificationPage from "@/pages/PublicTraceVerificationPage";
import TestingWaitlistPage from "@/pages/TestingWaitlistPage";
import AiKnowledgeBasePage from "@/pages/AiKnowledgeBasePage";
import AboutPage from "@/pages/AboutPage";
import PrivacyPage from "@/pages/PrivacyPage";
import FeaturesPage from "@/pages/FeaturesPage";
import RnDPage from "@/pages/RnDPage";
import GreenSocialsPage from "@/pages/GreenSocialsPage";
import StreamChatPage from "@/pages/StreamChatPage";
import FarmingAssistantPage from "@/pages/FarmingAssistantPage";
import UploadTestPage from "@/pages/UploadTestPage";
import EmailNotificationTestPage from "@/pages/EmailNotificationTestPage";
import PublicEmailTestPage from "@/pages/PublicEmailTestPage";
import SystemHealthPage from "@/pages/admin/SystemHealthPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import WaitlistManagementPage from "@/pages/admin/WaitlistManagementPage";
import AdminAlertsPage from "@/pages/admin/AdminAlertsPage";
import SecuritySettings from "@/pages/auth/SecuritySettings";
import AlertsPage from "@/pages/farmer/AlertsPage";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { SocketIOProvider } from "@/hooks/use-socketio";
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "@/components/ThemeProvider";
// import InstallPWA from "@/components/ui/InstallPWA"; // Currently unused
import OfflineIndicator from "@/components/ui/OfflineIndicator";
import { CartProvider } from "@/hooks/use-cart";
import { HelmetProvider } from "react-helmet-async";
import { NotificationProvider } from "@/hooks/use-notifications";
import { WebSocketProvider } from "@/hooks/use-websocket";

// Import farmer-specific pages
import FieldsPage from "@/pages/farmer/FieldsPage";
import CropsPage from "@/pages/farmer/CropsPage";
import TasksPage from "@/pages/farmer/TasksPage";
import WeatherPage from "@/pages/farmer/WeatherPage";
import PredictionsPage from "@/pages/farmer/PredictionsPage";
import ProfilePage from "@/pages/farmer/ProfilePage";
import SettingsPage from "@/pages/farmer/SettingsPage";
import PlantDiagnosisPage from "@/pages/farmer/PlantDiagnosisPage";
import MarketplacePage from "@/pages/farmer/MarketplacePage";
import MarketplaceDetailPage from "@/pages/farmer/MarketplaceDetailPage";
import CreateListingPage from "@/pages/farmer/CreateListingPage";
import CartPage from "@/pages/farmer/CartPage";
import CheckoutPage from "@/pages/farmer/CheckoutPage";
import CropTraceabilityPage from "@/pages/farmer/CropTraceabilityPage";
import CropPlanSimsPage from "@/pages/farmer/CropPlanSimsPage";
import ListCropOnMarketplace from "@/pages/farmer/ListCropOnMarketplace";
import NotificationsPage from "@/pages/farmer/NotificationsPage";
import NotificationSettingsPage from "@/pages/farmer/NotificationSettingsPage";
import ExpertDirectoryPage from "@/pages/farmer/ExpertDirectoryPage";
import DealerDirectoryPage from "@/pages/farmer/DealerDirectoryPage";
import OrdersPage from "./pages/farmer/OrdersPage";
import InventoryPage from "./pages/farmer/InventoryPage";
import ProductVerificationPage from "./pages/farmer/ProductVerificationPage";
import DashboardOverview from "@/pages/farmer/DashboardOverview";
import MerchantAccountPage from "@/pages/farmer/MerchantAccountPage";
import OnboardingPage from "@/pages/OnboardingPage";
import { OnboardingGuard } from "@/components/OnboardingGuard";
// import { PushNotificationDebug } from "./components/PushNotificationDebug"; // Currently unused
import { useLocation } from "wouter";

// Role-based layout components
function FarmerRouter({ userId }: { userId: string }) {
  return (
    <OnboardingGuard>
      <Switch>
        <ProtectedRoute
          path={`/farmer/${userId}`}
          component={DashboardOverview}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/dashboard`}
          component={DashboardOverview}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/fields/:fieldId/plans/:planId/sims`}
          component={CropPlanSimsPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/fields`}
          component={FieldsPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/crops`}
          component={CropsPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/tasks`}
          component={TasksPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/weather`}
          component={WeatherPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/alerts`}
          component={AlertsPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/diagnose`}
          component={PlantDiagnosisPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/verification`}
          component={ProductVerificationPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/predictions`}
          component={PredictionsPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/marketplace`}
          component={MarketplacePage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/marketplace/new`}
          component={CreateListingPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/marketplace/cart`}
          component={CartPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/marketplace/checkout`}
          component={CheckoutPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/marketplace/payment/confirmation`}
          component={CheckoutPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/marketplace/list-crop`}
          component={ListCropOnMarketplace}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/marketplace/:id`}
          component={MarketplaceDetailPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/orders`}
          component={OrdersPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/inventory`}
          component={InventoryPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/experts`}
          component={ExpertDirectoryPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/dealers`}
          component={DealerDirectoryPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/crops/:cropId/trace`}
          component={CropTraceabilityPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/notifications`}
          component={NotificationsPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/notification-settings`}
          component={NotificationSettingsPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/social`}
          component={GreenSocialsPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/chat`}
          component={StreamChatPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/assistant`}
          component={FarmingAssistantPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/profile`}
          component={ProfilePage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/merchant-account`}
          component={MerchantAccountPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/settings`}
          component={SettingsPage}
        />
        <ProtectedRoute
          path={`/farmer/${userId}/security`}
          component={SecuritySettings}
        />
        <Route component={NotFound} />
      </Switch>
    </OnboardingGuard>
  );
}

function BuyerRouter({ userId }: { userId: string }) {
  return (
    <OnboardingGuard>
      <Switch>
        <ProtectedRoute path={`/buyer/${userId}`} component={DashboardPage} />
        <ProtectedRoute
          path={`/buyer/${userId}/dashboard`}
          component={DashboardPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/marketplace`}
          component={MarketplacePage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/marketplace/cart`}
          component={CartPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/marketplace/checkout`}
          component={CheckoutPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/marketplace/payment/confirmation`}
          component={CheckoutPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/marketplace/:id`}
          component={MarketplaceDetailPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/orders`}
          component={OrdersPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/verification`}
          component={ProductVerificationPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/crops/:cropId/trace`}
          component={CropTraceabilityPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/notifications`}
          component={NotificationsPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/notification-settings`}
          component={NotificationSettingsPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/social`}
          component={GreenSocialsPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/chat`}
          component={StreamChatPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/assistant`}
          component={FarmingAssistantPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/profile`}
          component={ProfilePage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/settings`}
          component={SettingsPage}
        />
        <ProtectedRoute
          path={`/buyer/${userId}/security`}
          component={SecuritySettings}
        />
      </Switch>
    </OnboardingGuard>
  );
}

function SellerRouter({ userId }: { userId: string }) {
  return (
    <OnboardingGuard>
      <Switch>
        <ProtectedRoute path={`/seller/${userId}`} component={DashboardPage} />
        <ProtectedRoute
          path={`/seller/${userId}/dashboard`}
          component={DashboardPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/products`}
          component={MarketplacePage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/products/cart`}
          component={CartPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/products/checkout`}
          component={CheckoutPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/products/new`}
          component={CreateListingPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/products/:id`}
          component={MarketplaceDetailPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/marketplace`}
          component={MarketplacePage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/marketplace/cart`}
          component={CartPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/marketplace/checkout`}
          component={CheckoutPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/marketplace/new`}
          component={CreateListingPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/marketplace/:id`}
          component={MarketplaceDetailPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/orders`}
          component={OrdersPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/inventory`}
          component={InventoryPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/verification`}
          component={ProductVerificationPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/crops/:cropId/trace`}
          component={CropTraceabilityPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/notifications`}
          component={NotificationsPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/notification-settings`}
          component={NotificationSettingsPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/social`}
          component={GreenSocialsPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/chat`}
          component={StreamChatPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/assistant`}
          component={FarmingAssistantPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/merchant-account`}
          component={MerchantAccountPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/profile`}
          component={ProfilePage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/settings`}
          component={SettingsPage}
        />
        <ProtectedRoute
          path={`/seller/${userId}/security`}
          component={SecuritySettings}
        />
        <Route component={NotFound} />
      </Switch>
    </OnboardingGuard>
  );
}

function Router({ isAppSubdomain = false }: { isAppSubdomain?: boolean }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // If we're on app.domain.com, we should display app-specific routes without /dashboard prefix
  if (isAppSubdomain) {
    // For app subdomain, if not authenticated, redirect to auth
    if (!isLoading && !user) {
      return (
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="*">
            <Redirect to="/auth" />
          </Route>
        </Switch>
      );
    }

    // Role-based routing for app subdomain
    if (user) {
      const userId = user.id.toString();

      return (
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />
          <Route path="/verify-email" component={EmailVerificationPage} />

          {/* Role-based routes */}
          {user.role === "farmer" && (
            <Route path="/farmer/:userId/*">
              {(params) => <FarmerRouter userId={params.userId} />}
            </Route>
          )}

          {user.role === "buyer" && (
            <Route path="/buyer/:userId/*">
              {(params) => <BuyerRouter userId={params.userId} />}
            </Route>
          )}

          {(user.role === "supplier" || user.role === "seller") && (
            <Route path="/seller/:userId/*">
              {(params) => <SellerRouter userId={params.userId} />}
            </Route>
          )}

          {/* Admin routes */}
          {user.role === "admin" && (
            <>
              <ProtectedRoute path="/admin" component={AdminDashboard} />
              <ProtectedRoute
                path="/system-health"
                component={SystemHealthPage}
              />
            </>
          )}

          {/* Default redirects based on role */}
          <Route path="/">
            {user.role === "farmer" && (
              <Redirect to={`/farmer/${userId}/dashboard`} />
            )}
            {user.role === "buyer" && (
              <Redirect to={`/buyer/${userId}/dashboard`} />
            )}
            {(user.role === "supplier" || user.role === "seller") && (
              <Redirect to={`/seller/${userId}/dashboard`} />
            )}
            {user.role === "admin" && <Redirect to="/admin" />}
          </Route>

          {/* <Route component={NotFound} /> */}
        </Switch>
      );
    }

    return null; // Loading state
  }

  // Otherwise, we're on the main domain - show the public site with role-based dashboard routes
  return (
    <Switch>
      {/* Public/landing pages on main domain */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/verify-email" component={EmailVerificationPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/rnd" component={RnDPage} />
      <Route path="/marketplace" component={PublicMarketplacePage} />
      <Route path="/marketplace/sellers" component={PublicSellersPage} />
      <Route
        path="/marketplace/sellers/:id"
        component={PublicSellerProfilePage}
      />
      <Route path="/marketplace/:id" component={PublicListingDetailPage} />
      <Route path="/trace" component={PublicTraceVerificationPage} />
      <Route path="/ai-knowledge-base" component={AiKnowledgeBasePage} />
      <Route path="/upload-test" component={UploadTestPage} />
      <Route path="/public-email-test" component={PublicEmailTestPage} />
      <ProtectedRoute
        path="/test-email-notifications"
        component={EmailNotificationTestPage}
      />
      <Route path="/testing-waitlist" component={TestingWaitlistPage} />

      {/* Admin login route - public access */}
      <Route path="/admin/login" component={AdminLoginPage} />

      {/* Role-based dashboard routes on main domain */}
      {user && (
        <>
          {user.role === "farmer" && (
            <Route path="/farmer/:userId/*">
              {(params) => <FarmerRouter userId={params.userId} />}
            </Route>
          )}

          {user.role === "buyer" && (
            <Route path="/buyer/:userId/*">
              {(params) => <BuyerRouter userId={params.userId} />}
            </Route>
          )}

          {(user.role === "supplier" || user.role === "seller") && (
            <Route path="/seller/:userId/*">
              {(params) => <SellerRouter userId={params.userId} />}
            </Route>
          )}
        </>
      )}

      {/* Legacy dashboard routes - redirect to new role-based routes */}
      <ProtectedRoute
        path="/dashboard"
        component={() => {
          if (!user) return <Redirect to="/auth" />;
          if (user.role === "farmer")
            return <Redirect to={`/farmer/${user.id}/dashboard`} />;
          if (user.role === "buyer")
            return <Redirect to={`/buyer/${user.id}/dashboard`} />;
          if (user.role === "supplier" || user.role === "seller")
            return <Redirect to={`/seller/${user.id}/dashboard`} />;
          return <Redirect to="/auth" />;
        }}
      />

      <Route path="/dashboard/*">
        {() => {
          if (!user) return <Redirect to="/auth" />;
          const newPath = location.replace("/dashboard", "");
          if (user.role === "farmer")
            return <Redirect to={`/farmer/${user.id}${newPath}`} />;
          if (user.role === "buyer")
            return <Redirect to={`/buyer/${user.id}${newPath}`} />;
          if (user.role === "supplier" || user.role === "seller")
            return <Redirect to={`/seller/${user.id}${newPath}`} />;
          return <Redirect to="/auth" />;
        }}
      </Route>

      {/* Admin routes on main domain */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute
        path="/admin/system-health"
        component={SystemHealthPage}
      />
      <ProtectedRoute
        path="/admin/waitlist-management"
        component={WaitlistManagementPage}
      />
      <ProtectedRoute
        path="/admin/alerts"
        component={AdminAlertsPage}
      />

      {/* Profile creation - role-agnostic */}
      <ProtectedRoute
        path="/profile-creation"
        component={ProfileCreationPage}
      />

      <>
        {() => {
          // show a loader here if user profile is loading else show the 404 page
          if (isLoading) {
            return (
              <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto">
                  loading
                </div>
              </div>
            );
          }
          return <Route component={NotFound} />;
        }}
      </>
    </Switch>
  );
}

import { NetworkStatus } from "./components/mobile/NetworkStatus";
import { InstallPrompt } from "./components/mobile/InstallPrompt";

function App() {
  // Check if we're on the app subdomain
  const isAppSubdomain =
    typeof window !== "undefined" &&
    window.location.hostname.startsWith("app.");
  console.log("Test");

  return (
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* Keep legacy WebSocket provider for backward compatibility */}
          <WebSocketProvider>
            <NotificationProvider>
              {/* Use legacy ChatProvider for now, but start integrating SocketIO */}
              <SocketIOProvider>
                <CartProvider>
                  <HelmetProvider>
                    <Router isAppSubdomain={isAppSubdomain} />
                    <Toaster />
                    {/* Mobile PWA Components */}
                    <NetworkStatus />
                    <InstallPrompt />
                    {/* Legacy offline indicator - can be removed */}
                    {/* <OfflineIndicator /> */}
                    {/* Push Notifications Debug*/}
                    {/* <PushNotificationDebug /> */}
                  </HelmetProvider>
                </CartProvider>
              </SocketIOProvider>
            </NotificationProvider>
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
