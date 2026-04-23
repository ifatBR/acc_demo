import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { AppLayout } from "../components/AppLayout";
import { LandingPage } from "@/pages/landing/LandingPage";
import { BrowserPage } from "@/pages/browser/BrowserPage";
import { LayoutProvider } from "@/context/LayoutContext";
import { RouteErrorPage } from "@/components/RouteErrorPage";

const routerConfig = [
  { path: ROUTES.LANDING, element: <LandingPage /> },
  {
    path: "/",
    element: (
      <LayoutProvider>
        <AppLayout />
      </LayoutProvider>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to={ROUTES.LANDING} replace /> },
      { path: ROUTES.BROWSER, element: <BrowserPage /> },
    ],
  },
];

export const router = createBrowserRouter(routerConfig);
