import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
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
import GreenSocialsPage from "@/pages/GreenSocialsPage";
import StreamChatPage from "@/pages/StreamChatPage";
import FarmingAssistantPage from "@/pages/FarmingAssistantPage";
import UploadTestPage from "@/pages/UploadTestPage";
import EmailNotificationTestPage from "@/pages/EmailNotificationTestPage";
import PublicEmailTestPage from "@/pages/PublicEmailTestPage";
import SystemHealthPage from "@/pages/admin/SystemHealthPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import SecuritySettings from "@/pages/auth/SecuritySettings";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { SocketIOProvider } from "@/hooks/use-socketio";
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "@/components/ThemeProvider";
import InstallPWA from "@/components/ui/InstallPWA";
import OfflineIndicator from "@/components/ui/OfflineIndicator";
import { CartProvider } from "@/hooks/use-cart";
import { HelmetProvider } from "react-helmet-async";
import { NotificationProvider } from "@/hooks/use-notifications";
import { WebSocketProvider } from "@/hooks/use-websocket";

// Import farmer-specific pages
import FieldsPage from "@/pages/farmer/FieldsPage";
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
import ListCropOnMarketplace from "@/pages/farmer/ListCropOnMarketplace";
import NotificationsPage from "@/pages/farmer/NotificationsPage";
import NotificationSettingsPage from "@/pages/farmer/NotificationSettingsPage";
import ExpertDirectoryPage from "@/pages/farmer/ExpertDirectoryPage";
import DealerDirectoryPage from "@/pages/farmer/DealerDirectoryPage";
import OrdersPage from "./pages/farmer/OrdersPage";
import InventoryPage from "./pages/farmer/InventoryPage";
import ProductVerificationPage from "./pages/farmer/ProductVerificationPage";
import { PushNotificationDebug } from "./components/PushNotificationDebug";

