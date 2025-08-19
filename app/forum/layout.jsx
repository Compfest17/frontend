import Navbar from '../../components/Navbar';

export default function ForumLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        {children}
      </div>
    </div>
  );
}