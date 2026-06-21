export default function AdminLayout({ children }) {
  return (
    <html lang="bg">
      <body>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto p-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
