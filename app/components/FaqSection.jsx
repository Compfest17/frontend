"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";

const faqData = [
  {
    question: "Bagaimana cara melaporkan infrastruktur rusak di GatotKota?",
    answer:
      "Anda dapat melaporkan langsung melalui website kami dengan mengisi formulir laporan, melampirkan foto, dan menentukan lokasi infrastruktur yang rusak. Laporan Anda akan segera ditindaklanjuti oleh tim terkait.",
  },
  {
    question: "Apakah saya bisa melacak status laporan yang sudah saya buat?",
    answer:
      "Ya, setiap laporan memiliki ID unik yang dapat Anda gunakan untuk melacak status penanganan. Kami juga akan mengirimkan notifikasi update melalui website ini.",
  },
  {
    question: "Jenis infrastruktur apa saja yang bisa dilaporkan?",
    answer:
      "Anda dapat melaporkan berbagai jenis infrastruktur seperti jalan berlubang, lampu jalan mati, drainase tersumbat, jembatan rusak, trotoar rusak, dan fasilitas umum lainnya.",
  },
  {
    question:
      "Berapa lama waktu yang dibutuhkan untuk menindaklanjuti laporan?",
    answer:
      "Waktu penanganan bervariasi tergantung tingkat kerusakan dan jenis infrastruktur. Laporan darurat biasanya ditangani dalam 24 jam, sedangkan perbaikan rutin dapat memakan waktu 3-14 hari kerja.",
  },
  {
    question: "Apakah ada reward untuk pelapor yang aktif?",
    answer:
      "Ya, kami memiliki program apresiasi untuk masyarakat yang aktif melaporkan. Pelapor terbaik akan mendapat penghargaan dan kesempatan terlibat dalam program pembangunan kota.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleIndex = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px 0px" });

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.12,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={sectionVariants}
      className="pt-12 pb-20 md:pt-16 md:pb-24 bg-white text-center"
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-5xl mx-auto mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl font-semibold leading-tight font-montserrat mb-6"
            style={{ color: "#DD761C" }}
          >
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Temukan jawaban untuk pertanyaan umum tentang platform pelaporan
            infrastruktur GatotKota
          </p>
        </div>

        <div className="mt-10 space-y-4 max-w-4xl mx-auto">
          {faqData.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={index}
              className={`border rounded-xl transition shadow-sm ${
                openIndex === index ? "bg-gray-50" : "bg-white"
              }`}
              style={{
                borderColor: openIndex === index ? "#DD761C" : "#e5e7eb",
              }}
            >
              <button
                onClick={() => toggleIndex(index)}
                className="w-full flex items-center justify-between px-6 md:px-8 py-6 text-left"
              >
                <span
                  className={`font-semibold text-base md:text-lg font-montserrat ${
                    openIndex === index ? "" : "text-gray-800"
                  }`}
                  style={{ color: openIndex === index ? "#DD761C" : undefined }}
                >
                  {item.question}
                </span>
                {openIndex === index ? (
                  <ChevronDown
                    className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 ml-4"
                    style={{ color: "#DD761C" }}
                  />
                ) : (
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-500 flex-shrink-0 ml-4" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 md:px-8 pb-6 text-base md:text-lg text-gray-600 font-sans leading-relaxed text-start">
                  {item.answer}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
