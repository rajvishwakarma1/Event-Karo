
export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-6 text-sm text-gray-600">
        <nav className="mb-2 flex justify-center gap-4">
          <a className="nav-link" href="#">About</a>
          <a className="nav-link" href="#">Contact</a>
          <a className="nav-link" href="#">Privacy</a>
          <a className="nav-link" href="#">Terms</a>
        </nav>
        <p className="text-center">© {new Date().getFullYear()} Event Karo. All rights reserved.</p>
      </div>
    </footer>
  );
}
