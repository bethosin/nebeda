import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import FloatingScrollButton from './components/ui/FloatingScrollButton'
import { ToastProvider } from './components/ui/Toast'
import { CartProvider } from './context/CartContext'
import About from './pages/About'
import AddProduct from './pages/admin/AddProduct'
import AdminCustomOrders from './pages/admin/AdminCustomOrders'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEnquiries from './pages/admin/AdminEnquiries'
import EditProduct from './pages/admin/EditProduct'
import AdminLogin from './pages/admin/AdminLogin'
import AdminNewsletter from './pages/admin/AdminNewsletter'
import AdminOrders from './pages/admin/AdminOrders'
import AdminPayments from './pages/admin/AdminPayments'
import AdminProducts from './pages/admin/AdminProducts'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUsers from './pages/admin/AdminUsers'
import AccountDashboard from './pages/account/AccountDashboard'
import CustomOrderDetails from './pages/account/CustomOrderDetails'
import MyCustomOrders from './pages/account/MyCustomOrders'
import MyOrders from './pages/account/MyOrders'
import OrderDetails from './pages/account/OrderDetails'
import Profile from './pages/account/Profile'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CustomOrder from './pages/CustomOrder'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Shop from './pages/Shop'
import NotFound from './pages/NotFound'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import ShippingReturns from './pages/legal/ShippingReturns'
import Terms from './pages/legal/Terms'
import { isAdminAuthenticated } from './services/authService'

function ProtectedAdminRoute({ children }) {
  return isAdminAuthenticated() ? children : <Navigate replace to="/admin/login" />
}

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <ToastProvider>
      <CartProvider>
        <div className="min-h-screen bg-black">
          {isAdminRoute ? null : <Navbar />}
          {isAdminRoute ? null : <FloatingScrollButton />}
          <main>
            <Routes>
              <Route element={<Home />} path="/" />
              <Route element={<Shop />} path="/shop" />
              <Route element={<Cart />} path="/cart" />
              <Route element={<Checkout />} path="/checkout" />
              <Route element={<Login />} path="/login" />
              <Route element={<Signup />} path="/signup" />
              <Route element={<AccountDashboard />} path="/account" />
              <Route element={<MyOrders />} path="/account/orders" />
              <Route element={<OrderDetails />} path="/account/orders/:id" />
              <Route element={<MyCustomOrders />} path="/account/custom-orders" />
              <Route element={<CustomOrderDetails />} path="/account/custom-orders/:id" />
              <Route element={<Profile />} path="/account/profile" />
              <Route element={<CustomOrder />} path="/custom-order" />
              <Route element={<About />} path="/about" />
              <Route element={<Contact />} path="/contact" />
              <Route element={<PrivacyPolicy />} path="/privacy-policy" />
              <Route element={<Terms />} path="/terms" />
              <Route element={<ShippingReturns />} path="/shipping-returns" />
              <Route element={<AdminLogin />} path="/admin/login" />
              <Route
                element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>}
                path="/admin/dashboard"
              />
              <Route
                element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>}
                path="/admin/products"
              />
              <Route
                element={<ProtectedAdminRoute><AddProduct /></ProtectedAdminRoute>}
                path="/admin/products/add"
              />
              <Route
                element={<ProtectedAdminRoute><EditProduct /></ProtectedAdminRoute>}
                path="/admin/products/edit/:id"
              />
              <Route
                element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>}
                path="/admin/orders"
              />
              <Route
                element={<ProtectedAdminRoute><AdminCustomOrders /></ProtectedAdminRoute>}
                path="/admin/custom-orders"
              />
              <Route
                element={<ProtectedAdminRoute><AdminEnquiries /></ProtectedAdminRoute>}
                path="/admin/enquiries"
              />
              <Route
                element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>}
                path="/admin/users"
              />
              <Route
                element={<ProtectedAdminRoute><AdminNewsletter /></ProtectedAdminRoute>}
                path="/admin/newsletter"
              />
              <Route
                element={<ProtectedAdminRoute><AdminPayments /></ProtectedAdminRoute>}
                path="/admin/payments"
              />
              <Route
                element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>}
                path="/admin/settings"
              />
              <Route element={<Navigate replace to="/admin/dashboard" />} path="/admin" />
              <Route element={<NotFound />} path="*" />
            </Routes>
          </main>
          {isAdminRoute ? null : <Footer />}
        </div>
      </CartProvider>
    </ToastProvider>
  )
}

export default App