function Router({ isAppSubdomain = false }: { isAppSubdomain?: boolean }) {
  const { user, isLoading } = useAuth();

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

    return (
      <Switch>
        {/* In app subdomain, the root shows the dashboard */}
        <ProtectedRoute path="/" component={DashboardPage} />
        <Route path="/auth" component={AuthPage} />

        {/* Dashboard main pages - without /dashboard prefix on app subdomain */}
        <ProtectedRoute path="/fields" component={FieldsPage} />
        <ProtectedRoute path="/tasks" component={TasksPage} />
        <ProtectedRoute path="/weather" component={WeatherPage} />
        <ProtectedRoute path="/predictions" component={PredictionsPage} />
        <ProtectedRoute
          path="/plant-diagnosis"
          component={PlantDiagnosisPage}
        />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <ProtectedRoute path="/security" component={SecuritySettings} />
        <ProtectedRoute
          path="/profile-creation"
          component={ProfileCreationPage}
        />

        {/* Marketplace routes - without /dashboard prefix on app subdomain */}
        <ProtectedRoute path="/marketplace" component={MarketplacePage} />
        <ProtectedRoute path="/marketplace/new" component={CreateListingPage} />
        <ProtectedRoute path="/marketplace/cart" component={CartPage} />
        <ProtectedRoute path="/marketplace/checkout" component={CheckoutPage} />
        <ProtectedRoute
          path="/marketplace/payment/confirmation"
          component={CheckoutPage}
        />
        <ProtectedRoute
          path="/marketplace/:id"
          component={MarketplaceDetailPage}
        />
        <ProtectedRoute path="/orders" component={OrdersPage} />
        <ProtectedRoute path="/inventory" component={InventoryPage} />
        <ProtectedRoute path="/experts" component={ExpertDirectoryPage} />
        <ProtectedRoute path="/dealers" component={DealerDirectoryPage} />

        {/* CropTrace routes - without /dashboard prefix on app subdomain */}
        <ProtectedRoute
          path="/crops/:cropId/trace"
          component={CropTraceabilityPage}
        />
        <ProtectedRoute
          path="/marketplace/list-crop"
          component={ListCropOnMarketplace}
        />
        <ProtectedRoute
          path="/verification"
          component={ProductVerificationPage}
        />

        {/* Notification routes - without /dashboard prefix on app subdomain */}
        <ProtectedRoute path="/notifications" component={NotificationsPage} />
        <ProtectedRoute
          path="/notification-settings"
          component={NotificationSettingsPage}
        />

        {/* Green Socials routes - without /dashboard prefix on app subdomain */}
        <ProtectedRoute path="/social" component={GreenSocialsPage} />

        {/* Chat routes - without /dashboard prefix on app subdomain */}
        <ProtectedRoute path="/stream-chat" component={StreamChatPage} />
        <ProtectedRoute
          path="/farming-assistant"
          component={FarmingAssistantPage}
        />

        {/* Admin routes - without /dashboard prefix on app subdomain */}
        <ProtectedRoute path="/admin" component={AdminDashboard} />
        <ProtectedRoute path="/system-health" component={SystemHealthPage} />

        <Route component={NotFound} />
      </Switch>
    );
  }

  // Otherwise, we're on the main domain - show the public site with dashboard routes
  return (
    <Switch>
      {/* Public/landing pages on main domain */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/about" component={AboutPage} />
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

      {/* Dashboard routes on main domain - with /dashboard prefix */}
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/dashboard/fields" component={FieldsPage} />
      <ProtectedRoute path="/dashboard/tasks" component={TasksPage} />
      <ProtectedRoute path="/dashboard/weather" component={WeatherPage} />
      <ProtectedRoute
        path="/dashboard/predictions"
        component={PredictionsPage}
      />
      <ProtectedRoute
        path="/dashboard/plant-diagnosis"
        component={PlantDiagnosisPage}
      />
      <ProtectedRoute path="/dashboard/profile" component={ProfilePage} />
      <ProtectedRoute path="/dashboard/settings" component={SettingsPage} />
      <ProtectedRoute path="/dashboard/security" component={SecuritySettings} />
      <ProtectedRoute
        path="/profile-creation"
        component={ProfileCreationPage}
      />

      {/* Marketplace routes on main domain - with /dashboard prefix */}
      <ProtectedRoute
        path="/dashboard/marketplace"
        component={MarketplacePage}
      />
      <ProtectedRoute
        path="/dashboard/marketplace/new"
        component={CreateListingPage}
      />
      <ProtectedRoute path="/dashboard/marketplace/cart" component={CartPage} />
      <ProtectedRoute
        path="/dashboard/marketplace/checkout"
        component={CheckoutPage}
      />
      <ProtectedRoute
        path="/dashboard/marketplace/payment/confirmation"
        component={CheckoutPage}
      />
      <ProtectedRoute
        path="/dashboard/marketplace/:id"
        component={MarketplaceDetailPage}
      />
      <ProtectedRoute path="/dashboard/orders" component={OrdersPage} />
      <ProtectedRoute path="/dashboard/inventory" component={InventoryPage} />
      <ProtectedRoute
        path="/dashboard/experts"
        component={ExpertDirectoryPage}
      />
      <ProtectedRoute
        path="/dashboard/dealers"
        component={DealerDirectoryPage}
      />

      {/* CropTrace routes on main domain - with /dashboard prefix */}
      <ProtectedRoute
        path="/dashboard/crops/:cropId/trace"
        component={CropTraceabilityPage}
      />
      <ProtectedRoute
        path="/dashboard/marketplace/list-crop"
        component={ListCropOnMarketplace}
      />
      <ProtectedRoute
        path="/dashboard/verification"
        component={ProductVerificationPage}
      />

      {/* Notification routes on main domain - with /dashboard prefix */}
      <ProtectedRoute
        path="/dashboard/notifications"
        component={NotificationsPage}
      />
      <ProtectedRoute
        path="/dashboard/notification-settings"
        component={NotificationSettingsPage}
      />

      {/* Green Socials routes on main domain - with /dashboard prefix */}
      <ProtectedRoute path="/dashboard/social" component={GreenSocialsPage} />

      {/* Chat routes on main domain - with /dashboard prefix */}
      <ProtectedRoute
        path="/dashboard/stream-chat"
        component={StreamChatPage}
      />
      <ProtectedRoute
        path="/dashboard/farming-assistant"
        component={FarmingAssistantPage}
      />

      {/* Admin routes on main domain - with /dashboard prefix */}
      <ProtectedRoute path="/dashboard/admin" component={AdminDashboard} />
      <ProtectedRoute
        path="/dashboard/system-health"
        component={SystemHealthPage}
      />

      {/* Role-specific dashboard redirects */}
      <ProtectedRoute
        path="/buyer"
        component={() => <Redirect to="/dashboard/marketplace" />}
      />
      <ProtectedRoute
        path="/supplier"
        component={() => <Redirect to="/dashboard/marketplace" />}
      />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Check if we're on the app subdomain
  const isAppSubdomain = window.location.hostname.startsWith("app.");

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
                    {/* PWA Components */}
                    {/* <InstallPWA /> */}
                    <OfflineIndicator />
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
