"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ForumCard from "../../components/formulir/ForumCard";
import ForumAPI from "@/services/forumAPI";
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function KomunitasSection() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    AOS.init();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ForumAPI.getForums({ page: 1, limit: 9 });
        if (res.success && Array.isArray(res.data)) {
          setPosts(res.data);
          setFilteredPosts(res.data);
        } else if (res.success && res.data?.data) {
          setPosts(res.data.data);
          setFilteredPosts(res.data.data);
        }
      } catch (_) {
        setPosts([]);
        setFilteredPosts([]);
      }
    };
    load();
  }, []);

  const postsPerPage = 3;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <section className="pt-12 pb-20 md:pt-16 md:pb-16 bg-white text-center">
      <div className="container mx-auto px-4 md:px-8" data-aos="fade-up" data-aos-duration="1000">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentPosts.map((post) => (
            <ForumCard key={post.id} post={post}  />
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
      </div>
    </section>
  );
}
