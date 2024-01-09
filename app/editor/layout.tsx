import "@/global.css";
import { AuthProvider } from "./_components/AuthContainer";

export default function RootLayout({ children }) {
  return <AuthProvider type='secure'>{children}</AuthProvider>;
}
