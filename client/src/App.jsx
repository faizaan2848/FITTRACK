import AppRouter from "./routers/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { MembershipProvider } from "./context/MembershipContext";
import { ToastProvider } from "./context/ToastContext";
import "./styles/variables.css";
import "./styles/base.css";
import "./styles/app.css";

function App() {
  return (
    <AuthProvider>
      <MembershipProvider>
        <CartProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </CartProvider>
      </MembershipProvider>
    </AuthProvider>
  );
}

export default App;
