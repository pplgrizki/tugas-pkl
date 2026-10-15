import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/", (req, res) => {
  res.json({
    pesan: "API penulis berhasil dijalankan"
  });
});

app.get("/authors", async (req, res) => {
  try {
    const { data: authors, error: authorError } = await supabase
      .from("authors")
      .select("id, name");

    if (authorError) {
      return res.status(500).json({
        pesan: "Gagal mengambil data penulis",
        error: authorError.message
      });
    }

    const { data: books, error: bookError } = await supabase
  .from("books")
  .select("*");
  
    console.log("Data buku:", books);
    console.log("ID penulis:", authors.map((author) => author.id));

    if (bookError) {
      return res.status(500).json({
        pesan: "Gagal mengambil data buku",
        error: bookError.message
      });
    }

    const hasil = authors.map((author) => {
      const totalBuku = books.filter(
        (book) => Number(book.authors_id) === Number(author.id)
      ).length;

      return {
        id: author.id,
        nama: author.name,
        total_buku: totalBuku
      };
    });

    res.status(200).json({
      pesan: "Data penulis berhasil ditampilkan",
      jumlah: hasil.length,
      data: hasil
    });
  } catch (error) {
    console.error("Error:", error.message);

    res.status(500).json({
      pesan: "Terjadi kesalahan pada server",
      error: error.message
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});