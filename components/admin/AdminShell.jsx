import Header from './Header';
import Sidebar from './Sidebar';

export default function AdminShell({ title, children }) {
  return (
    <div className="flex min-h-screen bg-mist">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Header title={title} />
        <div className="w-full px-4 py-6 md:px-6">{children}</div>
      </main>
    </div>
  );
}
