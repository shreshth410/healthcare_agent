
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-bg-base overflow-hidden font-sans text-text-default">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-[1300px] w-full mx-auto pb-20">
          {children}
        </div>
      </div>
    </div>
  );
}
