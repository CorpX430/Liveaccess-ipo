import { Switch, Route, Router } from "wouter";
import { Toaster } from "sonner";
import { useTheme } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AccessPending from "./pages/AccessPending";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Management from "./pages/Management";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import News from "./pages/News";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function App() {
  const { theme } = useTheme();
  return (
    <Router base={base}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/access-pending" component={AccessPending} />
        <Route path="/signin" component={SignIn} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/orders" component={Orders} />
        <Route path="/management" component={Management} />
        <Route path="/settings" component={Settings} />
        <Route path="/support" component={Support} />
        <Route path="/news" component={News} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
      <Toaster theme={theme} position="bottom-center" />
    </Router>
  );
}

export default App;
