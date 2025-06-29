import PluginInit from "@/helper/PluginInit";
import "./font.css";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { registerLicense } from "@syncfusion/ej2-base";
registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY);
export const metadata = {
  title: "WowDash NEXT JS - Admin Dashboard Multipurpose Bootstrap 5 Template",
  description:
    "Wowdash NEXT JS is a developer-friendly, ready-to-use admin template designed for building attractive, scalable, and high-performing web applications.",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <PluginInit />
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
