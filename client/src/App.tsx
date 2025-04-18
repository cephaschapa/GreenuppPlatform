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
import AiKnowledgeBasePage from "@/pages/AiKnowledgeBasePage";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "@/components/ThemeProvider";
import InstallPWA from "@/components/ui/InstallPWA";
import OfflineIndicator from "@/components/ui/OfflineIndicator";
import { CartProvider } from "@/hooks/use-cart";
import { HelmetProvider } from 'react-helmet-async';

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/marketplace" component={PublicMarketplacePage} />
      <Route path="/marketplace/sellers" component={PublicSellersPage} />
      <Route path="/marketplace/sellers/:id" component={PublicSellerProfilePage} />
      <Route path="/marketplace/:id" component={PublicListingDetailPage} />
      <Route path="/trace" component={PublicTraceVerificationPage} />
      <Route path="/ai-knowledge-base" component={AiKnowledgeBasePage} />
      
      {/* Dashboard routes */}
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/dashboard/fields" component={FieldsPage} />
      <ProtectedRoute path="/dashboard/tasks" component={TasksPage} />
      <ProtectedRoute path="/dashboard/weather" component={WeatherPage} />
      <ProtectedRoute path="/dashboard/predictions" component={PredictionsPage} />
      <ProtectedRoute path="/dashboard/plant-diagnosis" component={PlantDiagnosisPage} />
      <ProtectedRoute path="/dashboard/profile" component={ProfilePage} />
      <ProtectedRoute path="/dashboard/settings" component={SettingsPage} />
      <ProtectedRoute path="/profile-creation" component={ProfileCreationPage} />
      
      {/* Marketplace routes */}
      <ProtectedRoute path="/dashboard/marketplace" component={MarketplacePage} />
      <ProtectedRoute path="/dashboard/marketplace/new" component={CreateListingPage} />
      <ProtectedRoute path="/dashboard/marketplace/cart" component={CartPage} />
      <ProtectedRoute path="/dashboard/marketplace/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/dashboard/marketplace/payment/confirmation" component={CheckoutPage} />
      <ProtectedRoute path="/dashboard/marketplace/:id" component={MarketplaceDetailPage} />
      
      {/* CropTrace routes */}
      <ProtectedRoute path="/dashboard/crops/:cropId/trace" component={CropTraceabilityPage} />
      <ProtectedRoute path="/dashboard/marketplace/list-crop" component={ListCropOnMarketplace} />
      
      {/* Role-specific dashboard redirects */}
      <ProtectedRoute path="/buyer" component={() => <Redirect to="/dashboard/marketplace" />} />
      <ProtectedRoute path="/supplier" component={() => <Redirect to="/dashboard/marketplace" />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <HelmetProvider>
              <Router />
              <Toaster />
              {/* PWA Components */}
              <InstallPWA />
              <OfflineIndicator />
            </HelmetProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
