"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import DisplayForumCard from "../../components/DisplayForumCard";
import ForumAPI from "../../services/forumAPI";
import { motion, useInView } from "framer-motion";

export default function KomunitasSection() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForums = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ForumAPI.getForums({
          page: 1,
          limit: 9,
        });
        if (response.success) {
          setPosts(response.data);
          setFilteredPosts(response.data);
        } else {
          setError("Gagal memuat data komunitas.");
        }
      } catch (err) {
        setError("Gagal memuat data komunitas.");
      } finally {
        setLoading(false);
      }
    };
    fetchForums();
  }, []);

  const postsPerPage = 3;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.3 + i * 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
    })
  };

  // Ref and inView for scroll-triggered animation
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px 0px" });

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={sectionVariants}
      className="pt-6 pb-10 md:pt-8 md:pb-8 bg-white text-center"
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-5xl mx-auto mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl font-semibold leading-tight font-montserrat mb-6"
            style={{ color: "#DD761C" }}
          >
            Komunitas
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Bergabung dengan komunitas kami, jadilah salah satu Kesatria demi memajukan Negara Kita!!
          </p>
        </div>
        {/* Loading/Error State */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat data komunitas...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  custom={i}
                >
                  <DisplayForumCard post={post} />
                </motion.div>
              ))}
            </div>
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Tidak ada diskusi yang ditemukan.</p>
              </div>
            )}
            <Link
              href="/forum"
              className="border border-zinc-300 px-5 py-3 mt-10 flex items-center mx-auto w-fit rounded-xl justify-center text-white font-semibold shadow-lg hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: "#DD761C" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#C5661A")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#DD761C")}
            >
              Lihat Lebih Banyak
            </Link>
          </>
        )}
      </div>
    </motion.section>
  );
}
