import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/context/ToastContext';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}