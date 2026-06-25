import { AppShell } from "../components/AppShell";
import { PhotosProvider } from "../components/PhotosProvider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhotosProvider>
      <AppShell>{children}</AppShell>
    </PhotosProvider>
  );
}
