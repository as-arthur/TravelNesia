import React from 'react'
import { Star, MapPin, Search } from 'lucide-react'

const AboutPage = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-96 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')"
          }}
        ></div>
        
        <div className="relative z-10 container mx-auto px-6 py-20 text-center text-white">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Why us ?
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Kami adalah platform terpercaya yang menghubungkan Anda dengan keindahan tersembunyi Nusantara. Dengan 
              kombinasi teknologi cerdas dan pemahaman mendalam tentang budaya Indonesia, kami membantu Anda 
              menemukan destinasi wisata yang sesuai dengan preferensi perjalanan Anda.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Rekomendasi Wisata Pintar */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Star className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Rekomendasi Wisata Pintar
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Sistem rekomendasi kami menganalisis preferensi Anda berdasarkan tempat-tempat yang 
                Anda simpan. Hasilnya adalah saran destinasi yang benar-benar sesuai dengan gaya perjalanan Anda, baik 
                Anda pencinta pantai, pengagum budaya, atau petualang alam.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors inline-flex items-center">
                Learn More →
              </button>
            </div>

            {/* Temukan Budaya Autentik */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-200 transition-colors">
                <Search className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Temukan Budaya Autentik
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Kami menampilkan informasi mendalam tentang kekayaan 
                budaya di setiap destinasi. Mulai dari upacara adat, kuliner khas, 
                hingga kerajinan tradisional yang dapat Anda eksplorasi.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors inline-flex items-center">
                Learn More →
              </button>
            </div>

            {/* Wisata Sekitar Dalam Genggaman */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <MapPin className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Wisata Sekitar Dalam Genggaman
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Dengan fitur lokasi pintar, aplikasi kami otomatis mendeteksi posisi 
                Anda dan merekomendasikan destinasi wisata menarik di sekitar 
                Anda. Temukan tempat-tempat tersembunyi yang jarang dikunjungi 
                wisatawan, lengkap dengan informasi jarak, transportasi, dan 
                jam operasional.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors inline-flex items-center">
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Menjadi jembatan antara wisatawan dengan kekayaan budaya dan alam Indonesia, 
              sekaligus mendukung pengembangan pariwisata berkelanjutan yang memberikan 
              manfaat bagi masyarakat lokal.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                <p className="text-gray-600">Destinasi Wisata</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
                <p className="text-gray-600">Pengguna Aktif</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">4.9</div>
                <p className="text-gray-600">Rating Aplikasi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nilai-nilai yang menjadi fondasi dalam setiap langkah perjalanan kami
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sustainability</h3>
              <p className="text-gray-600">Mendukung pariwisata berkelanjutan</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Community</h3>
              <p className="text-gray-600">Memberdayakan masyarakat lokal</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Innovation</h3>
              <p className="text-gray-600">Teknologi untuk pengalaman terbaik</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏛️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Heritage</h3>
              <p className="text-gray-600">Melestarikan budaya Indonesia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Memulai Petualangan Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan wisatawan yang telah menemukan pengalaman tak terlupakan 
            bersama TravelNesia
          </p>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Mulai Eksplorasi
          </button>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
